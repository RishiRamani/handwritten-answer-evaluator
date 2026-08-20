from app.evaluator import evaluate_answer
from app.schemas import EvaluationRequest


# ---------------------------------------------------------
# Common question
# ---------------------------------------------------------
# We use one question for most tests so that we can compare
# how the model reacts to different student answers.
# ---------------------------------------------------------

QUESTION = "What is TCP?"

ANSWER_KEY = (
    "TCP is a connection-oriented transport layer protocol "
    "that provides reliable and ordered delivery of data."
)

MAX_MARKS = 5


# ---------------------------------------------------------
# Test cases
# ---------------------------------------------------------
# Each case represents a different quality of student answer.
#
# human_expected is NOT used by the model.
# It is our rough human expectation that we can compare
# against Qwen's output.
# ---------------------------------------------------------

TEST_CASES = [
    {
        "name": "Fully correct",
        "student_answer": (
            "TCP is a connection-oriented transport layer protocol "
            "that provides reliable and ordered delivery of data."
        ),
        "human_expected": 5
    },

    {
        "name": "Mostly correct",
        "student_answer": (
            "TCP is a connection-oriented protocol used for "
            "reliable data transmission."
        ),
        "human_expected": 4
    },

    {
        "name": "Partially correct",
        "student_answer": (
            "TCP is a protocol used to transfer data between "
            "computers."
        ),
        "human_expected": 2
    },

    {
        "name": "Incorrect",
        "student_answer": (
            "TCP is a connectionless protocol that does not "
            "provide reliable delivery."
        ),
        "human_expected": 0
    },

    {
        "name": "Irrelevant",
        "student_answer": (
            "The OSI model has seven layers and the application "
            "layer is used by applications such as browsers."
        ),
        "human_expected": 0
    },

    {
        "name": "Correct but differently worded",
        "student_answer": (
            "TCP establishes a connection between endpoints and "
            "ensures that transmitted data reaches the destination "
            "reliably and in the correct order."
        ),
        "human_expected": 5
    },

    {
        "name": "Very short",
        "student_answer": "TCP is reliable.",
        "human_expected": 1
    },

    {
        "name": "Verbose but correct",
        "student_answer": (
            "TCP, or Transmission Control Protocol, operates at "
            "the transport layer. Before transferring data, it "
            "establishes a connection between the communicating "
            "endpoints. It provides reliable and ordered delivery "
            "of data, making sure that data reaches the destination "
            "correctly and in the proper order."
        ),
        "human_expected": 5
    }
]


def run_tests():
    """
    Run every grading case one by one.

    We print both the human expectation and Qwen's result so
    that we can manually inspect how well the model is grading.
    """

    print("\n==========================================")
    print("        QWEN GRADING TEST SUITE")
    print("==========================================\n")

    results = []

    for case in TEST_CASES:

        print("------------------------------------------")
        print(f"Test: {case['name']}")
        print("------------------------------------------")

        request = EvaluationRequest(
            question=QUESTION,
            answer_key=ANSWER_KEY,
            student_answer=case["student_answer"],
            max_marks=MAX_MARKS
        )

        try:
            result = evaluate_answer(request)

            score = result.score
            expected = case["human_expected"]

            difference = score - expected

            print(f"Expected score : {expected}/{MAX_MARKS}")
            print(f"Qwen score     : {score}/{MAX_MARKS}")
            print(f"Difference     : {difference:+.1f}")
            print(f"Correctness    : {result.correctness}")
            print(f"Completeness   : {result.completeness}")
            print(f"Relevance      : {result.relevance}")
            print(f"Feedback       : {result.feedback}")

            results.append({
                "name": case["name"],
                "expected": expected,
                "actual": score,
                "difference": difference
            })

        except Exception as error:

            # We don't want one failed test to stop the entire
            # test suite.
            print(f"ERROR: {error}")

    # -----------------------------------------------------
    # Summary
    # -----------------------------------------------------

    print("\n==========================================")
    print("                SUMMARY")
    print("==========================================")

    for result in results:

        print(
            f"{result['name']:<35} "
            f"Expected={result['expected']} "
            f"Qwen={result['actual']} "
            f"Diff={result['difference']:+.1f}"
        )


if __name__ == "__main__":
    run_tests()