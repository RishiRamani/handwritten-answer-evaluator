from app.ocr import run_ocr
from postprocessing import process_page, to_expected_format

image_path = "sample/pipeline_output/processed/page_001.png"

# Run OCR and process through pipeline
result = run_ocr(image_path)
processed = process_page(result, page_number=1, clean_noise=True)

# Get formatted output
formatted = to_expected_format(processed['qa_pairs'], submission_id="TEST001", page=1)

print(f"\nOriginal blocks: {len(processed['blocks'])}")
print(f"Lines: {len(processed['lines'])}")
print(f"Questions detected: {len(processed['qa_pairs'])}\n")

print("=" * 60)
print("QUESTION-ANSWER EXTRACTION")
print("=" * 60)

for qa in processed['qa_pairs']:
    print(f"\nQ{qa['question_number']}:")
    print(f"  Question: {qa['question_text']}")
    print(f"  Answer: {qa['answer_text']}")
    print(f"  Lines: {qa['line_range']['start']}-{qa['line_range']['end']}")

'''
print("\n" + "=" * 60)
print("STRUCTURED OUTPUT")
print("=" * 60)

import json
print(json.dumps(formatted, indent=2))
'''