from pydantic import BaseModel, Field


class EvaluationRequest(BaseModel):
    question: str
    answer_key: str
    student_answer: str
    max_marks: float = Field(gt=0)


class EvaluationResult(BaseModel):
    correctness: float = Field(ge=0, le=1)
    completeness: float = Field(ge=0, le=1)
    relevance: float = Field(ge=0, le=1)
    score: float = Field(ge=0)
    feedback: str