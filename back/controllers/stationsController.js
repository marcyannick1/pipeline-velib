import RealtimeVelib from "../models/RealtimeVelib.js";
import StationsBatch from "../models/StationsBatch.js";

/**
 * GET /api/stations
 * Query params: page, limit, q (search name), arrondissement
 */
export const listStations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "50", 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.q) {
      filter.name = { $regex: req.query.q, $options: "i" };
    }
    if (req.query.arrondissement) {
      filter.arrondissement = req.query.arrondissement;
    }

    const [items, total] = await Promise.all([
      RealtimeVelib.find(filter).sort({ last_update: -1 }).skip(skip).limit(limit).lean(),
      RealtimeVelib.countDocuments(filter)
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    next(err);
  }
};

export const getStationById = async (req, res, next) => {
  try {
    const station = await RealtimeVelib.findOne({ station_id: req.params.id }).lean();
    if (!station) return res.status(404).json({ message: "Station not found" });
    res.json(station);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/stations  (single document)
 * Accepts a JSON body of one station doc
 */
export const createStation = async (req, res, next) => {
  try {
    const doc = await RealtimeVelib.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/stations/bulk
 * Accepts an array of station documents - useful for ingestion jobs/scripts
 */
export const bulkInsertStations = async (req, res, next) => {
  try {
    const docs = req.body; // expect array
    if (!Array.isArray(docs)) return res.status(400).json({ message: "Body must be an array" });

    // Use insertMany with ordered:false to continue on errors
    const result = await RealtimeVelib.insertMany(docs, { ordered: false });
    res.status(201).json({ inserted: result.length });
  } catch (err) {
    // handle duplication errors gracefully
    next(err);
  }
};

/**
 * GET /api/stations/batch
 * Return batch-aggregated documents (stations_batch)
 */
export const listStationsBatch = async (req, res, next) => {
  try {
    const items = await StationsBatch.find({}).sort({ date: -1 }).limit(100).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
};
