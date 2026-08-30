import numpy as np


def paddleocr_to_blocks(
    result,
    page_number=1,
    image=None,
    line_recognizer=None,
    crop_padding=10,
):
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
        polygons = page.get("dt_polys", [])

        for index, (text, score, box) in enumerate(zip(texts, scores, boxes)):
            marker_text = text
            recognized_text = ""
            if line_recognizer is not None and image is not None:
                polygon = polygons[index] if index < len(polygons) else box
                recognized_text = _recognize_crop(
                    image,
                    polygon,
                    line_recognizer,
                    crop_padding,
                )
                if recognized_text:
                    text = recognized_text

            text = text.strip()
            print(f"[ocr][page={page_number}][block={index + 1}] paddle={marker_text!r} trocr={recognized_text!r} selected={text!r} source={'TrOCR' if recognized_text else 'PaddleOCR'}")

            # Ignore empty OCR detections
            if not text:
                continue

            blocks.append({
                "text": text,
                "marker_text": marker_text.strip(),
                "confidence": float(score),
                "bbox": np.asarray(box).tolist(),
                "page": page_number
            })

    return blocks


def _recognize_crop(image, polygon, line_recognizer, crop_padding):
    points = np.asarray(polygon, dtype=np.float32)
    if points.ndim != 2 or points.shape[1] != 2:
        return ""

    height, width = image.shape[:2]
    x_min = max(0, int(points[:, 0].min()) - crop_padding)
    y_min = max(0, int(points[:, 1].min()) - crop_padding)
    x_max = min(width, int(points[:, 0].max()) + crop_padding + 1)
    y_max = min(height, int(points[:, 1].max()) + crop_padding + 1)

    if x_max <= x_min or y_max <= y_min:
        return ""

    return line_recognizer(image[y_min:y_max, x_min:x_max])