import mongoose from "mongoose";
import dns from "node:dns";

// Dynamically set public DNS servers to resolve MongoDB SRV records (fixes ECONNREFUSED/querySrv)
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (err) {
  console.warn("Failed to set custom DNS servers:", err);
}

const MONGODB_URL = process.env.MONGODB_URL as string;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in environment variables.");
}

// Cached connection for serverless environments (Next.js)
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URL, {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}
