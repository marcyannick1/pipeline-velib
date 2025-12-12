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
    stationsEmpty: db.collection("stations_empty"),
    stationsRealtime: db.collection("stations_realtime")
  };
}

// Helper to normalize station data from streaming DB
export function normalizeStationData(station) {
  if (!station) return null;
  return {
    _id: station._id,
    station_id: station.station_id,
    name: station.name,
    address: station.nom_arrondissement_communes || '',
    latitude: station.latitude,
    longitude: station.longitude,
    capacity: station.capacity || 0,
    num_bikes_available: station.num_bikes_available || 0,
    num_docks_available: station.num_docks_available || 0,
    mechanical: station.mechanical_bikes || 0,
    ebike: station.ebikes || 0,
    is_installed: station.is_installed === 'OUI',
    is_renting: station.is_renting === 'OUI',
    is_returning: station.is_returning === 'OUI',
    ts: station.ts
  };
}

// Helper to normalize realtime station data with occupancy color
export function normalizeRealtimeStationData(station) {
  if (!station) return null;
  
  const occupancyRate = station.occupation_rate || 0;
  let status = 'available';
  
  if (occupancyRate >= 0.9) {
    status = 'full';
  } else if (occupancyRate >= 0.7) {
    status = 'available';
  } else if (occupancyRate > 0.2 && occupancyRate < 0.7) {
    status = 'low';
  } else if (occupancyRate <= 0.2) {
    status = 'empty';
  }
  
  return {
    _id: station._id,
    station_id: station.station_id,
    name: station.name,
    address: station.nom_arrondissement_communes || '',
    latitude: station.latitude,
    longitude: station.longitude,
    capacity: station.capacity || 0,
    num_bikes_available: station.num_bikes_available || 0,
    num_docks_available: station.num_docks_available || 0,
    mechanical: station.mechanical_bikes || 0,
    ebike: station.ebikes || 0,
    occupancyRate: Math.round(occupancyRate * 100),
    status,
    timestamp: station.timestamp
  };
}

export const RealtimeVelib = mongoose.model("RealtimeVelib", RealtimeVelibSchema);
export default RealtimeVelib;
