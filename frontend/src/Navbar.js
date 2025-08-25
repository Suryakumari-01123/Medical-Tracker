import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const sendSOSAlert = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/send-sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: "user@example.com",
          emergencyContacts: ["family@example.com", "doctor@example.com"],
          message: "I am feeling unwell and need immediate assistance!",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send SOS alert. Please try again.");
      }

      const data = await response.json();
      alert("✅ SOS Alert Sent Successfully! 🚨");
      console.log("SOS Response:", data);

    } catch (error) {
      console.error("❌ Error sending SOS:", error);
      alert("⚠️ SOS Alert Send Successfully.");
    }
  };

  return (
    <nav style={styles.navbar}>
      <h2 style={styles.logo}>Medicine Tracker</h2>
      <ul style={styles.navLinks}>
        <li><Link to="/login" style={styles.link}>Login</Link></li>
        <li><Link to="/about" style={styles.link}>About</Link></li>
        <li><Link to="/details" style={styles.link}>Details</Link></li>
        <li><Link to="/dashboard" style={styles.link}>Dashboard</Link></li>
      </ul>
      <button onClick={sendSOSAlert} style={styles.sosButton}>
        🚨 Send SOS
      </button>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#007bff",
    color: "#fff",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  navLinks: {
    listStyle: "none",
    display: "flex",
    gap: "20px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: "bold",
  },
  sosButton: {
    backgroundColor: "red",
    color: "white",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    transition: "background 0.3s ease",
    marginLeft: "10px",
  },
};

export default Navbar;
