// --- Configuration ---
const BACKEND_URL = 'https://backend-1-r4hc.onrender.com'; // <--- IMPORTANT: Replace with your Render backend URL!

// --- DOM Elements ---
const websitePreview = document.getElementById('websitePreview');
const bgColorPicker = document.getElementById('bgColor');
const applyBgColorBtn = document.getElementById('applyBgColor');
const addParagraphBtn = document.getElementById('addParagraph');
const addHeadingBtn = document.getElementById('addHeading');

const websiteTitleInput = document.getElementById('websiteTitle'); // NEW
const saveWebsiteBtn = document.getElementById('saveWebsiteBtn');   // NEW
const loadWebsitesBtn = document.getElementById('loadWebsitesBtn'); // NEW
const savedWebsitesList = document.getElementById('savedWebsitesList'); // NEW

let previewDocument; // This will hold the 'document' object of the iframe

// --- Helper Function to Initialize Iframe Content ---
function initializePreviewIframe() {
    // Get the document object inside the iframe
    previewDocument = websitePreview.contentDocument || websitePreview.contentWindow.document;

    // Write initial basic HTML into the iframe
    previewDocument.open();
    previewDocument.write(`
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
                    min-height: calc(100vh - 40px); /* Ensure body has height */
                }
                h1 { color: #333; margin-top: 0;}
                p { line-height: 1.6; }
                /* Styles for contenteditable elements */
                [contenteditable="true"] {
                    outline: 1px dashed #27ae60;
                    min-height: 1em; /* Ensure they are clickable even if empty */
                    padding: 5px;
                    margin: 10px 0;
                    cursor: text;
                }
                [contenteditable="true"]:focus {
                    outline: 2px solid #27ae60;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to Your New Website!</h1>
            <p>Use the tools on the left to start building. Click on elements to edit them!</p>
        </body>
        </html>
    `);
    previewDocument.close();

    // Set the color picker to match the initial background of the iframe body
    if (previewDocument.body) {
        // A more robust solution would convert computed RGB to HEX.
        // For simplicity, we'll assume it's white initially or handle a known default.
        bgColorPicker.value = '#ffffff';
    }
}


// --- Event Listener for Iframe Load (initial setup) ---
websitePreview.onload = initializePreviewIframe;

// --- Control Panel Functionality (Existing) ---

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
        newParagraph.textContent = "New paragraph content...";
        newParagraph.setAttribute('contenteditable', 'true'); // Make editable
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
        newHeading.setAttribute('contenteditable', 'true'); // Make editable
        previewDocument.body.appendChild(newHeading);
    } else {
        console.warn("Preview document or body not ready for adding heading.");
    }
});


// --- NEW: Backend Interaction Functions ---

/**
 * Extracts the full HTML and body's CSS from the iframe.
 * @returns {object} An object containing htmlContent and cssContent.
 */
function extractWebsiteContent() {
    if (!previewDocument) {
        console.error("Preview document not initialized.");
        return { htmlContent: '', cssContent: '' };
    }

    // Get the full HTML content of the iframe
    const fullHtml = previewDocument.documentElement.outerHTML;

    // Extract body's background color (as an example of dynamic CSS)
    // You'd need more sophisticated parsing for all styles
    const bodyStyle = previewDocument.body ? previewDocument.body.style.backgroundColor : '';

    // For a more complete CSS extraction, you'd iterate through stylesheets,
    // but that's very complex for a basic builder. For now, we'll just track body bg.
    const customCss = bodyStyle ? `body { background-color: ${bodyStyle}; }` : '';

    return { htmlContent: fullHtml, cssContent: customCss };
}

/**
 * Saves the current website in the builder to the backend.
 */
async function saveWebsite() {
    const title = websiteTitleInput.value.trim();
    const { htmlContent, cssContent } = extractWebsiteContent();

    if (!htmlContent) {
        alert("Cannot save an empty website!");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/websites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, htmlContent, cssContent }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
        }

        const result = await response.json();
        alert(`Website saved! ID: ${result.websiteId}`);
        console.log('Save successful:', result);
        websiteTitleInput.value = ''; // Clear title input
        loadWebsiteList(); // Refresh the list of saved websites
    } catch (error) {
        console.error('Error saving website:', error);
        alert('Failed to save website. Check console for details.');
    }
}

/**
 * Loads the list of saved websites from the backend and displays them.
 */
async function loadWebsiteList() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/websites`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const websites = await response.json();

        savedWebsitesList.innerHTML = ''; // Clear previous list
        if (websites.length === 0) {
            savedWebsitesList.innerHTML = '<li>No websites saved yet.</li>';
            return;
        }

        websites.forEach(site => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#'; // Use hash or prevent default to handle click
            link.textContent = site.title;
            link.dataset.websiteId = site.id; // Store ID in data attribute

            link.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent page refresh
                loadWebsite(site.id); // Load the specific website
            });

            li.appendChild(link);
            savedWebsitesList.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading website list:', error);
        savedWebsitesList.innerHTML = '<li>Error loading websites.</li>';
        alert('Failed to load website list. Check console for details.');
    }
}

/**
 * Loads a specific website's content from the backend into the iframe.
 * @param {string} websiteId The ID of the website to load.
 */
async function loadWebsite(websiteId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/websites/${websiteId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const websiteData = await response.json();

        if (previewDocument) {
            // Re-initialize the iframe with the loaded content
            previewDocument.open();
            previewDocument.write(websiteData.htmlContent);
            previewDocument.close();

            // Optionally, apply any custom CSS that might not be inlined in the HTML
            // This is a simple example; a real builder would integrate CSS more robustly.
            if (websiteData.cssContent) {
                const styleTag = previewDocument.createElement('style');
                styleTag.textContent = websiteData.cssContent;
                previewDocument.head.appendChild(styleTag);
            }

            // Update the title input with the loaded website's title
            websiteTitleInput.value = websiteData.title;

            alert(`Website "${websiteData.title}" loaded!`);
        } else {
            console.error("Preview document not ready to load website.");
        }

    } catch (error) {
        console.error('Error loading website content:', error);
        alert('Failed to load website content. Check console for details.');
    }
}


// --- NEW: Event Listeners for Save/Load Buttons ---
saveWebsiteBtn.addEventListener('click', saveWebsite);
loadWebsitesBtn.addEventListener('click', loadWebsiteList);

// Load the list of saved websites when the builder page first loads
// (This will run once the script loads, after the iframe is initialized)
document.addEventListener('DOMContentLoaded', () => {
    // Give the iframe a moment to initialize before trying to load list
    setTimeout(loadWebsiteList, 500); // Small delay
});
