export interface Order {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  customerId: string;
  address: string;
  phone: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  newPrice: string;
  oldPrice: string;
}
