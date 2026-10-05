// Local fallback data kept for UI development. Production reads come from Firestore.

export const mockCategories = [
  { id: 1, name: "Ladoo", slug: "ladoo", imageQuery: "ladoo indian sweet" },
  { id: 2, name: "Halwa", slug: "halwa", imageQuery: "halwa indian dessert" },
  { id: 3, name: "Barfi", slug: "barfi", imageQuery: "barfi indian sweet" },
  { id: 4, name: "Cookies", slug: "cookies", imageQuery: "healthy cookies" },
  { id: 5, name: "Gift Boxes", slug: "gift-boxes", imageQuery: "gift box sweets" },
];

export const mockProducts = [
  {
    id: 1,

      name: "Organic Besan Ladoo",
      slug: "organic-besan-ladoo",
      imageQuery: "besan ladoo indian sweet",
      price: 449,
      compareAtPrice: 549,
      rating: 4.6,
      reviewCount: 128,
      category: "ladoo",
      tags: ["Bestseller", "Organic"],
      shortDescription: "Hand-rolled roasted gram flour ladoo, sweetened with jaggery.",
      description:
        "Our Besan Ladoo is made in small batches using organic gram flour, pure cow ghee, and unrefined jaggery. No refined sugar, no preservatives — just the taste your grandmother used to make.",
      weights: ["250g", "500g", "1kg"],
      badges: ["100% Organic", "No Refined Sugar", "Preservative Free"],
      nutrition: { calories: 320, carbs: "38g", protein: "6g", fat: "16g", fiber: "2g" },
      inStock: true,
  },
  {
    id: 2,

      name: "Sugar-Free Dry Fruit Barfi",
      slug: "sugar-free-dry-fruit-barfi",
      imageQuery: "dry fruit barfi indian sweet",
      price: 599,
      compareAtPrice: 699,
      rating: 4.8,
      reviewCount: 94,
      category: "barfi",
      tags: ["Sugar-Free"],
      shortDescription: "Rich barfi made with dates, almonds, cashews and pistachios.",
      description:
        "A guilt-free indulgence — this barfi uses dates as the natural sweetener instead of sugar, packed with organic almonds, cashews and pistachios for a rich, fudgy bite.",
      weights: ["250g", "500g"],
      badges: ["Sugar-Free", "Organic", "Diabetic Friendly"],
      nutrition: { calories: 280, carbs: "22g", protein: "7g", fat: "18g", fiber: "3g" },
      inStock: true,
  },
  {
    id: 3,

      name: "Carrot Halwa (Gajar Halwa)",
      slug: "carrot-halwa",
      imageQuery: "gajar halwa carrot dessert",
      price: 399,
      compareAtPrice: 449,
      rating: 4.5,
      reviewCount: 76,
      category: "halwa",
      tags: ["Organic"],
      shortDescription: "Slow-cooked organic carrots in A2 ghee and jaggery.",
      description:
        "Traditional gajar halwa slow-cooked for hours with organic carrots, A2 cow ghee, jaggery, and a hint of cardamom. Best enjoyed warm.",
      weights: ["250g", "500g", "1kg"],
      badges: ["100% Organic", "A2 Ghee"],
      nutrition: { calories: 300, carbs: "34g", protein: "4g", fat: "15g", fiber: "3g" },
      inStock: true,
  },
  {
    id: 4,

      name: "Ragi Oats Cookies",
      slug: "ragi-oats-cookies",
      imageQuery: "oatmeal cookies healthy",
      price: 249,
      compareAtPrice: 299,
      rating: 4.3,
      reviewCount: 52,
      category: "cookies",
      tags: ["High Fiber"],
      shortDescription: "Crunchy cookies made with organic ragi and rolled oats.",
      description:
        "A wholesome snack for any time of the day — organic ragi flour and rolled oats baked into a crunchy, lightly-sweet cookie with jaggery instead of refined sugar.",
      weights: ["200g", "400g"],
      badges: ["High Fiber", "No Maida", "Organic"],
      nutrition: { calories: 140, carbs: "20g", protein: "3g", fat: "6g", fiber: "4g" },
      inStock: true,
  },
  {
    id: 5,

      name: "Coconut Barfi",
      slug: "coconut-barfi",
      imageQuery: "coconut barfi indian sweet",
      price: 349,
      compareAtPrice: 399,
      rating: 4.4,
      reviewCount: 61,
      category: "barfi",
      tags: ["Organic"],
      shortDescription: "Fresh coconut cooked in condensed milk and cardamom.",
      description:
        "Made with freshly grated organic coconut, slow-cooked with milk and a touch of cardamom for a soft, melt-in-mouth barfi.",
      weights: ["250g", "500g"],
      badges: ["100% Organic"],
      nutrition: { calories: 310, carbs: "30g", protein: "3g", fat: "19g", fiber: "2g" },
      inStock: true,
  },
  {
    id: 6,

      name: "Moong Dal Halwa",
      slug: "moong-dal-halwa",
      imageQuery: "moong dal halwa indian dessert",
      price: 549,
      compareAtPrice: 599,
      rating: 4.7,
      reviewCount: 88,
      category: "halwa",
      tags: ["Bestseller"],
      shortDescription: "Rich, ghee-roasted moong dal halwa — a festive classic.",
      description:
        "A labour of love — organic split moong dal slow-roasted in A2 ghee until golden, then simmered with milk and jaggery syrup.",
      weights: ["250g", "500g", "1kg"],
      badges: ["100% Organic", "A2 Ghee", "Festive Special"],
      nutrition: { calories: 340, carbs: "36g", protein: "8g", fat: "17g", fiber: "3g" },
      inStock: false,
  },
  {
    id: 7,

      name: "Rava Ladoo",
      slug: "rava-ladoo",
      imageQuery: "semolina ladoo indian sweet",
      price: 379,
      compareAtPrice: 429,
      rating: 4.2,
      reviewCount: 40,
      category: "ladoo",
      tags: ["Organic"],
      shortDescription: "Roasted semolina ladoo with organic ghee and dry fruits.",
      description:
        "Golden roasted rava (semolina) bound with organic ghee, jaggery syrup, and studded with cashews and raisins.",
      weights: ["250g", "500g"],
      badges: ["100% Organic"],
      nutrition: { calories: 290, carbs: "35g", protein: "5g", fat: "14g", fiber: "1g" },
      inStock: true,
  },
  {
    id: 8,

      name: "Festive Gift Box (Assorted)",
      slug: "festive-gift-box",
      imageQuery: "indian sweets gift box",
      price: 1299,
      compareAtPrice: 1599,
      rating: 4.9,
      reviewCount: 210,
      category: "gift-boxes",
      tags: ["Bestseller", "Gifting"],
      shortDescription: "A curated box of 6 organic desserts — perfect for gifting.",
      description:
        "Our most-loved gift box featuring Besan Ladoo, Coconut Barfi, Dry Fruit Barfi, Ragi Cookies, Carrot Halwa, and Rava Ladoo — beautifully packaged in a reusable box.",
      weights: ["Box of 6", "Box of 12"],
      badges: ["100% Organic", "Gift Wrapped", "Free Card Included"],
      nutrition: { calories: 300, carbs: "32g", protein: "5g", fat: "16g", fiber: "2g" },
      inStock: true,
  },
];

export const mockTestimonials = [
  { id: 1, name: "Priya Sharma", location: "Hyderabad", rating: 5, text: "The Tiramisu Dream Jar tastes like something from a real Italian bakery, not a home kitchen. Ordered it twice already." },
  { id: 2, name: "Rahul Mehta", location: "Bengaluru", rating: 5, text: "Sent the Dark Chocolate Jar as a gift and my sister messaged me within an hour asking where to buy more." },
  { id: 3, name: "Ananya Verma", location: "Chennai", rating: 5, text: "You can actually taste the real strawberries in the Strawberry Bliss Jar — not too sweet, just right." },
];

export function findProductBySlug(slug) {
  return mockProducts.find((p) => p.slug === slug) || null;
}

export function findRelatedProducts(currentSlug, category, limit = 4) {
  return mockProducts
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit);
}
