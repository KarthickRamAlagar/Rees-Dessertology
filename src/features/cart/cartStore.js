import { create } from "zustand";
import { persist } from "zustand/middleware";

// Cart is client-only state -> Zustand is a good fit here (lighter than Redux,
// no boilerplate, and persists to localStorage automatically).
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, price, image, weight, quantity }

      addItem: (product) =>
        set((state) => {
          const qtyToAdd = product.quantity || 1;
          const existing = state.items.find(
            (i) => i.id === product.id && i.weight === product.weight
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id && i.weight === product.weight
                  ? { ...i, quantity: i.quantity + qtyToAdd }
                  : i
              ),
            };
          }
          const { quantity, ...rest } = product;
          return { items: [...state.items, { ...rest, quantity: qtyToAdd }] };
        }),

      removeItem: (id, weight) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.weight === weight)),
        })),

      updateQuantity: (id, weight, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === id && i.weight === weight ? { ...i, quantity } : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "organic-desserts-cart" }
  )
);
