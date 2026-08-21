# app/trocr.py

import cv2
import numpy as np

from PIL import Image


MODEL_NAME = "microsoft/trocr-base-handwritten"


class TrOCREngine:

    def __init__(self):
        try:
            import torch
            from transformers import (
                TrOCRProcessor,
                VisionEncoderDecoderModel,
            )
        except (ImportError, OSError) as error:
            raise RuntimeError(
                "TrOCR requires a working PyTorch and Transformers installation. "
                "On Windows, install the Microsoft Visual C++ 2015-2022 x64 "
                "runtime and reinstall the CPU PyTorch wheel."
            ) from error

        self.torch = torch
        self.device = (
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        print(f"TrOCR device: {self.device}")

        self.processor = TrOCRProcessor.from_pretrained(
            MODEL_NAME
        )

        self.model = VisionEncoderDecoderModel.from_pretrained(
            MODEL_NAME
        )

        self.model.to(self.device)
        self.model.eval()

    def recognize(self, image):
        """
        Recognize handwritten text from a single
        text-line image.
        """

        image = _as_pil_image(image)

        # Prepare model input
        pixel_values = self.processor(
            images=image,
            return_tensors="pt",
        ).pixel_values

        pixel_values = pixel_values.to(
            self.device
        )

        # Generate text
        with self.torch.no_grad():

            generated_ids = self.model.generate(
                pixel_values
            )

        # Decode
        text = self.processor.batch_decode(
            generated_ids,
            skip_special_tokens=True,
        )[0]

        return text.strip()


def _as_pil_image(image: Image.Image | np.ndarray) -> Image.Image:
    """Convert an OpenCV or PIL line image to RGB for TrOCR."""

    if isinstance(image, Image.Image):
        return image.convert("RGB")

    if not isinstance(image, np.ndarray):
        raise TypeError("image must be a PIL image or NumPy array")

    if image.size == 0:
        raise ValueError("image is empty")

    if image.ndim == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.ndim == 3 and image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    else:
        raise ValueError("image must be grayscale or a 3-channel color image")

    return Image.fromarray(image)


_engine: TrOCREngine | None = None


def recognize_line(image: Image.Image | np.ndarray) -> str:
    """Recognize one already-cropped text line using TrOCR."""

    global _engine

    if _engine is None:
        _engine = TrOCREngine()

    return _engine.recognize(image)