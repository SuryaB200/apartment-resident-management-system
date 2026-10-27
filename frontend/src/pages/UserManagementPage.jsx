import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'RESIDENT',
    phone: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.users.getUsers('?page_size=200');
      setUsers(data.results || data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Unable to retrieve user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.users.createUser(formData);
      setShowCreateModal(false);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'RESIDENT',
        phone: '',
        password: '',
      });
      loadUsers();
    } catch (err) {
      alert("Failed to provision account: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      searchQuery === '' ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.last_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>System &amp; Security</span>
            <span>/</span>
            <span className="text-primary font-semibold">Access Control</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">RBAC Permissions</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">User Accounts &amp; RBAC Matrix</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Role-Based Access Control matrix governing administrative, staff, resident, and security roles.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Create Account</span>
          </button>
        </div>
      </div>

      {/* RBAC Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-surface-container-low text-on-surface w-full sm:w-80">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by username, name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
            />
          </div>

          <div className="flex items-center gap-space-xs">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm py-2 pl-space-sm pr-7 rounded-xl outline-none cursor-pointer hover:bg-surface-container transition-colors"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">System Admin</option>
                <option value="STAFF">Facility Staff</option>
                <option value="RESIDENT">Resident</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-outline pointer-events-none">unfold_more</span>
            </div>

            <button
              onClick={() => { setRoleFilter('ALL'); setSearchQuery(''); }}
              className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">User</th>
                <th className="py-3 px-space-md font-semibold">Username</th>
                <th className="py-3 px-space-md font-semibold">Assigned Role</th>
                <th className="py-3 px-space-md font-semibold">Contact Email</th>
                <th className="py-3 px-space-md font-semibold">Contact Phone</th>
                <th className="py-3 px-space-lg text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading user credentials...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    No users matching selected role or query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-space-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {u.first_name?.[0] || u.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="font-semibold text-on-surface">
                          {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-space-md font-mono text-body-sm text-primary font-bold">
                      @{u.username}
                    </td>
                    <td className="py-3 px-space-md">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-primary-container text-on-primary'
                            : u.role === 'STAFF'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-space-md text-body-sm text-on-surface-variant">
                      {u.email || '—'}
                    </td>
                    <td className="py-3 px-space-md font-mono text-body-sm text-on-surface-variant">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3 px-space-lg text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container text-tertiary-container font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Provision User</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Create authenticated account</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-space-sm">
              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="RESIDENT">Resident</option>
                    <option value="STAFF">Staff / Security</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
