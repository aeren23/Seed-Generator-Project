import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin'); // Varsayılan demo hesap
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await authService.login({ username, password });
      login(data.token, {
        id: data.userId,
        email: data.username,
        fullName: data.fullName,
        role: data.role
      });
      toast.success('Giriş başarılı!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">Hoş Geldiniz</h2>
        <p className="text-center text-slate-500 mb-8">Devam etmek için hesabınıza giriş yapın</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı veya E-posta</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-70 mt-4 shadow-lg shadow-slate-900/20"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Demo Hesapları</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onClick={() => { setUsername('admin'); setPassword('Admin123!'); }} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 text-left transition-colors">
              <span className="block font-bold text-slate-900">Admin</span> admin
            </button>
            <button type="button" onClick={() => { setUsername('seller'); setPassword('Seller123!'); }} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 text-left transition-colors">
              <span className="block font-bold text-slate-900">Satıcı</span> seller
            </button>
            <button type="button" onClick={() => { setUsername('customer'); setPassword('Customer123!'); }} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 text-left transition-colors col-span-2">
              <span className="block font-bold text-slate-900">Müşteri</span> customer
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          Hesabınız yok mu? <Link to="/register" className="text-blue-600 font-bold hover:underline">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
