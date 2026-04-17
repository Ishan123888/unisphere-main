/**
 * Utility functions for the marketplace
 */

/**
 * Format price as currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Generate a placeholder image URL
 */
export const getPlaceholderImage = (category: string): string => {
  return `https://via.placeholder.com/400x300?text=${encodeURIComponent(category)}`;
};

/**
 * Get full image URL
 * The backend returns the path, but we need to construct the full URL
 */
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return getPlaceholderImage("No Image");
  }
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  
  // If it starts with /api, construct full URL
  if (imageUrl.startsWith("/api")) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const baseUrl = apiBaseUrl.replace("/api/v1", "");
    return baseUrl + imageUrl;
  }
  
  // If it's just a filename, construct the full path
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  return `${apiBaseUrl}/uploads/${imageUrl}`;
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Generate a random UUID v4
 */
export const generateUUID = (): string => {
  if (typeof window !== "undefined" && "crypto" in window) {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  // Fallback for SSR
  return "00000000-0000-4000-8000-000000000000";
};

/**
 * Get seller ID from localStorage or generate new one
 */
export const getSellerId = (): string => {
  if (typeof window === "undefined") return "";

  let sellerId = localStorage.getItem("sellerId");
  if (!sellerId) {
    sellerId = generateUUID();
    localStorage.setItem("sellerId", sellerId);
  }
  return sellerId;
};

/**
 * Format category display name
 */
export const formatCategory = (category: string): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
