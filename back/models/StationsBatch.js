import mongoose from "mongoose";

const StationsBatchSchema = new mongoose.Schema({
  station_id: { type: String, required: true, index: true },
  name: { type: String, required: true, index: true },
  address: { type: String },
  arrondissement: { type: String, index: true },
  capacity: { type: Number },
  avg_bikes: { type: Number },
  avg_docks: { type: Number },
  date: { type: Date, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  collection: "stations_batch",
  timestamps: true
});

StationsBatchSchema.index({ station_id: 1, date: -1 });

export default mongoose.models.StationsBatch || mongoose.model("StationsBatch", StationsBatchSchema);
