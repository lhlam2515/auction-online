import { config } from "dotenv";
import nodemailer from "nodemailer";

config({ path: ".env" });

const requiredEnvVars = [
  "MAILER_HOST",
  "MAILER_PORT",
  "MAILER_USER",
  "MAILER_PASS",
  "MAILER_FROM",
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is required but not set.`);
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: Number(process.env.MAILER_PORT),
  secure: process.env.MAILER_SECURE === "true",
  pool: true, // Giữ kết nối để tái sử dụng

  // TĂNG maxConnections để phù hợp với worker concurrency: 20
  // Mỗi connection có thể xử lý nhiều email nhờ maxMessages
  maxConnections: 10, // Tăng từ 5 → 10

  // Số email tối đa qua 1 connection trước khi đóng & mở lại
  // Giúp tránh connection stale và clean memory
  maxMessages: 100, // Giữ nguyên

  // Timeout cho idle connections (ms) - Đóng connection không dùng sau 10s
  socketTimeout: 10000,

  // Thời gian chờ kết nối SMTP server
  connectionTimeout: 5000,

  // Tự động retry khi gửi failed (Lớp retry của nodemailer, khác với BullMQ retry)
  // Set false vì đã có retry ở BullMQ level
  maxRetries: 0,

  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
} as nodemailer.TransportOptions);

export const MAILER_FROM = process.env.MAILER_FROM as string;
export type MailerTransporter = typeof transporter;
export default transporter;
