import React, { useState, useEffect } from 'react';
import type { Category } from '../types';
import { categoryService } from '../api/categoryService';
import { userService } from '../api/userService';
import type { UserDto, CreateUserPayload } from '../api/userService';
import toast from 'react-hot-toast';
import { Trash2, Plus, LayoutGrid, Shield, Users, ChevronDown } from 'lucide-react';
import GoldenButton from '../components/GoldenButton';

type TabKey = 'categories' | 'users';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('categories');

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // User state
  const [users, setUsers] = useState<UserDto[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [newUser, setNewUser] = useState<CreateUserPayload>({
    userName: '', email: '', fullName: '', password: '', role: 'Customer'
  });
  const [userActionLoading, setUserActionLoading] = useState(false);

  // --- Category Logic ---
  const fetchCategories = async () => {
    try {
      setCatLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      toast.error('Kategoriler yüklenemedi.');
    } finally {
      setCatLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await categoryService.create(newCategory);
      toast.success('Yeni kategori eklendi!');
      await fetchCategories();
      setNewCategory({ name: '', description: '' });
    } catch {
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

  // --- User Logic ---
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      toast.error('Kullanıcılar yüklenemedi.');
    } finally {
      setUserLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userService.changeRole(userId, newRole);
      toast.success('Kullanıcı rolü güncellendi!');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rol güncellenirken hata oluştu.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await userService.deleteUser(userId);
      toast.success('Kullanıcı silindi!');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı silinirken hata oluştu.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUserActionLoading(true);
      await userService.createUser(newUser);
      toast.success('Yeni kullanıcı oluşturuldu!');
      await fetchUsers();
      setNewUser({ userName: '', email: '', fullName: '', password: '', role: 'Customer' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı oluşturulurken hata oluştu.');
    } finally {
      setUserActionLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUsers();
    document.title = "Admin Paneli - CleanBook";
  }, []);

  const TableSkeleton = () => (
    <div className="animate-pulse flex flex-col gap-4 p-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-12 w-full bg-slate-200 rounded-lg"></div>
      ))}
    </div>
  );

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'categories', label: 'Kategoriler', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'users', label: 'Kullanıcılar', icon: <Users className="w-4 h-4" /> },
  ];

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

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
              ${activeTab === tab.key 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
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
                  disabled={actionLoading || catLoading} 
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-md disabled:opacity-70 mt-4"
                >
                  {actionLoading ? 'Ekleniyor...' : 'Kategori Oluştur'}
                </button>
              </form>
            </div>
          </div>

          {/* Category List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700">Mevcut Kategoriler</h3>
              </div>
              {catLoading ? (
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
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          {/* Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Yeni Kullanıcı
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
                  <input type="text" required value={newUser.userName}
                    onChange={e => setNewUser({...newUser, userName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Örn: ahmet123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                  <input type="text" required value={newUser.fullName}
                    onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Örn: Ahmet Yılmaz" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                  <input type="email" required value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Örn: ahmet@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                  <input type="password" required value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Min. 6 karakter" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                    <option value="Customer">Customer</option>
                    <option value="Seller">Seller</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <button type="submit" disabled={userActionLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-md disabled:opacity-70 mt-4">
                  {userActionLoading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
                </button>
              </form>
            </div>
          </div>

          {/* User List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Kullanıcı Yönetimi
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  {users.length} kullanıcı
                </span>
              </div>
              {userLoading ? (
                <TableSkeleton />
              ) : users.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-bold">Ad Soyad</th>
                      <th className="px-6 py-3 font-bold">Kullanıcı Adı</th>
                      <th className="px-6 py-3 font-bold">E-posta</th>
                      <th className="px-6 py-3 font-bold">Rol</th>
                      <th className="px-6 py-3 font-bold text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-900">{u.fullName}</td>
                        <td className="px-6 py-4 text-slate-600">{u.userName}</td>
                        <td className="px-6 py-4 text-slate-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <select
                              value={u.role}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                              className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all focus:ring-2 focus:ring-blue-400 outline-none
                                ${u.role === 'Admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                  u.role === 'Seller' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                  'bg-green-50 text-green-700 border-green-200'}`}
                            >
                              <option value="Admin">Admin</option>
                              <option value="Seller">Seller</option>
                              <option value="Customer">Customer</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Kullanıcıyı Sil"
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
                    <Users className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Kullanıcı Bulunmuyor</h3>
                  <p className="text-slate-500 mt-1 max-w-sm">Sistemde kayıtlı kullanıcı yok.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
