const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const jobRepository = require('../repositories/job.repository');

const proposalRepository = require('../repositories/proposal.repository');

const projectRepository = require('../repositories/project.repository');

const workspaceRepository = require('../repositories/workspace.repository');

const workspaceAttachmentRepository = require('../repositories/workspaceAttachment.repository');

const uploadService = require('../services/upload.service');
const { normalizeStoredFileUrl } = require('../utils/upload.util');
const notificationTriggers = require('./notificationTriggers');
const paymentService = require('./payment.service');



const getId = (value) => {

  if (!value) return '';

  if (typeof value === 'string') return value;

  if (value._id) return value._id.toString();

  return value.toString();

};



const toClientTask = (task) => {

  const plain = task.toObject ? task.toObject() : task;

  return {

    id: plain._id.toString(),

    _id: plain._id.toString(),

    jobId: getId(plain.jobId),

    title: plain.title,

    description: plain.description || undefined,

    status: plain.status,

    priority: plain.priority,

    dueDate: plain.dueDate ? new Date(plain.dueDate).toISOString() : undefined,

    createdBy: getId(plain.createdBy),

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



  const canWrite =
    userRole !== 'client' &&
    jobInProgress &&
    (!project || projectStatus === 'active');



  return { job, project, readOnly: !canWrite };

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



const listTasks = async (jobId: string, userId: string, userRole: string, query: Record<string, unknown> = {}) => {

  const { readOnly } = await getWorkspaceAccess(jobId, userId, userRole);

  const { page, limit, skip } = parsePagination(query);

  const [tasks, total] = await Promise.all([
    workspaceRepository.findByJobPaginated({ jobId, skip, limit }),
    workspaceRepository.countByJob(jobId),
  ]);

  return {
    tasks: tasks.map(toClientTask),
    readOnly,
    meta: buildPaginationMeta(total, page, limit),
  };

};



const createTask = async (jobId: string, userId: string, userRole: string, data) => {

  await assertWorkspaceWrite(jobId, userId, userRole);



  const created = await workspaceRepository.create({

    jobId,

    title: data.title.trim(),

    description: data.description || undefined,

    status: data.status || 'todo',

    priority: data.priority || 'medium',

    dueDate: data.dueDate || undefined,

    createdBy: userId,

  });



  const task = await workspaceRepository.findById(created._id.toString());

  await syncProjectProgress(jobId);
  await notificationTriggers.workspaceTaskCreated(jobId, userId, data.title.trim());

  return toClientTask(task);

};



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



  const updated = await workspaceRepository.updateById(taskId, data);

  if (!updated) {

    throw new AppError('Task not found', 404);

  }



  await syncProjectProgress(jobId);
  await notificationTriggers.workspaceTaskUpdated(
    jobId,
    userId,
    existing.title,
    data.status || updated.status
  );

  return toClientTask(updated);

};



const deleteTask = async (jobId: string, taskId: string, userId: string, userRole: string) => {

  await assertWorkspaceWrite(jobId, userId, userRole);



  const existing = await workspaceRepository.findById(taskId);

  if (!existing || getId(existing.jobId) !== jobId) {

    throw new AppError('Task not found', 404);

  }



  await workspaceRepository.deleteById(taskId);

  await syncProjectProgress(jobId);

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



const listAttachments = async (jobId: string, userId: string, userRole: string, query: Record<string, unknown> = {}) => {
  await getWorkspaceAccess(jobId, userId, userRole);

  const { page, limit, skip } = parsePagination(query);

  const [attachments, total] = await Promise.all([
    workspaceAttachmentRepository.findByJobPaginated({ jobId, skip, limit }),
    workspaceAttachmentRepository.countByJob(jobId),
  ]);

  return {
    attachments: attachments.map(toClientAttachment),
    meta: buildPaginationMeta(total, page, limit),
  };
};



const uploadAttachment = async (
  jobId: string,
  userId: string,
  userRole: string,
  file,
  data: { caption?: string } = {}
) => {
  await assertWorkspaceAttachmentWrite(jobId, userId, userRole);

  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  const created = await workspaceAttachmentRepository.create({
    jobId,
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

  getWorkspaceTeam,

  listAttachments,

  uploadAttachment,

  deleteAttachment,

};

