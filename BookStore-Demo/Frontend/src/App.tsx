import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardHome from './pages/DashboardHome';
import InventoryManagement from './pages/InventoryManagement';
import AdminPanel from './pages/AdminPanel';
import BookDetailPage from './pages/BookDetailPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Public / General User Routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/books/:id" element={<Layout><BookDetailPage /></Layout>} />
      
      {/* Seller & Admin Routes */}
      <Route 
        path="/seller/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Seller', 'Admin']}>
            <Layout><DashboardHome /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/seller/inventory" 
        element={
          <ProtectedRoute allowedRoles={['Seller', 'Admin']}>
            <Layout><InventoryManagement /></Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Only Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout><AdminPanel /></Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            }} 
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
