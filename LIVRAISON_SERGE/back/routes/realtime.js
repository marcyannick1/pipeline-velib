import express from "express";
import {
  getTotals,
  getTopFull,
  getTopEmpty,
  getTopEbikes,
  getStationsBroken,
  getStationsClosed,
  getStationsFull,
  getStationsEmpty,
  getRealtimeStations
} from "../controllers/realtimeController.js";

const router = express.Router();

// GET /api/realtime/totals
router.get("/totals", getTotals);

// GET /api/realtime/top-full
router.get("/top-full", getTopFull);

// GET /api/realtime/top-empty
router.get("/top-empty", getTopEmpty);

// GET /api/realtime/top-ebikes
router.get("/top-ebikes", getTopEbikes);

// GET /api/realtime/stations-broken
router.get("/stations-broken", getStationsBroken);

// GET /api/realtime/stations-closed
router.get("/stations-closed", getStationsClosed);

// GET /api/realtime/stations-full
router.get("/stations-full", getStationsFull);

// GET /api/realtime/stations-empty
router.get("/stations-empty", getStationsEmpty);

// GET /api/realtime/stations
// Toutes les stations en temps réel avec données d'occupation
router.get("/stations", getRealtimeStations);

export default router;