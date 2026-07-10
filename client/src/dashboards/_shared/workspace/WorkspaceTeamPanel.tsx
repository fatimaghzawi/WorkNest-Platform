import { Link, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import UserAvatar from '../../../components/users/UserAvatar';
import type { WorkspaceTeam, WorkspaceTeamMember } from './types';
import '../../../css/Workspace.css';

const ROLE_LABEL = {
  client: 'Client',
  freelancer: 'Freelancer',
} as const;

function getProfilePath(
  member: WorkspaceTeamMember,
  viewerRole: 'client' | 'freelancer' | 'admin'
) {
  if (viewerRole === 'admin') {
    return `/admin/users/${member.id}/profile`;
  }

  if (viewerRole === 'client' && member.role === 'freelancer') {
    return `/client/freelancers/${member.id}`;
  }

  if (viewerRole === 'freelancer' && member.role === 'client') {
    return `/freelancer/clients/${member.id}`;
  }

  return null;
}

function TeamMemberRow({
  member,
  viewerRole,
  currentUserId,
  backPath,
}: {
  member: WorkspaceTeamMember;
  viewerRole: 'client' | 'freelancer' | 'admin';
  currentUserId?: string;
  backPath: string;
}) {
  const isSelf = currentUserId === member.id;
  const profilePath = !isSelf ? getProfilePath(member, viewerRole) : null;

  const content = (
    <>
      <UserAvatar
        firstName={member.firstName}
        lastName={member.lastName}
        role={member.role}
        image={member.profileImage}
        size="sm"
      />
      <span className="wn-workspace-team__meta">
        <span className="wn-workspace-team__name">{member.name}</span>
        <span className="wn-workspace-team__role">
          {isSelf ? `${ROLE_LABEL[member.role]} · You` : ROLE_LABEL[member.role]}
        </span>
      </span>
    </>
  );

  if (!profilePath) {
    return <li className="wn-workspace-team__item">{content}</li>;
  }

  return (
    <li className="wn-workspace-team__item">
      <Link
        to={profilePath}
        state={{ from: backPath, fromLabel: 'Back to workspace' }}
        className="wn-workspace-team__link"
      >
        {content}
      </Link>
    </li>
  );
}

export default function WorkspaceTeamPanel({
  team,
  loading,
  role,
  currentUserId,
}: {
  team: WorkspaceTeam | null;
  loading: boolean;
  role: 'client' | 'freelancer' | 'admin';
  currentUserId?: string;
}) {
  const location = useLocation();
  const backPath = `${location.pathname}${location.search}`;

  const members = [team?.client, team?.freelancer].filter(
    (member): member is WorkspaceTeamMember => member !== null && member !== undefined
  );

  return (
    <div className="wn-workspace-panel">
      <div className="wn-workspace-panel__header">
        <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
        Team
      </div>
      <div className="wn-workspace-panel__body">
        {loading ? (
          <p className="wn-workspace-team__empty">Loading team...</p>
        ) : members.length === 0 ? (
          <p className="wn-workspace-team__empty">No team members assigned yet.</p>
        ) : (
          <ul className="wn-workspace-panel__list wn-workspace-team">
            {members.map((member) => (
              <TeamMemberRow
                key={member.id}
                member={member}
                viewerRole={role}
                currentUserId={currentUserId}
                backPath={backPath}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
