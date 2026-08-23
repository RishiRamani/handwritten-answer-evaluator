from postprocessing.adapter import paddleocr_to_blocks
from postprocessing.noise_filter import clean_blocks
from postprocessing.reading_order import reconstruct_reading_order
from postprocessing.question_detection import segment_questions


def process_page(
    ocr_result,
    page_number=1,
    clean_noise=True,
    image=None,
    line_recognizer=None,
):
    """
    Process a single page's OCR result through the full post-processing pipeline.
    
    Args:
        ocr_result: Raw PaddleOCR result (list containing one page dict)
        page_number: Page number for reference
        clean_noise: Whether to filter noisy OCR blocks
    
    Returns:
        dict: {
            'qa_pairs': [...],
            'lines': [...],
            'blocks': [...],
            'page_number': page_number
        }
    """
    # Convert to blocks
    blocks = paddleocr_to_blocks(
        ocr_result,
        page_number,
        image=image,
        line_recognizer=line_recognizer,
    )
    
    # Clean noise (optional)
    if clean_noise:
        blocks = clean_blocks(blocks)
    
    # Reconstruct reading order
    lines = reconstruct_reading_order(blocks)
    
    # Extract questions and answers
    qa_pairs = segment_questions(lines)
    
    return {
        'qa_pairs': qa_pairs,
        'lines': lines,
        'blocks': blocks,
        'page_number': page_number
    }


def process_submission(
    ocr_results,
    submission_id="SUB123",
    clean_noise=True,
    page_images=None,
    line_recognizer=None,
):
    """
    Process multiple pages of a submission.
    
    Args:
        ocr_results: List of PaddleOCR results (one per page)
        submission_id: Submission identifier
        clean_noise: Whether to filter noisy OCR blocks
    
    Returns:
        dict: Complete structured output with answers from all pages
    """
    all_pages = []
    all_qa_pairs = []
    
    page_images = page_images or []

    for page_num, ocr_result in enumerate(ocr_results, start=1):
        image = page_images[page_num - 1] if page_num <= len(page_images) else None
        page_result = process_page(
            ocr_result,
            page_num,
            clean_noise,
            image=image,
            line_recognizer=line_recognizer,
        )
        all_pages.append(page_result)
        all_qa_pairs.extend(page_result['qa_pairs'])
    
    # TODO: Add multi-page merging here when implemented
    
    return {
        'submissionId': submission_id,
        'pages': all_pages,
        'answers': [
            {
                'questionNumber': qa['question_number'],
                'questionText': qa['question_text'],
                'answerText': qa['answer_text'],
                'lineRange': qa['line_range'],
                'page': qa.get('page', 1)
            }
            for qa in all_qa_pairs
        ]
    }