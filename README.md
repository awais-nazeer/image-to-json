# Bakery OCR Table Extraction Tool

**Author: Awais Nazeer (ZRR Gujjar)**  
**Email: awaisnazeer07@gmail.com**

A web application that allows bakery owners to upload images containing tables of bakery items and extract the data into a structured JSON format.

## Features

- Upload images containing tables of bakery data
- Automatically extract text and structure using OCR technology
- View extracted data in a nicely formatted table
- Get JSON output for integration with other systems
- Download the extracted data as JSON file

## Technology Stack

### Backend
- Python with Flask
- Tesseract OCR for text recognition
- OpenCV for image processing
- pandas for data manipulation

### Frontend
- React for the UI components
- Material-UI for styling
- Axios for API communication
- React-dropzone for file uploading

## Prerequisites

1. Python 3.7+ installed
2. Node.js 14+ installed
3. Tesseract OCR installed on your system
   - For Windows: Download and install from [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)
   - For macOS: Install via Homebrew `brew install tesseract`
   - For Linux: Install via apt `sudo apt install tesseract-ocr`

## Setup and Installation

### Backend Setup

1. Clone the repository
2. Create and activate a virtual environment (recommended)
   ```
   python -m venv venv
   source venv/bin/activate  # For Linux/macOS
   venv\Scripts\activate     # For Windows
   ```
3. Install the required packages
   ```
   pip install -r requirements.txt
   ```
4. If you're using Windows, uncomment and update the path to Tesseract in `app.py`:
   ```python
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```
   cd frontend
   ```
2. Install the required packages
   ```
   npm install
   ```

## Running the Application

### Start the Backend

From the root directory:
```
python app.py
```

The backend will start at http://localhost:5000

### Start the Frontend

From the frontend directory:
```
npm start
```

The frontend will start at http://localhost:3000

## Usage

1. Open the application in your browser
2. Upload an image containing a table of bakery items
3. Click "Extract Table Data"
4. View the extracted data in table form
5. Switch to the JSON view to see the structured data
6. Download the JSON file if needed

## Deployment

### Backend Deployment

The backend can be deployed to any server that supports Python. For production, consider using Gunicorn:

```
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Deployment

Build the frontend for production:

```
cd frontend
npm run build
```

The build files can be served by any web server or deployed to services like Netlify, Vercel, or GitHub Pages.

## Integrating into an Existing Website

To integrate this tool into your existing bakery website:

1. Deploy the backend as described above
2. Either:
   - Use the React components by importing them into your existing React project
   - Or embed the interface using an iframe
   - Or build a custom UI that calls the backend API directly

## License

MIT License 