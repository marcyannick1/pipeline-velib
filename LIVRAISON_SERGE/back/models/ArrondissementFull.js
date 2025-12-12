import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    nom_arrondissement_communes: String,
    pct_full_stations: Number
  },
  { collection: "arrondissement_full", timestamps: false }
);

export default mongoose.model("ArrondissementFull", schema);