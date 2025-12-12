import mongoose from "mongoose";
import { getStreamingDB } from "../config/db.js";

const RealtimeVelibSchema = new mongoose.Schema({
  station_id: { type: String, required: true, index: true },
  name: { type: String, required: true, index: true },
  address: { type: String },
  capacity: { type: Number },
  num_bikes_available: { type: Number },
  num_docks_available: { type: Number },
  mechanical: { type: Number },
  ebike: { type: Number },
  is_installed: { type: Boolean },
  is_renting: { type: Boolean },
  is_returning: { type: Boolean },
  last_update: { type: Date, default: Date.now, index: true },
  raw: { type: mongoose.Schema.Types.Mixed }
}, {
  collection: "realtime_velib",
  timestamps: true
});

RealtimeVelibSchema.index({ name: 1 });
RealtimeVelibSchema.index({ station_id: 1 });
RealtimeVelibSchema.index({ last_update: -1 });
RealtimeVelibSchema.index({ num_bikes_available: -1 });
RealtimeVelibSchema.index({ ebike: -1 });

// Helper function to get streaming DB collections
export async function getStreamingCollections() {
  const db = await getStreamingDB();
  return {
    totals: db.collection("totals"),
    topFull: db.collection("top_full"),
    topEmpty: db.collection("top_empty"),
    topEbikes: db.collection("top_ebikes"),
    stationsBroken: db.collection("stations_broken"),
    stationsClosed: db.collection("stations_closed"),
    stationsFull: db.collection("stations_full"),
    stationsEmpty: db.collection("stations_empty")
  };
}

export const RealtimeVelib = mongoose.model("RealtimeVelib", RealtimeVelibSchema);
export default RealtimeVelib;
