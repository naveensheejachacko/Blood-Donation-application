import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout.jsx';
import { Filters } from './components/Filters.jsx';
import { DonorList } from './components/DonorList.jsx';
import { AdminAuthPage } from './components/AdminAuthPage.jsx';
import { AdminDonors } from './components/AdminDonors.jsx';
import { fetchDonors, fetchDonorsPage } from './utils/donorsService.js';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from './utils/options.js';
import { supabase } from './utils/supabaseClient.js';
import './styles/layout.css';
import './styles/donors.css';

const INITIAL_FILTER_VALUE = 'all';
const DONORS_PAGE_SIZE = 20;

function getInitialView() {
  const hash = window.location.hash;
  if (hash === '#/admin') return 'admin';
  if (hash === '#/admin/login') return 'admin-login';
  // Legacy redirects
  if (hash === '#/blood-kochi-login' || hash === '#/blood-kochi-register') {
    window.location.hash = '#/admin/login';
    return 'admin-login';
  }
  return 'public';
}

export default function App() {
  const [donors, setDonors] = useState([]);
  const [totalDonors, setTotalDonors] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(INITIAL_FILTER_VALUE);
  const [selectedDistrict, setSelectedDistrict] = useState(INITIAL_FILTER_VALUE);
  const [view, setView] = useState(getInitialView); // 'public' | 'admin' | 'admin-login' | 'admin-register'
  const [adminSession, setAdminSession] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);

  const loadDonors = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const { donors: fetchedDonors, total } = await fetchDonorsPage({
        page,
        pageSize: DONORS_PAGE_SIZE,
        bloodGroup: selectedBloodGroup,
        district: selectedDistrict,
      });
      setDonors(fetchedDonors);
      setTotalDonors(total);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error while loading donors.');
      setStatus('error');
    }
  }, [page, selectedBloodGroup, selectedDistrict]);

  useEffect(() => {
    void loadDonors();
  }, [loadDonors]);

  // Restore admin session on reload and keep it in sync with Supabase Auth
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setAdminSession(data.session ?? null);
      }
    };

    void initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(session ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load admin profile (role, blocked flag). If none, create pending row so super admin can approve.
  useEffect(() => {
    const loadProfile = async () => {
      if (!adminSession?.user) {
        setAdminProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('admin_profiles')
        .select('role, is_blocked')
        .eq('user_id', adminSession.user.id)
        .maybeSingle();

      if (!error && data) {
        setAdminProfile(data);
        return;
      }

      if (!error && !data) {
        // No profile: create pending row (RLS allows self-insert with role=admin, is_blocked=true)
        const email = adminSession.user.email ?? '';
        await supabase.from('admin_profiles').insert({
          user_id: adminSession.user.id,
          email,
          role: 'admin',
          is_blocked: true,
        });
        const { data: after } = await supabase
          .from('admin_profiles')
          .select('role, is_blocked')
          .eq('user_id', adminSession.user.id)
          .maybeSingle();
        setAdminProfile(after ?? null);
        return;
      }

      setAdminProfile(null);
    };

    void loadProfile();
  }, [adminSession]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setView('admin');
      } else if (hash === '#/admin/login') {
        setView('admin-login');
      } else if (hash === '#/blood-kochi-login' || hash === '#/blood-kochi-register') {
        window.location.hash = '#/admin/login';
      } else {
        setView('public');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const bloodGroupOptions = BLOOD_GROUPS;
  const districtOptions = KERALA_DISTRICTS;

  const handleResetFilters = () => {
    setSelectedBloodGroup(INITIAL_FILTER_VALUE);
    setSelectedDistrict(INITIAL_FILTER_VALUE);
    setPage(1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdminSession(null);
    setAdminProfile(null);
    window.location.hash = '';
    setView('public');
  };

  const isSuperAdmin =
    !!adminProfile &&
    adminProfile.role === 'super_admin' &&
    adminProfile.is_blocked === false;

  return (
    <Layout>
      <header className="layout-header">
        <div className="layout-header-inner">
          <h1 className="site-title">Blood Donation Directory</h1>
          <div className="layout-header-actions">
            {view === 'public' && !adminSession && (
              <a href="#/admin/login" className="admin-login-link">
                Admin
              </a>
            )}
            {adminSession && (
              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="layout-main">
        {view === 'public' && (
          <>
            <section className="filters-section" aria-label="Filter donors">
              <Filters
                bloodGroupOptions={bloodGroupOptions}
                districtOptions={districtOptions}
                selectedBloodGroup={selectedBloodGroup}
                selectedDistrict={selectedDistrict}
                onBloodGroupChange={(v) => {
                  setSelectedBloodGroup(v);
                  setPage(1);
                }}
                onDistrictChange={(v) => {
                  setSelectedDistrict(v);
                  setPage(1);
                }}
                onReset={handleResetFilters}
              />
            </section>

            <section
              className="donors-section"
              aria-label="List of blood donors"
            >
              <DonorList
                donors={donors}
                status={status}
                error={error}
                onRetry={loadDonors}
                page={page}
                pageSize={DONORS_PAGE_SIZE}
                totalCount={totalDonors}
                onPageChange={setPage}
              />
            </section>
          </>
        )}

        {(view === 'admin-login' || view === 'admin-register') && (
          <AdminAuthPage onAuthenticated={setAdminSession} />
        )}

        {view === 'admin' && (
          <section className="admin-section" aria-label="Admin portal">
            {!adminSession ? (
              <p className="admin-message">
                You must sign in via the admin login URL before accessing the
                admin portal.
              </p>
            ) : adminProfile?.is_blocked ? (
              <p className="admin-message">
                {adminProfile.role === 'super_admin'
                  ? 'Your account is blocked. Contact another super admin.'
                  : 'Your account is pending approval. A super admin must approve you in Manage admins before you can use the portal.'}
              </p>
            ) : adminProfile ? (
              <AdminDonors isSuperAdmin={isSuperAdmin} />
            ) : (
              <p className="admin-message">
                Your account must be added by a super admin in Manage admins
                before you can use the portal.
              </p>
            )}
          </section>
        )}
      </main>

      <footer className="layout-footer">
        <div className="layout-footer-inner">

        </div>
      </footer>
    </Layout>
  );
}
