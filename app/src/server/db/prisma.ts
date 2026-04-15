import path from "node:path";
import { PrismaClient } from "@prisma/client";

const databaseFilePath = path.resolve(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/");

process.env.DATABASE_URL ??= `file:${databaseFilePath}`;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
