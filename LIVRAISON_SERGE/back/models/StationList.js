import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    station_id: String,
    station_name: String,
    city: String,
    zip_code: String,
    latitude: Number,
    longitude: Number,
    capacity: Number
  },
  { collection: "station_list", timestamps: false }
);

export default mongoose.model("StationList", schema);