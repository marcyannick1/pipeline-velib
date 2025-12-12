// src/api/velibApi.js
import axios from "axios";

// Default backend port is 4000 in this project
// In browser, use Vite env (import.meta.env); fallback to REACT_APP_* or localhost
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) ||
  process?.env?.REACT_APP_BACKEND_URL ||
  "http://localhost:4000/api";

/**
 * Vélib API client
 * Toutes les fonctions appellent le backend
 */

// Stations (collections batch + liste complète)
export const fetchStations = async () => {
  const res = await axios.get(`${BASE_URL}/stations`);
  return res.data;
};

export const fetchStationById = async (id) => {
  const res = await axios.get(`${BASE_URL}/stations/${id}`);
  return res.data;
};

export const fetchStationsByArrondissement = async (city) => {
  const res = await axios.get(
    `${BASE_URL}/stations/arrondissement/${encodeURIComponent(city)}`
  );
  return res.data;
};

// Statistiques batch
export const fetchArrondissementAvgBikes = async () => {
  const res = await axios.get(`${BASE_URL}/stats/arrondissement-avg-bikes`);
  return res.data;
};

export const fetchArrondissementEmpty = async () => {
  const res = await axios.get(`${BASE_URL}/stats/arrondissement-empty`);
  return res.data;
};

export const fetchArrondissementFull = async () => {
  const res = await axios.get(`${BASE_URL}/stats/arrondissement-full`);
  return res.data;
};

export const fetchArrondissementRate = async () => {
  const res = await axios.get(`${BASE_URL}/stats/arrondissement-rate`);
  return res.data;
};

export const fetchDailyRate = async () => {
  const res = await axios.get(`${BASE_URL}/stats/daily-rate`);
  return res.data;
};

export const fetchHourlyAvgBikes = async () => {
  const res = await axios.get(`${BASE_URL}/stats/hourly-avg-bikes`);
  return res.data;
};

export const fetchHourlyRate = async () => {
  const res = await axios.get(`${BASE_URL}/stats/hourly-rate`);
  return res.data;
};

export const fetchStationList = async () => {
  const res = await axios.get(`${BASE_URL}/stats/station-list`);
  return res.data;
};

export const fetchStationListById = async (id) => {
  const res = await axios.get(`${BASE_URL}/stats/station-list/${id}`);
  return res.data;
};

// Temps réel
export const fetchTotals = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/totals`);
  return res.data;
};

export const fetchTopFull = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/top-full`);
  return res.data;
};

export const fetchTopEmpty = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/top-empty`);
  return res.data;
};

export const fetchTopEbikes = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/top-ebikes`);
  return res.data;
};

export const fetchStationsBroken = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/stations-broken`);
  return res.data;
};

export const fetchStationsClosed = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/stations-closed`);
  return res.data;
};

export const fetchStationsFull = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/stations-full`);
  return res.data;
};

export const fetchStationsEmpty = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/stations-empty`);
  return res.data;
};

export const fetchRealtimeStations = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/stations`);
  return res.data;
};

// Aliases pour compatibilité avec les pages existantes
export const fetchGlobalStats = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/totals`);
  return res.data;
};

export const fetchHourlyStats = async () => {
  const res = await axios.get(`${BASE_URL}/stats/hourly-rate`);
  return res.data;
};

export const fetchWeeklyStats = async () => {
  const res = await axios.get(`${BASE_URL}/stats/daily-rate`);
  return res.data;
};

export const fetchTop10Stations = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/top-full`);
  return res.data;
};

export const fetchDistrictStats = async () => {
  const res = await axios.get(`${BASE_URL}/stats/arrondissement-rate`);
  return res.data;
};
