import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Customer'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.register(formData);
      toast.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">Kayıt Ol</h2>
        <p className="text-center text-slate-500 mb-8">Yeni bir hesap oluşturun</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
            <input 
              type="text" required
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
            <input 
              type="email" required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <input 
              type="password" required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hesap Türü</label>
            <select
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            >
              <option value="Customer">Müşteri</option>
              <option value="Seller">Satıcı</option>
            </select>
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold mt-6 shadow-lg"
          >
            {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          Zaten hesabınız var mı? <Link to="/login" className="text-blue-600 font-bold hover:underline">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
