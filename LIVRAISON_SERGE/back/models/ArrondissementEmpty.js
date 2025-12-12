import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    nom_arrondissement_communes: String,
    pct_empty_stations: Number
  },
  { collection: "arrondissement_empty", timestamps: false }
);

export default mongoose.model("ArrondissementEmpty", schema);