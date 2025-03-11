"""
=================================================================
Author: Awais Nazeer (ZRR Gujjar)
Email: awaisnazeer07@gmail.com
=================================================================
Bakery OCR System - Extract tabular data from bakery item images
=================================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
import pytesseract
from PIL import Image
import pandas as pd
import json
import re
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# For Windows, you need to specify the path to the Tesseract executable
# Uncomment and update this path according to your Tesseract installation:
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    """Preprocess the image to improve OCR accuracy"""
    # Read the image
    img = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply threshold to get image with only black and white
    _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    
    # Apply dilation to help with connected components
    kernel = np.ones((1, 1), np.uint8)
    dilated = cv2.dilate(binary, kernel, iterations=1)
    
    return dilated

def detect_table(preprocessed_img):
    """Detect table structure in the image"""
    # Find horizontal lines
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    horizontal_lines = cv2.erode(preprocessed_img, horizontal_kernel, iterations=3)
    horizontal_lines = cv2.dilate(horizontal_lines, horizontal_kernel, iterations=3)
    
    # Find vertical lines
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
    vertical_lines = cv2.erode(preprocessed_img, vertical_kernel, iterations=3)
    vertical_lines = cv2.dilate(vertical_lines, vertical_kernel, iterations=3)
    
    # Combine horizontal and vertical lines
    table_mask = cv2.bitwise_or(horizontal_lines, vertical_lines)
    
    # Find contours
    contours, _ = cv2.findContours(~table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Sort contours by area
    contours = sorted(contours, key=cv2.contourArea, reverse=True)
    
    # Get bounding boxes for cells
    cells = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 30 and h > 30:  # Filter out small contours
            cells.append((x, y, w, h))
    
    return cells

def extract_table_content(image_path):
    """Extract content from a table in an image"""
    # Preprocess the image
    preprocessed = preprocess_image(image_path)
    
    # Convert to PIL Image for tesseract
    pil_img = Image.fromarray(preprocessed)
    
    # Extract text using pytesseract
    extracted_text = pytesseract.image_to_string(pil_img)
    
    # Split text into lines
    lines = [line for line in extracted_text.split('\n') if line.strip()]
    
    # Parse the table structure
    table_data = []
    header = None
    
    for line in lines:
        # Split by spaces or tabs
        row = [cell.strip() for cell in line.split('  ') if cell.strip()]
        if not row:
            continue
        
        # First non-empty row is treated as header
        if header is None:
            header = row
            continue
        
        # Process data rows
        row_data = {}
        for i, value in enumerate(row):
            if i < len(header):
                row_data[header[i]] = value
        
        if row_data:
            table_data.append(row_data)
    
    return {'header': header, 'data': table_data}

def parse_advanced_table(image_path):
    """More advanced table parsing using layout analysis"""
    # Using pytesseract's image_to_data to get bounding box information
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    # Get detailed data including bounding boxes
    data = pytesseract.image_to_data(binary, output_type=pytesseract.Output.DICT)
    
    # Extract text, coordinates, and confidence
    text_data = []
    n_boxes = len(data['text'])
    for i in range(n_boxes):
        if int(data['conf'][i]) > 60:  # Only consider text with confidence > 60%
            text = data['text'][i]
            if text.strip():
                x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
                text_data.append({
                    'text': text,
                    'x': x,
                    'y': y,
                    'w': w,
                    'h': h,
                    'line_num': data['line_num'][i]
                })
    
    # Group by line
    lines = {}
    for item in text_data:
        line_num = item['line_num']
        if line_num not in lines:
            lines[line_num] = []
        lines[line_num].append(item)
    
    # Sort each line by x-coordinate
    for line_num in lines:
        lines[line_num] = sorted(lines[line_num], key=lambda x: x['x'])
    
    # Extract header and data rows
    sorted_line_nums = sorted(lines.keys())
    
    if not sorted_line_nums:
        return {'header': [], 'data': []}
    
    # First line is assumed to be the header
    header_line = lines[sorted_line_nums[0]]
    header = [item['text'] for item in header_line]
    
    # Rest are data rows
    data_rows = []
    for line_num in sorted_line_nums[1:]:
        row_items = lines[line_num]
        # Map to header columns based on position
        row_data = {}
        
        # Try to map columns based on x-position relative to header
        for item in row_items:
            # Find the header column this item belongs to
            best_header_idx = 0
            min_distance = float('inf')
            
            for i, h_item in enumerate(header_line):
                # Compare x positions
                distance = abs(item['x'] - h_item['x'])
                if distance < min_distance:
                    min_distance = distance
                    best_header_idx = i
            
            if best_header_idx < len(header):
                header_name = header[best_header_idx]
                # Append to existing value if the column already has content
                if header_name in row_data:
                    row_data[header_name] += " " + item['text']
                else:
                    row_data[header_name] = item['text']
        
        if row_data:
            data_rows.append(row_data)
    
    return {'header': header, 'data': data_rows}

def extract_general_text(image_path):
    """Extract and structure general text from an image (non-tabular)"""
    # Preprocess the image
    preprocessed = preprocess_image(image_path)
    
    # Convert to PIL Image for tesseract
    pil_img = Image.fromarray(preprocessed)
    
    # Extract text using pytesseract
    extracted_text = pytesseract.image_to_string(pil_img)
    
    # Split text into lines
    lines = [line.strip() for line in extracted_text.split('\n') if line.strip()]
    
    # Try to detect if it's a list of items with prices
    items_data = []
    for line in lines:
        # Look for patterns like "Item name - $price" or "Item name: $price"
        price_match = re.search(r'([^\$]+)[\s-:]+\$?\s*(\d+\.?\d*)', line)
        if price_match:
            item_name = price_match.group(1).strip()
            price = price_match.group(2).strip()
            items_data.append({
                "Item": item_name,
                "Price": "$" + price if not price.startswith("$") else price
            })
        else:
            # Check if it might be a key-value pair
            kv_match = re.search(r'([^:]+):\s*(.+)', line)
            if kv_match:
                key = kv_match.group(1).strip()
                value = kv_match.group(2).strip()
                items_data.append({
                    "Property": key,
                    "Value": value
                })
    
    # If we found structured data
    if items_data:
        # Find all unique keys
        all_keys = set()
        for item in items_data:
            all_keys.update(item.keys())
        
        header = list(all_keys)
        
        # Make sure all items have all the keys
        for item in items_data:
            for key in header:
                if key not in item:
                    item[key] = ""
        
        return {'header': header, 'data': items_data}
    
    # If we couldn't find structured data, return lines as raw text
    return {
        'header': ['Line Number', 'Text'],
        'data': [{'Line Number': i+1, 'Text': line} for i, line in enumerate(lines)]
    }

def auto_detect_format(image_path):
    """Automatically detect if the image contains a table or general text"""
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Look for table markers - horizontal and vertical lines
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    
    # Detect straight lines using Hough transform
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=100, maxLineGap=10)
    
    # If we detected many lines, it's likely a table
    if lines is not None and len(lines) > 10:
        # Count horizontal vs vertical lines
        horizontal_count = 0
        vertical_count = 0
        
        for line in lines:
            x1, y1, x2, y2 = line[0]
            
            # Check if horizontal or vertical
            if abs(y2 - y1) < 10:  # Approximately horizontal
                horizontal_count += 1
            elif abs(x2 - x1) < 10:  # Approximately vertical
                vertical_count += 1
        
        # If we have both horizontal and vertical lines, it's likely a table
        if horizontal_count > 3 and vertical_count > 3:
            try:
                return parse_advanced_table(image_path)
            except Exception:
                return extract_table_content(image_path)
    
    # If not detected as a table, try general text extraction
    return extract_general_text(image_path)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    mode = request.form.get('mode', 'auto')  # Get processing mode
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            result = None
            
            # Process based on selected mode
            if mode == 'table':
                # Try advanced table parsing first
                result = parse_advanced_table(filepath)
                
                # If we didn't get much data, try the simpler method
                if not result['data'] or len(result['data']) < 2:
                    result = extract_table_content(filepath)
            
            elif mode == 'text':
                # Extract general text
                result = extract_general_text(filepath)
            
            else:  # auto mode
                result = auto_detect_format(filepath)
            
            return jsonify({
                'success': True,
                'data': result
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/')
def index():
    return "Bakery OCR API is running!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 