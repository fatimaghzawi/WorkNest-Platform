import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../../../components/common/Button';
import UserAvatar from '../../../components/users/UserAvatar';
import { usersApi } from '../../../api/user.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import { StatGridSkeleton } from '../../../components/common/Skeleton';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { buildGmailComposeUrl } from '../../../utils/mailto';
import { formatDate } from '../../../utils/format';
import type { AdminUser } from '../../../types/user';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/UsersAdmin.css';

export default function AdminUserProfileView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await usersApi.getById(userId);
        if (active) setUser(response.data.data);
      } catch (error) {
        if (active) {
          setUser(null);
          toast.error(getApiErrorMessage(error, 'Failed to load user profile.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [userId, toast]);

  if (loading) {
    return (
      <div className="wn-analytics">
        <DashboardPageHeader hero eyebrow="Users" title="Member profile" subtitle="Loading..." />
        <StatGridSkeleton count={2} />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        description="This member may have been removed or the link is invalid."
        actionLabel="Back to users"
        actionTo="/admin/users"
      />
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const emailSubject = `WorkNest - Message for ${fullName}`;
  const gmailHref = buildGmailComposeUrl(user.email, { subject: emailSubject });

  return (
    <div className="wn-analytics wn-user-profile-view">
      <div className="wn-user-profile-view__toolbar">
        <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/admin/users')}>
          Back to directory
        </Button>
        <Button variant="outline" leftIcon={<Pencil size={16} />} onClick={() => navigate('/admin/users')}>
          Manage in directory
        </Button>
      </div>

      <DashboardPageHeader
        hero
        eyebrow={`${roleLabel} profile`}
        title={fullName}
        subtitle={user.email}
      />

      <div className="wn-user-profile-view__hero wn-user-profile-card">
        <UserAvatar
          firstName={user.firstName}
          lastName={user.lastName}
          role={user.role}
          image={user.profileImage}
          size="xl"
        />
        <div>
          <h2>{fullName}</h2>
          <p className="wn-user-profile-view__id">ID #{user._id.slice(-8).toUpperCase()}</p>
          <p className="wn-user-profile-view__meta">
            <MapPin size={14} /> {roleLabel} on WorkNest
          </p>
          <div className="wn-user-profile-view__actions">
            <Button
              variant="primary"
              leftIcon={<Mail size={16} />}
              href={gmailHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact
            </Button>
            {user.portfolioLink && (
              <Button
                variant="outline"
                leftIcon={<ExternalLink size={16} />}
                href={user.portfolioLink}
                target="_blank"
                rel="noreferrer"
              >
                Portfolio
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="wn-user-profile-view__grid">
        <section className="wn-user-profile-card">
          <h3>About</h3>
          <p>{user.bio || 'No bio provided yet.'}</p>
        </section>

        <section className="wn-user-profile-card">
          <h3>Account</h3>
          <ul className="wn-user-profile-view__facts">
            <li><span>Status</span><strong>{user.isActive ? 'Active' : 'Inactive'}</strong></li>
            <li><span>Email</span><strong>{user.emailVerified ? 'Verified' : 'Unverified'}</strong></li>
            <li><span>Joined</span><strong>{formatDate(user.createdAt)}</strong></li>
            {user.phone && (
              <li><span>Phone</span><strong>{user.phone}</strong></li>
            )}
          </ul>
        </section>

        {user.role === 'freelancer' && user.skills && user.skills.length > 0 && (
          <section className="wn-user-profile-card wn-user-profile-view__full">
            <h3>Skills & services</h3>
            <div className="wn-user-profile-view__services">
              {user.skills.map((skill) => (
                <div key={skill} className="wn-user-profile-view__service">
                  <CheckCircle2 size={16} />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {user.role === 'client' && (
          <section className="wn-user-profile-card wn-user-profile-view__full">
            <h3>Client activity</h3>
            <div className="wn-user-profile-view__services">
              <div className="wn-user-profile-view__service">
                <Briefcase size={16} />
                <span>Posts jobs and hires freelancers</span>
              </div>
              <div className="wn-user-profile-view__service">
                <CheckCircle2 size={16} />
                <span>Manages proposals and project workspaces</span>
              </div>
            </div>
            <p style={{ marginTop: 12 }}>
              <Link to="/admin/jobs" className="wn-user-profile-view__link">
                View platform jobs →
              </Link>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
