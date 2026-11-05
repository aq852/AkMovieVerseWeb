import { MongoClient } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URI ||
  "";

const secUri =
  process.env.SECONDARY_MONGODB_URI ||
  process.env.SECONDARY_MONGO_URI ||
  process.env.SECONDARY_DATABASE_URI ||
  "";

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let clientPromise;
if (!uri) {
  clientPromise = Promise.resolve(null);
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri, options).connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    clientPromise = new MongoClient(uri, options).connect();
  }
}

let secClientPromise;
if (!secUri) {
  secClientPromise = Promise.resolve(null);
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._secMongoClientPromise) {
      global._secMongoClientPromise = new MongoClient(secUri, options).connect();
    }
    secClientPromise = global._secMongoClientPromise;
  } else {
    secClientPromise = new MongoClient(secUri, options).connect();
  }
}

export default clientPromise;

export async function getDb() {
  const c = await clientPromise;
  if (!c) return null;
  const dbName = process.env.DATABASE_NAME || "AutoFilterBot";
  return c.db(dbName);
}

export async function getSecondaryDb() {
  const c = await secClientPromise;
  if (!c) return null;
  const dbName =
    process.env.SECONDARY_DATABASE_NAME ||
    process.env.DATABASE_NAME ||
    "AutoFilterBot";
  return c.db(dbName);
}

export async function getAllDatabases() {
  const dbs = [];
  try {
    const primary = await getDb();
    if (primary) dbs.push(primary);
  } catch (err) {}

  try {
    const secondary = await getSecondaryDb();
    if (secondary) dbs.push(secondary);
  } catch (err) {}

  return dbs;
}
