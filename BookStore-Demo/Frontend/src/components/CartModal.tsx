import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { basket, removeItem, clearBasket, checkout, loading } = useCart();

  if (!isOpen) return null;

  const totalAmount = basket?.items?.reduce((sum, item) => {
    return sum + ((item.book?.price || 0) * item.quantity);
  }, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Sepetim
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!basket?.items?.length ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Sepetiniz boş</p>
              <p className="text-sm">Hemen kitap keşfetmeye başlayın!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {basket.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl">
                  {item.book?.coverImageUrl ? (
                    <img src={item.book.coverImageUrl} alt={item.book.title} className="w-16 h-24 object-cover rounded-md shadow-sm" />
                  ) : (
                    <div className="w-16 h-24 bg-slate-200 rounded-md flex items-center justify-center text-xs text-slate-400">Görsel Yok</div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{item.book?.title}</h4>
                    <p className="text-sm text-slate-500 mb-2">₺{item.book?.price.toFixed(2)} x {item.quantity}</p>
                    <p className="font-semibold text-blue-600">₺{((item.book?.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.bookId)}
                    disabled={loading}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {basket?.items?.length ? (
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-medium">Toplam Tutar</span>
              <span className="text-2xl font-bold text-slate-900">₺{totalAmount.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={clearBasket}
                disabled={loading}
                className="py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Temizle
              </button>
              <button 
                onClick={checkout}
                disabled={loading}
                className="py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
              >
                Satın Al
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CartModal;
