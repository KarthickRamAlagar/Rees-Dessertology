// Firestore replacement for the old sanity/scripts/seed.mjs. Seeds the same
// real catalog content (4 categories, 15 named dessert jars) into Firestore
// instead of Sanity. Run with: node client/scripts/seed-firebase.mjs
// Requires the same FIREBASE_* admin credentials as the API routes (see
// client/.env.example) — either FIREBASE_SERVICE_ACCOUNT_JSON, or
// FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY — plus
// FIREBASE_STORAGE_BUCKET and UNSPLASH_ACCESS_KEY if you want real photos
// uploaded; without an Unsplash key, products/categories are seeded with no
// image and fall back to the storefront's own Unsplash-on-the-fly lookup.
import admin from "firebase-admin";
import { readFileSync } from "node:fs";

const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8"));
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }
  throw new Error("Missing Firebase admin credentials — set FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.");
}

admin.initializeApp({
  credential: admin.credential.cert(loadServiceAccount()),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
});
const db = admin.firestore();
const bucket = process.env.FIREBASE_STORAGE_BUCKET ? admin.storage().bucket() : null;

// Ree's Dessertology — real catalog content. 4 categories, 15 named dessert
// jars — this is Karthi's actual product + price list, mapped onto the 4
// existing categories exactly as given (including the couple of flavours
// that cross over, e.g. two different "Green Apple" jars in two different
// categories — that's intentional, not a mistake).
const categories = [
  { id: "category-fruity-delights", name: "Fruity Delights", imageQuery: "fresh fruit dessert jar" },
  { id: "category-classic-indulgence", name: "Classic Indulgence", imageQuery: "tiramisu red velvet dessert jar" },
  { id: "category-nutty-delights", name: "Nutty Delights", imageQuery: "pistachio hazelnut dessert jar" },
  { id: "category-chocolate-delights", name: "Chocolate Delights", imageQuery: "dark chocolate dessert jar" },
];

const products = [
  { id: "product-tea-tiramisu", categoryId: "category-classic-indulgence", name: "Tea Tiramisu", price: 150, query: "chai tiramisu dessert jar", shortDescription: "Spiced masala chai mascarpone cream over coffee-soaked sponge.", description: "Our tiramisu, reimagined with a warm masala chai twist — spiced chai-infused mascarpone cream layered over coffee-soaked sponge and a dusting of cocoa.", weights: ["150 g", "250 g"], badges: ["Classic"], tags: ["classic", "tea", "tiramisu", "jar"], rating: 4.7, reviewCount: 18, stockQuantity: 20, nutrition: { calories: 230, carbs: "26g", protein: "4g", fat: "11g", fiber: "1g" } },
  { id: "product-coffee-coco-cream", categoryId: "category-classic-indulgence", name: "Coffee Coco Cream", price: 150, query: "coffee chocolate cream dessert jar", shortDescription: "Bold coffee cream swirled with rich cocoa over soft sponge.", description: "A bold coffee-and-cocoa duet — smooth coffee cream swirled through rich chocolate layers over a soft sponge base. Classic, balanced, never too sweet.", weights: ["150 g", "250 g"], badges: ["Classic"], tags: ["classic", "coffee", "chocolate", "jar"], rating: 4.6, reviewCount: 15, stockQuantity: 20, nutrition: { calories: 240, carbs: "27g", protein: "4g", fat: "12g", fiber: "1g" } },
  { id: "product-dreamy-strawberry", categoryId: "category-classic-indulgence", name: "Dreamy Strawberry", price: 180, query: "strawberry cream dessert jar", shortDescription: "Fresh strawberry compote layered with silky vanilla cream.", description: "Real strawberry compote layered with silky vanilla cream and a buttery crumble base — a dreamy classic in every spoonful.", weights: ["150 g", "250 g"], badges: ["Bestseller", "Classic"], tags: ["classic", "strawberry", "jar"], rating: 4.8, reviewCount: 30, stockQuantity: 24, nutrition: { calories: 210, carbs: "28g", protein: "3g", fat: "9g", fiber: "1g" } },
  { id: "product-blue-current-treat", categoryId: "category-classic-indulgence", name: "Blue Current Treat", price: 180, query: "blackcurrant cream dessert jar", shortDescription: "Blue currant compote swirled through velvety vanilla cream.", description: "A deep purple layer of blue currant compote swirled through velvety vanilla cream over a soft crumble base — tangy-sweet and strikingly pretty.", weights: ["150 g", "250 g"], badges: ["Classic"], tags: ["classic", "blue currant", "jar"], rating: 4.6, reviewCount: 12, stockQuantity: 18, nutrition: { calories: 215, carbs: "27g", protein: "3g", fat: "9g", fiber: "1g" } },
  { id: "product-rich-pista", categoryId: "category-nutty-delights", name: "Rich Pista", price: 220, query: "pistachio cream dessert jar", shortDescription: "Roasted pistachio cream with a crunchy nutty base.", description: "Real roasted pistachios folded into a rich, silky pistachio cream over a crunchy nutty base. Generously nutty and fragrant.", weights: ["150 g", "250 g"], badges: ["Nutty", "Premium"], tags: ["nutty", "pistachio", "jar"], rating: 4.8, reviewCount: 25, stockQuantity: 16, nutrition: { calories: 280, carbs: "24g", protein: "6g", fat: "18g", fiber: "2g" } },
  { id: "product-dark-chocolate", categoryId: "category-chocolate-delights", name: "Dark Chocolate", price: 180, query: "dark chocolate mousse dessert jar", shortDescription: "Deep dark chocolate mousse layered with chocolate crumble.", description: "For the true chocolate lover — layers of deep dark chocolate mousse and a cocoa crumble base, finished with a hint of sea salt.", weights: ["150 g", "250 g"], badges: ["Bestseller", "Chocolate"], tags: ["chocolate", "dark chocolate", "jar"], rating: 4.9, reviewCount: 40, stockQuantity: 22, nutrition: { calories: 260, carbs: "25g", protein: "4g", fat: "15g", fiber: "2g" } },
  { id: "product-rich-dark-chocolate", categoryId: "category-chocolate-delights", name: "Rich Dark Chocolate", price: 200, query: "dark chocolate ganache dessert jar", shortDescription: "Intense dark chocolate ganache over a fudgy cocoa base.", description: "An even richer, more intense take on dark chocolate — silky ganache layered over a fudgy cocoa base for serious chocolate lovers.", weights: ["150 g", "250 g"], badges: ["Chocolate", "Premium"], tags: ["chocolate", "dark chocolate", "jar"], rating: 4.8, reviewCount: 22, stockQuantity: 18, nutrition: { calories: 275, carbs: "26g", protein: "4g", fat: "17g", fiber: "2g" } },
  { id: "product-mango-tiramisu", categoryId: "category-fruity-delights", name: "Mango Tiramisu", price: 220, query: "mango tiramisu dessert jar", shortDescription: "Alphonso mango puree through espresso-soaked sponge and mascarpone.", description: "A tropical twist on the Italian classic — ripe Alphonso mango puree layered through espresso-soaked sponge and whipped mascarpone cream.", weights: ["150 g", "250 g"], badges: ["Fruity", "Seasonal"], tags: ["fruity", "mango", "tiramisu", "jar"], rating: 4.7, reviewCount: 19, stockQuantity: 15, nutrition: { calories: 240, carbs: "30g", protein: "4g", fat: "11g", fiber: "1g" } },
  { id: "product-mango-magic-delight", categoryId: "category-classic-indulgence", name: "Mango Magic Delight", price: 180, query: "mango cream dessert jar", shortDescription: "Alphonso mango puree swirled through clouds of whipped cream.", description: "Ripe Alphonso mango puree swirled through clouds of whipped cream over a soft sponge base — a jar that tastes like summer.", weights: ["150 g", "250 g"], badges: ["Classic"], tags: ["classic", "mango", "jar"], rating: 4.7, reviewCount: 28, stockQuantity: 20, nutrition: { calories: 230, carbs: "31g", protein: "3g", fat: "10g", fiber: "1g" } },
  { id: "product-ruby-dragon", categoryId: "category-fruity-delights", name: "Ruby Dragon", price: 200, query: "dragon fruit dessert jar", shortDescription: "Vibrant dragon fruit puree layered with silky vanilla cream.", description: "Vibrant ruby dragon fruit puree layered with silky vanilla cream and a light crumble base — as striking to look at as it is to eat.", weights: ["150 g", "250 g"], badges: ["Fruity"], tags: ["fruity", "dragon fruit", "jar"], rating: 4.6, reviewCount: 14, stockQuantity: 16, nutrition: { calories: 200, carbs: "27g", protein: "3g", fat: "8g", fiber: "1g" } },
  { id: "product-green-apple", categoryId: "category-fruity-delights", name: "Green Apple", price: 200, query: "green apple dessert jar", shortDescription: "Tangy green apple compote layered with vanilla cream.", description: "Crisp, tangy green apple compote layered with silky vanilla cream over a buttery crumble — a refreshing, not-too-sweet fruity jar.", weights: ["150 g", "250 g"], badges: ["Fruity"], tags: ["fruity", "green apple", "jar"], rating: 4.6, reviewCount: 16, stockQuantity: 18, nutrition: { calories: 205, carbs: "28g", protein: "3g", fat: "8g", fiber: "1g" } },
  { id: "product-green-apple-treat", categoryId: "category-classic-indulgence", name: "Green Apple Treat", price: 180, query: "green apple cream dessert jar", shortDescription: "A milder, creamier take on green apple with whipped vanilla cream.", description: "A milder, creamier take on green apple — sweet-tart apple compote swirled through whipped vanilla cream over a soft sponge base.", weights: ["150 g", "250 g"], badges: ["Classic"], tags: ["classic", "green apple", "jar"], rating: 4.5, reviewCount: 11, stockQuantity: 15, nutrition: { calories: 215, carbs: "27g", protein: "3g", fat: "9g", fiber: "1g" } },
  { id: "product-blue-berry-royale", categoryId: "category-classic-indulgence", name: "Blue Berry Royale", price: 220, query: "blueberry cream dessert jar", shortDescription: "Blueberry compote layered with rich mascarpone cream.", description: "A royal take on blueberry — deep blueberry compote layered with rich mascarpone cream over a buttery crumble base. Indulgent and fruity at once.", weights: ["150 g", "250 g"], badges: ["Classic", "Premium"], tags: ["classic", "blueberry", "jar"], rating: 4.7, reviewCount: 17, stockQuantity: 14, nutrition: { calories: 235, carbs: "29g", protein: "4g", fat: "12g", fiber: "2g" } },
  { id: "product-blue-berry-treat", categoryId: "category-fruity-delights", name: "Blue Berry Treat", price: 180, query: "blueberry dessert jar", shortDescription: "Fresh blueberry compote layered with light vanilla cream.", description: "Fresh blueberry compote layered with light vanilla cream and a soft crumble base — simple, fruity, and full of real blueberry flavour.", weights: ["150 g", "250 g"], badges: ["Fruity"], tags: ["fruity", "blueberry", "jar"], rating: 4.6, reviewCount: 20, stockQuantity: 20, nutrition: { calories: 200, carbs: "26g", protein: "3g", fat: "8g", fiber: "1g" } },
  { id: "product-kiwi-magic", categoryId: "category-fruity-delights", name: "Kiwi Magic", price: 200, query: "kiwi dessert jar", shortDescription: "Tangy kiwi puree layered with silky vanilla cream.", description: "Bright, tangy kiwi puree layered with silky vanilla cream over a light crumble base — a refreshing, tropical finish to any meal.", weights: ["150 g", "250 g"], badges: ["Fruity"], tags: ["fruity", "kiwi", "jar"], rating: 4.6, reviewCount: 13, stockQuantity: 16, nutrition: { calories: 205, carbs: "27g", protein: "3g", fat: "8g", fiber: "1g" } },
];

function slug(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function unsplashImageUrl(query) {
  if (!unsplashKey || !bucket) return null;
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "squarish");
  const response = await fetch(url, { headers: { Authorization: `Client-ID ${unsplashKey}` } });
  if (!response.ok) return null;
  const data = await response.json();
  const photo = data.results?.[0];
  if (!photo?.urls?.regular) return null;
  const imageResponse = await fetch(photo.urls.regular);
  if (!imageResponse.ok) return null;
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  const destPath = `uploads/seed-${photo.id}.jpg`;
  await bucket.file(destPath).save(buffer, { contentType: "image/jpeg", public: true });
  return `https://storage.googleapis.com/${bucket.name}/${destPath}`;
}

async function upsertCategory(category) {
  const imageUrl = await unsplashImageUrl(category.imageQuery);
  const doc = { name: category.name, slug: slug(category.name), imageQuery: category.imageQuery, image: imageUrl || null };
  await db.collection("categories").doc(category.id).set(doc, { merge: true });
  return doc;
}

async function upsertProduct(product) {
  const category = categories.find((c) => c.id === product.categoryId);
  const imageUrl = await unsplashImageUrl(product.query);
  const doc = {
    name: product.name,
    slug: slug(product.name),
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    shortDescription: product.shortDescription,
    description: product.description,
    imageQuery: product.query,
    images: imageUrl ? [imageUrl] : [],
    weights: product.weights,
    badges: product.badges,
    tags: product.tags,
    nutrition: product.nutrition,
    rating: product.rating,
    reviewCount: product.reviewCount,
    inStock: true,
    stockQuantity: product.stockQuantity,
    categoryId: product.categoryId,
    categoryName: category?.name || "",
    categorySlug: category ? slug(category.name) : "",
    createdAt: new Date().toISOString(),
  };
  await db.collection("products").doc(product.id).set(doc, { merge: true });
  return doc;
}

console.log(`Seeding Firestore project ${admin.app().options.credential.projectId || ""}...`);
console.log(`Creating ${categories.length} categories...`);
for (const category of categories) {
  await upsertCategory(category);
  console.log(`  ✓ ${category.name}`);
}

console.log(`Creating ${products.length} products...`);
for (const product of products) {
  await upsertProduct(product);
  console.log(`  ✓ ${product.name}`);
}

console.log("\nSeed completed successfully.");
console.log(`Created/updated: ${categories.length} categories + ${products.length} products.`);
console.log("Document ids are reused (same ids as the old Sanity _ids), so running");
console.log("this again just updates the same Firestore documents — it never duplicates them.");
