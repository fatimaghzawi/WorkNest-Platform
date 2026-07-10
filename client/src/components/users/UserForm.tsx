import { FormEvent, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../hooks/useToast';
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from '../../types/user';
import type { UserRole } from '../../types/auth';
import { getApiErrorMessage } from '../../utils/apiError';
import '../../css/DashboardFeatures.css';

interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  bio: string;
  skills: string;
  portfolioLink: string;
  isActive: boolean;
}

const emptyValues: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'freelancer',
  phone: '',
  bio: '',
  skills: '',
  portfolioLink: '',
  isActive: true,
};

function toFormValues(user?: AdminUser): UserFormValues {
  if (!user) return emptyValues;

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    role: user.role,
    phone: user.phone || '',
    bio: user.bio || '',
    skills: user.skills?.join(', ') || '',
    portfolioLink: user.portfolioLink || '',
    isActive: user.isActive,
  };
}

export default function UserForm({
  initialUser,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialUser?: AdminUser;
  submitLabel: string;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const toast = useToast();
  const isEditing = Boolean(initialUser);
  const [values, setValues] = useState<UserFormValues>(() => toFormValues(initialUser));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const skills = values.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const shared = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      role: values.role,
      phone: values.phone.trim() || undefined,
      bio: values.bio.trim() || undefined,
      skills: skills.length ? skills : undefined,
      portfolioLink: values.portfolioLink.trim() || undefined,
      isActive: values.isActive,
    };

    try {
      if (isEditing) {
        await onSubmit(shared);
      } else {
        await onSubmit({
          ...shared,
          email: values.email.trim(),
          password: values.password,
        });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save user.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="wn-dash-form" onSubmit={handleSubmit} noValidate>
      <div className="wn-dash-form__row">
        <Input
          label="First name"
          required
          value={values.firstName}
          onChange={(e) => setValues((prev) => ({ ...prev, firstName: e.target.value }))}
        />
        <Input
          label="Last name"
          required
          value={values.lastName}
          onChange={(e) => setValues((prev) => ({ ...prev, lastName: e.target.value }))}
        />
      </div>

      {!isEditing && (
        <>
          <Input
            label="Email"
            type="email"
            required
            value={values.email}
            onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            required
            value={values.password}
            onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
            helperText="Minimum 8 characters"
          />
        </>
      )}

      <div className="wn-dash-form__row">
        <div>
          <label className="wn-dash-field-label" htmlFor="user-role">
            Role
          </label>
          <select
            id="user-role"
            className="wn-dash-select"
            style={{ width: '100%' }}
            value={values.role}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, role: e.target.value as UserRole }))
            }
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Input
          label="Phone"
          value={values.phone}
          onChange={(e) => setValues((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="+1234567890"
          helperText="E.164 format"
        />
      </div>

      <Input
        as="textarea"
        label="Bio"
        value={values.bio}
        onChange={(e) => setValues((prev) => ({ ...prev, bio: e.target.value }))}
        rows={3}
      />

      <Input
        label="Skills"
        value={values.skills}
        onChange={(e) => setValues((prev) => ({ ...prev, skills: e.target.value }))}
        helperText="Comma-separated, e.g. React, Node.js, Design"
      />

      <Input
        label="Portfolio link"
        value={values.portfolioLink}
        onChange={(e) => setValues((prev) => ({ ...prev, portfolioLink: e.target.value }))}
      />

      <label className="wn-dash-field-label">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => setValues((prev) => ({ ...prev, isActive: e.target.checked }))}
          style={{ marginRight: 8 }}
        />
        Active account
      </label>

      <div className="wn-dash-form__actions">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
