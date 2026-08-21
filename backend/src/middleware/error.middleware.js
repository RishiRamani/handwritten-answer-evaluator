import { errorResponse } from "../utils/response.js";

export function notFoundHandler(req, res) {
  res.status(404).json(errorResponse("Route not found"));
}

export function errorHandler(err, req, res, next) {
  console.error("[error]", err.message);

  if (err.name === "MulterError" || /pdf/i.test(err.message)) {
    return res.status(400).json(errorResponse(err.message));
  }

  if (err.name === "ValidationError") {
    return res.status(400).json(errorResponse(err.message));
  }

  if (err.name === "CastError") {
    return res.status(400).json(errorResponse("Invalid ID format"));
  }

  res.status(err.status || 500).json(errorResponse(err.message || "Internal server error"));
}