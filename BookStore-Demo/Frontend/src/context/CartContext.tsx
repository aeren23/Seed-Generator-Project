import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Basket } from '../types';
import { basketService } from '../api/basketService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  basket: Basket | null;
  loading: boolean;
  refreshBasket: () => Promise<void>;
  addItem: (bookId: string, quantity?: number) => Promise<void>;
  removeItem: (bookId: string) => Promise<void>;
  clearBasket: () => Promise<void>;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [basket, setBasket] = useState<Basket | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshBasket = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await basketService.getActive();
      setBasket(data);
    } catch (error) {
      console.error('Error fetching basket:', error);
    }
  };

  useEffect(() => {
    refreshBasket();
  }, [isAuthenticated]);

  const addItem = async (bookId: string, quantity = 1) => {
    try {
      setLoading(true);
      await basketService.addItem(bookId, quantity);
      await refreshBasket();
      toast.success('Kitap sepete eklendi');
    } catch (error) {
      toast.error('Sepete eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (bookId: string) => {
    try {
      setLoading(true);
      await basketService.removeItem(bookId);
      await refreshBasket();
      toast.success('Kitap sepetten çıkarıldı');
    } catch (error) {
      toast.error('Silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const clearBasket = async () => {
    try {
      setLoading(true);
      await basketService.clear();
      await refreshBasket();
      toast.success('Sepet temizlendi');
    } catch (error) {
      toast.error('Sepet temizlenemedi');
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    try {
      setLoading(true);
      await basketService.checkout();
      await refreshBasket();
      toast.success('Sipariş başarıyla tamamlandı!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Sipariş tamamlanamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ basket, loading, refreshBasket, addItem, removeItem, clearBasket, checkout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
