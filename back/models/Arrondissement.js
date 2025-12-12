import mongoose from "mongoose";

const arrondissementSchema = new mongoose.Schema({
  nom_arrondissement_communes: String,
  avg_bikes: Number
}, { collection: 'arrondissement', timestamps: false });

export default mongoose.model("Arrondissement", arrondissementSchema);