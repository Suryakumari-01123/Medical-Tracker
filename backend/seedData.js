import mongoose from "mongoose";
import dotenv from "dotenv";
import Medication from "./models/Medication.js";

dotenv.config();

mongoose.connect("mongodb://127.0.0.1:27017/medicine_tracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const medications = [
  { name: "Aspirin", interactions: ["Ibuprofen", "Warfarin"] },
  { name: "Ibuprofen", interactions: ["Aspirin", "Prednisone"] },
  { name: "Warfarin", interactions: ["Aspirin", "Paracetamol"] },
  { name: "Prednisone", interactions: ["Ibuprofen"] },
];

const seedDatabase = async () => {
  await Medication.deleteMany({});
  await Medication.insertMany(medications);
  console.log("✅ Medication data added!");
  mongoose.connection.close();
};

seedDatabase();
