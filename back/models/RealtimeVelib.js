import mongoose from "mongoose";

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
  raw: { type: mongoose.Schema.Types.Mixed } // keep raw payload optionally
}, {
  collection: "realtime_velib",
  timestamps: true
});

// Compound index example: quick lookup by name + arrondissement (if added)
RealtimeVelibSchema.index({ name: 1 });
RealtimeVelibSchema.index({ station_id: 1 });
RealtimeVelibSchema.index({ last_update: -1 });
RealtimeVelibSchema.index({ num_bikes_available: -1 });
RealtimeVelibSchema.index({ ebike: -1 });

export default mongoose.models.RealtimeVelib || mongoose.model("RealtimeVelib", RealtimeVelibSchema);
