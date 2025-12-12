import mongoose from "mongoose";

const dailyRateSchema = new mongoose.Schema({
  avg_rate: Number,
  min_rate: Number,
  max_rate: Number
}, { collection: 'daily_rate', timestamps: false });

export default mongoose.model("DailyRate", dailyRateSchema);