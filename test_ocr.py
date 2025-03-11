"""
=================================================================
Author: Awais Nazeer (ZRR Gujjar)
Email: awaisnazeer07@gmail.com
=================================================================
OCR Testing Tool - Test OCR extraction for bakery item images
=================================================================
"""

import cv2
import pytesseract
import sys
import os
from PIL import Image
import numpy as np

# For Windows, you may need to specify the path to the Tesseract executable
# Uncomment the following line and update the path as needed:
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def test_ocr_extraction(image_path):
    """
    Test the OCR extraction on a sample image
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file '{image_path}' not found.")
        return
    
    try:
        # Read the image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not read image '{image_path}'.")
            return
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        
        # Convert OpenCV image to PIL format for Tesseract
        pil_img = Image.fromarray(binary)
        
        # Extract text using Tesseract
        print("Extracting text using Tesseract OCR...")
        text = pytesseract.image_to_string(pil_img)
        
        # Print extracted text
        print("\n--- EXTRACTED TEXT ---")
        print(text)
        print("--- END OF EXTRACTED TEXT ---\n")
        
        # Also try to extract table structure data
        print("Trying to extract table structure using image_to_data...")
        data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
        
        # Print basic stats about recognized text
        n_boxes = len(data['text'])
        confidence_values = [int(conf) for conf in data['conf'] if conf != '-1']
        avg_confidence = sum(confidence_values) / len(confidence_values) if confidence_values else 0
        
        print(f"Detected {n_boxes} text elements")
        print(f"Average confidence: {avg_confidence:.2f}%")
        
        # Print a few sample elements
        print("\nSample detected text elements (with confidence > 60%):")
        sample_count = 0
        for i in range(n_boxes):
            if int(data['conf'][i]) > 60:  # Only consider text with confidence > 60%
                if data['text'][i].strip():
                    print(f"- '{data['text'][i]}' (confidence: {data['conf'][i]}%)")
                    sample_count += 1
                    if sample_count >= 10:  # Show max 10 samples
                        break
        
        return True
    
    except Exception as e:
        print(f"Error during OCR extraction: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ocr.py <path_to_image>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    success = test_ocr_extraction(image_path)
    
    if success:
        print("\nOCR test completed successfully. If the extracted text looks correct, the system is working.")
    else:
        print("\nOCR test failed. Please check the error messages above.")
        
    print("\nIf the text extraction doesn't look correct, try:")
    print("1. Improving the image quality (better lighting, resolution, contrast)")
    print("2. Checking if Tesseract OCR is properly installed")
    print("3. Trying different image preprocessing techniques") 