import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "";
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!uri) {
  // Graceful fallback during build step if env var not set yet
  clientPromise = Promise.resolve(null);
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;

export async function getDb() {
  const c = await clientPromise;
  if (!c) return null;
  const dbName = process.env.DATABASE_NAME || "AutoFilterBot";
  return c.db(dbName);
}
