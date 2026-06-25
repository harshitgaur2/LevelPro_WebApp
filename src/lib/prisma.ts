import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

function missingDatabaseUrl(): never {
  throw new Error("DATABASE_URL is required.");
}

const prismaFallback = new Proxy({} as PrismaClient, {
  get() {
    return missingDatabaseUrl();
  },
});

const prismaClient = databaseUrl
  ? globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaPg(new Pool({ connectionString: databaseUrl })),
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    })
  : prismaFallback;

export const prisma = prismaClient;

if (databaseUrl && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}
