import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    disease: { type: String, required: true },

    risk: { type: String, default: "Low" },
    suggestion: { type: String, default: "" },

    history: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Patient ||
  mongoose.model("Patient", PatientSchema);
