export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Customer' | 'Seller' | 'Admin';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Book {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  authorName: string;
  price: number;
  stockCount: number;
  coverImageUrl?: string;
  category?: Category;
}

export interface BasketItem {
  id: string;
  basketId: string;
  bookId: string;
  quantity: number;
  book?: Book;
}

export interface Basket {
  id: string;
  userId: string;
  isCompleted: boolean;
  items: BasketItem[];
}

export interface SaleChartData {
  date: string;
  totalRevenue: number;
  totalItems: number;
}
