const websitePreview = document.getElementById('websitePreview');
const bgColorPicker = document.getElementById('bgColor');
const applyBgColorBtn = document.getElementById('applyBgColor');
const addParagraphBtn = document.getElementById('addParagraph');
const addHeadingBtn = document.getElementById('addHeading');

let previewDocument; // This will hold the 'document' object of the iframe

// --- Initialize the iframe content ---
websitePreview.onload = function() {
    // Get the document object inside the iframe
    previewDocument = websitePreview.contentDocument || websitePreview.contentWindow.document;

    // Write initial basic HTML into the iframe
    // This creates a clean slate for the user's website
    previewDocument.open();
    previewDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Your Custom Website</title>
            <style>
                /* Basic default styles for the preview */
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #ffffff; /* Default white background */
                    color: #333;
                }
                h1 { color: #333; }
                p { line-height: 1.6; }
            </style>
        </head>
        <body>
            <h1>Welcome to Your New Website!</h1>
            <p>Use the tools on the left to start building.</p>
        </body>
        </html>
    `);
    previewDocument.close();

    // Set the color picker to match the initial background of the iframe body
    if (previewDocument.body) {
        // Get the computed style to handle default browser backgrounds
        const initialBgColor = window.getComputedStyle(previewDocument.body).backgroundColor;
        // Convert to hex if necessary, or just use it. For simplicity, we'll assume it's white initially.
        // A more robust solution would convert RGB to HEX.
        // For now, if the initial color is white, ensure picker shows white.
        if (initialBgColor === 'rgb(255, 255, 255)' || initialBgColor === '#ffffff') {
            bgColorPicker.value = '#ffffff';
        }
    }
};

// --- Control Panel Functionality ---

// 1. Change Background Color
applyBgColorBtn.addEventListener('click', () => {
    if (previewDocument && previewDocument.body) {
        previewDocument.body.style.backgroundColor = bgColorPicker.value;
    } else {
        console.warn("Preview document or body not ready for background color change.");
    }
});

// 2. Add Paragraph
addParagraphBtn.addEventListener('click', () => {
    if (previewDocument && previewDocument.body) {
        const newParagraph = previewDocument.createElement('p');
        newParagraph.textContent = "This is a new paragraph. Click to edit me!";
        // Make paragraph editable directly in preview (basic)
        newParagraph.setAttribute('contenteditable', 'true');
        newParagraph.style.border = '1px dashed #ccc'; // Visual cue for editable
        newParagraph.style.padding = '5px';
        newParagraph.style.margin = '10px 0';

        previewDocument.body.appendChild(newParagraph);
    } else {
        console.warn("Preview document or body not ready for adding paragraph.");
    }
});

// 3. Add Heading (H1)
addHeadingBtn.addEventListener('click', () => {
    if (previewDocument && previewDocument.body) {
        const newHeading = previewDocument.createElement('h1');
        newHeading.textContent = "New Heading Title";
        // Make heading editable directly in preview (basic)
        newHeading.setAttribute('contenteditable', 'true');
        newHeading.style.border = '1px dashed #ccc'; // Visual cue for editable
        newHeading.style.padding = '5px';
        newHeading.style.margin = '10px 0';

        previewDocument.body.appendChild(newHeading);
    } else {
        console.warn("Preview document or body not ready for adding heading.");
    }
});

// Optional: Add a simple way to clear the preview for testing
// (You'd add a button for this in your HTML)
function clearPreview() {
    if (websitePreview) {
        websitePreview.contentDocument.body.innerHTML = '';
        // Re-initialize to default welcome message
        websitePreview.contentDocument.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Your Custom Website</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #ffffff;
                        color: #333;
                    }
                    h1 { color: #333; }
                    p { line-height: 1.6; }
                </style>
            </head>
            <body>
                <h1>Welcome to Your New Website!</h1>
                <p>Use the tools on the left to start building.</p>
            </body>
            </html>
        `);
        websitePreview.contentDocument.close();
    }
}
