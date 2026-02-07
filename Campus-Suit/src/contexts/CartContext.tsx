import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  directCheckoutItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: number, removeAll?: boolean) => void;
  incrementQty: (productId: number) => void;
  clearCart: () => void;
  addToDirectCheckout: (product: Omit<CartItem, 'quantity'>) => void;
  incrementDirectCheckoutQty: (productId: number) => void;
  removeFromDirectCheckout: (productId: number, removeAll?: boolean) => void;
  clearDirectCheckout: () => void;
  switchUser: (userId: string) => void;
  clearCartForCurrentUser: () => void;
  currentUserId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [directCheckoutItems, setDirectCheckoutItems] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID (you might want to get this from your auth context)
  const getCurrentUserId = async (): Promise<string> => {
    try {
      // Try to get user ID from AsyncStorage (you should replace this with your actual auth logic)
      const userId = await AsyncStorage.getItem('currentUserId');
      if (userId) return userId;
      
      // If no user ID found, generate a temporary one for guest users
      const guestId = await getOrCreateGuestId();
      return guestId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 'guest';
    }
  };

  // Get or create guest ID for anonymous users
  const getOrCreateGuestId = async (): Promise<string> => {
    try {
      let guestId = await AsyncStorage.getItem('guestId');
      if (!guestId) {
        guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem('guestId', guestId);
      }
      return guestId;
    } catch (error) {
      console.error('Error creating guest ID:', error);
      return 'guest_default';
    }
  };

  // Load cart data for current user
  const loadCartForUser = async (userId: string) => {
    try {
      const cartKey = `cart_${userId}`;
      const savedCart = await AsyncStorage.getItem(cartKey);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }

      const directCheckoutKey = `direct_checkout_${userId}`;
      const savedDirectCheckout = await AsyncStorage.getItem(directCheckoutKey);
      if (savedDirectCheckout) {
        setDirectCheckoutItems(JSON.parse(savedDirectCheckout));
      } else {
        setDirectCheckoutItems([]);
      }
    } catch (error) {
      console.error('Error loading cart for user:', error);
      setCart([]);
      setDirectCheckoutItems([]);
    }
  };

  // Save cart data for current user
  const saveCartForUser = async (userId: string, cartData: CartItem[]) => {
    try {
      const cartKey = `cart_${userId}`;
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart for user:', error);
    }
  };

  // Save direct checkout items for current user
  const saveDirectCheckoutForUser = async (userId: string, items: CartItem[]) => {
    try {
      const directCheckoutKey = `direct_checkout_${userId}`;
      await AsyncStorage.setItem(directCheckoutKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving direct checkout for user:', error);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    const initializeCart = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      await loadCartForUser(userId);
    };
    initializeCart();
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    if (currentUserId) {
      saveCartForUser(currentUserId, cart);
    }
  }, [cart, currentUserId]);

  // Save direct checkout items whenever they change
  useEffect(() => {
    if (currentUserId) {
      saveDirectCheckoutForUser(currentUserId, directCheckoutItems);
    }
  }, [directCheckoutItems, currentUserId]);

  // Method to switch user (call this when user logs in/out)
  const switchUser = async (userId: string) => {
    // Save current user's cart before switching
    if (currentUserId) {
      await saveCartForUser(currentUserId, cart);
      await saveDirectCheckoutForUser(currentUserId, directCheckoutItems);
    }
    
    // Load new user's cart
    setCurrentUserId(userId);
    await loadCartForUser(userId);
    await AsyncStorage.setItem('currentUserId', userId);
  };

  // Method to clear cart for current user only
  const clearCartForCurrentUser = async () => {
    if (currentUserId) {
      await saveCartForUser(currentUserId, []);
      setCart([]);
    }
  };

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

  const addToDirectCheckout = (product: Omit<CartItem, 'quantity'>) => {
    setDirectCheckoutItems(prev => {
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

  const clearDirectCheckout = () => {
    setDirectCheckoutItems([]);
  };

  const incrementDirectCheckoutQty = (productId: number) => {
    setDirectCheckoutItems(prev =>
      prev.map(p =>
        p.productId === productId
          ? { ...p, quantity: p.quantity + 1 }
          : p
      )
    );
  };

  const removeFromDirectCheckout = (productId: number, removeAll = false) => {
    setDirectCheckoutItems(prev => {
      if (removeAll) {
        return prev.filter(p => p.productId !== productId);
      }
      return prev.map(p => {
        if (p.productId === productId) {
          if (p.quantity > 1) {
            return { ...p, quantity: p.quantity - 1 };
          }
          return null; // Remove the item completely
        }
        return p;
      }).filter((p): p is CartItem => p !== null);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      directCheckoutItems, 
      addToCart, 
      incrementQty, 
      removeFromCart, 
      clearCart,
      addToDirectCheckout, 
      incrementDirectCheckoutQty,
      removeFromDirectCheckout,
      clearDirectCheckout,
      switchUser,
      clearCartForCurrentUser,
      currentUserId
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
