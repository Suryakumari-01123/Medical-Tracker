import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ["patient", "doctor"], default: "patient" },
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }]
});

const User = mongoose.model("User", UserSchema);
export default User;
