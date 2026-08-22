import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function QuickAction({ to, icon, title, sub }) {
  return (
    <Link className="quickAction" to={to}>
      {icon}
      <div><strong>{title}</strong><small>{sub}</small></div>
      <ChevronRight />
    </Link>
  );
}