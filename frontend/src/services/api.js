const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function logout() {
  localStorage.removeItem("auth");
  sessionStorage.clear();
  // Clear any other stored data
  localStorage.removeItem("teacherAuth");
  localStorage.removeItem("studentAuth");
  localStorage.removeItem("adminAuth");
}

export function getAuth() {
  try {
    const auth = localStorage.getItem("auth");
    if (!auth || auth === "null" || auth === "undefined") {
      return null;
    }
    const parsed = JSON.parse(auth);
    // Validate that the token and user exist
    if (!parsed?.token || !parsed?.user) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function handleResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Request failed");
  return body.data;
}

async function request(url, options = {}) {
  const auth = getAuth();
  const headers = new Headers(options.headers || {});
  
  // Only add Authorization header if we have a valid token
  if (auth?.token) {
    headers.set("Authorization", `Bearer ${auth.token}`);
  }
  
  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  return fetch(url, { ...options, headers });
}
export async function loginTeacher(teacherId, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "teacher", teacherId, password })
  });
  const data = await handleResponse(res);
  // Store auth with proper role
  localStorage.setItem("auth", JSON.stringify(data));
  return data;
}

export async function loginStudent(roll) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "student", roll })
  });
  const data = await handleResponse(res);
  localStorage.setItem("auth", JSON.stringify(data));
  return data;
}

// ===== ADMIN =====
export async function adminLogin(username, password) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await handleResponse(res);
  // Store auth with admin role
  localStorage.setItem("auth", JSON.stringify(data));
  // Also store separately for safety
  localStorage.setItem("adminAuth", JSON.stringify(data));
  return data;
}
// ===== EXAMS =====
export async function createExam(examData) {
  const res = await request(`${BASE_URL}/exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(examData)
  });
  return handleResponse(res);
}

export async function listExams() {
  const res = await request(`${BASE_URL}/exams`);
  return handleResponse(res);
}

export async function getExam(id) {
  const res = await request(`${BASE_URL}/exams/${id}`);
  return handleResponse(res);
}

export async function deleteExam(id) {
  const res = await request(`${BASE_URL}/exams/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

// ===== SUBMISSIONS =====
export async function uploadSubmission({ examId, studentRoll, file }) {
  const formData = new FormData();
  formData.append("examId", examId);
  formData.append("studentRoll", studentRoll);
  formData.append("file", file);

  const res = await request(`${BASE_URL}/submissions`, {
    method: "POST",
    body: formData
  });
  return handleResponse(res);
}

export async function listSubmissions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await request(`${BASE_URL}/submissions${query ? `?${query}` : ""}`);
  return handleResponse(res);
}

export async function getSubmission(id) {
  const res = await request(`${BASE_URL}/submissions/${id}`);
  return handleResponse(res);
}

export async function publishSubmission(id) {
  const res = await request(`${BASE_URL}/submissions/${id}/publish`, { method: "PATCH" });
  return handleResponse(res);
}

export async function updateScore(submissionId, questionIndex, score) {
  const res = await request(`${BASE_URL}/submissions/${submissionId}/score`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionIndex, score })
  });
  return handleResponse(res);
}

// ===== RESULTS =====
export async function getResult(submissionId) {
  const res = await request(`${BASE_URL}/results/${submissionId}`);
  return handleResponse(res);
}

export async function getStudentResult(roll) {
  const res = await request(`${BASE_URL}/results/student/${roll}`);
  return handleResponse(res);
}

export async function getStudentResultBySubmission(roll, submissionId) {
  const res = await request(`${BASE_URL}/results/student/${roll}/submission/${submissionId}`);
  return handleResponse(res);
}

export async function getAllStudentResults(roll) {
  const res = await request(`${BASE_URL}/results/student/${roll}/all`);
  return handleResponse(res);
}


export async function adminCreateTeacher(data) {
  const res = await request(`${BASE_URL}/admin/teachers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function adminCreateStudent(data) {
  const res = await request(`${BASE_URL}/admin/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function adminGetTeachers() {
  const res = await request(`${BASE_URL}/admin/teachers`);
  return handleResponse(res);
}

export async function adminGetStudents() {
  const res = await request(`${BASE_URL}/admin/students`);
  return handleResponse(res);
}

export async function adminDeleteTeacher(teacherId) {
  const res = await request(`${BASE_URL}/admin/teachers/${teacherId}`, {
    method: "DELETE"
  });
  return handleResponse(res);
}

export async function adminDeleteStudent(roll) {
  const res = await request(`${BASE_URL}/admin/students/${roll}`, {
    method: "DELETE"
  });
  return handleResponse(res);
}


export async function updateTeacherProfile(data) {
  const res = await request(`${BASE_URL}/auth/teacher/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const responseData = await handleResponse(res);
  // Update stored auth with new data
  if (responseData.token && responseData.user) {
    const auth = getAuth();
    localStorage.setItem("auth", JSON.stringify({
      token: responseData.token,
      user: responseData.user
    }));
  }
  return responseData;
}

// ===== HELPERS =====
export function normalizeSubmission(s) {
  const statusMap = {
    "UPLOADED": "Uploaded",
    "OCR_PROCESSING": "OCR Processing",
    "OCR_COMPLETED": "OCR Done",
    "AI_EVALUATION": "AI Evaluating",
    "COMPLETED": "Evaluated",
    "FAILED": "Failed"
  };
  
  return {
    id: s._id,
    submissionId: s._id,
    roll: s.studentRoll,
    name: s.studentName || `Student ${s.studentRoll}`,
    exam: s.examId?.title || "",
    file: s.fileName,
    size: (s.fileSize / 1024 / 1024).toFixed(2) + " MB",
    status: statusMap[s.status] || s.status,
    score: null,
    confidence: null,
    published: s.published || false,
    rawStatus: s.status,
    createdAt: s.createdAt
  };
}

export function normalizeResult(r) {
  return {
    submissionId: r.submissionId || r._id,
    studentRoll: r.studentRoll,
    name: r.studentName || r.name,
    exam: r.exam || r.examId?.title || "Unknown Exam",
    score: r.totalScore || 0,
    totalMarks: r.totalMarks || 0,
    confidence: r.confidence || 0,
    published: r.published || false,
    status: r.status || "COMPLETED",
    teacherReviewed: r.teacherReviewed || false,
    questions: (r.questions || []).map((q, i) => ({
      no: `Q${i + 1}`,
      title: q.question || q.questionText || `Question ${i + 1}`,
      marks: q.score || 0,
      total: q.maxMarks || 0,
      originalScore: q.originalScore,
      manuallyEdited: q.manuallyEdited || false,
      confidence: q.confidence || 0,
      feedback: q.feedback || "No feedback provided.",
      studentAnswer: q.studentAnswer || "",
      correctness: q.correctness,
      completeness: q.completeness,
      relevance: q.relevance
    }))
  };
}

export async function retrySubmission(id) {
  const res = await request(`${BASE_URL}/submissions/${id}/retry`, { method: "POST" });
  return handleResponse(res);
}

export async function deleteSubmission(id) {
  const res = await request(`${BASE_URL}/submissions/${id}`, { method: "DELETE" });
  return handleResponse(res);
}