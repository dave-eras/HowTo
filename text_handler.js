
/**
 * Alternative function with more flexible naming convention
 * Uses a hierarchical approach: section_element_language
 */
function loadTextContentFlexible() {
    try {
        // Get variables from Storyline using player.GetVar
        const level = player.GetVar("level");
        const contentId = player.GetVar("content_id");
        const targetLanguage = player.GetVar("targetLanguage");

        console.log('Loading text content (flexible) with:', { level, contentId, targetLanguage });

        // Use global content data
        if (!window.contentData) {
            console.error('Content data not available');
            return;
        }

        // Find the correct content section
        const contentSection = window.contentData.level[level];
        
        if (!contentSection) {
            console.error('Content section not found for level:', level);
            return;
        }

        // Recursive function to extract all text content
        function extractTextContent(obj, prefix = '') {
            const textVariables = {};

            Object.keys(obj).forEach(key => {
                const currentPath = prefix ? `${prefix}_${key}` : key;
                
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    // If it's an object with language keys (en, fr, etc.)
                    if (obj[key][targetLanguage] !== undefined) {
                        const variableName = currentPath;
                        textVariables[variableName] = obj[key][targetLanguage];
                    } else {
                        // Recursively process nested objects
                        const nestedVars = extractTextContent(obj[key], currentPath);
                        Object.assign(textVariables, nestedVars);
                    }
                }
            });

            return textVariables;
        }

        // Extract all text content
        const allTextVariables = extractTextContent(contentSection);

        // Set text variables in Storyline
        Object.keys(allTextVariables).forEach(variableName => {
            player.SetVar(variableName, allTextVariables[variableName]);
            console.log(`Set variable ${variableName}:`, allTextVariables[variableName]);
        });

        console.log('Text content loaded successfully (flexible mode)');
        console.log('Variables set:', Object.keys(allTextVariables));

    } catch (error) {
        console.error('Error in loadTextContentFlexible:', error);
    }
}

// Make functions available globally for Storyline

window.loadTextContentFlexible = loadTextContentFlexible;
