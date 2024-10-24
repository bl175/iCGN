# iCGN (Intelligent Cancer Genetics Navigator)

## Overview

iCGN is a web-based application designed to create and analyze cancer pedigrees. It provides an interactive interface for building family trees with a focus on cancer history, and offers AI-powered insights for genetic counseling.

## Features

- Interactive pedigree creation
- Detailed family member information input
- AI-assisted genetic counseling suggestions
- PDF export of pedigrees
- CSV import/export for data persistence
- Zoom and pan functionality for large pedigrees
- Free-text annotations on the pedigree

## Technology Stack

- React.js
- OpenAI API for AI-assisted counseling
- jsPDF for PDF generation

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/AIDI-KHCC/iCancerGenomicsNavigator
   cd iCancerGenomicsNavigator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

1. **Adding Family Members**: Click on the "Add Parent", "Add Child", or "Add Spouse" buttons to add new members to the pedigree.

2. **Editing Information**: Fill out the form fields for each family member with their relevant information.

3. **Pedigree Visualization**: The pedigree is automatically updated and displayed on the canvas as you add or edit family members.

4. **AI Assistance**: Click the "AI" button to get AI-generated genetic counseling suggestions based on the current pedigree.

5. **Exporting**: Use the "PDF" button to save the pedigree as a PDF, or "CSV" to export the data in CSV format.

6. **Importing**: Use the "Load" button to import a previously saved CSV file.

## Contributing

Contributions to iCGN are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- King Hussein Cancer Center for their support and inspiration for this project.
- OpenAI for providing the AI capabilities.

** Areas for improvement: **
- Control + z should undo the last action.
- Control + y should redo the last action.
- The AI should be able read free text input for genetics and cancers and build the pedigree accordingly.
- Reight side of screen should not be scrollable
- Export and import to csv are not working proberly, possibly due to the way IDs are being handled.
- UI needs to be improved.
- Multiple spouses for a single person are not being handled properly.