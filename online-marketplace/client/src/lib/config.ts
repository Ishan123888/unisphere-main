/**
 * Application Configuration
 * Centralized configuration for the marketplace application
 */

export const config = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
    ENDPOINTS: {
      MARKETPLACE: "/marketplace",
      ITEMS: "/marketplace",
      SELLERS: "/marketplace/seller",
      SEARCH: "/marketplace/search",
    },
    TIMEOUT: 30000, // 30 seconds
  },

  // Image Configuration
  IMAGE: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ACCEPTED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  },

  // Validation Configuration
  VALIDATION: {
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 100,
    MIN_DESCRIPTION_LENGTH: 20,
    MAX_DESCRIPTION_LENGTH: 1000,
    MIN_PRICE: 0,
    MAX_PRICE: 999999,
  },

  // UI Configuration
  UI: {
    ITEMS_PER_PAGE: 12,
    TOAST_DURATION: 5000, // 5 seconds
    ANIMATION_DURATION: 300, // 300ms
  },

  // Storage Configuration
  STORAGE: {
    SELLER_ID_KEY: "sellerId",
    PREFERENCES_KEY: "marketplace_preferences",
  },
};
