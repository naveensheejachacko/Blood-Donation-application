import { AdminLogin } from './AdminLogin.jsx';
import { AdminRegister } from './AdminRegister.jsx';

export function AdminAuthPage({ onAuthenticated }) {
  return (
    <section className="admin-section" aria-label="Admin sign in and register">
      <h2 className="admin-auth-page-title">Admin</h2>
      <p className="admin-auth-page-subtitle">
        Sign in if you have an account, or register to request access.
      </p>
      <div className="admin-auth-layout admin-auth-same-page">
        <div className="admin-auth-block">
          <AdminLogin onAuthenticated={onAuthenticated} />
        </div>
        <div className="admin-auth-block">
          <AdminRegister />
        </div>
      </div>
    </section>
  );
}
