import ProfileSettingsPage from '../../_shared/profile/ProfileSettingsPage';

export default function Profile() {
  return (
    <ProfileSettingsPage
      role="admin"
      eyebrow="Account"
      subtitle="Manage your personal details and how you appear across the admin workspace."
      showAbout={false}
      showPortfolio={false}
      showSkills={false}
    />
  );
}
