import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, BookOpen, LogIn, Shield } from 'lucide-react';
import CartModal from './CartModal';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { basket } = useCart();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalItems = basket?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-panel border-b-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="font-bold text-xl tracking-tight text-slate-900">CleanBook</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="text-sm font-medium text-slate-700 hidden sm:block">
                    Hoş geldin, {user.fullName} <span className="text-xs bg-slate-200 px-2 py-1 rounded-full ml-1">{user.role}</span>
                  </div>
                  
                  {['Seller', 'Admin'].includes(user.role) && (
                    <Link to="/seller/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Dashboard
                    </Link>
                  )}

                  {user.role === 'Admin' && (
                    <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-800">
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                  )}

                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {totalItems > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </button>

                  <button onClick={handleLogout} className="p-2 text-slate-600 hover:text-red-600 transition-colors">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                  <LogIn className="h-5 w-5" />
                  Giriş Yap
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
