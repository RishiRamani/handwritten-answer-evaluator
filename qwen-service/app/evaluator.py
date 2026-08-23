import json
import time

from .model import generate_response
from .schemas import EvaluationRequest, EvaluationResult


# ---------------------------------------------------------
# Evaluation prompt
# ---------------------------------------------------------
# Qwen only evaluates the three semantic dimensions:
#
#   Correctness
#   Completeness
#   Relevance
#
# It does NOT calculate the final marks.
#
# The final score is calculated deterministically by Python.
# ---------------------------------------------------------

EVALUATION_PROMPT = """
You are a strict but fair academic examiner.

Evaluate the student's answer using the question and reference
answer.

GRADING:

- Correctness: Are the claims made by the student factually true?
- Completeness: How much of the important information required
  by the question is included?
- Relevance: Does the answer actually address the question?

Important:

- If the answer contains a major factual error about the central
  concept, correctness should be 0.0–0.2, even if some other
  statements are correct.
- If the answer has spelling mistakes or errors that can be otherwise justified with correct spelling,
    correctness should be high since OCR is not perfect.
- If the answer is factually correct but missing important
  information, keep correctness high and reduce completeness.
- Correct but incomplete answers receive partial credit, not zero.
- A single correct fact should receive limited credit when the
  question requires multiple important facts.
- Completely irrelevant answers should receive zero or near zero.
- Correct answers with different wording or synonyms must receive
  credit.
- Do not require every minor detail from the reference answer.
- Do not award credit merely because keywords are present.
- Do not invent information that the student did not state.

Return ONLY valid JSON:

{{
  "correctness": <number between 0 and 1>,
  "completeness": <number between 0 and 1>,
  "relevance": <number between 0 and 1>,
  "feedback": "<short explanation>"
}}

Do not include a score field.
Do not use Markdown or include any text outside the JSON.

QUESTION:
{question}

REFERENCE ANSWER:
{answer_key}

STUDENT ANSWER:
{student_answer}
"""

def build_prompt(request: EvaluationRequest) -> str:
    """
    Fill the evaluation prompt with the actual question,
    reference answer and student's answer.
    """

    return EVALUATION_PROMPT.format(
        question=request.question,
        answer_key=request.answer_key,
        student_answer=request.student_answer
    )


def extract_json(response: str) -> dict:
    """
    Convert Qwen's textual response into a Python dictionary.

    Ideally Qwen returns pure JSON. However, we also handle
    accidental surrounding text.
    """

    response = response.strip()

    # -----------------------------------------------------
    # First attempt:
    # Parse the entire response as JSON.
    # -----------------------------------------------------

    try:
        return json.loads(response)

    except json.JSONDecodeError:
        pass

    # -----------------------------------------------------
    # Fallback:
    # Find the first '{' and last '}'.
    # -----------------------------------------------------

    start = response.find("{")
    end = response.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise ValueError("Qwen did not return valid JSON.")

    json_text = response[start:end + 1]

    try:
        return json.loads(json_text)

    except json.JSONDecodeError as error:
        raise ValueError(
            "Qwen returned malformed JSON."
        ) from error


def calculate_score(
    correctness: float,
    completeness: float,
    relevance: float,
    max_marks: float
) -> float:
    """
    Convert Qwen's semantic evaluation into marks.

    Qwen evaluates the answer.
    Python performs the actual scoring.

    The three dimensions are weighted:

        Correctness   = 50%
        Completeness  = 30%
        Relevance     = 20%

    Correctness receives the highest weight because factual
    accuracy is the most important property of an academic answer.
    """

    score_ratio = (
        0.50 * correctness
        + 0.35 * completeness
        + 0.15 * relevance
    )

    score = score_ratio * max_marks

    # -----------------------------------------------------
    # Round to the nearest 0.25 mark.
    #
    # This keeps the grading output clean while still allowing
    # partial marks.
    # -----------------------------------------------------

    score = round(score * 4) / 4

    # -----------------------------------------------------
    # Safety bounds.
    # -----------------------------------------------------

    score = max(0.0, min(score, max_marks))

    return score


def validate_result(
    data: dict,
    max_marks: float
) -> EvaluationResult:
    """
    Validate Qwen's output and calculate the final score.
    """

    # -----------------------------------------------------
    # Qwen should only return:
    #
    # correctness
    # completeness
    # relevance
    # feedback
    #
    # There should be NO score from Qwen.
    # -----------------------------------------------------

    required_fields = {
        "correctness",
        "completeness",
        "relevance",
        "feedback"
    }

    missing_fields = required_fields - data.keys()

    if missing_fields:
        raise ValueError(
            f"Qwen response is missing fields: {missing_fields}"
        )

    # -----------------------------------------------------
    # Validate semantic evaluation.
    # -----------------------------------------------------

    correctness = float(data["correctness"])
    completeness = float(data["completeness"])
    relevance = float(data["relevance"])

    # -----------------------------------------------------
    # Make sure Qwen's values are valid.
    # -----------------------------------------------------

    for name, value in [
        ("correctness", correctness),
        ("completeness", completeness),
        ("relevance", relevance)
    ]:
        if not 0 <= value <= 1:
            raise ValueError(
                f"{name} must be between 0 and 1, "
                f"got {value}"
            )

    # -----------------------------------------------------
    # Calculate the actual marks ourselves.
    # -----------------------------------------------------

    score = calculate_score(
        correctness=correctness,
        completeness=completeness,
        relevance=relevance,
        max_marks=max_marks
    )

    # -----------------------------------------------------
    # Build the final validated result.
    # -----------------------------------------------------

    return EvaluationResult(
        correctness=correctness,
        completeness=completeness,
        relevance=relevance,
        score=score,
        feedback=str(data["feedback"])
    )


def evaluate_answer(
    request: EvaluationRequest
) -> EvaluationResult:
    """
    Complete evaluation pipeline:

        Input
          ↓
        Prompt
          ↓
        Qwen
          ↓
        JSON extraction
          ↓
        Semantic validation
          ↓
        Python score calculation
          ↓
        EvaluationResult
    """

    # Build the final prompt.
    prompt = build_prompt(request)

    # -----------------------------------------------------
    # Measure Qwen inference time.
    # -----------------------------------------------------

    start_time = time.perf_counter()

    raw_response = generate_response(
        prompt,
        max_new_tokens=128
    )

    elapsed_time = time.perf_counter() - start_time

    print(
        f"\nQwen generation time: {elapsed_time:.2f} seconds"
    )

    # -----------------------------------------------------
    # Convert Qwen's response into Python data.
    # -----------------------------------------------------

    parsed_response = extract_json(raw_response)

    # -----------------------------------------------------
    # Validate Qwen's evaluation and calculate the score.
    # -----------------------------------------------------

    result = validate_result(
        parsed_response,
        request.max_marks
    )

    return result