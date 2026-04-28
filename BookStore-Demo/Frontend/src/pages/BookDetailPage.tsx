import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService } from '../api/bookService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import {
  ShoppingCart,
  ArrowLeft,
  Minus,
  Plus,
  Package,
  User,
  Tag,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, basket, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const fetchBook = async (showLoading = true) => {
    if (!id) return;
    if (showLoading) setLoading(true);
    try {
      const data = await bookService.getById(id);
      setBook(data);
    } catch (error) {
      if (showLoading) toast.error('Kitap bulunamadı');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Sayfa ilk yüklendiğinde veya ID değiştiğinde
  useEffect(() => {
    fetchBook(true);
    setQuantity(1);
  }, [id]);

  // Sepette bir değişiklik olduğunda (alışveriş sonrası vb.) arka planda güncel stok bilgisini çek
  useEffect(() => {
    fetchBook(false);
  }, [basket]);

  // How many of this book are already in the cart
  const inCartQty =
    basket?.items.find((i) => i.bookId === id)?.quantity ?? 0;

  // Max the user can still add
  const maxAddable = book ? Math.max(0, book.stockCount - inCartQty) : 0;

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () =>
    setQuantity((q) => Math.min(q + 1, maxAddable));

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast('Önce giriş yapmalısınız');
      navigate('/login');
      return;
    }
    if (!book) return;
    await addItem(book.id, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <XCircle className="w-16 h-16" />
        <p className="text-xl font-medium">Kitap bulunamadı</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:underline text-sm"
        >
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  const isOutOfStock = book.stockCount <= 0;
  const canAddMore = maxAddable > 0;

  return (
    <div className="animate-in fade-in duration-400">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Geri</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
        {/* ── Left: Cover Image ── */}
        <div className="relative md:col-span-5 lg:col-span-4 flex justify-center">
          <div className="w-full max-w-[280px] aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-300 ring-1 ring-slate-200">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <Package className="w-16 h-16 opacity-30" />
                <span className="text-sm font-medium">Kapak Görseli Yok</span>
              </div>
            )}
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl flex items-center justify-center max-w-[280px] mx-auto">
              <span className="bg-red-600/90 text-white font-black text-xl px-6 py-2 rounded-xl rotate-[-12deg] shadow-2xl tracking-wider">
                TÜKENDİ
              </span>
            </div>
          )}
        </div>

        {/* ── Right: Info & Actions ── */}
        <div className="flex flex-col gap-6 md:col-span-7 lg:col-span-8">
          {/* Category badge */}
          {book.category?.name && (
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                {book.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {book.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-base font-medium">{book.authorName}</span>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-3">
            {/* Seller */}
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              <span className="text-xs text-slate-500 font-medium">Satıcı</span>
              <span className="text-xs font-bold text-slate-800">
                {book.sellerName ?? 'Bilinmiyor'}
              </span>
            </div>

            {/* Stock badge */}
            {isOutOfStock ? (
              <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-full">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-bold">Stok Yok</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold">
                  {book.stockCount} adet mevcut
                </span>
              </div>
            )}

            {/* Already in cart indicator */}
            {inCartQty > 0 && (
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-2 rounded-full">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-bold">
                  Sepette: {inCartQty} adet
                </span>
              </div>
            )}
          </div>

          <hr className="border-slate-100 my-2" />

          {/* Price & Cart Actions */}
          <div className="flex flex-col lg:flex-row gap-8 lg:items-end lg:justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
            {/* Price section */}
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">
                Fiyat
              </span>
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                ₺{book.price.toFixed(2)}
              </span>
            </div>

            {/* Quantity selector + Add to Cart */}
            {!isOutOfStock && (
              <div className="flex flex-col gap-4 flex-1 max-w-sm">
                {/* Quantity row */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Adet
                  </span>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-xl p-1 shrink-0">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-800 text-lg select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= maxAddable}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title={
                        quantity >= maxAddable
                          ? `Maksimum ${book.stockCount} adet alabilirsiniz`
                          : ''
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Stock limit hint */}
                  {!canAddMore && inCartQty > 0 && (
                    <span className="text-xs text-amber-600 font-medium leading-tight">
                      Maksimum eklendi
                    </span>
                  )}
                </div>

                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || !canAddMore}
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-slate-900 hover:bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-blue-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-1 group"
                >
                  {cartLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>İşleniyor...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Sepete Ekle </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {isOutOfStock && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex flex-col justify-center items-center flex-1 max-w-sm">
                <span className="text-red-600 font-bold mb-1">
                  Şu an stokta yok
                </span>
                <span className="text-red-400 text-xs font-medium">
                  Daha sonra tekrar kontrol ediniz
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
