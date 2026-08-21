import os

os.environ.setdefault("FLAGS_use_mkldnn", "0")

import cv2
import numpy as np
import torch
import paddle

from app.preprocessing.pipeline import preprocess_pdf
from app.trocr import recognize_line
from paddleocr import PaddleOCR


PDF_PATH = "sample/test1.pdf"
OUTPUT_DIR = "sample/test1_trocr_output"


def main():

    # -----------------------------------------------------
    # PDF → page image
    # -----------------------------------------------------

    pages = preprocess_pdf(
        PDF_PATH,
        OUTPUT_DIR,
        dpi=300,
        target_width=2000,
        denoise=True,
        perspective=True,
        deskew=True,
        contrast=True,
        threshold=False,
    )

    if not pages:
        raise RuntimeError("No pages extracted.")

    # -----------------------------------------------------
    # Detect and recognize every line on every page.
    # -----------------------------------------------------

    ocr = PaddleOCR(
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        enable_mkldnn=False,
        device=(
            "gpu"
            if paddle.device.is_compiled_with_cuda()
            else "cpu"
        ),
    )

    all_text = []
    for page_number, page_path in enumerate(pages, start=1):
        image = cv2.imread(str(page_path))

        if image is None:
            raise FileNotFoundError(page_path)

        print(f"\nPage {page_number}: {page_path}")
        print(f"Page shape: {image.shape}")

        result = ocr.predict(image)
        if not result:
            print("No OCR result.")
            continue

        page_text = []
        boxes = result[0]["dt_polys"]
        ordered_boxes = sorted(
            boxes,
            key=lambda current_box: (
                np.asarray(current_box)[:, 1].min(),
                np.asarray(current_box)[:, 0].min(),
            ),
        )

        print(f"Detected boxes: {len(ordered_boxes)}")
        for line_number, current_box in enumerate(ordered_boxes, start=1):
            box = np.asarray(current_box)
            x_min = max(0, int(box[:, 0].min()) - 10)
            y_min = max(0, int(box[:, 1].min()) - 10)
            x_max = min(image.shape[1], int(box[:, 0].max()) + 10)
            y_max = min(image.shape[0], int(box[:, 1].max()) + 10)

            if x_max <= x_min or y_max <= y_min:
                continue

            crop = image[y_min:y_max, x_min:x_max]
            crop_path = (
                f"{OUTPUT_DIR}/page_{page_number:03d}"
                f"_line_{line_number:03d}.png"
            )
            if not cv2.imwrite(crop_path, crop):
                raise RuntimeError(f"Could not save crop: {crop_path}")

            text = recognize_line(crop)
            page_text.append(text)
            print(f"Line {line_number}: {text}")

        all_text.extend(page_text)

    if not all_text:
        raise RuntimeError("No text lines were recognized.")

    print("\nFull TrOCR text:")
    print("\n".join(all_text))


if __name__ == "__main__":
    main()