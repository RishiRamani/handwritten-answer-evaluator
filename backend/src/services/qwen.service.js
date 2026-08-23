/**
 * QWEN SERVICE — placeholder with 5 second delay and random data.
 * 
 * Simulates Qwen evaluation with a 5-second delay and returns
 * mock evaluation results for each question.
 */
export async function evaluateAnswer({ question, answerKey, studentAnswer, maxMarks }) {
  // Simulate 5 second delay
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Generate realistic random scores
  const correctness = 0.5 + Math.random() * 0.5;
  const completeness = 0.4 + Math.random() * 0.6;
  const relevance = 0.5 + Math.random() * 0.5;
  
  const avg = (correctness + completeness + relevance) / 3;
  const score = Math.round((maxMarks * avg) / 10) * 10; // Round to nearest 10
  const confidence = Math.round(avg * 100);

  const feedbackOptions = [
    "Excellent response! The student has demonstrated thorough understanding.",
    "Good attempt with clear reasoning. Minor improvements could be made.",
    "The answer covers the main points but lacks some depth.",
    "Solid understanding shown, with room for more detailed explanation.",
    "The response is partially correct but misses key elements.",
    "Good conceptual grasp, but the explanation needs more clarity.",
    "The student shows good knowledge but could structure the answer better.",
    "Comprehensive and well-articulated response.",
    "The answer is on the right track but needs more development.",
    "Excellent work! The student has mastered this topic."
  ];

  const feedbackIndex = Math.floor(Math.random() * feedbackOptions.length);

  return {
    correctness: Math.round(correctness * 10) / 10,
    completeness: Math.round(completeness * 10) / 10,
    relevance: Math.round(relevance * 10) / 10,
    score: Math.min(score, maxMarks),
    confidence: Math.min(confidence, 100),
    feedback: feedbackOptions[feedbackIndex]
  };
}