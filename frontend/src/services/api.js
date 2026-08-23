const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("auth") || "null");
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("auth");
}

async function handleResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Request failed");
  return body.data;
}

async function request(url, options = {}) {
  const auth = getAuth();
  const headers = new Headers(options.headers || {});
  if (auth?.token) headers.set("Authorization", `Bearer ${auth.token}`);
  return fetch(url, { ...options, headers });
}

export async function loginTeacher(teacherId, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "teacher", teacherId, password }) });
  const data = await handleResponse(res);
  localStorage.setItem("auth", JSON.stringify(data));
  return data;
}

export async function loginStudent(roll) {
  const res = await fetch(`${BASE_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "student", roll }) });
  const data = await handleResponse(res);
  localStorage.setItem("auth", JSON.stringify(data));
  return data;
}

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

export async function uploadSubmission({ examId, studentRoll, studentName, file }) {
  const formData = new FormData();
  formData.append("examId", examId);
  formData.append("studentRoll", studentRoll);
  formData.append("studentName", studentName);
  formData.append("file", file);

  const res = await request(`${BASE_URL}/submissions`, { method: "POST", body: formData });
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

export async function getResult(submissionId) {
  const res = await request(`${BASE_URL}/results/${submissionId}`);
  return handleResponse(res);
}

export async function getStudentResult(roll) {
  const res = await request(`${BASE_URL}/results/student/${roll}`);
  return handleResponse(res);
}

// Maps backend submission shape -> the shape your UI components expect
export function normalizeSubmission(s) {
  return {
    id: s._id,
    submissionId: s._id,
    roll: s.studentRoll,
    name: s.studentName,
    exam: s.examId?.title || "",
    file: s.fileName,
    size: (s.fileSize / 1024 / 1024).toFixed(2) + " MB",
    status: s.status === "COMPLETED" ? "Evaluated" : s.status === "FAILED" ? "Failed" : "Pending",
    score: null,
    confidence: null
  };
}

// Maps backend result shape -> the shape TeacherEvaluation/StudentResultDetail expect
export function normalizeResult(r) {
  return {
    name: r.studentName,
    exam: r.exam,
    score: r.totalScore,
    totalMarks: r.totalMarks,
    confidence: r.confidence,
    published: r.published,
    questions: r.questions.map((q, i) => ({
      no: `Q${i + 1}`,
      title: q.question,
      marks: q.score,
      total: q.maxMarks,
      confidence: q.confidence,
      feedback: q.feedback
    }))
  };
}