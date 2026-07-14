import { CheckCircle2, RotateCcw } from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import type { ProjectStatus } from '../../../api/projects.api';
import { projectStatusBadgeVariant, projectStatusLabel } from '../projects/projectStatus';
import '../../../css/Workspace.css';

type WorkspaceProjectActionsProps = {
  role: 'client' | 'freelancer' | 'admin';
  projectStatus: ProjectStatus;
  progress: number;
  acting?: boolean;
  onCompleteProject?: () => void;
  onAcceptDelivery?: () => void;
  onRequestRevision?: () => void;
};

export default function WorkspaceProjectActions({
  role,
  projectStatus,
  progress,
  acting = false,
  onCompleteProject,
  onAcceptDelivery,
  onRequestRevision,
}: WorkspaceProjectActionsProps) {
  const showFreelancerComplete = role === 'freelancer' && projectStatus === 'active';
  const showClientReview = role === 'client' && projectStatus === 'pending_review';

  if (!showFreelancerComplete && !showClientReview) {
    return (
      <div className="wn-workspace-actions wn-workspace-actions--status-only">
        <Badge variant={projectStatusBadgeVariant(projectStatus)}>
          {projectStatusLabel(projectStatus)}
        </Badge>
      </div>
    );
  }

  return (
    <div className="wn-workspace-actions">
      <Badge variant={projectStatusBadgeVariant(projectStatus)}>
        {projectStatusLabel(projectStatus)}
      </Badge>

      {showFreelancerComplete && (
        <>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<CheckCircle2 size={16} />}
            disabled={progress < 100 || acting}
            loading={acting}
            onClick={onCompleteProject}
          >
            Complete project
          </Button>
          {progress < 100 && (
            <span className="wn-workspace-actions__hint">
              Approve all tasks first ({progress}% complete)
            </span>
          )}
        </>
      )}

      {showClientReview && (
        <>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<CheckCircle2 size={16} />}
            loading={acting}
            onClick={onAcceptDelivery}
          >
            Accept delivery
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RotateCcw size={16} />}
            disabled={acting}
            onClick={onRequestRevision}
          >
            Request revisions
          </Button>
        </>
      )}
    </div>
  );
}
