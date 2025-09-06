import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './admin/AdminAuthContext';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerDetail from './components/CustomerDetail';
import Profile from './components/Profile';
import Analytics from './components/Analytics';
import Cashbook from './components/Cashbook';
import ContactUs from './components/ContactUs';

// Admin Components
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminUserDetails from './admin/AdminUserDetails';
import AdminMessages from './admin/AdminMessages';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" />;
}

function AdminProtectedRoute({ children }) {
  const { admin } = useAdminAuth();
  return admin ? children : <Navigate to="/admin/login" />;
}

function AdminPublicRoute({ children }) {
  const { admin } = useAdminAuth();
  return !admin ? children : <Navigate to="/admin/dashboard" />;
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* User Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cashbook" 
                element={
                  <ProtectedRoute>
                    <Cashbook />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/:id" 
                element={
                  <ProtectedRoute>
                    <CustomerDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <ProtectedRoute>
                    <ContactUs />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/login" 
                element={
                  <AdminPublicRoute>
                    <AdminLogin />
                  </AdminPublicRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminProtectedRoute>
                    <AdminUsers />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users/:userId" 
                element={
                  <AdminProtectedRoute>
                    <AdminUserDetails />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/messages" 
                element={
                  <AdminProtectedRoute>
                    <AdminMessages />
                  </AdminProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;