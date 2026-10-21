import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PasswordInput } from '../components/form/PasswordInput';

function AuthLayout({ children, title, description, label }) {
  return (
    <main className="auth-page">
      <section className="auth-art">
        <p>BOOKFLOW</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </section>
      <section className="auth-card">
        <p className="eyebrow">{label}</p>
        {children}
      </section>
    </main>
  );
}

export function LoginPage({ goRegister }) {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <AuthLayout
      title="Turn every product request into a finished delivery."
      description="Products · bookings · inventory"
      label="WELCOME BACK"
    >
      <h2>Sign in to Bookflow</h2>
      <form onSubmit={submit}>
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button>Sign in</button>
      </form>
      <p className="muted auth-link">
        New customer?{' '}
        <button type="button" onClick={goRegister}>
          Create account
        </button>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage({ goLogin }) {
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    try {
      await register(name, email, mobileNumber, password);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <AuthLayout
      title="Create your customer account."
      description="Browse products and request bookings in one place."
      label="CUSTOMER REGISTRATION"
    >
      <h2>Join Bookflow</h2>
      <form onSubmit={submit}>
        {error && <p className="error">{error}</p>}
        <label>
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mobile number
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            placeholder="10-digit mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
          />
        </label>
        <label>
          Password
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="8"
          />
        </label>
        <button>Create account</button>
      </form>
      <p className="muted auth-link">
        Already registered?{' '}
        <button type="button" onClick={goLogin}>
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
