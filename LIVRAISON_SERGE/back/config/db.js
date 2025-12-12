import mongoose from "mongoose";
import { MongoClient } from "mongodb";

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      // other options are optional with modern mongoose
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

// Create a global MongoDB client for accessing streaming DB
let streamingClient = null;

export async function getStreamingDB() {
  try {
    if (!streamingClient) {
      const mongoUri = process.env.MONGO_STREAMING_URI || "mongodb://mongodb:27017";
      streamingClient = new MongoClient(mongoUri);
      await streamingClient.connect();
      console.log("✅ Streaming MongoDB connected");
    }
    return streamingClient.db("velib_kpi_streaming");
  } catch (err) {
    console.error("❌ Streaming MongoDB connection error:", err);
    throw err;
  }
}
