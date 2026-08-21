export function calculateTotals(items) {
  // items: [{ score, maxMarks, confidence }]
  let totalScore = 0;
  let totalMarks = 0;
  let confidenceSum = 0;

  items.forEach(item => {
    totalScore += item.score;
    totalMarks += item.maxMarks;
    confidenceSum += item.confidence;
  });

  const avgConfidence = items.length
    ? Math.round(confidenceSum / items.length)
    : 0;

  return { totalScore, totalMarks, avgConfidence };
}