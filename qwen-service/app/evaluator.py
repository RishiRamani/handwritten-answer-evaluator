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
You are a strict but fair academic examiner evaluating answers that
may have been extracted using OCR.

Your PRIMARY grading standard is the REFERENCE ANSWER.

====================================
OCR AND SPELLING RULES
====================================

The STUDENT ANSWER may contain OCR errors, spelling mistakes,
typographical errors, capitalization errors, punctuation errors,
spacing errors, missing characters, or extra characters.

Before evaluating the answer, determine the student's intended meaning.

You MUST ignore spelling mistakes and OCR errors when the intended
meaning is reasonably clear from context.

Spelling mistakes, OCR errors, typographical errors, capitalization
errors, punctuation errors, and minor grammatical errors MUST NOT
reduce correctness, completeness, or relevance.

A difference in spelling between the STUDENT ANSWER and the
REFERENCE ANSWER is NOT a factual or conceptual error when the
intended meaning is clear.

Evaluate SEMANTIC MEANING only.

You are NOT evaluating spelling, grammar, punctuation, or writing
quality.

Do NOT treat a misspelled word as incorrect solely because its
spelling differs from the REFERENCE ANSWER.

Do NOT mention spelling mistakes or OCR errors in the feedback.

Only penalize an answer when its intended meaning is genuinely
incorrect, incomplete, contradictory, or irrelevant.

====================================
REFERENCE ANSWER RULE
====================================

You must evaluate the student's intended meaning by carefully
comparing it against the REFERENCE ANSWER.

The REFERENCE ANSWER defines the important concepts, facts, and
requirements expected in a good answer.

The REFERENCE ANSWER is the PRIMARY source of truth for grading.

Follow this evaluation process:

1. Carefully analyze the REFERENCE ANSWER.
2. Identify its essential concepts and facts.
3. Read the STUDENT ANSWER and determine its intended meaning.
4. Ignore and mentally normalize obvious OCR and spelling errors.
5. Compare the intended meaning of the STUDENT ANSWER against the
   essential concepts in the REFERENCE ANSWER.
6. Determine which important concepts are correctly covered.
7. Penalize genuinely missing essential concepts when calculating
   completeness.
8. Penalize statements that genuinely contradict the required
   concepts when calculating correctness.

Do NOT ignore the REFERENCE ANSWER and evaluate the student answer
using only your own general knowledge.

However:

- A student may use different wording, synonyms, examples, or a
  different valid explanation and still receive full credit.
- Do not require exact wording from the REFERENCE ANSWER.
- Do not require exact phrase matching.
- Do not require every minor detail from the REFERENCE ANSWER.
- If the student provides additional information that is correct and
  relevant, do not penalize it merely because it is not explicitly
  present in the REFERENCE ANSWER.
- If the REFERENCE ANSWER is incomplete, do not blindly mark correct
  information as incorrect solely because it is absent from the
  REFERENCE ANSWER.

====================================
GRADING DIMENSIONS
====================================

CORRECTNESS:

Compare the intended semantic meaning of the student's answer against
the REFERENCE ANSWER.

Ask:

"Are the essential claims made by the student conceptually and
factually correct?"

Rules:

- If the student's intended meaning matches the required concepts in
  the REFERENCE ANSWER, correctness should be high.
- If the student's answer is semantically equivalent to the
  REFERENCE ANSWER, it should receive very high or full correctness.
- Different wording, synonyms, and OCR or spelling variations must
  not reduce correctness when the intended meaning is clear.
- A genuine contradiction of an essential fact should significantly
  reduce correctness.
- If the answer contains a major factual error about the central
  concept, correctness should usually be between 0.0 and 0.2.
- Only genuine factual or conceptual errors should reduce
  correctness.

COMPLETENESS:

Use the essential concepts and requirements from the REFERENCE ANSWER
as the checklist.

Ask:

"How much of the essential information required by the reference
answer did the student successfully communicate?"

Rules:

- Missing major concepts should significantly reduce completeness.
- Correct answers that cover only part of the required information
  should receive partial credit.
- A single correct fact should receive limited completeness credit
  when the reference answer requires multiple essential facts.
- Do not reduce completeness because information is misspelled or
  imperfectly extracted by OCR when its intended meaning is clear.

RELEVANCE:

Evaluate whether the intended meaning of the student's answer
actually addresses the QUESTION.

Rules:

- Ignore spelling, OCR artifacts, punctuation, grammar, and writing
  quality.
- Evaluate whether the actual intended content answers the question.
- Completely irrelevant answers should receive zero or near-zero
  relevance.
- Do not award credit merely because keywords from the QUESTION or
  REFERENCE ANSWER appear in the student's response.

====================================
FINAL EVALUATION RULES
====================================

Do not invent information that the student did not state.

Do not assume that a spelling difference represents a different
concept when the intended meaning is reasonably clear.

If two answers have the same intended semantic meaning, they should
receive the same evaluation even if one contains OCR or spelling
errors.

The student's answer must be evaluated based on its intended meaning,
not exact character matching.

====================================
OUTPUT FORMAT
====================================

Return ONLY valid JSON:

{{
  "correctness": <number between 0 and 1>,
  "completeness": <number between 0 and 1>,
  "relevance": <number between 0 and 1>,
  "feedback": "<short explanation of what was correct, missing, or incorrect>"
}}

The feedback must evaluate the student's content only.

Do NOT criticize spelling.
Do NOT criticize grammar.
Do NOT criticize punctuation.
Do NOT mention OCR errors.

Do not include a score field.
Do not use Markdown.
Do not include any text outside the JSON.

====================
QUESTION
====================
{question}

====================
REFERENCE ANSWER
PRIMARY GRADING STANDARD
====================
{answer_key}

====================
STUDENT ANSWER
====================
{student_answer}
"""

def build_prompt(request: EvaluationRequest) -> str:
    """
    Fill the evaluation prompt with the actual question,
    reference answer and student's answer.
    """
    print(request.answer_key)
    print(request.student_answer)
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
        "relevance"
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

    feedback = str(data.get("feedback") or _fallback_feedback(
        correctness,
        completeness,
        relevance,
    ))

    return EvaluationResult(
        correctness=correctness,
        completeness=completeness,
        relevance=relevance,
        score=score,
        feedback=feedback
    )


def _fallback_feedback(correctness: float, completeness: float, relevance: float) -> str:
    weakest_dimension = min(
        [(correctness, "correctness"), (completeness, "completeness"), (relevance, "relevance")],
        key=lambda item: item[0],
    )[1]
    return f"The answer was evaluated. Review the response for improved {weakest_dimension}."


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