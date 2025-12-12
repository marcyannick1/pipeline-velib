import RealtimeVelib, { getStreamingCollections, normalizeStationData, normalizeRealtimeStationData } from "../models/RealtimeVelib.js";

/**
 * GET /api/realtime/totals
 * Totaux globaux en temps réel
 */
export const getTotals = async (req, res, next) => {
  try {
    const collections = await getStreamingCollections();
    const result = await collections.totals.findOne({});
    if (!result) {
      return res.json({
        total_bikes: 0,
        total_mechanical: 0,
        total_ebike: 0,
        total_docks: 0,
        occupancyRate: 0
      });
    }
    // Map fields to frontend expected format
    res.json({
      total_bikes: Number(result.bikes_available || 0),
      total_mechanical: Number(result.mechanical_available || 0),
      total_ebike: Number(result.ebikes_available || 0),
      total_docks: Number(result.free_slots || 0),
      occupancyRate: result.occupation_rate ? Math.round(result.occupation_rate * 100) : 0
    });
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
    const collections = await getStreamingCollections();
    const stations = await collections.topFull.find({}).limit(10).toArray();
    res.json(stations.map(normalizeStationData));
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
    const collections = await getStreamingCollections();
    const stations = await collections.topEmpty.find({}).limit(10).toArray();
    res.json(stations.map(normalizeStationData));
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
    const collections = await getStreamingCollections();
    const stations = await collections.topEbikes.find({}).limit(10).toArray();
    res.json(stations.map(normalizeStationData));
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
    const collections = await getStreamingCollections();
    const stations = await collections.stationsBroken.find({}).toArray();
    res.json(stations.map(normalizeStationData));
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
    const collections = await getStreamingCollections();
    const stations = await collections.stationsClosed.find({}).toArray();
    res.json(stations.map(normalizeStationData));
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
    const collections = await getStreamingCollections();
    const stations = await collections.stationsFull.find({}).toArray();
    res.json(stations.map(normalizeStationData));
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
    const collections = await getStreamingCollections();
    const stations = await collections.stationsEmpty.find({}).toArray();
    res.json(stations.map(normalizeStationData));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/realtime/stations
 * Toutes les stations en temps réel avec données d'occupation
 */
export const getRealtimeStations = async (req, res, next) => {
  try {
    const collections = await getStreamingCollections();
    const stations = await collections.stationsRealtime.find({}).toArray();
    res.json(stations.map(normalizeRealtimeStationData));
  } catch (error) {
    next(error);
  }
};