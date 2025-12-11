import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    nom_arrondissement_communes: String,
    avg_bikes: Number
  },
  { collection: "arrondissement_avg_bikes", timestamps: false }
);

export default mongoose.model("ArrondissementAvgBikes", schema);