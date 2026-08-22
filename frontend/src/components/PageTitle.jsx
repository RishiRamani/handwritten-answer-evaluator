import React from "react";

export default function PageTitle({ eyebrow, title, desc, action }) {
  return (
    <div className="pageTitle">
      <div>
        <span className="eyebrow small">{eyebrow}</span>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {action}
    </div>
  );
}