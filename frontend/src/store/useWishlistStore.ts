import { create } from 'zustand';

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  grade?: string;
  scale?: string;
  brand?: string;
  price: number;
  imageUrl?: string;
  isPreorder?: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  loadFromStorage: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  addToWishlist: (item) => {
    const exists = get().items.some((i) => i.id === item.id);
    if (!exists) {
      const updated = [...get().items, item];
      localStorage.setItem('autobot_wishlist', JSON.stringify(updated));
      set({ items: updated });
    }
  },

  removeFromWishlist: (id) => {
    const updated = get().items.filter((i) => i.id !== id);
    localStorage.setItem('autobot_wishlist', JSON.stringify(updated));
    set({ items: updated });
  },

  toggleWishlist: (item) => {
    const exists = get().items.some((i) => i.id === item.id);
    if (exists) {
      get().removeFromWishlist(item.id);
    } else {
      get().addToWishlist(item);
    }
  },

  isInWishlist: (id) => {
    return get().items.some((i) => i.id === id);
  },

  clearWishlist: () => {
    localStorage.removeItem('autobot_wishlist');
    set({ items: [] });
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem('autobot_wishlist');
      if (raw) {
        set({ items: JSON.parse(raw) });
      }
    } catch {
      // ignore
    }
  },
}));
