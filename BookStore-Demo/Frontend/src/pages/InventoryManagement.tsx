import React, { useState, useEffect } from 'react';
import type { Book, Category } from '../types';
import { bookService } from '../api/bookService';
import { categoryService } from '../api/categoryService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2, Plus, ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const InventoryManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [newBook, setNewBook] = useState({
    title: '', 
    authorName: '',
    price: 0, 
    stockCount: 0,
    categoryId: '',
    coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksData, categoriesData] = await Promise.all([
        bookService.getAll(1, 100),
        categoryService.getAll()
      ]);
      const myBooks = user?.role === 'Admin' 
        ? booksData.items 
        : booksData.items.filter((b: Book) => b.sellerId === user?.id);
      
      setBooks(myBooks || []);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !newBook.categoryId) {
        setNewBook(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (error) {
      toast.error('Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    document.title = "Envanter Yönetimi - CleanBook";
  }, [user]);

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('Bu kitabı silmek istediğinize emin misiniz?')) return;
    try {
      setActionLoading(true);
      await bookService.delete(id);
      toast.success('Kitap başarıyla silindi!');
      await fetchData();
    } catch (error) {
      toast.error('Kitap silinirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await bookService.create({ ...newBook, sellerId: user?.id });
      toast.success('Yeni kitap eklendi!');
      await fetchData();
      setNewBook(prev => ({ ...prev, title: '', authorName: '', price: 0, stockCount: 0 }));
    } catch (error) {
      toast.error('Kitap eklenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const TableSkeleton = () => (
    <div className="animate-pulse flex flex-col gap-4 p-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-12 w-full bg-slate-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Link to="/seller/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Envanter Yönetimi</h1>
          <p className="text-slate-500">Kitaplarınızı buradan ekleyebilir ve yönetebilirsiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Yeni Kitap Ekle
            </h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kitap Adı</label>
                <input type="text" required value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500" placeholder="Örn: Yüzüklerin Efendisi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yazar</label>
                <input type="text" required value={newBook.authorName} onChange={e => setNewBook({...newBook, authorName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Örn: J.R.R. Tolkien" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fiyat (₺)</label>
                  <input type="number" step="0.01" min="0" required value={newBook.price || ''} onChange={e => setNewBook({...newBook, price: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stok</label>
                  <input type="number" min="0" required value={newBook.stockCount || ''} onChange={e => setNewBook({...newBook, stockCount: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select required value={newBook.categoryId} onChange={e => setNewBook({...newBook, categoryId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                  <option value="" disabled>Seçiniz...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={actionLoading || loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-md disabled:opacity-70 mt-4">
                {actionLoading ? 'Ekleniyor...' : 'Kitabı Kaydet'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <TableSkeleton />
            ) : books.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Kitap</th>
                    <th className="px-6 py-4 font-bold">Fiyat</th>
                    <th className="px-6 py-4 font-bold">Stok</th>
                    <th className="px-6 py-4 font-bold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{book.title}</div>
                        <div className="text-slate-500 text-xs">{book.authorName} · {book.category?.name}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">₺{book.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${book.stockCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {book.stockCount} Adet
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
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
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Henüz Kitap Yok</h3>
                <p className="text-slate-500 mt-1 max-w-sm">Mağazanızda şu an hiç kitap bulunmuyor. Sol taraftaki formu kullanarak hemen ilk kitabınızı ekleyebilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
