import cv2
import numpy as np


# ---------------------------------------------------------
# Noise removal
# ---------------------------------------------------------

def remove_noise(
    image: np.ndarray,
    kernel_size: int = 3,
) -> np.ndarray:
    """
    Remove small image noise while preserving handwritten
    character edges.

    Median filtering is useful for small speckles and
    salt-and-pepper type noise because it tends to preserve
    edges better than a standard Gaussian blur.
    """

    if kernel_size < 3 or kernel_size % 2 == 0:
        raise ValueError(
            "kernel_size must be an odd integer >= 3."
        )

    return cv2.medianBlur(
        image,
        kernel_size,
    )


# ---------------------------------------------------------
# Perspective correction
# ---------------------------------------------------------

# ---------------------------------------------------------
# Perspective correction
# ---------------------------------------------------------

def order_corners(
    points: np.ndarray,
) -> np.ndarray:
    """
    Order four points as:

        top-left
        top-right
        bottom-right
        bottom-left
    """

    ordered = np.zeros(
        (4, 2),
        dtype=np.float32,
    )

    sums = points.sum(axis=1)
    differences = np.diff(
        points,
        axis=1,
    ).flatten()

    ordered[0] = points[np.argmin(sums)]
    ordered[2] = points[np.argmax(sums)]
    ordered[1] = points[np.argmin(differences)]
    ordered[3] = points[np.argmax(differences)]

    return ordered


def correct_perspective(
    image: np.ndarray,
) -> np.ndarray:
    """
    Detect the page region and correct perspective distortion.

    A small border is removed before detection because PDF/image
    extraction may introduce white padding around the page.
    """

    height, width = image.shape[:2]
    image_area = height * width

    # -----------------------------------------------------
    # 1. Remove artificial image borders
    # -----------------------------------------------------

    border = int(
        min(height, width) * 0.04
    )

    cropped = image[
        border:height - border,
        border:width - border,
    ]

    crop_height, crop_width = cropped.shape[:2]
    crop_area = crop_height * crop_width

    # -----------------------------------------------------
    # 2. Blur
    # -----------------------------------------------------

    blurred = cv2.GaussianBlur(
        cropped,
        (7, 7),
        0,
    )

    # -----------------------------------------------------
    # 3. Detect bright page region
    # -----------------------------------------------------

    threshold_value, binary = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )

    print(
        f"Perspective threshold: {threshold_value:.2f}"
    )

    # Clean mask
    kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (15, 15),
    )

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_CLOSE,
        kernel,
    )

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        np.ones(
            (5, 5),
            np.uint8,
        ),
    )

    # Save the ACTUAL mask used for contour detection.
    cv2.imwrite(
        "sample/perspective_binary_clean.png",
        binary,
    )

    # -----------------------------------------------------
    # 4. Clean mask
    # -----------------------------------------------------

    kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (15, 15),
    )

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_CLOSE,
        kernel,
    )

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        np.ones(
            (5, 5),
            np.uint8,
        ),
    )

    # -----------------------------------------------------
    # 5. Find contours
    # -----------------------------------------------------

    contours, _ = cv2.findContours(
        binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    if not contours:
        print(
            "Perspective: no contours detected."
        )
        return image

    contours = sorted(
        contours,
        key=cv2.contourArea,
        reverse=True,
    )

    page_contour = None

    # -----------------------------------------------------
    # 6. Find a large contour that is NOT simply the
    #    entire cropped image.
    # -----------------------------------------------------

    for contour in contours:

        area = cv2.contourArea(
            contour
        )

        if area < 0.20 * crop_area:
            continue

        contour_x, contour_y, contour_w, contour_h = (
            cv2.boundingRect(contour)
        )

        # Reject contours that are essentially the entire
        # cropped image.
        touches_all_sides = (
            contour_x <= 2
            and contour_y <= 2
            and contour_x + contour_w >= crop_width - 2
            and contour_y + contour_h >= crop_height - 2
        )

        if touches_all_sides:
            continue

        page_contour = contour
        break

    if page_contour is None:
        print(
            "Perspective: no suitable page contour detected."
        )
        return image

    # -----------------------------------------------------
    # 7. Try to approximate the page as a quadrilateral.
    # -----------------------------------------------------

    perimeter = cv2.arcLength(
        page_contour,
        True,
    )

    page_corners = None

    for epsilon_ratio in (
        0.01,
        0.02,
        0.03,
        0.04,
        0.05,
    ):

        approximation = cv2.approxPolyDP(
            page_contour,
            epsilon_ratio * perimeter,
            True,
        )

        if len(approximation) == 4:

            candidate = approximation.reshape(
                4,
                2,
            )

            if cv2.contourArea(candidate) >= (
                0.20 * crop_area
            ):
                page_corners = candidate
                break

    # -----------------------------------------------------
    # 8. If quadrilateral detection fails, use the
    #    minimum-area rectangle.
    # -----------------------------------------------------

    if page_corners is None:

        print(
            "Perspective: quadrilateral not found."
        )

        print(
            "Perspective: using minimum-area rectangle."
        )

        rectangle = cv2.minAreaRect(
            page_contour
        )

        page_corners = cv2.boxPoints(
            rectangle
        )

        page_corners = np.asarray(
            page_corners,
            dtype=np.float32,
        )

    else:

        print(
            "Perspective: four page corners detected."
        )

    # -----------------------------------------------------
    # 9. Convert coordinates back to original image.
    # -----------------------------------------------------

    page_corners[:, 0] += border
    page_corners[:, 1] += border

    # -----------------------------------------------------
    # 10. Order corners.
    # -----------------------------------------------------

    page_corners = order_corners(
        page_corners
    )

    print(
        "Perspective corners:",
        page_corners.astype(int).tolist()
    )

    # -----------------------------------------------------
    # 11. Calculate output dimensions.
    # -----------------------------------------------------

    top_left = page_corners[0]
    top_right = page_corners[1]
    bottom_right = page_corners[2]
    bottom_left = page_corners[3]

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

    output_width = int(
        max(
            width_top,
            width_bottom,
        )
    )

    output_height = int(
        max(
            height_left,
            height_right,
        )
    )

    if output_width <= 0 or output_height <= 0:
        return image

    # -----------------------------------------------------
    # 12. Destination rectangle.
    # -----------------------------------------------------

    destination = np.array(
        [
            [0, 0],
            [output_width - 1, 0],
            [output_width - 1, output_height - 1],
            [0, output_height - 1],
        ],
        dtype=np.float32,
    )

    # -----------------------------------------------------
    # 13. Perspective transform.
    # -----------------------------------------------------

    matrix = cv2.getPerspectiveTransform(
        page_corners.astype(np.float32),
        destination,
    )

    corrected = cv2.warpPerspective(
        image,
        matrix,
        (
            output_width,
            output_height,
        ),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )

    return corrected
# ---------------------------------------------------------
# Deskew
# ---------------------------------------------------------

def deskew_image(
    image: np.ndarray,
) -> np.ndarray:
    """
    Correct small rotation/skew of the page by detecting
    near-horizontal text/ruling lines using Hough transform.
    """

    # -----------------------------------------------------
    # 1. Create a binary image.
    #
    # Dark handwriting/ruling becomes white foreground.
    # -----------------------------------------------------

    binary = cv2.threshold(
        image,
        0,
        255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
    )[1]

    # -----------------------------------------------------
    # 2. Remove very small noise before line detection.
    # -----------------------------------------------------

    kernel = np.ones(
        (3, 3),
        np.uint8,
    )

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        kernel,
    )

    # -----------------------------------------------------
    # 3. Detect edges.
    # -----------------------------------------------------

    edges = cv2.Canny(
        binary,
        50,
        150,
        apertureSize=3,
    )

    # -----------------------------------------------------
    # 4. Detect line segments.
    # -----------------------------------------------------

    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=80,
        minLineLength=100,
        maxLineGap=20,
    )

    if lines is None:
        print("Deskew: no lines detected.")
        return image

    # -----------------------------------------------------
    # 5. Extract angles of approximately horizontal lines.
    # -----------------------------------------------------

    angles = []

    for line in lines:
        x1, y1, x2, y2 = line.reshape(-1)

        dx = x2 - x1
        dy = y2 - y1

        if dx == 0:
            continue

        angle = np.degrees(
            np.arctan2(dy, dx)
        )

        # Only consider lines close to horizontal.
        if -30 <= angle <= 30:

            line_length = np.sqrt(
                dx * dx + dy * dy
            )

            angles.append(
                (angle, line_length)
            )

    if not angles:
        print(
            "Deskew: no horizontal lines detected."
        )
        return image

    # -----------------------------------------------------
    # 6. Weight longer lines more heavily.
    #
    # Notebook ruling lines can be very long and therefore
    # provide a strong estimate of page rotation.
    # -----------------------------------------------------

    angle_values = np.array(
        [angle for angle, _ in angles]
    )

    angle_weights = np.array(
        [length for _, length in angles]
    )

    # Weighted average.
    skew_angle = float(
        np.average(
            angle_values,
            weights=angle_weights,
        )
    )

    print(
        f"Deskew estimated angle: "
        f"{skew_angle:.2f}°"
    )

    # -----------------------------------------------------
    # 7. Ignore tiny rotation.
    # -----------------------------------------------------

    if abs(skew_angle) < 0.1:
        print("Deskew: image already straight.")
        return image

    # -----------------------------------------------------
    # 8. Rotate the image.
    # -----------------------------------------------------

    height, width = image.shape[:2]

    center = (
        width / 2,
        height / 2,
    )

    rotation_matrix = cv2.getRotationMatrix2D(
        center,
        skew_angle,
        1.0,
    )

    corrected = cv2.warpAffine(
        image,
        rotation_matrix,
        (width, height),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )

    return corrected


# ---------------------------------------------------------
# Contrast enhancement
# ---------------------------------------------------------

def enhance_contrast(
    image: np.ndarray,
    clip_limit: float = 2.0,
    tile_grid_size: tuple[int, int] = (8, 8),
) -> np.ndarray:
    """
    Improve local contrast using CLAHE.

    CLAHE is generally more suitable than global histogram
    equalization when page illumination is uneven.
    """

    clahe = cv2.createCLAHE(
        clipLimit=clip_limit,
        tileGridSize=tile_grid_size,
    )

    return clahe.apply(image)


# ---------------------------------------------------------
# Optional thresholding
# ---------------------------------------------------------

def apply_threshold(
    image: np.ndarray,
    block_size: int = 31,
    constant: int = 10,
) -> np.ndarray:
    """
    Convert the grayscale image into a binary image using
    adaptive Gaussian thresholding.

    This is optional because aggressive thresholding can
    remove faint handwritten strokes.
    """

    if block_size <= 1 or block_size % 2 == 0:
        raise ValueError(
            "block_size must be an odd integer > 1."
        )

    return cv2.adaptiveThreshold(
        image,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        block_size,
        constant,
    )

# ---------------------------------------------------------
# Notebook line removal
# ---------------------------------------------------------

def remove_notebook_lines(
    image: np.ndarray,
    min_line_length_ratio: float = 0.5,
    max_line_angle: float = 2.0,
) -> np.ndarray:
    """
    Remove long horizontal notebook lines while preserving
    handwritten characters.

    This should be applied to an already cropped text region,
    not to the entire page.
    """

    if image is None:
        raise ValueError("image cannot be None.")

    if image.ndim == 3:
        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )
    else:
        gray = image.copy()

    height, width = gray.shape[:2]

    # Convert dark pixels into foreground.
    binary = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU,
    )[1]

    # Detect line segments.
    lines = cv2.HoughLinesP(
        binary,
        rho=1,
        theta=np.pi / 180,
        threshold=max(30, width // 5),
        minLineLength=int(
            width * min_line_length_ratio
        ),
        maxLineGap=20,
    )

    if lines is None:
        return gray

    cleaned = gray.copy()

    for line in lines:

        x1, y1, x2, y2 = line[0]

        dx = x2 - x1
        dy = y2 - y1

        if dx == 0:
            continue

        angle = np.degrees(
            np.arctan2(dy, dx)
        )

        # Normalize angle to [-90, 90].
        if angle > 90:
            angle -= 180

        if angle < -90:
            angle += 180

        # Only remove almost-horizontal lines.
        if abs(angle) > max_line_angle:
            continue

        # Remove the detected notebook line.
        cv2.line(
            cleaned,
            (x1, y1),
            (x2, y2),
            255,
            2,
        )

    return cleaned
# ---------------------------------------------------------
# Complete advanced preprocessing pipeline
# ---------------------------------------------------------

def preprocess_advanced(
    image: np.ndarray,
    denoise: bool = True,
    perspective: bool = True,
    deskew: bool = True,
    contrast: bool = True,
    threshold: bool = False,
) -> np.ndarray:
    """
    Run advanced preprocessing on an already validated,
    resolution-normalized grayscale image.

        Noise removal
             ↓
        Perspective correction
             ↓
        Deskew
             ↓
        Contrast enhancement
             ↓
        Optional thresholding
    """

    processed = image.copy()

    if denoise:
        processed = remove_noise(
            processed
        )

    if perspective:
        processed = correct_perspective(
            processed
        )

    if deskew:
        processed = deskew_image(
            processed
        )

    if contrast:
        processed = enhance_contrast(
            processed
        )

    if threshold:
        processed = apply_threshold(
            processed
        )

    return processed