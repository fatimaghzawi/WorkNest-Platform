import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';
import { profileApi } from '../../../api/profile.api';
import type { UserProfile } from '../../../types/profile';
import { getApiErrorMessage } from '../../../utils/apiError';
import { PROFILE_COPY, type ModernProfileConfig } from './profileConfig';

type Props = {
  open: boolean;
  user: UserProfile;
  config: ModernProfileConfig;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditProfileModal({ open, user, config, onClose, onUpdated }: Props) {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const copy = PROFILE_COPY[config.role];
  const showSkills = config.showSkills ?? config.role === 'freelancer';
  const showPortfolio = config.showPortfolio ?? config.role === 'freelancer';

  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio || '',
    phone: user.phone || '',
    portfolioLink: user.portfolioLink || '',
    skills: user.skills || [],
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || '',
      phone: user.phone || '',
      portfolioLink: user.portfolioLink || '',
      skills: user.skills || [],
    });
    setSkillInput('');
  }, [open, user]);

  const addSkill = () => {
    const next = skillInput.trim();
    if (!next || form.skills.includes(next)) return;
    setForm({ ...form, skills: [...form.skills, next] });
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter((item) => item !== skill) });
  };

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.warning('First and last name are required.');
      return;
    }

    setLoading(true);
    try {
      await profileApi.updateMe({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio.trim() || undefined,
        phone: form.phone.trim() || undefined,
        ...(showPortfolio
          ? { portfolioLink: form.portfolioLink.trim() || undefined }
          : {}),
        ...(showSkills
          ? { skills: form.skills.length ? form.skills : undefined }
          : {}),
      });
      await refreshUser();
      toast.success('Profile updated.');
      onUpdated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={submit}>
            Save changes
          </Button>
        </>
      }
    >
      <form
        className="wn-profile-edit-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <fieldset className="wn-profile-edit-section">
          <legend>Personal details</legend>
          <div className="wn-profile-form-grid">
            <Input
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>
        </fieldset>

        <fieldset className="wn-profile-edit-section">
          <legend>About</legend>
          <Input
            as="textarea"
            label="Bio"
            rows={4}
            maxLength={500}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder={copy.bioPlaceholder}
            helperText={`${form.bio.length}/500 characters`}
          />
        </fieldset>

        <fieldset className="wn-profile-edit-section">
          <legend>Contact{showPortfolio ? ' & links' : ''}</legend>
          <div className={showPortfolio ? 'wn-profile-form-grid' : undefined}>
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1234567890"
            />
            {showPortfolio && (
              <Input
                label="Portfolio link"
                type="url"
                value={form.portfolioLink}
                onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })}
                placeholder="https://yourportfolio.com"
              />
            )}
          </div>
        </fieldset>

        {showSkills && (
          <fieldset className="wn-profile-edit-section">
            <legend>Skills</legend>
            <Input
              label="Add skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. React, UI Design"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              helperText="Press Enter to add. Click a tag to remove."
            />
            {form.skills.length > 0 && (
              <div className="wn-profile-edit-skills">
                {form.skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className="wn-profile-edit-skill"
                    onClick={() => removeSkill(skill)}
                  >
                    <Badge variant="default">{skill}</Badge>
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}
          </fieldset>
        )}
      </form>
    </Modal>
  );
}
