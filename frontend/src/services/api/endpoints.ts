/**
 * API Endpoints constants
 */
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Auth
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    REFRESH: '/users/refresh',
    LOGOUT: '/users/logout',
    FORGOT_PASSWORD: '/users/forgot-password', // NOSONAR - API endpoint, not a password
    RESET_PASSWORD: '/users/reset-password', // NOSONAR - API endpoint, not a password
    VERIFY_EMAIL: '/users/verify-email',
  },

  // MFA
  MFA: {
    SETUP: '/users/mfa/setup',
    ENABLE: '/users/mfa/enable',
    DISABLE: '/users/mfa/disable',
    VERIFY_LOGIN: '/users/mfa/verify-login',
  },

  // Users
  USERS: {
    PROFILE: (userId?: string) => userId ? `/users/${userId}/profile` : '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password', // NOSONAR - API endpoint, not a password
    SETTINGS: '/users/settings',
    LISTINGS: (userId: string) => `/users/${userId}/listings`,
    REVIEWS: (userId: string) => `/users/${userId}/reviews`,
    FAVORITES: {
      LIST: '/favorites',
      ADD: '/favorites',
      REMOVE: (productId: string) => `/favorites/${productId}`,
    },
  },

  // Catalog
  CATALOG: {
    PRODUCTS: '/catalog/products',
    PRODUCT: (productId: string) => `/catalog/products/${productId}`,
    CATEGORIES: '/catalog/categories',
    CATEGORY: (categorySlug: string) => `/catalog/categories/${categorySlug}`,
    FEATURED: '/catalog/featured',
    RECENT: '/catalog/recent',
    SIMILAR: (productId: string) => `/catalog/products/${productId}/similar`,
    SEARCH: '/catalog/search',
    UPLOAD: '/catalog/upload',
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (itemId: string) => `/cart/items/${itemId}`,
    REMOVE: (itemId: string) => `/cart/items/${itemId}`,
    CLEAR: '/cart/clear',
  },

  // Checkout
  CHECKOUT: {
    CREATE_SESSION: '/checkout/session',
    CONFIRM: '/checkout/confirm',
    SHIPPING: '/checkout/shipping',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    DETAIL: (orderId: string) => `/orders/${orderId}`,
    CONFIRM_DELIVERY: (orderId: string) => `/orders/${orderId}/confirm-delivery`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    READ_ALL: '/notifications/read-all',
    PREFERENCES: '/notifications/preferences',
  },
} as const;
