import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import stationsRouter from "./routes/stations.js";
import statsRouter from "./routes/stats.js";
import errorHandler from "./utils/errorHandler.js";
import realtimeRouter from "./routes/realtime.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/velib_kpi_batch";

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.send("Velib backend ✅"));

app.use("/api/stations", stationsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/realtime", realtimeRouter);

// Error handler (last)
app.use(errorHandler);

async function start() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();
