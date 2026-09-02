import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Parse credentials from DATABASE_URL safely
// Uses regex to support passwords with special characters (+, /, =, etc.)
const getDbConfig = () => {
  const urlString = process.env.DATABASE_URL;
  if (!urlString) {
    return null;
  }

  try {
    // Pattern: protocol://user:password@host:port/database
    const match = urlString.match(
      /^(?:mysql|mariadb):\/\/([^:]+):(.+)@([^:\/]+):?(\d+)?\/(.+)$/
    );

    if (match) {
      const [, user, password, host, port, database] = match;
      return {
        host,
        port: port ? parseInt(port) : 3306,
        user: decodeURIComponent(user),
        password: decodeURIComponent(password),
        database: database.split("?")[0],
      };
    }

    // Fallback standard URL parser
    const dbUrl = new URL(urlString);
    return {
      host: dbUrl.hostname || "127.0.0.1",
      port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
      user: dbUrl.username || "root",
      password: decodeURIComponent(dbUrl.password || ""),
      database: dbUrl.pathname.replace("/", "") || "almarte",
    };
  } catch (err) {
    console.warn("Invalid DATABASE_URL format:", err);
    return null;
  }
};

function createPrismaClient(): PrismaClient {
  const config = getDbConfig();

  if (config) {
    try {
      const adapter = new PrismaMariaDb({
        ...config,
        connectionLimit: process.env.NODE_ENV === "production" ? 15 : 5,
        allowPublicKeyRetrieval: true,
        connectTimeout: 3000,
        acquireTimeout: 3000,
      });
      return new PrismaClient({ adapter });
    } catch (e) {
      console.warn("Could not create PrismaMariaDb adapter, falling back to standard PrismaClient:", e);
    }
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Keep instance in globalThis in both development and production to prevent connection pool leaks
globalForPrisma.prisma = prisma;

export default prisma;
