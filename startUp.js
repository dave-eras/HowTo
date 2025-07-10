// ————————————————
// Storyline Web Object Startup
// ————————————————

// Configuration
const CONFIG = {
    webObjectURL: "6gBZPThFJBZ",
    maxRetries: 3,        // Maximum number of retry attempts
    retryDelay: 2000      // Delay between retries in milliseconds
};

// Define the web object folder path
const webObjectFolder = `./story_content/WebObjects/${CONFIG.webObjectURL}/`;
console.log("Web object folder path:", webObjectFolder);

// Global variables
window.player = GetPlayer();  // Make player globally available
window.contentData = null;    // Make content data globally available

let loadedCount = 0;
const numLibs = 4;   // content.json, image_handler.js, text_handler.js, audio_handler.js
let cachedXmlDoc = null;

// Function to check if all files are loaded
window.checkIfAllFilesLoaded = function() {
    console.log(`Files loaded: ${loadedCount}/${numLibs}`);
    if (loadedCount >= numLibs) {
        window.player.SetVar("javascriptLoadedState", 1);
        console.log("All files loaded successfully");
    }
};

// Function to load JavaScript files
window.loadJavaScriptFile = function(filename, callback) {
    const script = document.createElement('script');
    script.type = "text/javascript";
    script.src = filename;

    script.onload = () => {
        loadedCount++;
        console.log(`JavaScript file loaded: ${filename}`);
        if (callback) callback();
        checkIfAllFilesLoaded();
    };

    script.onerror = (error) => {
        console.error(`Error loading JavaScript file ${filename}:`, error);
        loadedCount++; // Increment count even on error to prevent infinite loading
        if (callback) callback();
        checkIfAllFilesLoaded();
    };

    document.head.appendChild(script);
};

// Function to load the content JSON file with retry logic
window.loadContentJSON = function(callback, retryCount = 0) {
    const url = webObjectFolder + 'content.json';
    console.log("Attempting to load content from:", url);
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.contentData = data;
            loadedCount++;
            console.log('Content data loaded successfully');
            if (callback) callback();
            checkIfAllFilesLoaded();
        })
        .catch(error => {
            console.error(`Error loading content data (attempt ${retryCount + 1}/${CONFIG.maxRetries}):`, error);
            
            if (retryCount < CONFIG.maxRetries - 1) {
                console.log(`Retrying in ${CONFIG.retryDelay/1000} seconds...`);
                setTimeout(() => {
                    window.loadContentJSON(callback, retryCount + 1);
                }, CONFIG.retryDelay);
            } else {
                console.error('Maximum retry attempts reached. Content data could not be loaded.');
                loadedCount++;
                if (callback) callback();
                checkIfAllFilesLoaded();
            }
        });
};

// Start the loading process
window.loadContentJSON(() => {
    window.loadJavaScriptFile(webObjectFolder + "image_handler.js", () => {
        window.loadJavaScriptFile(webObjectFolder + "text_handler.js", () => {
            window.loadJavaScriptFile(webObjectFolder + "audio_handler.js", () => {
                console.log("All files loaded in sequence");
            });
        });
    });
}); 