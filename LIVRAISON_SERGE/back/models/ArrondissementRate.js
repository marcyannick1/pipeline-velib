import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    nom_arrondissement_communes: String,
    avg_occupation_rate: Number
  },
  { collection: "arrondissement_rate", timestamps: false }
);

export default mongoose.model("ArrondissementRate", schema);