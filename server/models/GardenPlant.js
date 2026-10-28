import mongoose from "mongoose"

const gardenPlantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    commonName: { type: String, default: "", trim: true, maxlength: 120 },
    scientificName: { type: String, required: true, trim: true, maxlength: 160 },
    probability: { type: Number, min: 0, max: 1 },
    imageUrl: { type: String, default: "" },
    notes: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true },
)

export default mongoose.model("GardenPlant", gardenPlantSchema)
