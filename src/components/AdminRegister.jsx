import { useState } from 'react';
import { supabase } from '../utils/supabaseClient.js';

export function AdminRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message || 'Registration failed.');
      return;
    }

    setMessage('Registration successful. Check your email to confirm your account.');
    setEmail('');
    setPassword('');
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2 className="admin-title">Admin Register</h2>
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
      {message ? <p className="admin-message">{message}</p> : null}
      <button
        className="admin-button admin-button-secondary"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
}

