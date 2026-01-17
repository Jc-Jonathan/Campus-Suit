import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  productId: number;
  name: string;
  imageUrl: string;
  newPrice: number;
  oldPrice?: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: number, removeAll?: boolean) => void;
  incrementQty: (productId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(p => p.productId === product.productId);
      if (existing) {
        return prev.map(p =>
          p.productId === product.productId
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const incrementQty = (productId: number) => {
    setCart(prev =>
      prev.map(p =>
        p.productId === productId
          ? { ...p, quantity: p.quantity + 1 }
          : p
      )
    );
  };

  const removeFromCart = (productId: number, removeAll = false) => {
    setCart(prev => {
      if (removeAll) {
        return prev.filter(p => p.productId !== productId);
      }
      return prev.map(p => {
        if (p.productId === productId) {
          if (p.quantity > 1) {
            return { ...p, quantity: p.quantity - 1 };
          }
          return p; // Keep the item but don't remove it completely
        }
        return p;
      });
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, incrementQty, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
