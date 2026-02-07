import { useState } from 'react';
import { supabase } from '../utils/supabaseClient.js';

export function AdminLogin({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (authError) {
      setError(authError.message || 'Login failed.');
      return;
    }

    onAuthenticated(data.session);
    window.location.hash = '#/admin';
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2 className="admin-title">Admin Login</h2>
      <label className="admin-label">
        Email
        <input
          className="admin-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="admin-label">
        Password
        <input
          className="admin-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
      <button
        className="admin-button"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

