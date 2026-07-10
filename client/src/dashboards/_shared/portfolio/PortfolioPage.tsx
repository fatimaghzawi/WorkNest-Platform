import { useEffect, useState } from 'react';
import { ExternalLink, Image, Link2, Plus } from 'lucide-react';
import { profileApi } from '../../../api/profile.api';
import type { UserProfile } from '../../../types/profile';
import DashboardPageHeader from '../DashboardPageHeader';
import EmptyState from '../EmptyState';
import Card, { CardBody, CardHeader } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { StatGridSkeleton } from '../../../components/common/Skeleton';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import '../../../css/DesignSystem.css';

export default function PortfolioPage() {
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi
      .getMe()
      .then((res) => setProfile(res.data.data))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load portfolio.')))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div>
        <DashboardPageHeader eyebrow="Portfolio" title="My portfolio" subtitle="Loading..." />
        <StatGridSkeleton count={2} />
      </div>
    );
  }

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Portfolio"
        title="Showcase your work"
        subtitle="Present your best projects to clients. Full gallery management connects when the portfolio API is live."
        actions={
          <Button to="/freelancer/profile" variant="primary">
            Edit profile
          </Button>
        }
      />

      <div className="wn-quick-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <Card hover>
          <CardBody>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="wn-quick-link__icon" aria-hidden="true">
                <Link2 size={20} />
              </span>
              <div>
                <p className="wn-quick-link__title">Portfolio link</p>
                {profile?.portfolioLink ? (
                  <a
                    href={profile.portfolioLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 14, color: 'var(--color-secondary-main)' }}
                  >
                    {profile.portfolioLink} <ExternalLink size={12} style={{ verticalAlign: -2 }} />
                  </a>
                ) : (
                  <p className="wn-quick-link__desc">Add a link in your profile settings.</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
        <Card hover>
          <CardBody>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="wn-quick-link__icon" aria-hidden="true">
                <Image size={20} />
              </span>
              <div>
                <p className="wn-quick-link__title">Gallery items</p>
                <p className="wn-quick-link__desc">Upload projects, case studies, and visuals.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Work gallery"
          subtitle="Drag-and-drop uploads and public client view arrive with the portfolio service."
          action={
            <Button variant="ghost" size="sm" disabled leftIcon={<Plus size={16} />}>
              Add work
            </Button>
          }
        />
        <CardBody>
          <EmptyState
            icon={Image}
            title="No portfolio items yet"
            description="Add your portfolio URL and bio on your profile today. Image gallery CRUD will appear here once the backend is connected."
            actionLabel="Update profile"
            actionTo="/freelancer/profile"
          />
        </CardBody>
      </Card>
    </div>
  );
}
