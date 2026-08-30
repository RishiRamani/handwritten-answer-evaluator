import shutil
import tempfile
from pathlib import Path

import cv2
from fastapi import FastAPI, File, HTTPException, UploadFile

from app.ocr import run_ocr
from app.preprocessing.pipeline import preprocess_pdf
from app.trocr import recognize_line
from postprocessing.pipeline import process_submission


app = FastAPI(title="Handwritten Answer OCR Service")


def process_pdf(pdf_path, submission_id="SUB123"):
	"""Run preprocessing, detection, TrOCR recognition, and postprocessing."""

	with tempfile.TemporaryDirectory(prefix="ocr-service-") as output_dir:
		page_paths = preprocess_pdf(pdf_path, output_dir)
		ocr_results = [run_ocr(page_path) for page_path in page_paths]
		page_images = [cv2.imread(str(page_path)) for page_path in page_paths]

		if any(image is None for image in page_images):
			raise ValueError("Could not load a preprocessed page image")

		return process_submission(
			ocr_results,
			submission_id=submission_id,
			page_images=page_images,
		)


@app.get("/health")
def health_check():
	return {"status": "ok"}


@app.post("/api/ocr")
async def recognize_answer_sheet(file: UploadFile = File(...)):
	if file.content_type != "application/pdf":
		raise HTTPException(status_code=415, detail="Only PDF files are supported")

	suffix = Path(file.filename or "answer-sheet.pdf").suffix or ".pdf"
	temporary_path = None
	try:
		with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary_file:
			temporary_path = Path(temporary_file.name)
			shutil.copyfileobj(file.file, temporary_file)

		result = process_pdf(
			temporary_path,
			submission_id=Path(file.filename or "submission").stem,
		)
		return {
			"submissionId": result["submissionId"],
			"ocrConfidence": result["ocrConfidence"],
			"answers": result["answers"],
			"pages": result["pages"],
		}
	except Exception as error:
		raise HTTPException(status_code=500, detail=str(error)) from error
	finally:
		if temporary_path is not None:
			temporary_path.unlink(missing_ok=True)
