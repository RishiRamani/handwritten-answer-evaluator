from pathlib import Path

import cv2

from .basic import preprocess_basic
from .advanced import preprocess_advanced
from .pages import extract_pdf_pages


# ---------------------------------------------------------
# Complete preprocessing pipeline
# ---------------------------------------------------------
# This file only connects the different preprocessing
# stages.
#
# It does NOT implement preprocessing itself.
#
# Pipeline:
#
# PDF
#  ↓
# Page extraction
#  ↓
# Basic preprocessing
#  ↓
# Advanced preprocessing
#  ↓
# OCR-ready images
# ---------------------------------------------------------


def preprocess_pdf(
    pdf_path: str | Path,
    output_dir: str | Path,
    dpi: int = 200,
    target_width: int = 2000,
    denoise: bool = True,
    perspective: bool = True,
    deskew: bool = True,
    contrast: bool = True,
    threshold: bool = False,
) -> list[Path]:
    """
    Extract and preprocess every page in a PDF.

    Returns:
        Paths to the final preprocessed page images.
    """

    pdf_path = Path(pdf_path)
    output_dir = Path(output_dir)

    # -----------------------------------------------------
    # Step 1: Extract PDF pages.
    #
    # Each PDF page becomes a separate PNG image.
    # -----------------------------------------------------

    extracted_dir = output_dir / "extracted"

    page_paths = extract_pdf_pages(
        pdf_path,
        extracted_dir,
        dpi=dpi,
    )

    # Directory for the final OCR-ready images.
    processed_dir = output_dir / "processed"

    processed_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    processed_pages: list[Path] = []

    # -----------------------------------------------------
    # Step 2: Process each page independently.
    # -----------------------------------------------------

    for page_path in page_paths:

        # Load the extracted page.
        image = cv2.imread(
            str(page_path)
        )

        if image is None:
            raise ValueError(
                f"Could not load extracted page: {page_path}"
            )

        # -------------------------------------------------
        # Step 3: Our basic preprocessing.
        #
        # Validation
        #     ↓
        # Resolution normalization
        #     ↓
        # Grayscale
        # -------------------------------------------------

        image = preprocess_basic(
            image,
            target_width=target_width,
        )

        # -------------------------------------------------
        # Step 4: Advanced preprocessing.
        #
        # Denoising
        #     ↓
        # Deskew
        #     ↓
        # Contrast
        #     ↓
        # Optional thresholding
        # -------------------------------------------------

        image = preprocess_advanced(
            image,
            denoise=denoise,
            perspective=perspective,
            deskew=deskew,
            contrast=contrast,
            threshold=threshold,
        )

        # -------------------------------------------------
        # Step 5: Save the final OCR-ready image.
        # -------------------------------------------------

        output_path = (
            processed_dir / page_path.name
        )

        cv2.imwrite(
            str(output_path),
            image,
        )

        processed_pages.append(
            output_path
        )

    return processed_pages