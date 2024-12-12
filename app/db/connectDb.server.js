import mongoose from "mongoose";

// Call this function from entry.server.jsx. We reuse an existing Mongoose db
// connection to avoid creating multiple connections in dev mode when Remix
// "purges the require cache" when reloading on file changes.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDb() {
  const { MONGODB_URI, NODE_ENV } = process.env;

  if (!MONGODB_URI) {
    const errorMessage =
      NODE_ENV === "production"
        ? "Please define the MONGODB_URI environment variable — pointing to your full connection string, including database name."
        : "Please define the MONGODB_URI environment variable inside an .env file — pointing to your full connection string, including database name.";
    throw new Error(errorMessage);
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDb;
