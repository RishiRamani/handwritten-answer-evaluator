import cv2
import numpy as np
from paddleocr import PaddleOCR


IMAGE_PATH = "sample/pipeline_output/processed/page_001.png"
OUTPUT_PATH = "sample/pipeline_output/detection_boxes.png"


def main():

    image = cv2.imread(IMAGE_PATH)

    if image is None:
        raise FileNotFoundError(IMAGE_PATH)

    ocr = PaddleOCR(
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        device="gpu",

        # Detection settings
        text_det_limit_side_len=1280,
        text_det_limit_type="min",
        text_det_thresh=0.25,
        text_det_box_thresh=0.45,
        text_det_unclip_ratio=1.5,
    )

    result = ocr.predict(image)

    if not result:
        print("No detection result.")
        return

    data = result[0]

    boxes = data["dt_polys"]

    print(f"Detected {len(boxes)} boxes")

    # Draw every detected box.
    for i, box in enumerate(boxes):

        points = np.asarray(
            box,
            dtype=np.int32,
        )

        cv2.polylines(
            image,
            [points],
            True,
            (0, 0, 255),
            3,
        )

        # Put box number near the first point.
        x, y = points[0]

        cv2.putText(
            image,
            str(i),
            (int(x), int(y) - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 0, 0),
            2,
        )

    cv2.imwrite(
        OUTPUT_PATH,
        image,
    )

    print(f"Saved: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()