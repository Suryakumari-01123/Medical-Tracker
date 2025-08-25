import mongoose from "mongoose";

const MedicationSchema = new mongoose.Schema({
  name: String,
  interactions: [{ type: String }], // List of medicines it interacts with
});

const Medication = mongoose.model("Medication", MedicationSchema);
export default Medication;
