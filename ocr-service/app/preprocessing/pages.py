from pathlib import Path

import fitz


# ---------------------------------------------------------
# PDF page extraction
# ---------------------------------------------------------
# This module is responsible ONLY for converting a PDF
# into individual page images.
#
# It does not perform:
#   - resizing
#   - grayscale conversion
#   - denoising
#   - deskewing
#   - OCR
#
# Those are handled by later stages of the pipeline.
# ---------------------------------------------------------


def extract_pdf_pages(
    pdf_path: str | Path,
    output_dir: str | Path,
    dpi: int = 200,
) -> list[Path]:
    """
    Convert every page of a PDF into a PNG image.

    Args:
        pdf_path:
            Path to the input PDF.

        output_dir:
            Directory where extracted page images
            will be stored.

        dpi:
            Resolution used when rendering PDF pages.

    Returns:
        A list containing the paths of the generated
        page images in document order.
    """

    pdf_path = Path(pdf_path)
    output_dir = Path(output_dir)

    # -----------------------------------------------------
    # Validate the input PDF.
    # -----------------------------------------------------

    if not pdf_path.exists():
        raise FileNotFoundError(
            f"PDF not found: {pdf_path}"
        )

    if pdf_path.suffix.lower() != ".pdf":
        raise ValueError(
            f"Expected a PDF file, got: {pdf_path.suffix}"
        )

    # Create the output directory if it does not exist.
    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # -----------------------------------------------------
    # Convert DPI into the scaling factor required by
    # PyMuPDF.
    #
    # PDF coordinates are based around 72 DPI.
    # -----------------------------------------------------

    scale = dpi / 72

    matrix = fitz.Matrix(
        scale,
        scale,
    )

    extracted_pages: list[Path] = []

    # -----------------------------------------------------
    # Open the PDF.
    # -----------------------------------------------------

    with fitz.open(pdf_path) as document:

        if len(document) == 0:
            raise ValueError("PDF contains no pages.")

        # Process pages in their original document order.
        for page_number, page in enumerate(document, start=1):

            # Render the PDF page into a raster image.
            pixmap = page.get_pixmap(
                matrix=matrix,
                alpha=False,
            )

            # Use predictable zero-padded filenames:
            #
            # page_001.png
            # page_002.png
            # page_003.png
            #
            output_path = (
                output_dir
                / f"page_{page_number:03d}.png"
            )

            # Save the rendered page.
            pixmap.save(output_path)

            extracted_pages.append(output_path)

    return extracted_pages