from pathlib import Path

import cv2

from app.preprocessing.basic import preprocess_basic


# Use one of the pages we extracted earlier.
INPUT_IMAGE = (
    Path("sample")
    / "extracted_pages"
    / "page_001.png"
)

OUTPUT_IMAGE = (
    Path("sample")
    / "basic_output.png"
)


def main():
    # Load the extracted page.
    image = cv2.imread(str(INPUT_IMAGE))

    # Run our preprocessing stages.
    processed = preprocess_basic(image)

    # Save the result so we can visually inspect it.
    cv2.imwrite(
        str(OUTPUT_IMAGE),
        processed,
    )

    print(f"Input shape : {image.shape}")
    print(f"Output shape: {processed.shape}")
    print(f"Saved to    : {OUTPUT_IMAGE}")


if __name__ == "__main__":
    main()