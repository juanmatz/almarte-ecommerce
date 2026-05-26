import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

// Parse credentials from DATABASE_URL
const getDbConfig = () => {
  const urlString = process.env.DATABASE_URL;
  if (!urlString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }
  
  const dbUrl = new URL(urlString);
  return {
    host: dbUrl.hostname,
    port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace("/", ""),
  };
};

if (process.env.NODE_ENV === "production") {
  const config = getDbConfig();
  const adapter = new PrismaMariaDb({
    ...config,
    connectionLimit: 15, // Hostinger Business connection pool limit
  });
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const config = getDbConfig();
    const adapter = new PrismaMariaDb({
      ...config,
      connectionLimit: 5,
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
export { prisma };
