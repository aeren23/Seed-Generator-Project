import React, { useState, useEffect } from 'react';
import type { Category } from '../types';
import { categoryService } from '../api/categoryService';
import toast from 'react-hot-toast';
import { Trash2, Plus, LayoutGrid, Shield } from 'lucide-react';
import GoldenButton from '../components/GoldenButton';

const AdminPanel: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    document.title = "Admin Paneli - CleanBook";
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await categoryService.create(newCategory);
      toast.success('Yeni kategori eklendi!');
      await fetchCategories();
      setNewCategory({ name: '', description: '' });
    } catch (error) {
      toast.error('Kategori eklenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      setActionLoading(true);
      await categoryService.delete(id);
      toast.success('Kategori silindi!');
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kategori silinirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const TableSkeleton = () => (
    <div className="animate-pulse flex flex-col gap-4 p-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-12 w-full bg-slate-200 rounded-lg"></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Paneli</h1>
          <p className="text-slate-500">Sistemin genel ayarlarını ve verilerini yönetin.</p>
        </div>
      </div>

      {/* Golden Button Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Demo Sıfırlama (OmniSeed)</h2>
            <p className="text-sm text-slate-600 mt-1">
              Veritabanını "Golden State"e döndürür. Tüm çöp veriler temizlenir ve AI tarafından oluşturulmuş orijinal demo verisi geri yüklenir.
            </p>
          </div>
          <GoldenButton />
        </div>
      </div>

      {/* Category Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Yeni Kategori
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Adı</label>
                <input 
                  type="text" required 
                  value={newCategory.name} 
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="Örn: Bilim Kurgu" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                <textarea 
                  rows={3} 
                  value={newCategory.description} 
                  onChange={e => setNewCategory({...newCategory, description: e.target.value})} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" 
                  placeholder="Kategori hakkında kısa bilgi..." 
                />
              </div>
              <button 
                type="submit" 
                disabled={actionLoading || loading} 
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-md disabled:opacity-70 mt-4"
              >
                {actionLoading ? 'Ekleniyor...' : 'Kategori Oluştur'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-700">Mevcut Kategoriler</h3>
            </div>
            {loading ? (
              <TableSkeleton />
            ) : categories.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-bold">Kategori Adı</th>
                    <th className="px-6 py-3 font-bold">Açıklama</th>
                    <th className="px-6 py-3 font-bold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map(category => (
                    <tr key={category.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{category.name}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{category.description || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={actionLoading}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <LayoutGrid className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Kategori Bulunmuyor</h3>
                <p className="text-slate-500 mt-1 max-w-sm">Sisteme henüz hiç kategori eklenmemiş. Sol taraftaki formu kullanarak hemen ilk kategoriyi oluşturun.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
