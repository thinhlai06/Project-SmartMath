"""
OCR Service using PaddleOCR
"""
import logging
import numpy as np
import cv2
try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None

logger = logging.getLogger(__name__)

class OCRService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OCRService, cls).__new__(cls)
            cls._instance.ocr = None
        return cls._instance

    def initialize(self):
        if self.ocr is None:
            if PaddleOCR:
                logger.info("Initializing PaddleOCR (lang=vi)...")
                # use_gpu=False for safety on typical verified envs unless specified
                # Removed show_log=False as it caused errors in newer versions
                # enable_mkldnn=False to fix "OneDnnContext" error on Windows CPU
                self.ocr = PaddleOCR(use_angle_cls=True, lang='vi', use_gpu=False, enable_mkldnn=False)
            else:
                logger.error("PaddleOCR package not installed.")
                raise ImportError("PaddleOCR not installed")

    def recognize(self, image_content: bytes) -> str:
        self.initialize()
        
        try:
            # Convert bytes to numpy
            nparr = np.frombuffer(image_content, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Invalid image data")

            # OCR
            result = self.ocr.ocr(img, cls=True)
            
            # PaddleOCR returns list of lines [ [line1], [line2] ]
            # result[0] is the list of lines for the first image
            full_text = []
            if result and result[0]:
                for line in result[0]:
                    # line format: [ [[x,y]..], ('text', conf) ]
                    if line and len(line) > 1:
                        text = line[1][0]
                        full_text.append(text)
            
            return "\n".join(full_text)
            
        except Exception as e:
            logger.error(f"OCR Error: {e}")
            raise e
