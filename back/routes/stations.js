import express from "express";
import {
  listStations,
  getStationById,
  createStation,
  bulkInsertStations,
  listStationsBatch
} from "../controllers/stationsController.js";

const router = express.Router();

router.get("/", listStations);
router.get("/batch", listStationsBatch);
router.get("/:id", getStationById);
router.post("/", createStation);
router.post("/bulk", bulkInsertStations);

export default router;
