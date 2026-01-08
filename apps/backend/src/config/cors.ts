import { config } from "dotenv";

config({ path: ".env.local" });

export const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // Potential frontend port
    "http://localhost:4173", // Vite preview
    process.env.FRONTEND_URL, // Production frontend URL
    process.env.CORS_ORIGIN,
  ].filter((origin): origin is string => !!origin),
  credentials: true, // Allow cookies and auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
};
