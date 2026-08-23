import axios from "axios";
import { env } from "../config/environment.js";

export async function evaluateAnswer({ question, answerKey, studentAnswer, maxMarks }) {
  let response;

  try {
    response = await axios.post(`${env.qwenServiceUrl}/api/evaluate`, {
      question,
      answer_key: answerKey,
      student_answer: studentAnswer,
      max_marks: maxMarks
    }, { timeout: env.qwenTimeoutMs });
  } catch (error) {
    const detail = error.response?.data?.detail || error.message;
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