import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout.jsx';
import { Filters } from './components/Filters.jsx';
import { DonorList } from './components/DonorList.jsx';
import { AdminAuthPage } from './components/AdminAuthPage.jsx';
import { AdminDonors } from './components/AdminDonors.jsx';
import { fetchDonors } from './utils/donorsService.js';
import { filterDonors } from './utils/filters.js';
import { BLOOD_GROUPS, KERALA_DISTRICTS } from './utils/options.js';
import { supabase } from './utils/supabaseClient.js';
import './styles/layout.css';
import './styles/donors.css';

const INITIAL_FILTER_VALUE = 'all';

function getInitialView() {
  const hash = window.location.hash;
  if (hash === '#/admin') return 'admin';
  if (hash === '#/blood-kochi-login') return 'admin-login';
  if (hash === '#/blood-kochi-register') return 'admin-register';
  return 'public';
}

export default function App() {
  const [donors, setDonors] = useState([]);
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
      const fetchedDonors = await fetchDonors();
      setDonors(fetchedDonors);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error while loading donors.');
      setStatus('error');
    }
  }, []);

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

  // Load admin profile (role, blocked flag) for the logged-in user
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

      if (!error) {
        setAdminProfile(data);
      } else {
        setAdminProfile(null);
      }
    };

    void loadProfile();
  }, [adminSession]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setView('admin');
      } else if (hash === '#/blood-kochi-login') {
        setView('admin-login');
      } else if (hash === '#/blood-kochi-register') {
        setView('admin-register');
      } else {
        setView('public');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const bloodGroupOptions = BLOOD_GROUPS;
  const districtOptions = KERALA_DISTRICTS;

  const filteredDonors = useMemo(
    () =>
      filterDonors(donors, {
        bloodGroup: selectedBloodGroup,
        district: selectedDistrict,
      }),
    [donors, selectedBloodGroup, selectedDistrict],
  );

  const handleResetFilters = () => {
    setSelectedBloodGroup(INITIAL_FILTER_VALUE);
    setSelectedDistrict(INITIAL_FILTER_VALUE);
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
                onBloodGroupChange={setSelectedBloodGroup}
                onDistrictChange={setSelectedDistrict}
                onReset={handleResetFilters}
              />
            </section>

            <section
              className="donors-section"
              aria-label="List of blood donors"
            >
              <DonorList
                donors={filteredDonors}
                status={status}
                error={error}
                onRetry={loadDonors}
              />
            </section>
          </>
        )}

        {(view === 'admin-login' || view === 'admin-register') && (
          <AdminAuthPage onAuthenticated={setAdminSession} />
        )}

        {view === 'admin' && (
          <section className="admin-section" aria-label="Admin portal">
            {adminSession ? (
              <AdminDonors isSuperAdmin={isSuperAdmin} />
            ) : (
              <p className="admin-message">
                You must sign in via the admin login URL before accessing the
                admin portal.
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
