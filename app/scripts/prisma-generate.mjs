import { execSync } from "node:child_process";
import path from "node:path";

const databaseFilePath = path.resolve(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/");

process.env.DATABASE_URL ??= `file:${databaseFilePath}`;

execSync("npx prisma generate", {
  stdio: "inherit",
  env: process.env,
});
