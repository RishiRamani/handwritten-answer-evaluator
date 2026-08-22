def paddleocr_to_blocks(result, page_number=1):
    """
    Convert PaddleOCR output into a simple list of OCR blocks.

    Performs only safe normalization:
    - Removes leading/trailing whitespace
    - Skips completely empty OCR blocks
    - Preserves OCR text, confidence, and coordinates
    """

    blocks = []

    for page in result:
        texts = page.get("rec_texts", [])
        scores = page.get("rec_scores", [])
        boxes = page.get("rec_boxes", [])

        for text, score, box in zip(texts, scores, boxes):

            text = text.strip()

            # Ignore empty OCR detections
            if not text:
                continue

            blocks.append({
                "text": text,
                "confidence": float(score),
                "bbox": box.tolist(),
                "page": page_number
            })

    return blocks