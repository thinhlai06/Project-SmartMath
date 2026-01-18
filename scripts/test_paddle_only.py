try:
    print("Importing PaddleOCR...")
    from paddleocr import PaddleOCR
    print("PaddleOCR imported successfully!")
    ocr = PaddleOCR(use_angle_cls=True, lang='vi', use_gpu=False, show_log=False)
    print("PaddleOCR initialized!")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Exception: {e}")
    import traceback
    traceback.print_exc()
