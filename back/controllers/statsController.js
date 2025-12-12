import RealtimeVelib from "../models/RealtimeVelib.js";
import ArrondissementAvgBikes from "../models/ArrondissementAvgBikes.js";
import ArrondissementEmpty from "../models/ArrondissementEmpty.js";
import ArrondissementFull from "../models/ArrondissementFull.js";
import ArrondissementRate from "../models/ArrondissementRate.js";
import DailyRate from "../models/DailyRate.js";
import HourlyAvgBikes from "../models/HourlyAvgBikes.js";
import HourlyRate from "../models/HourlyRate.js";
import StationList from "../models/StationList.js";

/**
 * GET /api/stats/top10
 * Return top10 stations by bikes available (most filled)
 */
export const top10Stations = async (req, res, next) => {
  try {
    const items = await RealtimeVelib.aggregate([
      { $sort: { num_bikes_available: -1 } },
      { $limit: 10 },
      { $project: { station_id: 1, name: 1, num_bikes_available: 1, num_docks_available: 1 } }
    ]);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/stats/global
 * Basic global stats
 */
export const globalStats = async (req, res, next) => {
  try {
    const stats = await RealtimeVelib.aggregate([
      {
        $group: {
          _id: null,
          avg_bikes: { $avg: "$num_bikes_available" },
          avg_docks: { $avg: "$num_docks_available" },
          total_stations: { $sum: 1 }
        }
      }
    ]);
    res.json(stats[0] || {});
  } catch (err) {
    next(err);
  }
};

export const getArrondissementAvgBikes = async (req, res, next) => {
  try {
    const data = await ArrondissementAvgBikes.find().sort({ avg_bikes: -1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getArrondissementEmpty = async (req, res, next) => {
  try {
    const data = await ArrondissementEmpty.find().sort({ pct_empty_stations: -1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getArrondissementFull = async (req, res, next) => {
  try {
    const data = await ArrondissementFull.find().sort({ pct_full_stations: -1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getArrondissementRate = async (req, res, next) => {
  try {
    const data = await ArrondissementRate.find().sort({ avg_occupation_rate: -1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getDailyRate = async (req, res, next) => {
  try {
    const data = await DailyRate.find();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getHourlyAvgBikes = async (req, res, next) => {
  try {
    const data = await HourlyAvgBikes.find().sort({ hour: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getHourlyRate = async (req, res, next) => {
  try {
    const data = await HourlyRate.find().sort({ hour: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getStationList = async (req, res, next) => {
  try {
    const data = await StationList.find();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getStationListById = async (req, res, next) => {
  try {
    const station = await StationList.findOne({ station_id: req.params.id });
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }
    res.json(station);
  } catch (error) {
    next(error);
  }
};
