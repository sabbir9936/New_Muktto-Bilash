
export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  deliveryCharge: number;
  total: number;
  date: string;
  status: 'pending' | 'cleared';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export type View = 'gallery' | 'scanner' | 'order' | 'history' | 'voucher' | 'settings';
