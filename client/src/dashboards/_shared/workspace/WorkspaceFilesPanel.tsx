import { useState } from 'react';
import { Files, Layers } from 'lucide-react';
import type { TaskDeliverableGroup } from './types';
import WorkspaceAttachmentsPanel from './WorkspaceAttachmentsPanel';
import WorkspaceTaskDeliverablesLibrary from './WorkspaceTaskDeliverablesLibrary';
import '../../../css/Workspace.css';

type FilesTab = 'project' | 'deliverables';

export default function WorkspaceFilesPanel({
  jobId,
  canUploadProjectFiles,
  deliverablesRefreshKey = 0,
  onOpenTask,
}: {
  jobId: string;
  canUploadProjectFiles: boolean;
  deliverablesRefreshKey?: number;
  onOpenTask?: (task: TaskDeliverableGroup['task']) => void;
}) {
  const [tab, setTab] = useState<FilesTab>('deliverables');

  return (
    <div className="wn-workspace-panel wn-workspace-files">
      <div className="wn-workspace-files__tabs" role="tablist" aria-label="Workspace files">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'deliverables'}
          className={`wn-workspace-files__tab${tab === 'deliverables' ? ' wn-workspace-files__tab--active' : ''}`}
          onClick={() => setTab('deliverables')}
        >
          <Layers size={15} />
          Task deliverables
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'project'}
          className={`wn-workspace-files__tab${tab === 'project' ? ' wn-workspace-files__tab--active' : ''}`}
          onClick={() => setTab('project')}
        >
          <Files size={15} />
          Project files
        </button>
      </div>

      <div className="wn-workspace-panel__body wn-workspace-files__body">
        {tab === 'deliverables' ? (
          <WorkspaceTaskDeliverablesLibrary
            jobId={jobId}
            refreshKey={deliverablesRefreshKey}
            onOpenTask={onOpenTask}
          />
        ) : (
          <WorkspaceAttachmentsPanel jobId={jobId} canUpload={canUploadProjectFiles} embedded />
        )}
      </div>
    </div>
  );
}
