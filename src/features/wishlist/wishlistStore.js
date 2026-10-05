import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, price, slug }

      toggleItem: (product) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === product.id);
          return exists
            ? { items: state.items.filter((i) => i.id !== product.id) }
            : { items: [...state.items, product] };
        }),

      isWishlisted: (id) => get().items.some((i) => i.id === id),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    }),
    { name: "organic-desserts-wishlist" }
  )
);
