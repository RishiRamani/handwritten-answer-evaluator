import axios from "axios";
import { env } from "../config/environment.js";

/**
 * Calls Rishi's Qwen evaluation microservice.
 *
 * Contract assumption (adjust to match qwen-service/app/schemas.py):
 *   POST {QWEN_SERVICE_URL}/api/evaluate
 *   body: { question, answer_key, student_answer, max_marks }
 *   -> { correctness, completeness, relevance, score, confidence, feedback }
 */
export async function evaluateAnswer({ question, answerKey, studentAnswer, maxMarks }) {
  let response;
  try {
    response = await axios.post(`${env.qwenServiceUrl}/api/evaluate`, {
      question,
      answer_key: answerKey,
      student_answer: studentAnswer,
      max_marks: maxMarks
    });
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    throw new Error(`Qwen service failed: ${detail}`);
  }

  const data = response.data;

  if (
    data == null ||
    typeof data.correctness !== "number" ||
    typeof data.completeness !== "number" ||
    typeof data.relevance !== "number" ||
    typeof data.score !== "number"
  ) {
    throw new Error("Qwen service returned an unexpected response shape");
  }

  return {
    correctness: data.correctness,
    completeness: data.completeness,
    relevance: data.relevance,
    score: data.score,
    confidence: data.confidence ?? Math.round(
      ((data.correctness + data.completeness + data.relevance) / 3) * 100
    ),
    feedback: data.feedback || "No feedback provided."
  };
}