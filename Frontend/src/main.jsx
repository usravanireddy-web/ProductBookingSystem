import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import './styles.css';

function Application() {
  const app = useApp();
  const [authPage, setAuthPage] = useState('login');

  if (!app.token) {
    return authPage === 'register' ? (
      <RegisterPage goLogin={() => setAuthPage('login')} />
    ) : (
      <LoginPage goRegister={() => setAuthPage('register')} />
    );
  }

  return app.user?.role === 'admin' ? <AdminDashboard {...app} /> : <CustomerDashboard {...app} />;
}

createRoot(document.getElementById('root')).render(
  <AppProvider>
    <Application />
  </AppProvider>,
);
