from pathlib import Path

from app.preprocessing.pages import extract_pdf_pages


# ---------------------------------------------------------
# Test input
# ---------------------------------------------------------
# The sample PDF lives outside the application code.
# This test simply feeds it into our page extraction
# function.
# ---------------------------------------------------------

SAMPLE_PDF = Path("sample") / "test1.pdf"

# Extracted pages will temporarily go here.
OUTPUT_DIR = Path("sample") / "extracted_pages"


def main():
    # Convert the PDF into individual page images.
    pages = extract_pdf_pages(
        SAMPLE_PDF,
        OUTPUT_DIR,
        dpi=200,
    )

    print(f"\nExtracted {len(pages)} pages:\n")

    for page in pages:
        print(f"  {page}")


if __name__ == "__main__":
    main()