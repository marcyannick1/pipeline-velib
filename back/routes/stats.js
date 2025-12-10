import express from "express";
import DailyRate from "../models/DailyRate.js";
import Arrondissement from "../models/Arrondissement.js";
import HourlyAvgBikes from "../models/HourlyAvgBikes.js";
import HourlyRate from "../models/HourlyRate.js";
import StationEmptyFull from "../models/StationEmptyFull.js";

const router = express.Router();

router.get("/daily-rate", async (req, res) => {
  try {
    const data = await DailyRate.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/arrondissement", async (req, res) => {
  try {
    const data = await Arrondissement.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/hourly-avg-bikes", async (req, res) => {
  try {
    const data = await HourlyAvgBikes.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/hourly-rate", async (req, res) => {
  try {
    const data = await HourlyRate.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/station-empty-full", async (req, res) => {
  try {
    const data = await StationEmptyFull.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
