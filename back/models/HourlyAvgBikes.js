import mongoose from "mongoose";

const hourlyAvgBikesSchema = new mongoose.Schema({
  hour: Number,
  avg_bikes: Number
}, { collection: 'hourly_avg_bikes', timestamps: false });

export default mongoose.model("HourlyAvgBikes", hourlyAvgBikesSchema);