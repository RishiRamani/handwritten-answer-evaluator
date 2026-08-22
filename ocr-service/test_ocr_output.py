from app.ocr import run_ocr

image_path = "sample/pipeline_output/processed/page_001.png"

result = run_ocr(image_path)

print(type(result))
print(result)