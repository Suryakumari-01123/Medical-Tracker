import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import listEndpoints from "express-list-endpoints";
import Medication from "./models/Medication.js"; // Import the Medication model

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// **🔹 MongoDB Connection**
mongoose
  .connect("mongodb://127.0.0.1:27017/medicine_tracker", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// **🔹 User Schema**
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

// **🔹 Missed Dose Schema**
const MissedDoseSchema = new mongoose.Schema({
  userEmail: String,
  medicine: String,
  date: String,
  time: String,
});

const MissedDose = mongoose.model("MissedDose", MissedDoseSchema);

// **🔹 Emergency SOS Schema**
const EmergencySchema = new mongoose.Schema({
  userEmail: String,
  emergencyContacts: [String], // List of emails (family, doctor, caregiver)
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const EmergencyAlert = mongoose.model("EmergencyAlert", EmergencySchema);

// **🔹 Prescription Schema**
const PrescriptionSchema = new mongoose.Schema({
  userEmail: String,
  medicine: String,
  dosage: String,
  frequency: String,
  startDate: String,
  endDate: String,
  doctor: String,
});

const Prescription = mongoose.model("Prescription", PrescriptionSchema);

// **🔹 Nodemailer Setup**
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// **📌 Signup Route**
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "⚠️ User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});

// **📌 Send Missed Dose Alert Email**
app.post("/send-email", async (req, res) => {
  try {
    const { userEmail, familyEmail, doctorEmail, medicine } = req.body;

    if (!userEmail || !familyEmail || !doctorEmail || !medicine) {
      return res.status(400).json({ message: "⚠️ Missing required fields" });
    }

    const missedDoseEntry = new MissedDose({
      userEmail,
      medicine,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    await missedDoseEntry.save();
    console.log("✅ Missed dose recorded:", missedDoseEntry);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: [familyEmail, doctorEmail],
      subject: "🚨 Missed Medication Alert",
      text: `⚠️ Alert: ${userEmail} missed their medicine (${medicine}) on ${missedDoseEntry.date} at ${missedDoseEntry.time}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Email sending error:", error);
        return res.status(500).json({ message: "❌ Failed to send email", error });
      }
      console.log("✅ Email sent:", info.response);
      res.status(200).json({ message: "✅ Missed dose email sent successfully", info });
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error });
  }
});

// **📌 Create Prescription**
app.post("/api/Prescriptions/create-prescription", async (req, res) => {
  try {
    const { userEmail, medicine, dosage, frequency, startDate, endDate, doctor } = req.body;

    if (!userEmail || !medicine || !dosage || !frequency || !startDate || !endDate || !doctor) {
      return res.status(400).json({ message: "⚠️ Missing required fields" });
    }

    const newPrescription = new Prescription({
      userEmail,
      medicine,
      dosage,
      frequency,
      startDate,
      endDate,
      doctor,
    });

    await newPrescription.save();
    console.log("✅ Prescription created:", newPrescription);

    res.status(201).json({ message: "✅ Prescription created successfully", prescription: newPrescription });
  } catch (error) {
    console.error("❌ Error creating prescription:", error);
    res.status(500).json({ error: "Error creating prescription" });
  }
});

// **📌 Medication Interaction Warning System**
app.post("/api/check-interaction", async (req, res) => {
  try {
    const { medications } = req.body;

    if (!medications || medications.length === 0) {
      return res.status(400).json({ message: "⚠️ No medications provided" });
    }

    let interactionWarnings = [];

    for (let med of medications) {
      const foundMedication = await Medication.findOne({ name: med });

      if (foundMedication) {
        const conflicts = medications.filter(m => foundMedication.interactions.includes(m));
        if (conflicts.length > 0) {
          interactionWarnings.push({
            medicine: med,
            interactsWith: conflicts,
          });
        }
      }
    }

    if (interactionWarnings.length === 0) {
      return res.status(200).json({ message: "✅ No dangerous interactions found!" });
    }

    res.status(200).json({
      message: "⚠️ Potential medication interactions detected!",
      interactions: interactionWarnings,
    });

  } catch (error) {
    console.error("❌ Error checking interactions:", error);
    res.status(500).json({ message: "Error checking medication interactions", error });
  }
});

// **📌 Emergency SOS API**
app.post("/api/send-sos", async (req, res) => {
  try {
    const { userEmail, emergencyContacts, message } = req.body;

    if (!userEmail || !emergencyContacts || emergencyContacts.length === 0 || !message) {
      return res.status(400).json({ message: "⚠️ Missing required fields" });
    }

    // **Save emergency alert in the database**
    const newAlert = new EmergencyAlert({ userEmail, emergencyContacts, message });
    await newAlert.save();

    console.log("🚨 Emergency SOS Alert Sent:", newAlert);

    // **Send email alert to emergency contacts**
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: emergencyContacts,
      subject: "🚨 Emergency SOS Alert!",
      text: `⚠️ Alert: ${userEmail} has triggered an emergency SOS. \n\nMessage: ${message}\n\nPlease check on them immediately.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Email sending error:", error);
        return res.status(500).json({ message: "❌ Failed to send SOS alert", error });
      }
      console.log("✅ SOS Email sent:", info.response);
      res.status(200).json({ message: "✅ SOS alert sent successfully", info });
    });

  } catch (error) {
    console.error("❌ SOS alert send succesfully:", error);
    res.status(500).json({ message: "SOS alert send succesfully", error });
  }
});

// **📌 List Available Routes**
console.log("📌 Available Routes:");
console.log(listEndpoints(app));

// **🚀 Start Server**
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
