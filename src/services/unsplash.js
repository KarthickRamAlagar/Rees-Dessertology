// Unsplash Search API wrapper.
// Add your key to .env as VITE_UNSPLASH_ACCESS_KEY=your_access_key
// Free tier: 50 requests/hour — queries are cached indefinitely per session (see useUnsplashImage)
// to avoid burning through the limit while browsing the catalog.

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export function isUnsplashConfigured() {
  return Boolean(ACCESS_KEY);
}

export async function searchUnsplashImage(query) {
  if (!ACCESS_KEY) return null;

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`,
    { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;

  return {
    url: result.urls.regular,
    // Unsplash API guidelines require attributing the photographer when displaying their work.
    photographerName: result.user?.name,
    photographerLink: result.user?.links?.html,
  };
}
