import { Sparkles } from 'lucide-react';
import FeaturePlaceholder from '../../_shared/FeaturePlaceholder';

export default function AdminSkills() {
  return (
    <FeaturePlaceholder
      eyebrow="Admin"
      title="Skills taxonomy"
      subtitle="Manage the skills library freelancers use to tag profiles and proposals."
      icon={Sparkles}
      highlights={[
        'Curated skill list with synonyms',
        'Merge duplicate skill entries',
        'Trending skills from job posts',
        'Link skills to categories',
      ]}
      primaryAction={{ label: 'Categories', to: '/admin/categories' }}
      secondaryAction={{ label: 'Users', to: '/admin/users' }}
    />
  );
}
