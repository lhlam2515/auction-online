// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
} as const;

// API Request Timeouts (ms)
export const TIMEOUTS = {
  DEFAULT: 30000,
  UPLOAD: 120000,
  DOWNLOAD: 60000,
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Product Status Colors
export const PRODUCT_STATUS_COLORS = {
  draft: "gray",
  pending: "yellow",
  active: "green",
  ended: "blue",
  cancelled: "red",
  sold: "purple",
} as const;

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  pending_payment: "yellow",
  paid: "blue",
  shipped: "indigo",
  completed: "green",
  cancelled: "red",
} as const;

// User Roles
export const USER_ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PRODUCT_TITLE_MIN_LENGTH: 10,
  PRODUCT_TITLE_MAX_LENGTH: 200,
  PRODUCT_DESCRIPTION_MIN_LENGTH: 50,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 5000,
  QUESTION_MIN_LENGTH: 10,
  QUESTION_MAX_LENGTH: 500,
  ANSWER_MIN_LENGTH: 10,
  ANSWER_MAX_LENGTH: 1000,
  RATING_COMMENT_MAX_LENGTH: 500,
  CHAT_MESSAGE_MAX_LENGTH: 1000,
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

// Time Constants (ms)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

// Debounce/Throttle Delays (ms)
export const DELAYS = {
  SEARCH: 500,
  AUTOSAVE: 2000,
  SCROLL: 100,
  RESIZE: 200,
} as const;

// Rating Values
export const RATING_VALUES = [1, 2, 3, 4, 5] as const;

// Sort Options
export const SORT_OPTIONS = {
  PRICE_ASC: { value: "price:asc", label: "Giá: Thấp đến Cao" },
  PRICE_DESC: { value: "price:desc", label: "Giá: Cao đến Thấp" },
  TIME_ASC: { value: "time:asc", label: "Thời gian: Cũ nhất" },
  TIME_DESC: { value: "time:desc", label: "Thời gian: Mới nhất" },
  ENDING_SOON: { value: "endingSoon:asc", label: "Sắp kết thúc" },
  BIDS_DESC: { value: "bids:desc", label: "Nhiều lượt đấu giá" },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra lại.",
  UNAUTHORIZED: "Bạn cần đăng nhập để thực hiện thao tác này.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  NOT_FOUND: "Không tìm thấy dữ liệu.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ.",
  UNKNOWN_ERROR: "Đã có lỗi xảy ra.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Đăng nhập thành công!",
  LOGOUT: "Đăng xuất thành công!",
  REGISTER: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh.",
  UPDATE_PROFILE: "Cập nhật thông tin thành công!",
  CHANGE_PASSWORD: "Đổi mật khẩu thành công!",
  CREATE_PRODUCT: "Tạo sản phẩm thành công!",
  UPDATE_PRODUCT: "Cập nhật sản phẩm thành công!",
  DELETE_PRODUCT: "Xóa sản phẩm thành công!",
  PLACE_BID: "Đặt giá thành công!",
  ADD_WATCHLIST: "Đã thêm vào danh sách theo dõi!",
  REMOVE_WATCHLIST: "Đã xóa khỏi danh sách theo dõi!",
  SEND_MESSAGE: "Gửi tin nhắn thành công!",
  SUBMIT_RATING: "Gửi đánh giá thành công!",
} as const;
