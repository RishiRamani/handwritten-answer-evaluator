def to_expected_format(qa_pairs, submission_id="SUB123", page=1):
    """
    Convert internal QA format to the expected output format.
    
    Args:
        qa_pairs: List of question-answer pairs from process_page
        submission_id: Submission identifier
        page: Page number for the answers
    
    Returns:
        dict: Structured output matching expected format
    """
    return {
        "submissionId": submission_id,
        "answers": [
            {
                "questionNumber": qa["question_number"],
                "questionText": qa["question_text"],
                "text": qa["answer_text"],
                "pages": [page],
                "lineRange": qa["line_range"]
            }
            for qa in qa_pairs
        ]
    }


def to_json(qa_pairs, submission_id="SUB123", page=1, indent=2):
    """
    Convert to JSON string.
    """
    import json
    return json.dumps(
        to_expected_format(qa_pairs, submission_id, page),
        indent=indent
    )