import sys
from pathlib import Path

import cv2
import fitz
import numpy as np


# Project root: tests/ -> ocr-service/
PROJECT_ROOT = Path(__file__).resolve().parent.parent

sys.path.insert(
    0,
    str(PROJECT_ROOT),
)


from app.preprocessing.basic import preprocess_basic
from app.preprocessing.advanced import (
    remove_noise,
    correct_perspective,
    deskew_image,
    enhance_contrast,
    apply_threshold,
)


INPUT_PATH = PROJECT_ROOT / "sample" /"1788104166013-42135479.pdf"
OUTPUT_DIR = PROJECT_ROOT / "app" / "output"


def load_first_page_as_image(
    pdf_path: Path,
) -> np.ndarray:
    """
    Render the first PDF page as an OpenCV image.
    """

    document = fitz.open(
        str(pdf_path)
    )

    if len(document) == 0:
        document.close()
        raise ValueError(
            "PDF contains no pages."
        )

    page = document[0]

    pixmap = page.get_pixmap(
        matrix=fitz.Matrix(2, 2)
    )

    image = cv2.imdecode(
        np.frombuffer(
            pixmap.tobytes("png"),
            dtype=np.uint8,
        ),
        cv2.IMREAD_COLOR,
    )

    document.close()

    if image is None:
        raise ValueError(
            "Could not convert PDF page to image."
        )

    return image


def save_image(
    name: str,
    image: np.ndarray,
) -> None:
    """
    Save an intermediate preprocessing result.
    """

    path = OUTPUT_DIR / name

    success = cv2.imwrite(
        str(path),
        image,
    )

    if not success:
        raise RuntimeError(
            f"Could not save image: {path}"
        )

    print(f"Saved: {path.name}")


def main():
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    if not INPUT_PATH.exists():
        raise FileNotFoundError(
            f"Could not find file: {INPUT_PATH}"
        )

    # -------------------------------------------------
    # PDF -> page image
    # -------------------------------------------------

    image = load_first_page_as_image(
        INPUT_PATH
    )

    # -------------------------------------------------
    # Basic preprocessing
    # validation -> resize -> grayscale
    # -------------------------------------------------

    basic = preprocess_basic(
        image
    )

    save_image(
        "01_basic.jpg",
        basic,
    )

    # -------------------------------------------------
    # Advanced preprocessing stages
    # -------------------------------------------------

    denoised = remove_noise(
        basic
    )

    save_image(
        "02_denoised.jpg",
        denoised,
    )

    perspective_corrected = correct_perspective(
        denoised
    )

    save_image(
        "03_perspective.jpg",
        perspective_corrected,
    )

    deskewed = deskew_image(
        perspective_corrected
    )

    save_image(
        "04_deskewed.jpg",
        deskewed,
    )

    contrasted = enhance_contrast(
        deskewed
    )

    save_image(
        "05_contrast.jpg",
        contrasted,
    )

    thresholded = apply_threshold(
        contrasted
    )

    save_image(
        "06_thresholded.jpg",
        thresholded,
    )

    print("\nPreprocessing complete.")
    print(f"Output directory: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()