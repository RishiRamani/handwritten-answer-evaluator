/**
 * OCR SERVICE — placeholder implementation.
 *
 * Shubh (preprocessing + PaddleOCR) and Rachit (question-wise
 * segmentation) will replace processAnswerSheet() with the real pipeline.
 * Everything downstream (submission.service.js) only cares about the
 * contract below, not the implementation.
 *
 * Contract:
 *   input:  filePath (uploaded PDF/image), questions (array of Question docs)
 *   output: { "<questionId>": "<extracted student answer text>", ... }
 */
export async function processAnswerSheet(filePath, questions) {
  // TODO: replace with real PaddleOCR + preprocessing + segmentation pipeline
  const mockAnswers = {};

  questions.forEach(q => {
    mockAnswers[q._id.toString()] =
      `[MOCK OCR TEXT for question: ${q.questionText.slice(0, 40)}...]`;
  });

  return mockAnswers;
}