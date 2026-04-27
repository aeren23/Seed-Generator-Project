import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../api/adminService';
import toast from 'react-hot-toast';

const GoldenButton: React.FC = () => {
  const { user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  // Sadece Admin'lere göster
  if (user?.role !== 'Admin') {
    return null;
  }

  const handleReset = async () => {
    try {
      setIsResetting(true);
      
      // Toast Loading Bildirimi
      toast.loading('Sistem Golden State\'e geri döndürülüyor...', { id: 'resetToast' });
      
      await adminService.resetDemoState();
      
      // Toast Başarı Bildirimi
      toast.success('OmniSeed çalıştı! Sistem başarıyla Golden State\'e döndü.', { id: 'resetToast' });
      
      // Kısa bir süre bekleyip UI'ı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      toast.error('Sıfırlama işlemi başarısız oldu.', { id: 'resetToast' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white shadow-2xl shadow-yellow-500/50 transition-all duration-300
        ${isResetting ? 'bg-yellow-600 scale-95 cursor-wait' : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:scale-105 hover:-translate-y-1'}`}
      title="Sistemi OmniSeed ile Golden State'e döndür"
    >
      <RefreshCw className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">Reset Demo State</span>
    </button>
  );
};

export default GoldenButton;
