import { useUnsplashImage } from "@/hooks/useUnsplashImage";
import { ImageIcon } from "lucide-react";

// `image` is now a plain Firebase Storage download URL (or array of them,
// in which case the first is used) — Firestore has no asset-reference
// object like Sanity's {_type:"image",asset:{...}}, so product/category
// docs just store URL strings (see client/api/_lib.js's uploadFile /
// uploadUnsplash and client/api/admin/products.js).
export default function UnsplashImage({ query, image, alt, className = "" }) {
  const storedUrl = Array.isArray(image) ? image[0] : image;
  const hasStoredImage = typeof storedUrl === "string" && storedUrl.trim().length > 0;

  const { data, isLoading } = useUnsplashImage(query, !hasStoredImage);

  // 1. A real stored (uploaded or previously Unsplash-fetched) image.
  if (hasStoredImage) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img src={storedUrl} alt={alt || query} className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }

  // 2. Loading Unsplash fallback
  if (isLoading) {
    return <div className={`bg-cream-200 animate-pulse ${className}`} />;
  }

  // 3. Unsplash fallback
  if (data?.url) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img src={data.url} alt={alt || query} className="w-full h-full object-cover" loading="lazy" />
        {data.photographerName && (
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (data.photographerLink) {
                window.open(data.photographerLink, "_blank", "noopener,noreferrer");
              }
            }}
            className="absolute bottom-1 right-1.5 text-[9px] text-white/80 bg-black/30 px-1.5 py-0.5 rounded cursor-pointer"
          >
            Photo: {data.photographerName}
          </span>
        )}
      </div>
    );
  }

  // 4. Final placeholder
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-caramel-400/15 to-sage-500/10 text-cocoa-400 ${className}`}>
      <ImageIcon size={28} strokeWidth={1.5} />
    </div>
  );
}
