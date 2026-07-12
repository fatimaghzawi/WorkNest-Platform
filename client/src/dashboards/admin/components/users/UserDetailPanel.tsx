import { CheckCircle2, ExternalLink, Mail, MapPin, UserRound } from 'lucide-react';
import Button from '../../../../components/common/Button';
import UserAvatar from '../../../../components/users/UserAvatar';
import type { AdminUser } from '../../../../types/user';
import type { UserRole } from '../../../../types/auth';
import { formatDate, formatDateTime } from '../../../../utils/format';
import { buildGmailComposeUrl } from '../../../../utils/mailto';
import '../../../../css/UsersAdmin.css';

const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Client',
  freelancer: 'Freelancer',
  admin: 'Admin',
};

export default function UserDetailPanel({
  user,
  isSelf,
  onClose,
  onEdit,
  onToggleActive,
  onRoleChange,
  onDeactivate,
  busy,
}: {
  user: AdminUser;
  isSelf: boolean;
  onClose: () => void;
  onEdit: () => void;
  onToggleActive: (active: boolean) => void;
  onRoleChange: (role: UserRole) => void;
  onDeactivate: () => void;
  busy: boolean;
}) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const canViewProfile = user.role === 'client' || user.role === 'freelancer';
  const emailSubject = `WorkNest - Message for ${fullName}`;
  const gmailHref = buildGmailComposeUrl(user.email, { subject: emailSubject });

  return (
    <aside className="wn-analytics-card wn-member-panel" aria-label={`${fullName} profile`}>
      <button
        type="button"
        className="wn-member-panel__close"
        onClick={onClose}
        aria-label="Close profile panel"
      >
        ×
      </button>

      <div className="wn-member-panel__hero">
        <UserAvatar
          firstName={user.firstName}
          lastName={user.lastName}
          role={user.role}
          image={user.profileImage}
          size="xl"
        />
        <h2 className="wn-member-panel__name">{fullName}</h2>
        <p className="wn-member-panel__id">ID #{user._id.slice(-8).toUpperCase()}</p>
        <p className="wn-member-panel__location">
          {/* <MapPin size={14} /> */}
          {ROLE_LABELS[user.role]} · {user.email}
        </p>

        <div className="wn-member-panel__cta">
          {canViewProfile ? (
            <Button
              to={`/admin/users/${user._id}/profile`}
              variant="primary"
              size="sm"
              leftIcon={<UserRound size={16} />}
            >
              View profile
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Mail size={16} />}
              href={gmailHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Mail size={16} />}
            href={gmailHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Email
          </Button>
        </div>
      </div>

      <div className="wn-member-panel__body">
        <p className="wn-member-panel__bio">
          {user.bio ||
            (user.role === 'freelancer'
              ? 'This freelancer has not added a bio yet.'
              : user.role === 'client'
                ? 'This client has not added a bio yet.'
                : 'Platform administrator account.')}
        </p>

        {user.skills && user.skills.length > 0 && (
          <div>
            <p className="wn-member-panel__section-title">The skills I offer</p>
            <div className="wn-member-panel__tags">
              {user.skills.map((skill) => (
                <span key={skill} className="wn-member-panel__tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* {user.role === 'freelancer' && (
          <div>
            <p className="wn-member-panel__section-title">Services</p>
            <ul className="wn-member-panel__services">
              {(user.skills?.length ? user.skills.slice(0, 6) : ['Project delivery', 'Collaboration']).map(
                (item) => (
                  <li key={item}>
                    <CheckCircle2 size={15} />
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )} */}

        {/* {user.role === 'client' && (
          <div>
            <p className="wn-member-panel__section-title">Client services</p>
            <ul className="wn-member-panel__services">
              <li>
                <CheckCircle2 size={15} />
                <span>Post and manage jobs</span>
              </li>
              <li>
                <CheckCircle2 size={15} />
                <span>Review proposals</span>
              </li>
              <li>
                <CheckCircle2 size={15} />
                <span>Run project workspaces</span>
              </li>
            </ul>
          </div>
        )} */}

        <div>
          <p className="wn-member-panel__section-title">Account</p>
          <div className="wn-member-panel__account">
            <div>
              <span>Status</span>
              <label className="wn-user-switch" title={isSelf ? 'Cannot change your own status' : ''}>
                <input
                  type="checkbox"
                  checked={user.isActive}
                  disabled={isSelf || busy}
                  onChange={(e) => onToggleActive(e.target.checked)}
                />
                <span className="wn-user-switch__slider" />
              </label>
              <strong>{user.isActive ? 'Active' : 'Inactive'}</strong>
            </div>
            <div>
              <span>Role</span>
              <select
                className="wn-dash-select"
                value={user.role}
                disabled={isSelf || busy}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
              >
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <span>Joined</span>
              <strong>{formatDate(user.createdAt)}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user.emailVerified ? 'Verified' : 'Unverified'}</strong>
              {!user.isActive && user.emailVerified && (
                <span className="wn-member-panel__email-hint"> (inactive account)</span>
              )}
            </div>
          </div>
        </div>

        {user.portfolioLink && (
          <a
            href={user.portfolioLink}
            target="_blank"
            rel="noreferrer"
            className="wn-member-panel__portfolio"
          >
            <ExternalLink size={14} />
            Open portfolio link
          </a>
        )}

        <p className="wn-member-panel__updated">Updated {formatDateTime(user.updatedAt)}</p>
      </div>

      <div className="wn-member-panel__actions">
        <Button size="sm" onClick={onEdit} disabled={busy}>
          Edit user
        </Button>
        {user.isActive ? (
          <Button
            size="sm"
            variant="danger"
            onClick={onDeactivate}
            disabled={isSelf || busy}
            title={isSelf ? 'You cannot deactivate your own account' : undefined}
          >
            Deactivate user
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleActive(true)}
            disabled={isSelf || busy}
          >
            Activate user
          </Button>
        )}
      </div>
    </aside>
  );
}
