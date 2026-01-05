import { randomInt } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/config/database";
import { users } from "@/models";

const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";

export const maskName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "****";
  if (parts.length === 1) return "****";
  const last = parts[parts.length - 1];
  return "****" + last;
};

function generateRandomSuffix(length: number = 4): string {
  let result = "";
  const charactersLength = ALPHABET.length;
  for (let i = 0; i < length; i++) {
    // randomInt(min, max): max là exclusive (không bao gồm)
    const randomIndex = randomInt(0, charactersLength);
    result += ALPHABET[randomIndex];
  }
  return result;
}

export async function generateUniqueUsername(email: string): Promise<string> {
  // 1. Clean email để lấy base username
  let baseUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  // Giới hạn độ dài base
  if (baseUsername.length > 20) {
    baseUsername = baseUsername.substring(0, 20);
  }

  // 2. Kiểm tra base username
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, baseUsername),
    columns: { id: true },
  });

  if (!existingUser) {
    return baseUsername;
  }

  // 3. Logic Retry với crypto
  let maxRetries = 5;

  while (maxRetries > 0) {
    // Thay thế nanoid() bằng hàm tự viết dùng crypto
    const suffix = generateRandomSuffix(4);
    const candidate = `${baseUsername}.${suffix}`;

    const isTaken = await db.query.users.findFirst({
      where: eq(users.username, candidate),
      columns: { id: true },
    });

    if (!isTaken) {
      return candidate;
    }

    maxRetries--;
  }

  // 4. Fallback cuối cùng: dùng timestamp + suffix ngắn
  // crypto cũng có thể dùng ở đây để tăng độ ngẫu nhiên
  return `${baseUsername}.${Date.now().toString(36)}${generateRandomSuffix(2)}`;
}
