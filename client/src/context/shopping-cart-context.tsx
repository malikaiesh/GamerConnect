import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface CartItem {
  id: string;
  type: 'plan' | 'verification' | 'room_creation' | 'diamonds' | 'coins';
  planId?: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  metadata?: any;
}

interface ShoppingCartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isLoading: boolean;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export function ShoppingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (user) {
      if (items.length > 0) {
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
      } else {
        // Clear localStorage when cart is empty
        localStorage.removeItem(`cart_${user.id}`);
      }
    }
  }, [items, user]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    if (user) {
      localStorage.removeItem(`cart_${user.id}`);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const contextValue: ShoppingCartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isLoading
  };

  return (
    <ShoppingCartContext.Provider value={contextValue}>
      {children}
    </ShoppingCartContext.Provider>
  );
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
}