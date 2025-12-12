import express from "express";
import {
  getArrondissementAvgBikes,
  getArrondissementEmpty,
  getArrondissementFull,
  getArrondissementRate,
  getDailyRate,
  getHourlyAvgBikes,
  getHourlyRate,
  getStationList,
  getStationListById,
  getStationEmptyFull,
  getArrondissement
} from "../controllers/statsController.js";

const router = express.Router();

// GET /api/stats/arrondissement-avg-bikes
router.get("/arrondissement-avg-bikes", getArrondissementAvgBikes);

// GET /api/stats/arrondissement-empty
router.get("/arrondissement-empty", getArrondissementEmpty);

// GET /api/stats/arrondissement-full
router.get("/arrondissement-full", getArrondissementFull);

// GET /api/stats/arrondissement-rate
router.get("/arrondissement-rate", getArrondissementRate);

// GET /api/stats/daily-rate
router.get("/daily-rate", getDailyRate);

// GET /api/stats/hourly-avg-bikes
router.get("/hourly-avg-bikes", getHourlyAvgBikes);

// GET /api/stats/hourly-rate
router.get("/hourly-rate", getHourlyRate);

// GET /api/stats/station-list
router.get("/station-list", getStationList);

// GET /api/stats/station-list/:id
router.get("/station-list/:id", getStationListById);

// GET /api/stats/station-empty-full
router.get("/station-empty-full", getStationEmptyFull);

// GET /api/stats/arrondissement
router.get("/arrondissement", getArrondissement);

export default router;
