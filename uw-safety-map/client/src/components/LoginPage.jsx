import { useState } from 'react';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validate() {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('UW email is required.');
      valid = false;
    } else if (!email.toLowerCase().endsWith('@uw.edu')) {
      setEmailError('Must be a @uw.edu email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }

    return valid;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) {
      onLogin({ email });
    }
  }

  // Derive NetID from email for display
  const netid = email.toLowerCase().replace('@uw.edu', '');

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-title">🗺️ Husky Help</div>
          <div className="login-brand-subtitle">Protect the Pack</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="uw-email">UW Email (NetID)</label>
            <input
              id="uw-email"
              type="email"
              placeholder="netid@uw.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={emailError ? 'error' : ''}
              autoComplete="username"
            />
            {emailError && <span className="login-error">{emailError}</span>}
          </div>

          <div className="login-field">
            <label htmlFor="uw-password">Password</label>
            <input
              id="uw-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={passwordError ? 'error' : ''}
              autoComplete="current-password"
            />
            {passwordError && <span className="login-error">{passwordError}</span>}
          </div>

          <button type="submit" className="login-submit">
            Sign in with UW NetID
          </button>
        </form>

        <p className="login-note">
          Demo mode — any password accepted for <span>@uw.edu</span> accounts
        </p>
      </div>
    </div>
  );
}
