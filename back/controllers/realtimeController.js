import RealtimeVelib from "../models/RealtimeVelib.js";

/**
 * GET /api/realtime/totals
 * Totaux globaux en temps réel
 */
export const getTotals = async (req, res, next) => {
  try {
    const result = await RealtimeVelib.aggregate([
      {
        $group: {
          _id: null,
          total_stations: { $sum: 1 },
          total_bikes: { $sum: "$num_bikes_available" },
          total_docks: { $sum: "$num_docks_available" },
          total_mechanical: { $sum: "$mechanical" },
          total_ebike: { $sum: "$ebike" },
          total_capacity: { $sum: "$capacity" }
        }
      }
    ]);
    res.json(result[0] || {});
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/realtime/top-full
 * Top 10 stations les plus remplies
 */
export const getTopFull = async (req, res, next) => {
  try {
    const stations = await RealtimeVelib.find({ capacity: { $gt: 0 } })
      .select('station_id name num_bikes_available capacity')
      .sort({ num_bikes_available: -1 })
      .limit(10);
    
    res.json(stations.map(s => ({
      ...s.toObject(),
      fill_rate: s.capacity > 0 ? (s.num_bikes_available / s.capacity).toFixed(2) : 0
    })));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/realtime/top-empty
 * Top 10 stations les plus vides
 */
export const getTopEmpty = async (req, res, next) => {
  try {
    const stations = await RealtimeVelib.find({ capacity: { $gt: 0 } })
      .select('station_id name num_bikes_available num_docks_available capacity')
      .sort({ num_bikes_available: 1 })
      .limit(10);
    
    res.json(stations.map(s => ({
      ...s.toObject(),
      empty_rate: s.capacity > 0 ? (s.num_docks_available / s.capacity).toFixed(2) : 0
    })));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/realtime/top-ebikes
 * Top 10 stations avec le plus de vélos électriques
 */
export const getTopEbikes = async (req, res, next) => {
  try {
    const stations = await RealtimeVelib.find({ ebike: { $gt: 0 } })
      .select('station_id name ebike mechanical num_bikes_available')
      .sort({ ebike: -1 })
      .limit(10);
    
    res.json(stations);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/realtime/stations-broken
 * Stations cassées/non installées
 */
export const getStationsBroken = async (req, res, next) => {
  try {
    const stations = await RealtimeVelib.find({ is_installed: false })
      .select('station_id name address is_installed last_update')
      .sort({ last_update: -1 });
    
    res.json(stations);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/realtime/stations-closed
 * Stations fermées (pas de location/retour)
 */
export const getStationsClosed = async (req, res, next) => {
  try {
    const stations = await RealtimeVelib.find({
      $or: [
        { is_renting: false },
        { is_returning: false }
      ]
    })
      .select('station_id name is_renting is_returning last_update')
      .sort({ last_update: -1 });
    
    res.json(stations);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/realtime/stations-full
 * Stations pleines (0 places disponibles)
 */
export const getStationsFull = async (req, res, next) => {
  try {
    const stations = await RealtimeVelib.find({ 
      num_docks_available: 0,
      capacity: { $gt: 0 }
    })
      .select('station_id name num_bikes_available capacity last_update')
      .sort({ last_update: -1 });
    
    res.json(stations);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/realtime/stations-empty
 * Stations vides (0 vélos disponibles)
 */
export const getStationsEmpty = async (req, res, next) => {
  try {
    const stations = await RealtimeVelib.find({ 
      num_bikes_available: 0,
      capacity: { $gt: 0 }
    })
      .select('station_id name num_docks_available capacity last_update')
      .sort({ last_update: -1 });
    
    res.json(stations);
  } catch (error) {
    next(error);
  }
};