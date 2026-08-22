import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Go to homepage">
      <span className="logoMark"><Sparkles size={17} /></span>
      <span>Eval<span>X</span></span>
    </Link>
  );
}