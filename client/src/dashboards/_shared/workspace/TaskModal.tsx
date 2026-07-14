import { useEffect, useState } from 'react';

import Input from '../../../components/common/Input';

import Button from '../../../components/common/Button';

import Modal from '../../../components/common/Modal';

import { useToast } from '../../../hooks/useToast';

import TaskDeliverablesPanel from './TaskDeliverablesPanel';

import type { TaskPriority, TaskStatus, WorkspaceTask } from './types';



export default function TaskModal({

  open,

  task,

  jobId,

  readOnly = false,

  canDelete = false,

  canUploadDeliverables = false,

  defaultStatus = 'todo',

  onClose,

  onSave,

  onDelete,

  onDeliverablesChange,

}: {

  open: boolean;

  task: WorkspaceTask | null;

  jobId?: string;

  readOnly?: boolean;

  canDelete?: boolean;

  canUploadDeliverables?: boolean;

  defaultStatus?: TaskStatus;

  onClose: () => void;

  onSave: (payload: Omit<WorkspaceTask, 'id'> & { id?: string }) => void | Promise<void>;

  onDelete?: (id: string) => void | Promise<void>;

  onDeliverablesChange?: () => void;

}) {

  const toast = useToast();

  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');

  const [status, setStatus] = useState<TaskStatus>('todo');

  const [priority, setPriority] = useState<TaskPriority>('medium');

  const [dueDate, setDueDate] = useState('');

  const [saving, setSaving] = useState(false);



  useEffect(() => {

    if (!open) return;

    setTitle(task?.title ?? '');

    setDescription(task?.description ?? '');

    setStatus(task?.status ?? defaultStatus);

    setPriority(task?.priority ?? 'medium');

    setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : '');

  }, [open, task, defaultStatus]);



  const handleSubmit = async (event: React.FormEvent) => {

    event.preventDefault();

    if (!title.trim()) {

      toast.warning('Task title is required.');

      return;

    }



    setSaving(true);

    try {

      await onSave({

        id: task?.id,

        title: title.trim(),

        description: description.trim() || undefined,

        status: task?.status ?? defaultStatus,

        priority,

        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,

      });

      onClose();

    } finally {

      setSaving(false);

    }

  };



  const showDeliverables = Boolean(
    task &&
      jobId &&
      (task.status === 'todo' ||
        task.status === 'in_progress' ||
        task.status === 'review' ||
        task.status === 'done')
  );
  const showSubmissionNotes = Boolean(
    task?.submissionNotes && (task.status === 'review' || task.status === 'done')
  );



  return (

    <Modal

      open={open}

      onClose={onClose}

      title={readOnly ? 'View task' : task ? 'Edit task' : 'New task'}

      size={showDeliverables ? 'lg' : 'md'}

      footer={

        readOnly ? (

          <Button variant="ghost" onClick={onClose}>

            Close

          </Button>

        ) : (

          <>

            {task && onDelete && canDelete && (

              <Button

                variant="danger"

                disabled={saving}

                onClick={async () => {

                  setSaving(true);

                  try {

                    await onDelete(task.id);

                  } finally {

                    setSaving(false);

                  }

                }}

              >

                Delete

              </Button>

            )}

            <Button variant="ghost" onClick={onClose} disabled={saving}>

              Cancel

            </Button>

            <Button variant="primary" type="submit" form="workspace-task-form" loading={saving}>

              Save task

            </Button>

          </>

        )

      }

    >

      <form

        id="workspace-task-form"

        onSubmit={handleSubmit}

        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}

      >

        <Input

          label="Title"

          required={!readOnly}

          value={title}

          onChange={(event) => setTitle(event.target.value)}

          placeholder="What needs to be done?"

          disabled={readOnly}

        />



        <Input

          as="textarea"

          label="Description"

          value={description}

          onChange={(event) => setDescription(event.target.value)}

          placeholder="Optional scope or acceptance criteria..."

          rows={3}

          disabled={readOnly}

        />



        {!task && (

          <p className="wn-workspace-task-hint">New tasks start in the To do column.</p>

        )}



        {task && (

          <p className="wn-workspace-task-hint">

            Status: {status.replace(/_/g, ' ')} — use the board actions to move tasks through the workflow.

          </p>

        )}



        {showSubmissionNotes && (

          <div className="wn-task-submission-notes">

            <span className="wn-field__label">Submission notes</span>

            <p>{task?.submissionNotes}</p>

          </div>

        )}



        {!readOnly && (

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>

            <label className="wn-field">

              <span className="wn-field__label">Priority</span>

              <select

                className="wn-dash-select"

                value={priority}

                onChange={(event) => setPriority(event.target.value as TaskPriority)}

              >

                <option value="low">Low</option>

                <option value="medium">Medium</option>

                <option value="high">High</option>

              </select>

            </label>

          </div>

        )}



        {!readOnly && (

          <Input

            label="Due date"

            type="date"

            value={dueDate}

            onChange={(event) => setDueDate(event.target.value)}

          />

        )}



        {showDeliverables && jobId && task && (

          <TaskDeliverablesPanel
            jobId={jobId}
            taskId={task.id}
            canUpload={Boolean(canUploadDeliverables)}
            onMutated={onDeliverablesChange}
          />

        )}

      </form>

    </Modal>

  );

}


