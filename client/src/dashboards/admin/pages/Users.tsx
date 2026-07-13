import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import UserForm from '../../../components/users/UserForm';
import { usersApi } from '../../../api/user.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import UserCard from '../components/users/UserCard';
import UserDetailPanel from '../components/users/UserDetailPanel';
import UsersDirectoryOverview from '../components/users/UsersDirectoryOverview';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { AdminUser, CreateUserPayload, UpdateUserPayload, UserStats } from '../../../types/user';
import type { UserRole } from '../../../types/auth';
import { getApiErrorMessage } from '../../../utils/apiError';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/DashboardFeatures.css';
import '../../../css/UsersAdmin.css';

type RoleFilter = UserRole | 'all';
type SortOption = 'newest' | 'name_asc' | 'name_desc' | 'role';

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'client', label: 'Clients' },
  { value: 'freelancer', label: 'Freelancers' },
  { value: 'admin', label: 'Admins' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'role', label: 'Role' },
];

const emptyStats: UserStats = {
  total: 0,
  active: 0,
  clients: 0,
  freelancers: 0,
  admins: 0,
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>(emptyStats);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: debouncedSearch.trim() || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      sort,
    }),
    [page, debouncedSearch, roleFilter, sort]
  );

  const loadStats = useCallback(async () => {
    try {
      const response = await usersApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.warning(getApiErrorMessage(error, 'Could not refresh user overview stats.'));
    }
  }, [toast]);

  const loadUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await usersApi.list(listParams);
      const nextUsers = response.data.data;
      setUsers(nextUsers);
      setTotalPages(response.data.meta?.totalPages || 1);

      setSelectedUser((current) => {
        if (current) {
          return nextUsers.find((user) => user._id === current._id) ?? current;
        }
        return nextUsers[0] ?? null;
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [listParams, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refreshAll = async (silent = true) => {
    await Promise.all([loadUsers(silent), loadStats()]);
  };

  const patchUser = async (userId: string, payload: UpdateUserPayload) => {
    setActionBusy(true);
    try {
      const response = await usersApi.update(userId, payload);
      const updated = response.data.data;
      setUsers((current) => current.map((user) => (user._id === updated._id ? updated : user)));
      setSelectedUser(updated);
      if (payload.isActive !== undefined) {
        toast.success(updated.isActive ? 'User activated.' : 'User deactivated.');
      } else if (payload.role) {
        toast.success(`Role updated to ${updated.role}.`);
      } else {
        toast.success('User updated successfully.');
      }
      void loadStats();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update user.'));
      throw err;
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggleActive = async (active: boolean) => {
    if (!selectedUser) return;
    await patchUser(selectedUser._id, { isActive: active });
  };

  const handleRoleChange = async (role: UserRole) => {
    if (!selectedUser || selectedUser.role === role) return;

    const isAdminChange = role === 'admin' || selectedUser.role === 'admin';
    if (isAdminChange) {
      const confirmed = await confirm({
        title: role === 'admin' ? 'Grant admin access' : 'Change admin role',
        message:
          role === 'admin'
            ? `Grant admin privileges to ${selectedUser.firstName} ${selectedUser.lastName}? They will have full platform access.`
            : `Remove admin privileges from ${selectedUser.firstName} ${selectedUser.lastName}?`,
        confirmLabel: role === 'admin' ? 'Grant admin' : 'Change role',
        variant: role === 'admin' ? 'primary' : 'danger',
      });
      if (!confirmed) return;
    }

    await patchUser(selectedUser._id, { role });
  };

  const handleDeactivate = async () => {
    if (!selectedUser || !selectedUser.isActive) return;
    const fullName = `${selectedUser.firstName} ${selectedUser.lastName}`;
    const confirmed = await confirm({
      title: 'Deactivate user',
      message: `Deactivate ${fullName}? They will no longer be able to sign in.`,
      confirmLabel: 'Deactivate user',
      variant: 'danger',
    });
    if (!confirmed) return;

    await patchUser(selectedUser._id, { isActive: false });
  };

  const hasFilters = Boolean(debouncedSearch.trim()) || roleFilter !== 'all';

  if (loading && users.length === 0) {
    return (
      <div className="wn-analytics">
        <DashboardPageHeader
          hero
          eyebrow="Admin"
          title="User management"
          subtitle="Loading members..."
        />
        <div className="wn-users-overview wn-users-overview--loading" aria-hidden>
          <div className="wn-users-overview__spotlight" />
          <div className="wn-users-overview__tiles">
            <div className="wn-users-overview__tile" />
            <div className="wn-users-overview__tile" />
            <div className="wn-users-overview__tile" />
            <div className="wn-users-overview__tile" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wn-analytics">
      <DashboardPageHeader
        hero
        eyebrow="Admin"
        title="User management"
        subtitle="Browse members, review profiles, and manage roles across the platform."
        actions={
          <Button leftIcon={<UserPlus size={18} />} onClick={() => { setCreating(true); setEditing(null); }}>
            Add user
          </Button>
        }
      />

      <UsersDirectoryOverview stats={stats} />

      <section className="wn-analytics-card wn-members-toolbar">
        <label className="wn-members-sort">
          <span>Sort by</span>
          <select
            className="wn-dash-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <input
          className="wn-dash-search wn-members-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search users"
        />

        <div className="wn-members-filters">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`wn-members-chip ${roleFilter === filter.value ? 'wn-members-chip--active' : ''}`}
              onClick={() => { setRoleFilter(filter.value); setPage(1); }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div className="wn-analytics__layout wn-members-layout">
        <section className="wn-analytics-card wn-members-grid-wrap" aria-label="User cards">
          {loading ? (
            <div className="wn-members-skeleton" aria-hidden>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="wn-members-skeleton__card" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title={hasFilters ? 'No users match your filters' : 'No users yet'}
              description={
                hasFilters
                  ? 'Try adjusting your search or filters.'
                  : 'Add the first member to get your community started.'
              }
              actionLabel={hasFilters ? undefined : 'Add user'}
              onAction={hasFilters ? undefined : () => setCreating(true)}
            />
          ) : (
            <>
              <div className="wn-members-grid">
                {users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    selected={selectedUser?._id === user._id}
                    onSelect={setSelectedUser}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div style={{ marginTop: 16 }}>
                  <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </section>

        {selectedUser && (
          <UserDetailPanel
            user={selectedUser}
            isSelf={selectedUser._id === currentUser?._id}
            onClose={() => setSelectedUser(null)}
            onEdit={() => { setEditing(selectedUser); setCreating(false); }}
            onToggleActive={handleToggleActive}
            onRoleChange={handleRoleChange}
            onDeactivate={handleDeactivate}
            busy={actionBusy}
          />
        )}
      </div>

      <Modal
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? 'Edit user' : 'Invite new user'}
        size="lg"
      >
        <UserForm
          initialUser={editing || undefined}
          submitLabel={editing ? 'Save changes' : 'Create user'}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={async (payload) => {
            if (editing) {
              const response = await usersApi.update(editing._id, payload as UpdateUserPayload);
              toast.success('User updated successfully.');
              setSelectedUser(response.data.data);
            } else {
              await usersApi.create(payload as CreateUserPayload);
              toast.success('User created successfully.');
            }
            setCreating(false);
            setEditing(null);
            await refreshAll(true);
          }}
        />
      </Modal>
    </div>
  );
}
