// src/api/velibApi.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000/api";

/**
 * Vélib API client
 * Toutes les fonctions appellent ton backend réel
 */

// Stations
export const fetchStations = async () => {
  const res = await axios.get(`${BASE_URL}/stations`);
  return res.data;
};

export const fetchStationById = async (id) => {
  const res = await axios.get(`${BASE_URL}/stations/${id}`);
  return res.data;
};

export const fetchStationsByArrondissement = async (city) => {
  const res = await axios.get(`${BASE_URL}/stations/arrondissement/${city}`);
  return res.data;
};

// Totaux globaux en temps réel
export const fetchTotals = async () => {
  const res = await axios.get(`${BASE_URL}/realtime/totals`);
  return res.data;
};

// Top stations
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

// Stations particulières
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
