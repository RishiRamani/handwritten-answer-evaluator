import React from "react";

export default function Stat({ icon, label, value, sub }) {
  return (
    <div className="statCard">
      <div className="statIcon">{icon}</div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{sub}</span>
      </div>
    </div>
  );
}