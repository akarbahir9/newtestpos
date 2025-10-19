import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from './layout/Layout';

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
