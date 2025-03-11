# Bakery OCR System - Images Guide

**Author: Awais Nazeer (ZRR Gujjar)**  
**Email: awaisnazeer07@gmail.com**

## Required Images

For the Bakery OCR application to look its best, you'll need to provide the following images:

### 1. Logo Files

#### Location: `/frontend/public/`

- **favicon.ico** - 32x32 pixels, browser tab icon
- **logo192.png** - 192x192 pixels, app icon for medium displays
- **logo512.png** - 512x512 pixels, app icon for high-resolution displays

The logos should feature a bakery theme with the primary brown color (#8d6e63).

### 2. UI Design Assets

#### Location: `/frontend/src/assets/`

- **bakery-hero.jpg** - 1200x400 pixels, hero image for the header
- **cupcake-pattern.png** - 400x400 pixels, subtle repeating pattern for backgrounds

### 3. Sample Images for Testing

#### Location: `/sample_images/`

- **bakery-table-1.jpg** - Clean table of bakery items
- **bakery-table-2.jpg** - Complex table with product codes
- **bakery-menu.jpg** - Menu-style layout
- **bakery-inventory.jpg** - Inventory sheet
- **bakery-price-list.jpg** - Simple price list

## Image Creation Guidelines

### Logo Design

1. Use Adobe Illustrator, Figma or other vector tools for best results
2. Start with a simple bakery icon (cupcake, cake, bread, etc.)
3. Use the brown color palette (#8d6e63 as primary color)
4. Export in multiple sizes, ensuring clean edges at small sizes
5. For favicon.ico, use a tool like [favicon.io](https://favicon.io/)

### UI Assets

1. For the hero image, choose a high-quality bakery photo
2. Apply a slight dark overlay for text readability
3. For the pattern, create a subtle repeating design
4. Keep file sizes optimized for web use

### Sample Images

1. Create sample tables in Excel, Word, or Google Docs
2. Fill with realistic bakery items, prices, and categories
3. Take clear photos or screenshots
4. Include a mix of structured tables and free-form text
5. Ensure good lighting and contrast for OCR accuracy

## Testing OCR with Images

1. Start the application as per the main README
2. Upload sample images one by one
3. Try different processing modes:
   - "Auto Detect" for automatic format detection
   - "Table Format" for strictly tabular data
   - "General Text" for menus and price lists
4. Compare the JSON output with the original data
5. Adjust image quality if extraction accuracy is low

## Troubleshooting

If OCR results are poor:
- Increase image resolution
- Improve lighting and contrast
- Ensure text is clearly visible and not blurry
- Try preprocessing images (increasing contrast, removing noise)
- Check that Tesseract OCR is properly installed

---

These images will greatly enhance both the aesthetics and functionality of your Bakery OCR application. 