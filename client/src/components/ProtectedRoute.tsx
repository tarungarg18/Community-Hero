import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isGoogleUser = user.providerData.some((p) => p.providerId === 'google.com');
  if (!isGoogleUser && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
