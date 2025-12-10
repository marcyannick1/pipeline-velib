import RealtimeVelib from "../models/RealtimeVelib.js";

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
