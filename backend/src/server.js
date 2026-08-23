import express from "express";
import cors from "cors";
import { env } from "./config/environment.js";
import { connectDatabase } from "./config/database.js";
import examRoutes from "./routes/exam.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import evaluationRoutes from "./routes/evaluation.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/exams", examRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/results", evaluationRoutes);
app.use("/api/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`[server] running on http://localhost:${env.port}`);
  });
}

start();