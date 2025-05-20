# WhatsApp Scraper Demo

## Demo Script

1. **Introduction** (10 seconds)
   - "In this demo, I'll show how the WhatsApp scraper pipe works to extract messages from the WhatsApp desktop application."

2. **Setup** (10 seconds)
   - Show the WhatsApp scraper UI
   - Mention that WhatsApp needs to be installed and logged in

3. **Basic Usage** (30 seconds)
   - Enter a contact name 
   - Set number of messages to 30
   - Click "Start Scraping"
   - Show how it automatically opens WhatsApp, searches for the contact, and extracts messages

4. **Results and Search** (20 seconds)
   - Show the extracted messages
   - Demonstrate the search functionality to find specific messages
   - Toggle timestamp and sender visibility

5. **Export** (10 seconds)
   - Select export format (JSON)
   - Click export
   - Show the saved file briefly

6. **Conclusion** (10 seconds)
   - "This pipe demonstrates how screenpipe can be used to extract data from desktop applications like WhatsApp."
   - "The code is modular and can be adapted for other applications."

## Demo Preparation

1. Make sure WhatsApp Desktop is installed and logged in
2. Have a test conversation with enough messages
3. Start the pipe with `bun dev`
4. Open browser at http://localhost:3000

## Technical Notes

The demo showcases:
- UI automation with screenpipe's operator API
- Text extraction from application UI
- Content parsing and structuring 
- User-friendly interface for configuration
- Export functionality

Key components demonstrated:
- Opening WhatsApp application
- Navigating to a specific contact
- Extracting and parsing messages
- Exporting structured data 