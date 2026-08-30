from app.ocr import run_ocr


IMAGE_PATH = "sample/pipeline_output/1788104166013-42135479.png"


def main():
    results = run_ocr(IMAGE_PATH)

    for result in results:
        print(result)


if __name__ == "__main__":
    main()