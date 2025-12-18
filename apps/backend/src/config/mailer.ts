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
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

export const MAILER_FROM = process.env.MAILER_FROM as string;
export type MailerTransporter = typeof transporter;
export default transporter;
