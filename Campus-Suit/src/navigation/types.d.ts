// Navigation type definitions - no component imports to avoid circular dependencies

export type StoreStackParamList = {
  StoreHome: undefined;
  ProductDetail: { productId: number};
  Cart: undefined;
  Checkout: { cartItems: any[], totalPrice: number, source?: 'cart' | 'product' };
  Tracking: { orderId?: number };
  OrderDisplay: undefined;
  OrderDetailshow: { orderId: number };
  OrderStatus: { id?: string } | undefined;
  Search: undefined;
  Notifications: undefined;
  AuthFlow: undefined;
  PaypalScreen: { amount: number };
};
