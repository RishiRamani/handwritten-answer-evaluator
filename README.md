# EvalX

EvalX is an automated examination evaluation platform for handwritten answer sheets. Teachers create examinations, upload student answer-sheet PDFs, and review AI-generated scores and feedback. Students can view their published results and performance statistics.

## Features

- Teacher examination creation with questions, reference answers, and marks
- PDF answer-sheet upload
- PDF page extraction and image preprocessing
- PaddleOCR text detection and recognition
- TrOCR handwritten line recognition
- OCR confidence measurement
- Qwen-based answer evaluation
- Correctness, completeness, relevance, marks, and feedback
- Teacher review, score overrides, publishing, retry, and deletion
- Student result portal with exam percentage graph
- Admin dashboard for teacher and student account management
- Role-based authentication and authorization

## Architecture

```text
Frontend (React + Vite)
        |
        | HTTP / JSON / multipart PDF
        v
Backend (Node.js + Express)
        |
        |-- MongoDB: exams, questions, submissions, answers, evaluations
        |-- OCR service: PDF preprocessing, PaddleOCR, TrOCR
        `-- Qwen service: semantic answer evaluation
```

### Services

| Service | Directory | Default URL | Purpose |
|---|---|---:|---|
| Frontend | `frontend/` | `http://localhost:5173` | React web application |
| Backend | `backend/` | `http://localhost:5000` | REST API and evaluation coordinator |
| OCR | `ocr-service/` | `http://localhost:8001` | PDF preprocessing and OCR |
| Qwen | `qwen-service/` | `http://localhost:8002` | AI answer evaluation |
| MongoDB | Local or remote | `mongodb://127.0.0.1:27017` | Persistent application data |

## Requirements

- Windows, macOS, or Linux
- Node.js 18 or newer
- npm
- Python 3.10 or newer
- MongoDB running locally or a reachable MongoDB instance
- Enough disk space for PaddleOCR, TrOCR, and Qwen model files
- Optional NVIDIA GPU and compatible CUDA/PyTorch installation

The first model run may download or initialize large model files. CPU inference can take considerably longer than GPU inference.

## Project Structure

```text
backend/
  src/
    config/          Database and environment configuration
    controllers/     HTTP request handlers
    middleware/      Upload and authentication middleware
    models/          Mongoose models
    routes/          Express routes
    services/        OCR, Qwen, exam, submission, and evaluation logic
    utils/           Response and scoring helpers

frontend/
  src/
    components/      Shared UI components
    pages/           Landing, login, admin, teacher, and student pages
    services/api.js  Backend API client

ocr-service/
  app/
    main.py          FastAPI entrypoint
    ocr.py           PaddleOCR setup
    trocr.py         TrOCR handwritten recognition
    preprocessing/   PDF extraction and image preprocessing
  postprocessing/    OCR normalization and question segmentation
  tests/             OCR and preprocessing tests

qwen-service/
  app/
    main.py          FastAPI entrypoint
    evaluator.py     Prompting, parsing, validation, and scoring
    model.py         Local Qwen model loading and generation
    schemas.py       Request and response schemas
  models/            Downloaded Qwen model files
  tests/             Evaluation tests
```

## Installation

### 1. Start MongoDB

Start MongoDB using the method appropriate for your installation. The default connection is:

```text
mongodb://127.0.0.1:27017/sih-evaluation
```

### 2. Configure the backend

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sih-evaluation
MAX_FILE_SIZE_MB=15
UPLOAD_DIR=uploads
OCR_SERVICE_URL=http://localhost:8001
OCR_TIMEOUT_MS=120000
QWEN_SERVICE_URL=http://localhost:8002
QWEN_TIMEOUT_MS=120000
AUTH_SECRET=replace-with-a-long-random-secret
TEACHER_ID=TCH001
TEACHER_PASSWORD=demo123
```

Use a long random value for `AUTH_SECRET` outside local development.

### 3. Install backend dependencies

```powershell
cd backend
npm install
```

### 4. Configure the frontend

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies:

```powershell
cd frontend
npm install
```

### 5. Set up the OCR service

```powershell
cd ocr-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks activation, run the service with the virtual-environment executable directly:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 6. Set up the Qwen service

```powershell
cd qwen-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

The Qwen service requires the model files under `qwen-service/models/`. If the model is not present, configure or download the model according to `qwen-service/app/model.py`.

## Running the Application

Run each service in a separate terminal.

### OCR service

```powershell
cd ocr-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Health check:

```text
http://localhost:8001/health
```

### Qwen service

```powershell
cd qwen-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

Health check:

```text
http://localhost:8002/health
```

### Backend

```powershell
cd backend
npm start
```

Health check:

```text
http://localhost:5000/api/health
```

For development with automatic restart:

```powershell
npm run dev
```

### Frontend

```powershell
cd frontend
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173
```

## Demo Credentials

The default local teacher login is:

```text
Teacher ID: TCH001
Password: demo123
```

The admin login uses an admin record stored in MongoDB. The seed script or existing database setup must create the admin account. The default demo credentials used by the frontend are:

```text
Username: admin
Password: admin123
```

Students log in with a registered roll number. Student accounts can be created from the admin portal.

## Main Workflow

1. Log in as an admin and create teacher and student accounts.
2. Log in as a teacher.
3. Open **Examinations** and create an examination.
4. Add at least one question, reference answer, and positive maximum mark.
5. Open **Upload Paper** and select the examination and student.
6. Upload a PDF answer sheet.
7. The backend sends the PDF to the OCR service.
8. OCR preprocesses pages, detects text regions, measures PaddleOCR confidence, and uses TrOCR for handwritten text.
9. The backend sends each extracted answer to the Qwen service.
10. Qwen evaluates correctness, completeness, relevance, marks, and feedback.
11. The teacher reviews the result and optionally edits marks.
12. The teacher publishes the result.
13. The student logs in and views the published result and exam performance graph.

## API Overview

All backend API routes are prefixed with `/api`.

### Authentication

```http
POST /api/auth/login
```

Teacher request:

```json
{
  "role": "teacher",
  "teacherId": "TCH001",
  "password": "demo123"
}
```

Student request:

```json
{
  "role": "student",
  "roll": "2024CSE1021"
}
```

Admin login:

```http
POST /api/admin/login
```

Authenticated requests use:

```http
Authorization: Bearer <token>
```

### Exams

```http
GET    /api/exams
GET    /api/exams/:id
POST   /api/exams
DELETE /api/exams/:id
```

Create-exam request:

```json
{
  "title": "Data Structures Mid-Term",
  "subject": "Data Structures",
  "questions": [
    {
      "questionText": "Explain binary search.",
      "answerKey": "Binary search repeatedly divides a sorted search interval in half.",
      "maxMarks": 10
    }
  ]
}
```

### Submissions

```http
POST   /api/submissions
GET    /api/submissions
GET    /api/submissions/:id
POST   /api/submissions/:id/retry
DELETE /api/submissions/:id
PATCH  /api/submissions/:id/publish
PATCH  /api/submissions/:submissionId/score
```

Upload a submission as multipart form data with:

```text
examId
studentRoll
file
```

Retry is available for failed or completed submissions. It clears previous answer/evaluation records and reruns OCR and AI evaluation.

### Results

```http
GET /api/results/:submissionId
GET /api/results/student/:roll
```

Student result access is restricted to the authenticated student’s own roll number.

### OCR service

```http
GET  /health
POST /api/ocr
```

The OCR response includes answer-level and submission-level OCR confidence:

```json
{
  "submissionId": "answer-sheet",
  "ocrConfidence": 82,
  "answers": [
    {
      "questionNumber": 1,
      "questionText": "Q1 Explain binary search",
      "answerText": "...",
      "ocrConfidence": 82,
      "lineRange": { "start": 0, "end": 4 },
      "page": 1
    }
  ]
}
```

OCR confidence is derived from PaddleOCR recognition scores. It is separate from Qwen’s semantic evaluation and marks.

### Qwen service

```http
GET  /health
POST /evaluate
POST /api/evaluate
```

Qwen request:

```json
{
  "question": "Explain binary search.",
  "answer_key": "Binary search repeatedly divides a sorted search interval in half.",
  "student_answer": "Binary search divides the sorted list into halves.",
  "max_marks": 10
}
```

Qwen response:

```json
{
  "correctness": 0.9,
  "completeness": 0.8,
  "relevance": 1.0,
  "score": 8.75,
  "feedback": "The answer is correct but could explain the process in more detail."
}
```

## Authorization Rules

- Unauthenticated users cannot access portals or protected API routes.
- Teachers can create exams, upload submissions, review scores, publish results, retry submissions, and delete exams/submissions.
- Admins can manage teacher/student accounts and read dashboard exam/submission statistics.
- Students can view only their own published results.
- Exam deletion cascades to its questions, submissions, answers, evaluations, and uploaded files.

## Testing and Validation

### Frontend build

```powershell
cd frontend
npm run build
```

### Backend syntax checks

```powershell
cd backend
node --check src/server.js
node --check src/services/ocr.service.js
node --check src/services/qwen.service.js
```

### OCR tests

From `ocr-service`:

```powershell
python -m pytest tests
```

Some files under `tests/` are executable scripts rather than pytest test modules. They can also be run directly when appropriate:

```powershell
python -m tests.test_pipeline
python -m tests.test_ocr
```

### Qwen tests

From `qwen-service`:

```powershell
python -m pytest tests
```

## Security Notes

- Change demo credentials before deployment.
- Use a strong random `AUTH_SECRET`.
- Do not commit `.env` files or credentials.
- Store passwords hashed before using this system outside a demo environment. The current local account implementation stores passwords directly for simplicity.
- Restrict CORS to the deployed frontend origin.
- Add request rate limiting and file scanning before exposing upload endpoints publicly.

## Current Limitations

- Student login is roll-based rather than password-based.
- Teacher credentials are configured through environment variables unless managed by the admin account flow.
- OCR question segmentation depends on recognizable question markers such as `Q1`, `1.`, or `Question 1`.
- TrOCR model inference can be slow on CPU.
- Background evaluation currently runs inside the backend process rather than a separate job queue.
- The frontend build may print a Vite dynamic-import chunk warning for the shared API module; it does not prevent the build from succeeding.

## License

This project is intended for hackathon and educational use. Add the appropriate project license before distributing it publicly.
