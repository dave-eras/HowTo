// Image Handler for Storyline Project
// This file contains functions to handle image injection from AWS

/**
 * Function to handle image placement based on current content variables
 */
window.handleImagePlacement = function() {
    try {
        // Get the current content variables from Storyline
        const topic = window.player.GetVar("topic");
        const subtopic = window.player.GetVar("subtopic");
        const level = window.player.GetVar("level");
        const contentId = window.player.GetVar("content_id");
        
        console.log('Content variables from Storyline:', { topic, subtopic, level, contentId });
        
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
        
        // Get the image URL from the content
        const imageUrl = contentSection.image;
        
        if (imageUrl) {
            console.log('Image URL found:', imageUrl);
            
            // Find the image container
            const imageContainer = document.querySelector('[data-acc-text="imageFrame"]');
            console.log('Image container found:', imageContainer);
            
            if (imageContainer) {
                // Log the container's HTML structure
                console.log('Container HTML:', imageContainer.outerHTML);
                
                // Create or update the image element
                let imgElement = imageContainer.querySelector('img');
                console.log('Existing img element:', imgElement);
                
                if (!imgElement) {
                    console.log('Creating new img element');
                    imgElement = document.createElement('img');
                    imageContainer.appendChild(imgElement);
                }
                
                // Set the image source and styling
                imgElement.src = imageUrl;
                imgElement.alt = `Content image for ${level} - ${contentId}`;
                
                // Apply styling to ensure image is visible and properly sized
                imgElement.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    z-index: 10;
                `;
                
                // Ensure the container has proper positioning
                imageContainer.style.position = 'relative';
                
                // Hide the SVG background if it exists
                const svgElement = imageContainer.querySelector('svg');
                if (svgElement) {
                    svgElement.style.display = 'none';
                }
                
                console.log('Image updated successfully:', imageUrl);
                console.log('Final img element:', imgElement.outerHTML);
                
                // Force a reflow to ensure the image is displayed
                imgElement.style.display = 'none';
                imgElement.offsetHeight; // Force reflow
                imgElement.style.display = '';
                
                                } else {
                        console.error('Image container not found. Available elements with data-acc-text:', 
                            Array.from(document.querySelectorAll('[data-acc-text]')).map(el => ({
                                dataAccText: el.getAttribute('data-acc-text')
                            })));
                    }
        } else {
            console.error(`No image URL found for content:`, { topic, subtopic, level, contentId });
        }
            
    } catch (error) {
        console.error('Error in handleImagePlacement:', error);
    }
}

/**
 * Function to inject image into imageFrame shape
 * Call this function every time the page opens
 */
function injectImage() {
    try {
        // Find the shape with accessibility text "imageFrame"
        const imageFrame = document.querySelector('[data-acc-text="imageFrame"]');
        
        if (!imageFrame) {
            console.error('ImageFrame element not found');
            return;
        }

        // Clear existing content
        imageFrame.innerHTML = '';

        // Create image container HTML
        const imageContainerHTML = `
            <div id="imageContainer" style="
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8f9fa;
                border-radius: 8px;
                overflow: hidden;
            ">
                <div id="imagePlaceholder" style="
                    color: #6c757d;
                    font-size: 14px;
                    text-align: center;
                    padding: 20px;
                ">Loading image...</div>
            </div>
        `;

        // Inject the image container
        imageFrame.innerHTML = imageContainerHTML;

        // Load the image
        window.handleImagePlacement();

        console.log('Image container injected successfully');
    } catch (error) {
        console.error('Error injecting image container:', error);
    }
}

// Make functions available globally for Storyline
window.injectImage = injectImage;
