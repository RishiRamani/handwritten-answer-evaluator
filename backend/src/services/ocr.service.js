/**
 * OCR SERVICE — placeholder with 5 second delay and random data.
 * 
 * Simulates OCR processing with a 5-second delay and returns
 * mock extracted text for each question.
 */
export async function processAnswerSheet(filePath, questions) {
  // Simulate 5 second delay
  await new Promise(resolve => setTimeout(resolve, 5000));

  const mockAnswers = {};
  const mockTexts = [
    "The answer to this question is clearly stated in the textbook.",
    "This response demonstrates good understanding of the concept.",
    "The student has provided a comprehensive explanation with examples.",
    "The answer is correct and well-articulated.",
    "This shows partial understanding of the topic.",
    "The response is detailed and covers all key points.",
    "The student needs to focus on core concepts.",
    "Good attempt with minor errors in the explanation."
  ];

  questions.forEach((q, index) => {
    const textIndex = index % mockTexts.length;
    mockAnswers[q._id.toString()] = 
      `[OCR EXTRACTED TEXT] ${mockTexts[textIndex]} (Question: ${q.questionText.slice(0, 30)}...)`;
  });

  return mockAnswers;
}