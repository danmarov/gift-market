export const CACHE_CONSTANTS = {
  KEYS: {
    GIFTS_CATALOG: "gifts-catalog",
    GIFT_DETAILS: "gift-details",
    USER_PROFILE: "user-profile",
    USER_ORDERS: "user-orders",
    USER_TASKS: "user-tasks", // новый ключ
    LOOTBOX_TASKS: "lootbox-tasks", // новый ключ
    ADMIN_DASHBOARD: "admin-dashboard",
  },

  TAGS: {
    GIFTS: "gifts",
    USERS: "users",
    ORDERS: "orders",
    TASKS: "tasks", // новый тег
    LOOTBOX_TASKS: "lootbox-tasks", // новый тег
    ADMIN: "admin",
    ANALYTICS: "analytics",
  },
} as const;

export const createCacheKey = {
  giftDetails: (giftId: string) =>
    `${CACHE_CONSTANTS.KEYS.GIFT_DETAILS}-${giftId}`,
  userProfile: (userId: string) =>
    `${CACHE_CONSTANTS.KEYS.USER_PROFILE}-${userId}`,
  userOrders: (userId: string) =>
    `${CACHE_CONSTANTS.KEYS.USER_ORDERS}-${userId}`,
  userTasks: (userId: string, role: string) =>
    `${CACHE_CONSTANTS.KEYS.USER_TASKS}-${userId}-${role}`, // новый хелпер
  giftsPage: (page: number) =>
    `${CACHE_CONSTANTS.KEYS.GIFTS_CATALOG}-page-${page}`,
} as const;

export const createCacheTag = {
  userData: (userId: string) => `${CACHE_CONSTANTS.TAGS.USERS}-${userId}`,
  giftData: (giftId: string) => `${CACHE_CONSTANTS.TAGS.GIFTS}-${giftId}`,
  userTasks: (userId: string) => `${CACHE_CONSTANTS.TAGS.TASKS}-user-${userId}`, // новый хелпер
} as const;
