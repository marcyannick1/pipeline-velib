import StationList from "../models/StationList.js";


export const listStations = async (req, res) => {
  try {
    const stations = await StationList.find();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStationById = async (req, res) => {
  try {
    const station = await StationList.findOne({ station_id: req.params.id });
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listStationsByArrondissement = async (req, res) => {
  try {
    // Recherche insensible à la casse pour être plus flexible
    const stations = await StationList.find({ 
      city: { $regex: new RegExp(req.params.city, 'i') }
    });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};