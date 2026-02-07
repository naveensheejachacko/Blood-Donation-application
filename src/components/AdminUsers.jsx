import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient.js';

export function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserId(data.session?.user?.id ?? null);
    };
    void loadUser();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('admin_profiles')
      .select('user_id, email, role, is_blocked')
      .order('email', { ascending: true });

    if (error) {
      setError(error.message || 'Failed to load admin profiles.');
      setAdmins([]);
    } else {
      setAdmins(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadAdmins();
  }, []);

  const updateAdmin = async (userId, patch) => {
    setError('');
    const { error } = await supabase
      .from('admin_profiles')
      .update(patch)
      .eq('user_id', userId);

    if (error) {
      setError(error.message || 'Failed to update admin.');
      return;
    }

    await loadAdmins();
  };

  return (
    <div>
      <h3 className="admin-title">Admin management</h3>
      {error ? <p className="admin-error">{error}</p> : null}
      {loading ? (
        <p className="admin-message">Loading admins…</p>
      ) : (
        <ul className="admin-list admin-list-scroll">
          {admins.map((admin) => {
            const isCurrentUser = admin.user_id === currentUserId;
            const isCurrentUserSuperAdmin =
              isCurrentUser && admin.role === 'super_admin';

            return (
              <li key={admin.user_id} className="admin-list-item">
                <div className="admin-list-item-main">
                  <strong>{admin.email}</strong>
                  <span className="admin-list-item-sub">
                    {admin.role === 'super_admin' ? 'Super admin' : 'Admin'} ·{' '}
                    {admin.is_blocked ? 'Blocked' : 'Active'}
                    {isCurrentUser ? ' (you)' : ''}
                  </span>
                </div>
                <div className="admin-list-actions">
                  <button
                    type="button"
                    className="admin-list-edit"
                    disabled={isCurrentUserSuperAdmin}
                    title={
                      isCurrentUserSuperAdmin
                        ? 'You cannot downgrade yourself'
                        : undefined
                    }
                    onClick={() =>
                      updateAdmin(admin.user_id, {
                        role:
                          admin.role === 'super_admin' ? 'admin' : 'super_admin',
                      })
                    }
                  >
                    {admin.role === 'super_admin'
                      ? 'Make regular admin'
                      : 'Make super admin'}
                  </button>
                  <button
                    type="button"
                    className="admin-list-delete"
                    disabled={isCurrentUser}
                    title={
                      isCurrentUser ? 'You cannot block yourself' : undefined
                    }
                    onClick={() =>
                      updateAdmin(admin.user_id, {
                        is_blocked: !admin.is_blocked,
                      })
                    }
                  >
                    {admin.is_blocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </li>
            );
          })}
          {admins.length === 0 && (
            <li className="admin-list-item">
              <span className="admin-list-item-sub">
                No admin profiles configured yet.
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

