import React, { useState, useEffect } from "react";

function Dashboard() {
  const [adherenceData, setAdherenceData] = useState([]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("adherenceData")) || [];
    setAdherenceData(storedData);
  }, []);

  const adherencePercentage = () => {
    if (adherenceData.length === 0) return "N/A";
    const takenCount = adherenceData.filter((entry) => entry.taken).length;
    return ((takenCount / adherenceData.length) * 100).toFixed(2) + "%";
  };

  return (
    <div className="dashboard-container">
      <h2>Medicine Adherence Report</h2>
      <p>Adherence Rate: {adherencePercentage()}</p>
      
      <table>
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Date</th>
            <th>Time</th>
            <th>Taken</th>
          </tr>
        </thead>
        <tbody>
          {adherenceData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.medicine}</td>
              <td>{entry.date}</td>
              <td>{entry.time}</td>
              <td>{entry.taken ? "✅ Yes" : "❌ No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
