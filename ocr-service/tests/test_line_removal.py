import cv2
import numpy as np

from paddleocr import PaddleOCR, TextRecognition


IMAGE_PATH = (
    "sample/pipeline_output/"
    "processed/page_001.png"
)

OUTPUT_DIR = (
    "sample/pipeline_output/"
    "perspective_lines"
)


def order_points(points):
    """
    Order quadrilateral points as:

        top-left
        top-right
        bottom-right
        bottom-left
    """

    points = np.asarray(
        points,
        dtype=np.float32,
    )

    ordered = np.zeros(
        (4, 2),
        dtype=np.float32,
    )

    total = points.sum(axis=1)
    difference = np.diff(
        points,
        axis=1,
    ).flatten()

    ordered[0] = points[np.argmin(total)]
    ordered[2] = points[np.argmax(total)]
    ordered[1] = points[np.argmin(difference)]
    ordered[3] = points[np.argmax(difference)]

    return ordered


def perspective_crop(
    image,
    points,
    padding=8,
):
    """
    Perspective-correct one detected text box.

    The original quadrilateral is transformed into a
    horizontal rectangle suitable for recognition.
    """

    points = order_points(points)

    top_left = points[0]
    top_right = points[1]
    bottom_right = points[2]
    bottom_left = points[3]

    width_top = np.linalg.norm(
        top_right - top_left
    )

    width_bottom = np.linalg.norm(
        bottom_right - bottom_left
    )

    height_left = np.linalg.norm(
        bottom_left - top_left
    )

    height_right = np.linalg.norm(
        bottom_right - top_right
    )

    width = int(
        max(
            width_top,
            width_bottom,
        )
    )

    height = int(
        max(
            height_left,
            height_right,
        )
    )

    if width <= 0 or height <= 0:
        return None

    # Add a little vertical padding.
    height += padding * 2

    destination = np.array(
        [
            [0, padding],
            [width - 1, padding],
            [width - 1, height - padding - 1],
            [0, height - padding - 1],
        ],
        dtype=np.float32,
    )

    matrix = cv2.getPerspectiveTransform(
        points,
        destination,
    )

    warped = cv2.warpPerspective(
        image,
        matrix,
        (width, height),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )

    return warped


def normal_crop(
    image,
    points,
    padding=8,
):
    """
    Create the old axis-aligned rectangular crop.
    """

    points = np.asarray(
        points,
        dtype=np.int32,
    )

    x_min = max(
        0,
        int(points[:, 0].min()) - padding,
    )

    y_min = max(
        0,
        int(points[:, 1].min()) - padding,
    )

    x_max = min(
        image.shape[1],
        int(points[:, 0].max()) + padding,
    )

    y_max = min(
        image.shape[0],
        int(points[:, 1].max()) + padding,
    )

    return image[
        y_min:y_max,
        x_min:x_max,
    ]


def recognize(
    recognizer,
    image,
    path,
):
    """
    Run Paddle recognition on one image.
    """

    cv2.imwrite(
        path,
        image,
    )

    result = recognizer.predict(
        input=path,
        batch_size=1,
    )

    if not result:
        return "", 0.0

    data = result[0]

    return (
        data.get("rec_text", ""),
        data.get("rec_score", 0.0),
    )


def main():

    # -----------------------------------------------------
    # Load image
    # -----------------------------------------------------

    image = cv2.imread(
        IMAGE_PATH
    )

    if image is None:
        raise FileNotFoundError(
            IMAGE_PATH
        )

    print(
        "Page shape:",
        image.shape,
    )

    # -----------------------------------------------------
    # Paddle detection
    # -----------------------------------------------------

    detector = PaddleOCR(
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        device="gpu",

        text_det_limit_side_len=1280,
        text_det_limit_type="min",
        text_det_thresh=0.25,
        text_det_box_thresh=0.45,
        text_det_unclip_ratio=1.5,
    )

    result = detector.predict(
        image
    )

    if not result:
        raise RuntimeError(
            "PaddleOCR detected nothing."
        )

    data = result[0]

    boxes = data["dt_polys"]

    if not boxes:
        raise RuntimeError(
            "No text boxes detected."
        )

    print(
        f"Detected {len(boxes)} text regions."
    )

    # -----------------------------------------------------
    # Recognition model
    # -----------------------------------------------------

    recognizer = TextRecognition(
        model_name="PP-OCRv5_mobile_rec",
        device="gpu",
    )

    # -----------------------------------------------------
    # Process each line
    # -----------------------------------------------------

    for index, box in enumerate(boxes):

        print()
        print(
            f"========== LINE {index} =========="
        )

        # -------------------------------------------------
        # Normal crop
        # -------------------------------------------------

        original = normal_crop(
            image,
            box,
        )

        original_path = (
            f"{OUTPUT_DIR}/"
            f"normal_{index:03d}.png"
        )

        original_text, original_score = recognize(
            recognizer,
            original,
            original_path,
        )

        # -------------------------------------------------
        # Perspective crop
        # -------------------------------------------------

        corrected = perspective_crop(
            image,
            box,
        )

        if corrected is None:
            print(
                "Perspective crop failed."
            )
            continue

        corrected_path = (
            f"{OUTPUT_DIR}/"
            f"perspective_{index:03d}.png"
        )

        corrected_text, corrected_score = recognize(
            recognizer,
            corrected,
            corrected_path,
        )

        # -------------------------------------------------
        # Print comparison
        # -------------------------------------------------

        print(
            f"Normal      : "
            f"{original_text}"
        )

        print(
            f"Normal score: "
            f"{original_score:.4f}"
        )

        print(
            f"Perspective : "
            f"{corrected_text}"
        )

        print(
            f"Perspective score: "
            f"{corrected_score:.4f}"
        )


if __name__ == "__main__":
    main()