import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import { useAuth } from './hooks/useAuth';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/employees" element={<Employees />} />
      </Route>
    </Routes>
  );
}

export default App;
