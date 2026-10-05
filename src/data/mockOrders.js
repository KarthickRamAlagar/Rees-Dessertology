export const mockOrders = [
  {
    id: "NM123456",
    date: "2026-09-08",
    status: "delivered",
    total: 1797,
    items: [
      { name: "Organic Besan Ladoo", weight: "500g", qty: 1, price: 449 },
      { name: "Sugar-Free Dry Fruit Barfi", weight: "250g", qty: 1, price: 599 },
      { name: "Carrot Halwa", weight: "500g", qty: 1, price: 399 },
    ],
    statusHistory: [
      { step: "placed", time: "2026-09-05T10:30:00" },
      { step: "packed", time: "2026-09-05T13:15:00" },
      { step: "shipped", time: "2026-09-06T09:00:00" },
      { step: "outForDelivery", time: "2026-09-08T08:30:00" },
      { step: "delivered", time: "2026-09-08T14:10:00" },
    ],
    address: "123 Green Park, Guntur, AP - 522xxx",
  },
  {
    id: "NM123455",
    date: "2026-08-28",
    status: "processing",
    total: 948,
    items: [
      { name: "Ragi Oats Cookies", weight: "400g", qty: 2, price: 249 },
      { name: "Coconut Barfi", weight: "250g", qty: 1, price: 349 },
    ],
    statusHistory: [
      { step: "placed", time: "2026-08-28T11:00:00" },
      { step: "packed", time: "2026-08-28T15:00:00" },
    ],
    address: "123 Green Park, Guntur, AP - 522xxx",
  },
];

export function findOrderById(id) {
  return mockOrders.find((o) => o.id === id) || null;
}
