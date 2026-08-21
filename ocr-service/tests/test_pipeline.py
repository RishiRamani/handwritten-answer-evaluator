from pathlib import Path

from app.preprocessing.pipeline import preprocess_pdf


# ---------------------------------------------------------
# Test input
# ---------------------------------------------------------

SAMPLE_PDF = Path("sample") / "test1.pdf"

OUTPUT_DIR = (
    Path("sample")
    / "pipeline_output"
)


def main():
    processed_pages = preprocess_pdf(
        SAMPLE_PDF,
        OUTPUT_DIR,
        dpi=200,
        target_width=2000,

        # Advanced preprocessing options.
        denoise=True,
        deskew=True,
        contrast=True,

        # Keep this False initially because thresholding
        # can destroy faint handwriting.
        threshold=False,
    )

    print(
        f"\nProcessed {len(processed_pages)} pages:\n"
    )

    for page in processed_pages:
        print(f"  {page}")


if __name__ == "__main__":
    main()