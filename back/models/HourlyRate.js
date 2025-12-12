import mongoose from "mongoose";

const hourlyRateSchema = new mongoose.Schema({
  hour: Number,
  avg_occupation_rate: Number
}, { collection: 'hourly_rate', timestamps: false });

export default mongoose.model("HourlyRate", hourlyRateSchema);