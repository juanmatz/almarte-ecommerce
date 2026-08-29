import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

// Parse credentials from DATABASE_URL
// Uses regex instead of new URL() to handle passwords with special characters (/, +, =)
const getDbConfig = () => {
  const urlString = process.env.DATABASE_URL;
  if (!urlString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  // Pattern: protocol://user:password@host:port/database
  const match = urlString.match(
    /^(?:mysql|mariadb):\/\/([^:]+):(.+)@([^:\/]+):?(\d+)?\/(.+)$/
  );

  if (!match) {
    throw new Error(
      "DATABASE_URL format is invalid. Expected: mysql://user:password@host:port/database"
    );
  }

  const [, user, password, host, port, database] = match;
  return {
    host,
    port: port ? parseInt(port) : 3306,
    user: decodeURIComponent(user),
    password: decodeURIComponent(password),
    database,
  };
};

if (process.env.NODE_ENV === "production") {
  const config = getDbConfig();
  const adapter = new PrismaMariaDb({
    ...config,
    connectionLimit: 15, // Hostinger Business connection pool limit
    allowPublicKeyRetrieval: true,
  });
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const config = getDbConfig();
    const adapter = new PrismaMariaDb({
      ...config,
      connectionLimit: 5,
      allowPublicKeyRetrieval: true,
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
export { prisma };
