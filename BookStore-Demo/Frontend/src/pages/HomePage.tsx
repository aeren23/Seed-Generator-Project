import React, { useEffect, useState, useCallback } from 'react';
import type { Book, Category } from '../types';
import { bookService } from '../api/bookService';
import { categoryService } from '../api/categoryService';
import { subscribeToCheckout } from '../context/CartContext';
import BookCard from '../components/BookCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 8;

const HomePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBooks = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await bookService.getAll(page, PAGE_SIZE);
      setBooks(result.items || []);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.totalCount || 0);
      setCurrentPage(result.pageNumber || page);
    } catch (error) {
      console.error('Kitaplar yüklenirken hata oluştu', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata oluştu', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBooks(1);
    fetchCategories();
  }, [fetchBooks, fetchCategories]);

  // Re-fetch books after checkout so stock counts update instantly
  useEffect(() => {
    const unsubscribe = subscribeToCheckout(() => fetchBooks(currentPage));
    return () => { unsubscribe(); };
  }, [fetchBooks, currentPage]);

  // Filter client-side (category + search)
  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory ? book.categoryId === selectedCategory : true;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchBooks(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when category or search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      fetchBooks(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  // Generate page numbers to display
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-xl text-slate-500 font-medium">Aradığınız kriterlere uygun kitap bulunamadı.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-400 font-bold">...</span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                  currentPage === page 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            )
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>

          <span className="ml-4 text-sm text-slate-400">
            {totalCount} kitaptan {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalCount)} arası
          </span>
        </div>
      )}
    </div>
  );
};

export default HomePage;
