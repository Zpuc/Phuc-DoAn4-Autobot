import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  grade?: string;
  scale?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isPreorder: boolean;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
  loadFromStorage: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (newItem) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((i) => i.id === newItem.id);

    let updatedItems: CartItem[];
    if (existingIndex > -1) {
      updatedItems = [...currentItems];
      updatedItems[existingIndex].quantity += newItem.quantity;
    } else {
      updatedItems = [...currentItems, newItem];
    }

    localStorage.setItem('autobot_cart', JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id);
      return;
    }
    const updatedItems = get().items.map((item) =>
      item.id === id ? { ...item, quantity } : item,
    );
    localStorage.setItem('autobot_cart', JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  removeFromCart: (id) => {
    const updatedItems = get().items.filter((item) => item.id !== id);
    localStorage.setItem('autobot_cart', JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  clearCart: () => {
    localStorage.removeItem('autobot_cart');
    set({ items: [] });
  },

  getTotalCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  loadFromStorage: () => {
    const saved = localStorage.getItem('autobot_cart');
    if (saved) {
      try {
        set({ items: JSON.parse(saved) });
      } catch {
        localStorage.removeItem('autobot_cart');
      }
    }
  },
}));

