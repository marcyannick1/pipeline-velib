import mongoose from "mongoose";

const stationEmptyFullSchema = new mongoose.Schema({
  station_id: String,
  pct_empty: Number,
  pct_full: Number
}, { collection: 'station_empty_full', timestamps: false });

export default mongoose.model("StationEmptyFull", stationEmptyFullSchema);