import sendgrid from "@sendgrid/mail";
import { config } from "dotenv";

import logger from "@/config/logger";

config({ path: ".env" });

const requiredEnvVars = ["SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL"];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is required but not set.`);
  }
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL as string;

// Khởi tạo SendGrid với API key
sendgrid.setApiKey(SENDGRID_API_KEY);

// Log thông tin cấu hình khi khởi tạo
logger.info(`✅ SendGrid configured with sender: ${SENDGRID_FROM_EMAIL}`);

export default sendgrid;
