import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__farmTatvaPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__farmTatvaPrisma = prisma;
}

export default prisma;
