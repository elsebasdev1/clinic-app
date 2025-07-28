import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientEditProfile from './pages/PatientEditProfile';
import ScheduleAppointment from './pages/ScheduleAppointment';
import SpecialtyManagement from './pages/SpecialtyManagement';
import DoctorManagement from './pages/DoctorManagement';
import UserManagement from './pages/UserManagement';

function PrivateRoute({ children }) {
  const { firebaseUser, loadingAuth } = useAuth();
  if (loadingAuth) return null;
  return firebaseUser ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { firebaseUser, role, loadingAuth } = useAuth();
  if (loadingAuth) return null;
  return firebaseUser && role === 'admin'
    ? children
    : <Navigate to="/" replace />;
}

function LoginRoute() {
  const { firebaseUser, role, loadingAuth } = useAuth();
  if (loadingAuth) return null;
  return !firebaseUser
    ? <Login />
    : role === 'admin'
      ? <Navigate to="/admin" replace />
      : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#fff',
            color: '#333',
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route path="/" element={
          <PrivateRoute>
            <PatientDashboard />
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <PatientEditProfile />
          </PrivateRoute>
        } />

        <Route path="/schedule" element={
          <PrivateRoute>
            <ScheduleAppointment />
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="/admin/specialties" element={
          <AdminRoute>
            <SpecialtyManagement />
          </AdminRoute>
        } />

        <Route path="/admin/doctors" element={
          <AdminRoute>
            <DoctorManagement />
          </AdminRoute>
        } />

        <Route path="/admin/users" element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
