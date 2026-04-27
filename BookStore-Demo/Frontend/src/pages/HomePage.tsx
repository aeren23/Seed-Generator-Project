import React, { useEffect, useState } from 'react';
import type { Book, Category } from '../types';
import { bookService } from '../api/bookService';
import { categoryService } from '../api/categoryService';
import BookCard from '../components/BookCard';
import { Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksData, categoriesData] = await Promise.all([
          bookService.getAll(1, 100),
          categoryService.getAll()
        ]);
        setBooks(booksData.items || []);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory ? book.categoryId === selectedCategory : true;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Yeni Dünyaları Keşfet</h1>
          <p className="text-lg text-slate-300 mb-8">En son çıkan romanlar, sürükleyici bilim kurgular ve daha fazlası CleanBook mağazasında.</p>
          
          <div className="relative max-w-md text-slate-900">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Kitap veya yazar ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-6 py-2.5 rounded-full whitespace-nowrap font-medium transition-all ${
            selectedCategory === '' 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tüm Kitaplar
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2.5 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === category.id 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-xl text-slate-500 font-medium">Aradığınız kriterlere uygun kitap bulunamadı.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
