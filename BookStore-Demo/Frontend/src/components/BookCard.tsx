import React from 'react';
import type { Book } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addItem, basket, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // How many already in cart
  const inCartQty = basket?.items.find((i) => i.bookId === book.id)?.quantity ?? 0;
  const maxAddable = Math.max(0, book.stockCount - inCartQty);
  const cartFull = maxAddable <= 0 && book.stockCount > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger card click
    if (!isAuthenticated) {
      toast('Önce giriş yapmalısınız');
      navigate('/login');
      return;
    }
    if (cartFull) {
      toast.error(`Bu kitaptan maksimum ${book.stockCount} adet alabilirsiniz`);
      return;
    }
    addItem(book.id, 1);
  };

  const handleCardClick = () => {
    navigate(`/books/${book.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 flex items-center justify-center">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-slate-400 font-medium">Kapak Yok</div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
          ₺{book.price.toFixed(2)}
        </div>
        {book.stockCount <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-bold text-lg rotate-12 bg-red-600 px-4 py-1 rounded">
              TÜKENDİ
            </span>
          </div>
        )}
        {/* Cart full indicator */}
        {cartFull && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
            Max. sepette
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
          {book.category?.name || 'Kategori Yok'}
        </div>
        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-1 flex-grow">
          {book.authorName}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-slate-500 font-medium">
            Stok: {book.stockCount}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={book.stockCount <= 0 || loading || cartFull}
            title={
              cartFull
                ? `Maksimum ${book.stockCount} adet alabilirsiniz`
                : book.stockCount <= 0
                ? 'Stokta yok'
                : 'Sepete ekle'
            }
            className="flex items-center justify-center bg-slate-900 hover:bg-blue-600 text-white rounded-full p-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-hover:px-4 group-hover:w-auto w-10 overflow-hidden"
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span className="hidden group-hover:block ml-2 text-sm font-semibold whitespace-nowrap">
              Sepete Ekle
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
