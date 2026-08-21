# app/preprocessing/basic.py

from pathlib import Path

import cv2
import numpy as np


# ---------------------------------------------------------
# Supported image extensions
# ---------------------------------------------------------
# We explicitly control which image formats our pipeline
# accepts instead of letting OpenCV fail somewhere later.
# ---------------------------------------------------------

SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}


# ---------------------------------------------------------
# Image validation
# ---------------------------------------------------------

def validate_image(image: np.ndarray) -> None:
    """
    Validate that an image was successfully loaded and
    has reasonable dimensions.

    Raises:
        ValueError: if the image is invalid.
    """

    # OpenCV returns None when it cannot read an image.
    if image is None:
        raise ValueError("Image could not be loaded.")

    # Make sure the image has actual dimensions.
    if image.size == 0:
        raise ValueError("Image is empty.")

    height, width = image.shape[:2]

    # A page this small is unlikely to contain useful
    # handwriting and usually indicates a bad input.
    if width < 100 or height < 100:
        raise ValueError(
            f"Image resolution is too small: {width}x{height}"
        )


# ---------------------------------------------------------
# Resolution normalization
# ---------------------------------------------------------

def normalize_resolution(
    image: np.ndarray,
    target_width: int = 2000,
) -> np.ndarray:
    """
    Resize an image to a target width while preserving
    its original aspect ratio.

    Images that are already smaller than target_width are
    not enlarged unnecessarily.
    """

    height, width = image.shape[:2]

    # Don't upscale small images.
    if width <= target_width:
        return image

    # Calculate scale while preserving aspect ratio.
    scale = target_width / width

    new_width = target_width
    new_height = int(height * scale)

    return cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_AREA,
    )


# ---------------------------------------------------------
# Grayscale conversion
# ---------------------------------------------------------

def convert_to_grayscale(image: np.ndarray) -> np.ndarray:
    """
    Convert a color image to grayscale.

    OCR generally does not need RGB color information
    for ordinary black/blue handwriting on paper.
    """

    # If the image already has one channel, it is already
    # grayscale.
    if len(image.shape) == 2:
        return image

    return cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )


# ---------------------------------------------------------
# Complete basic preprocessing pipeline
# ---------------------------------------------------------

def preprocess_basic(
    image: np.ndarray,
    target_width: int = 2000,
) -> np.ndarray:
    """
    Run our part of the preprocessing pipeline:

        Validation
             ↓
        Resolution normalization
             ↓
        Grayscale

    Page extraction happens before this function because
    this function operates on ONE page at a time.
    """

    # Step 1: validate the loaded page.
    validate_image(image)

    # Step 2: normalize resolution.
    image = normalize_resolution(
        image,
        target_width=target_width,
    )

    # Step 3: convert to grayscale.
    image = convert_to_grayscale(image)

    return image