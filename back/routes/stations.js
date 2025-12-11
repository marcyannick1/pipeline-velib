import express from "express";
import { 
  listStations, 
  getStationById, 
  listStationsByArrondissement 
} from "../controllers/stationsController.js";

const router = express.Router();

// GET /api/stations - Liste toutes les stations
router.get("/", listStations);

// ⚠️ IMPORTANT: Routes spécifiques AVANT les routes avec paramètres dynamiques
router.get("/arrondissement/:city", listStationsByArrondissement);

// GET /api/stations/:id - Récupère une station par ID
router.get("/:id", getStationById);

export default router;
