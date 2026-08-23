import os

# The cached PP-OCR models use attributes unsupported by Paddle's oneDNN
# executor on some Windows CPU builds.
os.environ.setdefault("FLAGS_use_mkldnn", "0")

import torch
import paddle
from paddleocr import PaddleOCR


DEVICE = "gpu" if paddle.device.is_compiled_with_cuda() else "cpu"


ocr = PaddleOCR(
    text_detection_model_name="PP-OCRv5_mobile_det",
    text_recognition_model_name="en_PP-OCRv5_mobile_rec",

    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    enable_mkldnn=False,

    text_det_limit_side_len=1280,

    device=DEVICE,
)


def run_ocr(image_path: str):
    """
    Run PaddleOCR on a single preprocessed image.
    """

    return ocr.predict(str(image_path))