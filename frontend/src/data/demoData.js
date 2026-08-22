export const MAX_FILE_SIZE = 15 * 1024 * 1024;

export const demoPapers = [
  {
    id: 1, roll: "2024CSE1021", name: "Aarav Sharma",
    exam: "Data Structures Mid-Term", file: "aarav-answer-sheet.pdf",
    size: "8.4 MB", status: "Evaluated", score: 86, confidence: 94
  },
  {
    id: 2, roll: "2024CSE1044", name: "Riya Verma",
    exam: "Data Structures Mid-Term", file: "riya-answer-sheet.pdf",
    size: "11.2 MB", status: "Evaluated", score: 91, confidence: 96
  },
  {
    id: 3, roll: "2024CSE1078", name: "Kabir Singh",
    exam: "Data Structures Mid-Term", file: "kabir-answer-sheet.pdf",
    size: "6.8 MB", status: "Pending", score: null, confidence: null
  }
];

export const demoResults = {
  "2024CSE1021": {
    name: "Aarav Sharma",
    exam: "Data Structures Mid-Term",
    score: 86,
    confidence: 94,
    questions: [
      { no: "Q1", title: "Binary Search", marks: 9, total: 10, confidence: 96, feedback: "Correct concept and complexity. Good explanation." },
      { no: "Q2", title: "Stack Applications", marks: 8, total: 10, confidence: 92, feedback: "Good explanation; one relevant example was missing." },
      { no: "Q3", title: "Linked List", marks: 9, total: 10, confidence: 95, feedback: "Accurate answer with appropriate terminology." },
      { no: "Q4", title: "Trees", marks: 8, total: 10, confidence: 89, feedback: "Correct definition; traversal explanation can be improved." },
      { no: "Q5", title: "Graph Traversal", marks: 7, total: 10, confidence: 76, feedback: "The concept is correct but the answer needs more detail." }
    ]
  },
  "2024CSE1044": {
    name: "Riya Verma",
    exam: "Data Structures Mid-Term",
    score: 91,
    confidence: 96,
    questions: [
      { no: "Q1", title: "Binary Search", marks: 10, total: 10, confidence: 98, feedback: "Excellent answer." },
      { no: "Q2", title: "Stack Applications", marks: 9, total: 10, confidence: 97, feedback: "Strong explanation with examples." },
      { no: "Q3", title: "Linked List", marks: 9, total: 10, confidence: 95, feedback: "Accurate and complete." },
      { no: "Q4", title: "Trees", marks: 8, total: 10, confidence: 91, feedback: "Good answer with minor omissions." },
      { no: "Q5", title: "Graph Traversal", marks: 9, total: 10, confidence: 94, feedback: "Clear comparison of BFS and DFS." }
    ]
  }
};