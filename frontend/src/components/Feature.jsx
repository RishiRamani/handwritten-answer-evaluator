import React from "react";

export default function Feature({ icon, title, text }) {
  return (
    <div className="featureCard">
      <div className="featureIcon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}