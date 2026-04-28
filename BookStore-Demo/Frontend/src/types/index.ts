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
  sellerName?: string;
  categoryId: string;
  title: string;
  authorName: string;
  price: number;
  stockCount: number;
  coverImageUrl?: string;
  category?: Category;
}

export interface BasketItem {
  bookId: string;
  bookTitle: string;
  coverImageUrl?: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
}

export interface Basket {
  id: string;
  userId: string;
  totalAmount: number;
  items: BasketItem[];
}

export interface SaleChartData {
  date: string;
  totalRevenue: number;
  totalItems: number;
}
