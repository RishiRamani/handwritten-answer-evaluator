import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { env } from "../config/environment.js";

export async function processAnswerSheet(filePath, questions) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  let response;
  try {
    response = await axios.post(`${env.ocrServiceUrl}/api/ocr`, form, {
      headers: form.getHeaders(),
      timeout: env.ocrTimeoutMs,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
  } catch (error) {
    const detail = error.response?.data?.detail || error.message;
    throw new Error(`OCR service failed: ${detail}`);
  }

  if (!Array.isArray(response.data?.answers)) {
    throw new Error("OCR service returned an unexpected response shape");
  }

  const result = {};
  const fallbackConfidence = Number(response.data.ocrConfidence);
  const usedQuestionIds = new Set();
  const usableFallback = Number.isFinite(fallbackConfidence) ? fallbackConfidence : 0;
  response.data.answers.forEach((answer, index) => {
    const questionNumber = Number(answer?.questionNumber);
    const numberedQuestion = Number.isInteger(questionNumber) && questionNumber > 0
      ? questions[questionNumber - 1]
      : null;
    const question = numberedQuestion && !usedQuestionIds.has(numberedQuestion._id.toString())
      ? numberedQuestion
      : questions.find(candidate => !usedQuestionIds.has(candidate._id.toString()));
    if (question) {
      const text = typeof answer === "string" ? answer : (answer?.answerText || answer?.text);
      const confidence = typeof answer === "object" && answer !== null
        ? Number(answer.ocrConfidence ?? answer.confidence)
        : null;
      result[question._id.toString()] = {
        text: text || "",
        ocrConfidence: Number.isFinite(confidence) ? confidence : usableFallback
      };
      usedQuestionIds.add(question._id.toString());
    }
  });

  questions.forEach(question => {
    const key = question._id.toString();
    if (!result[key]) result[key] = { text: "", ocrConfidence: usableFallback };
  });

  return result;
}