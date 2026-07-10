import type { LucideIcon } from 'lucide-react';
import Button from '../../components/common/Button';
import Card, { CardBody } from '../../components/common/Card';
import DashboardPageHeader from './DashboardPageHeader';
import '../../css/DesignSystem.css';

export default function FeaturePlaceholder({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  highlights,
  primaryAction,
  secondaryAction,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  highlights: string[];
  primaryAction?: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
}) {
  return (
    <div>
      <DashboardPageHeader hero eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <Card>
        <CardBody>
          <div className="wn-feature-placeholder">
            <span className="wn-feature-placeholder__icon" aria-hidden="true">
              <Icon size={32} />
            </span>
            <h2 className="wn-feature-placeholder__title">Coming in a future release</h2>
            <p className="wn-feature-placeholder__desc">
              This section is part of the WorkNest roadmap. Core flows like jobs, proposals, profiles,
              and workspace are available today.
            </p>
            <ul className="wn-feature-placeholder__list">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="wn-feature-placeholder__actions">
              {primaryAction && (
                <Button to={primaryAction.to} variant="primary">
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button to={secondaryAction.to} variant="outline">
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
