import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { env } from "../config/environment.js";

/**
 * Calls Shubh/Rachit's OCR microservice.
 *
 * Contract assumption (adjust to match ocr-service/app/main.py):
 *   POST {OCR_SERVICE_URL}/api/ocr   (multipart, field "file")
 *   -> { "answers": ["text for Q1", "text for Q2", ...] }
 *
 * The OCR service doesn't know our DB questionIds, so it returns answers
 * in question order (Q1, Q2, Q3...). We map them positionally onto
 * exam.questions, which is stored/populated in the same order they were
 * created. If your exam's question order in the DB can ever diverge from
 * the paper's Q1/Q2/Q3 order, switch this to a label-based match instead.
 */
export async function processAnswerSheet(filePath, questions) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  let response;
  try {
    response = await axios.post(`${env.ocrServiceUrl}/api/ocr`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    throw new Error(`OCR service failed: ${detail}`);
  }

  const answersArray = response.data?.answers;

  if (!Array.isArray(answersArray)) {
    throw new Error("OCR service returned an unexpected response shape");
  }

  const result = {};
  questions.forEach((q, index) => {
    result[q._id.toString()] = answersArray[index] || "";
  });

  return result;
}