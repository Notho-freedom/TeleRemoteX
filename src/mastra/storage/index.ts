/**
 * PostgreSQL Storage Configuration
 * 
 * Configures the shared PostgreSQL storage instance for Mastra.
 * Uses DATABASE_URL environment variable with fallback for development.
 * 
 * Environment Variables:
 * - DATABASE_URL: PostgreSQL connection string (required in production)
 * 
 * Example: postgresql://user:password@host:port/database
 */
import { PostgresStore } from "@mastra/pg";

// Get database URL from environment or use a default for development
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // In production, DATABASE_URL should always be set
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ DATABASE_URL not set in production environment. Using fallback.");
  }
  
  return "postgresql://localhost:5432/mastra";
};

// Create a single shared PostgreSQL storage instance
export const sharedPostgresStorage = new PostgresStore({
  connectionString: getDatabaseUrl(),
});
