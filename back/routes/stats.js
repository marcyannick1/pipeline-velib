import express from "express";
import { top10Stations, globalStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/top10", top10Stations);
router.get("/global", globalStats);

export default router;
