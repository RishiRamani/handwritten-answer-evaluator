from fastapi import FastAPI, HTTPException

from .evaluator import evaluate_answer
from .schemas import EvaluationRequest, EvaluationResult


app = FastAPI(
    title="Qwen Academic Grading Service",
    description="Local Qwen-based academic answer evaluation service",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    """
    Simple endpoint used to check whether the service is alive.
    """
    return {
        "status": "ok",
        "service": "qwen-grading"
    }


@app.post("/evaluate", response_model=EvaluationResult)
def evaluate(request: EvaluationRequest):
    """
    Evaluate one student's answer.
    """

    try:
        result = evaluate_answer(request)

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )