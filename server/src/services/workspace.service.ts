const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { assertStatusTransition } = require('../utils/taskWorkflow');

const jobRepository = require('../repositories/job.repository');
const proposalRepository = require('../repositories/proposal.repository');
const projectRepository = require('../repositories/project.repository');
const workspaceRepository = require('../repositories/workspace.repository');
const workspaceAttachmentRepository = require('../repositories/workspaceAttachment.repository');

const uploadService = require('../services/upload.service');
const { normalizeStoredFileUrl } = require('../utils/upload.util');
const notificationTriggers = require('./notificationTriggers');
const paymentService = require('./payment.service');

const OWN_STATUS_VALUES = new Set(['todo', 'in_progress', 'review', 'done']);

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const resolveTaskOrigin = (task) => {
  if (task?.origin === 'client' || task?.origin === 'freelancer') {
    return task.origin;
  }
  const role =
    task?.createdBy && typeof task.createdBy === 'object' ? task.createdBy.role : undefined;
  if (role === 'client' || role === 'freelancer') return role;
  return 'freelancer';
};

const creatorDisplayName = (createdBy) => {
  if (!createdBy || typeof createdBy === 'string') return 'User';
  const plain = createdBy.toObject ? createdBy.toObject() : createdBy;
  return `${plain.firstName || ''} ${plain.lastName || ''}`.trim() || 'User';
};

const creatorRole = (createdBy) => {
  if (!createdBy || typeof createdBy === 'string') return undefined;
  const plain = createdBy.toObject ? createdBy.toObject() : createdBy;
  return plain.role || undefined;
};

const toClientTask = (task, attachmentCount = 0) => {
  const plain = task.toObject ? task.toObject() : task;
  const origin = resolveTaskOrigin(plain);
  const createdByObj =
    plain.createdBy && typeof plain.createdBy === 'object' ? plain.createdBy : null;
  const creatorPlain = createdByObj
    ? createdByObj.toObject
      ? createdByObj.toObject()
      : createdByObj
    : null;

  return {
    id: plain._id.toString(),
    title: plain.title,
    description: plain.description || undefined,
    status: plain.status,
    priority: plain.priority,
    origin,
    dueDate: plain.dueDate ? new Date(plain.dueDate).toISOString() : undefined,
    submissionNotes: plain.submissionNotes || undefined,
    submittedAt: plain.submittedAt ? new Date(plain.submittedAt).toISOString() : undefined,
    attachmentCount: attachmentCount ?? 0,
    createdBy: getId(plain.createdBy),
    createdByName: creatorDisplayName(createdByObj),
    createdByFirstName: creatorPlain?.firstName || undefined,
    createdByLastName: creatorPlain?.lastName || undefined,
    createdByProfileImage: normalizeStoredFileUrl(creatorPlain?.profileImage) || undefined,
    createdByRole: creatorRole(createdByObj) || origin,
    createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : undefined,
    updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : undefined,
  };
};

const verifyJobParticipant = async (job, jobId: string, userId: string, userRole: string) => {
  if (userRole === 'admin') return;

  if (userRole === 'client') {
    if (getId(job.clientId) !== userId) {
      throw new AppError('You can only access workspaces for your own jobs', 403);
    }
    return;
  }

  if (userRole === 'freelancer') {
    const accepted = await proposalRepository.findByJobAndFreelancer(jobId, userId);
    if (!accepted || accepted.status !== 'accepted') {
      throw new AppError('You can only access workspaces for your accepted projects', 403);
    }
    return;
  }

  throw new AppError('Forbidden', 403);
};

const getWorkspaceAccess = async (jobId: string, userId: string, userRole: string) => {
  const job = await jobRepository.findById(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  await verifyJobParticipant(job, jobId, userId, userRole);

  const project = await projectRepository.findByJobId(jobId);
  const projectStatus = project?.status;

  if (projectStatus === 'cancelled') {
    throw new AppError('This project has been cancelled', 403);
  }

  const jobInProgress = job.status === 'in_progress';
  const jobClosedComplete = job.status === 'closed' && projectStatus === 'completed';

  const canRead =
    userRole === 'admin' ||
    (jobInProgress && (!project || projectStatus !== 'cancelled')) ||
    jobClosedComplete;

  if (!canRead) {
    throw new AppError('Workspace is not available for this project', 403);
  }

  const canCollaborate =
    jobInProgress && (!project || projectStatus === 'active');

  const isWorkspaceRole =
    userRole === 'admin' || userRole === 'client' || userRole === 'freelancer';

  const permissions = {
    canCreate: Boolean(canCollaborate && isWorkspaceRole),
    canManageTasks: Boolean(
      canCollaborate && (userRole === 'freelancer' || userRole === 'admin')
    ),
    canReviewTasks: Boolean(canCollaborate && userRole === 'client'),
  };

  return {
    job,
    project,
    readOnly: !canCollaborate,
    permissions,
  };
};

const assertWorkspaceWrite = async (jobId: string, userId: string, userRole: string) => {
  const access = await getWorkspaceAccess(jobId, userId, userRole);

  if (access.readOnly) {
    throw new AppError('This workspace is read-only and cannot be edited', 403);
  }

  if (userRole === 'freelancer' && access.project) {
    await paymentService.assertEscrowHeldForProject(access.project._id.toString());
  }

  return access;
};

const calculateJobProgress = async (jobId: string) => {
  const [total, done] = await Promise.all([
    workspaceRepository.countByJob(jobId),
    workspaceRepository.countDoneByJob(jobId),
  ]);

  if (total === 0) return 0;
  return Math.round((done / total) * 100);
};

const syncProjectProgress = async (jobId: string) => {
  const project = await projectRepository.findByJobId(jobId);
  if (!project) return;

  const progress = await calculateJobProgress(jobId);
  if (project.status === 'completed' || project.status === 'cancelled') return;

  await projectRepository.updateById(project._id.toString(), { progress });
};

const listTasks = async (
  jobId: string,
  userId: string,
  userRole: string,
  query: Record<string, unknown> = {}
) => {
  const { readOnly, permissions } = await getWorkspaceAccess(jobId, userId, userRole);
  const { page, limit, skip } = parsePagination(query);

  const origin =
    query.origin === 'client' || query.origin === 'freelancer' ? query.origin : undefined;
  const priority =
    query.priority === 'low' || query.priority === 'medium' || query.priority === 'high'
      ? query.priority
      : undefined;
  const sortBy =
    query.sortBy === 'priority' ||
    query.sortBy === 'dueDate' ||
    query.sortBy === 'title' ||
    query.sortBy === 'createdAt'
      ? query.sortBy
      : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  const filters = { origin, priority };

  const [tasks, total, progress] = await Promise.all([
    workspaceRepository.findByJobPaginated({
      jobId,
      skip,
      limit,
      origin,
      priority,
      sortBy,
      sortOrder,
    }),
    workspaceRepository.countByJob(jobId, filters),
    calculateJobProgress(jobId),
  ]);

  const taskIds = tasks.map((task) => task._id.toString());
  const countsByTask = await workspaceAttachmentRepository.countByTaskIds(taskIds);

  return {
    tasks: tasks.map((task) =>
      toClientTask(task, countsByTask[task._id.toString()] || 0)
    ),
    readOnly,
    permissions,
    progress,
    meta: buildPaginationMeta(total, page, limit),
  };
};

const createTask = async (jobId: string, userId: string, userRole: string, data) => {
  await assertWorkspaceWrite(jobId, userId, userRole);

  const origin = userRole === 'freelancer' ? 'freelancer' : 'client';

  const created = await workspaceRepository.create({
    jobId,
    title: data.title.trim(),
    description: data.description || undefined,
    status: 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate || undefined,
    origin,
    createdBy: userId,
  });

  const task = await workspaceRepository.findById(created._id.toString());
  await syncProjectProgress(jobId);
  await notificationTriggers.workspaceTaskCreated(jobId, userId, data.title.trim());

  return toClientTask(task);
};

const pickOwnFieldUpdates = (data) => {
  const updates: Record<string, unknown> = {};
  if (data.title !== undefined) updates.title = String(data.title).trim();
  if (data.description !== undefined) {
    updates.description = data.description || undefined;
  }
  if (data.priority !== undefined) updates.priority = data.priority;
  if (data.dueDate !== undefined) updates.dueDate = data.dueDate;
  return updates;
};

const hasContentEditFields = (data) =>
  data.title !== undefined ||
  data.description !== undefined ||
  data.priority !== undefined ||
  data.dueDate !== undefined ||
  data.submissionNotes !== undefined;

const updateTask = async (
  jobId: string,
  taskId: string,
  userId: string,
  userRole: string,
  data
) => {
  await assertWorkspaceWrite(jobId, userId, userRole);

  const existing = await workspaceRepository.findById(taskId);
  if (!existing || getId(existing.jobId) !== jobId) {
    throw new AppError('Task not found', 404);
  }

  const taskOrigin = resolveTaskOrigin(existing);
  let updates: Record<string, unknown> = {};

  if (userRole === 'admin') {
    updates = {
      ...pickOwnFieldUpdates(data),
    };
    if (data.status !== undefined) updates.status = data.status;
    if (data.submissionNotes !== undefined) {
      updates.submissionNotes = data.submissionNotes || undefined;
    }
    if (data.status === 'review' && existing.status !== 'review') {
      updates.submittedAt = new Date();
    }
  } else if (taskOrigin === userRole) {
    updates = pickOwnFieldUpdates(data);

    if (data.status !== undefined && data.status !== existing.status) {
      if (userRole === 'freelancer') {
        assertStatusTransition('freelancer', existing.status, data.status);
        updates.status = data.status;
        if (data.status === 'review') {
          updates.submittedAt = new Date();
          if (data.submissionNotes !== undefined) {
            updates.submissionNotes = data.submissionNotes || undefined;
          }
        } else if (data.submissionNotes !== undefined) {
          throw new AppError('Submission notes are only allowed when submitting for review', 400);
        }
      } else if (userRole === 'client') {
        if (!OWN_STATUS_VALUES.has(data.status)) {
          throw new AppError('Invalid task status', 400);
        }
        updates.status = data.status;
        if (data.submissionNotes !== undefined) {
          throw new AppError('Clients cannot set submission notes on their own tasks', 400);
        }
      }
    } else if (data.submissionNotes !== undefined && userRole === 'freelancer') {
      throw new AppError('Submission notes are only allowed when submitting for review', 400);
    } else if (data.submissionNotes !== undefined && userRole === 'client') {
      throw new AppError('Clients cannot set submission notes on their own tasks', 400);
    }
  } else if (userRole === 'client' && taskOrigin === 'freelancer') {
    if (hasContentEditFields(data)) {
      throw new AppError('You can only approve or request changes on freelancer tasks', 403);
    }
    if (data.status === undefined) {
      throw new AppError('Status is required to review a freelancer task', 400);
    }
    assertStatusTransition('client', existing.status, data.status);
    updates = { status: data.status };
  } else if (userRole === 'freelancer' && taskOrigin === 'client') {
    throw new AppError('You cannot update client tasks', 403);
  } else {
    throw new AppError('You cannot update this task', 403);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('At least one field is required for update', 400);
  }

  const updated = await workspaceRepository.updateById(taskId, updates);
  if (!updated) {
    throw new AppError('Task not found', 404);
  }

  await syncProjectProgress(jobId);
  await notificationTriggers.workspaceTaskUpdated(
    jobId,
    userId,
    existing.title,
    (updates.status as string) || updated.status
  );

  return toClientTask(updated, await workspaceAttachmentRepository.countByTask(taskId));
};

const deleteTask = async (jobId: string, taskId: string, userId: string, userRole: string) => {
  await assertWorkspaceWrite(jobId, userId, userRole);

  const existing = await workspaceRepository.findById(taskId);
  if (!existing || getId(existing.jobId) !== jobId) {
    throw new AppError('Task not found', 404);
  }

  if (userRole !== 'admin') {
    const taskOrigin = resolveTaskOrigin(existing);
    if (taskOrigin !== userRole) {
      throw new AppError('You can only delete your own tasks', 403);
    }
  }

  await workspaceAttachmentRepository.deleteByTaskId(taskId);
  await workspaceRepository.deleteById(taskId);
  await syncProjectProgress(jobId);
};

const seedDefaultTasksForJob = async (jobId: string, createdBy: string) => {
  const existingCount = await workspaceRepository.countByJob(jobId);
  if (existingCount > 0) return [];

  const created = await workspaceRepository.createMany([
    {
      jobId,
      title: 'Kickoff & requirements',
      description: 'Align on goals, scope, and success criteria.',
      status: 'todo',
      priority: 'high',
      origin: 'client',
      createdBy,
    },
    {
      jobId,
      title: 'Milestones & deliverables',
      description: 'Confirm milestones, timeline, and acceptance criteria.',
      status: 'todo',
      priority: 'medium',
      origin: 'client',
      createdBy,
    },
  ]);

  await syncProjectProgress(jobId);
  return created.map((task) => toClientTask(task));
};

const toTeamMember = (user, role: 'client' | 'freelancer') => {
  if (!user) return null;

  const plain = user.toObject ? user.toObject() : user;
  if (typeof plain === 'string') return null;

  const firstName = plain.firstName || '';
  const lastName = plain.lastName || '';
  const name = `${firstName} ${lastName}`.trim() || 'User';

  return {
    id: plain._id.toString(),
    firstName,
    lastName,
    name,
    role,
    profileImage: normalizeStoredFileUrl(plain.profileImage) || undefined,
  };
};

const getWorkspaceTeam = async (jobId: string, userId: string, userRole: string) => {
  await getWorkspaceAccess(jobId, userId, userRole);

  const [project, job, acceptedProposal] = await Promise.all([
    projectRepository.findByJobIdPopulated(jobId),
    jobRepository.findById(jobId, { populate: true }),
    proposalRepository.findAcceptedByJob(jobId),
  ]);

  const client = project?.clientId ?? job?.clientId ?? null;
  const freelancer = project?.freelancerId ?? acceptedProposal?.freelancerId ?? null;

  return {
    client: toTeamMember(client, 'client'),
    freelancer: toTeamMember(freelancer, 'freelancer'),
  };
};

const displayName = (user) => {
  if (!user || typeof user === 'string') return 'User';
  const plain = user.toObject ? user.toObject() : user;
  return `${plain.firstName || ''} ${plain.lastName || ''}`.trim() || 'User';
};

const toClientAttachment = (attachment) => {
  const plain = attachment.toObject ? attachment.toObject() : attachment;
  const uploader =
    plain.uploadedBy && typeof plain.uploadedBy === 'object' ? plain.uploadedBy : null;

  return {
    id: plain._id.toString(),
    _id: plain._id.toString(),
    jobId: getId(plain.jobId),
    taskId: plain.taskId ? getId(plain.taskId) : undefined,
    fileName: plain.fileName,
    fileUrl: normalizeStoredFileUrl(plain.fileUrl),
    mimeType: plain.mimeType,
    fileSize: plain.fileSize,
    caption: plain.caption || undefined,
    uploadedBy: getId(plain.uploadedBy),
    uploaderName: displayName(uploader),
    createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : undefined,
  };
};

const assertWorkspaceAttachmentWrite = async (jobId: string, userId: string, userRole: string) => {
  await assertWorkspaceWrite(jobId, userId, userRole);

  if (userRole === 'client') {
    throw new AppError('Only freelancers can upload workspace attachments', 403);
  }
};

const listAttachments = async (
  jobId: string,
  userId: string,
  userRole: string,
  query: Record<string, unknown> = {}
) => {
  await getWorkspaceAccess(jobId, userId, userRole);

  const { page, limit, skip } = parsePagination(query);
  const taskId = typeof query.taskId === 'string' ? query.taskId : undefined;

  if (taskId) {
    const task = await workspaceRepository.findById(taskId);
    if (!task || getId(task.jobId) !== jobId) {
      throw new AppError('Task not found', 404);
    }
  }

  const [attachments, total] = await Promise.all([
    workspaceAttachmentRepository.findByJobPaginated({ jobId, taskId, skip, limit }),
    workspaceAttachmentRepository.countFiltered({ jobId, taskId }),
  ]);

  return {
    attachments: attachments.map(toClientAttachment),
    meta: buildPaginationMeta(total, page, limit),
  };
};

const listTaskDeliverables = async (
  jobId: string,
  userId: string,
  userRole: string,
  query: Record<string, unknown> = {}
) => {
  await getWorkspaceAccess(jobId, userId, userRole);

  const { page, limit, skip } = parsePagination(query);
  const previewLimit = Math.min(
    typeof query.previewLimit === 'number'
      ? query.previewLimit
      : Number(query.previewLimit) || 6,
    20
  );

  const [groups, totalGroups, totalAttachments] = await Promise.all([
    workspaceAttachmentRepository.findTaskDeliverableGroupsPaginated({
      jobId,
      skip,
      limit,
      previewLimit,
    }),
    workspaceAttachmentRepository.countTaskDeliverableGroups(jobId),
    workspaceAttachmentRepository.countTaskDeliverables(jobId),
  ]);

  const data = groups.map((group) => {
    const taskPlain = group.task?.toObject ? group.task.toObject() : group.task;
    return {
      task: taskPlain
        ? {
            id: taskPlain._id.toString(),
            title: taskPlain.title,
            status: taskPlain.status,
            submissionNotes: taskPlain.submissionNotes || undefined,
            submittedAt: taskPlain.submittedAt
              ? new Date(taskPlain.submittedAt).toISOString()
              : undefined,
          }
        : {
            id: group.taskId,
            title: 'Task',
            status: 'todo',
          },
      attachments: group.attachments.map(toClientAttachment),
      attachmentTotal: group.attachmentCount,
    };
  });

  return {
    groups: data,
    meta: {
      ...buildPaginationMeta(totalGroups, page, limit),
      totalAttachments,
      previewLimit,
    },
  };
};

const uploadAttachment = async (
  jobId: string,
  userId: string,
  userRole: string,
  file,
  data: { caption?: string; taskId?: string } = {}
) => {
  await assertWorkspaceAttachmentWrite(jobId, userId, userRole);

  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  const taskId = data.taskId || undefined;
  if (taskId) {
    const task = await workspaceRepository.findById(taskId);
    if (!task || getId(task.jobId) !== jobId) {
      throw new AppError('Task not found', 404);
    }
  }

  const created = await workspaceAttachmentRepository.create({
    jobId,
    taskId: taskId || null,
    uploadedBy: userId,
    fileName: file.originalname,
    fileUrl: uploadService.resolveWorkspaceFileUrl(file),
    mimeType: file.mimetype,
    fileSize: file.size,
    caption: data.caption?.trim() || undefined,
  });

  const attachment = await workspaceAttachmentRepository.findById(created._id.toString());
  const clientAttachment = toClientAttachment(attachment);
  await notificationTriggers.workspaceAttachmentUploaded(
    jobId,
    userId,
    clientAttachment.fileName,
    clientAttachment.uploaderName
  );
  return clientAttachment;
};

const deleteAttachment = async (
  jobId: string,
  attachmentId: string,
  userId: string,
  userRole: string
) => {
  await assertWorkspaceAttachmentWrite(jobId, userId, userRole);

  const existing = await workspaceAttachmentRepository.findById(attachmentId);
  if (!existing || getId(existing.jobId) !== jobId) {
    throw new AppError('Attachment not found', 404);
  }

  if (userRole !== 'admin' && getId(existing.uploadedBy) !== userId) {
    throw new AppError('You can only delete your own attachments', 403);
  }

  await workspaceAttachmentRepository.deleteById(attachmentId);
};

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  seedDefaultTasksForJob,
  getWorkspaceTeam,
  listAttachments,
  listTaskDeliverables,
  uploadAttachment,
  deleteAttachment,
};
