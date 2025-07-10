// Audio Handler for Storyline Project
// This file contains functions to handle audio playback in Storyline

// Global variables
let currentAudio = null;
let isAudioPlaying = "false";
let subtitlesEnabled = false;
let currentSubtitles = [];
let currentSubtitleIndex = 0;

/**
 * Injects an audio player into the imageFrame shape
 * Call this function every time the page opens
 */
function injectAudioPlayer() {
    try {
        // Find the shape with accessibility text "audioFrame"
        const audioFrame = document.querySelector('[data-acc-text="audioFrame"]');
        
        if (!audioFrame) {
            console.error('AudioFrame element not found');
            return;
        }

        // Clear existing content
        audioFrame.innerHTML = '';

        // Create audio player HTML
        const audioPlayerHTML = `
            <div id="audioPlayer" style="
                width: 100%;
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                background: #f5f5f5;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                                <div style="
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                ">
                    <button id="playButton" 
                        type="button"
                        aria-label="Play audio"
                        role="button"
                        tabindex="0"
 
                        style="
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                            border: none;
                            background: #007bff;
                            color: white;
                            font-size: 18px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: background 0.3s;
                            pointer-events: auto;
                            z-index: 1000;
                        ">
                        ▶
                    </button>
                    <button id="ccButton" 
                        type="button"
                        aria-label="Toggle closed captions"
                        role="button"
                        tabindex="0"

                        style="
                            width: 40px;
                            height: 40px;
                            border-radius: 4px;
                            border: 1px solid #ddd;
                            background: #f8f9fa;
                            color: #666;
                            font-size: 12px;
                            font-weight: bold;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.3s;
                            pointer-events: auto;
                            z-index: 1000;
                        ">
                        CC
                    </button>
                    <div style="flex: 1;">
                        <div id="audioInfo" style="
                            font-size: 14px;
                            color: #666;
                            margin-bottom: 5px;
                        ">Ready to play</div>
                        <div id="timeDisplay" style="
                            font-size: 12px;
                            color: #999;
                        ">0:00 / 0:00</div>
                    </div>
                </div>
                <div id="subtitleContainer" style="
                    display: none;
                    margin-top: 10px;
                    padding: 10px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    border-radius: 4px;
                    font-size: 14px;
                    text-align: center;
                    min-height: 20px;
                "></div>
                <div style="
                    width: 100%;
                    height: 6px;
                    background: #ddd;
                    border-radius: 3px;
                    cursor: pointer;
                    position: relative;
                " onclick="seekAudio(event)">
                    <div id="progressBar" style="
                        width: 0%;
                        height: 100%;
                        background: #007bff;
                        border-radius: 3px;
                        transition: width 0.1s;
                    "></div>
                </div>
                <audio id="audioElement" preload="metadata"></audio>
            </div>
        `;

        // Inject the audio player
        audioFrame.innerHTML = audioPlayerHTML;

        // Set up audio element event listeners
        const audioElement = document.getElementById('audioElement');
        const playButton = document.getElementById('playButton');
        const ccButton = document.getElementById('ccButton');
        const progressBar = document.getElementById('progressBar');
        const timeDisplay = document.getElementById('timeDisplay');

        // Add click event listener to play button
        playButton.addEventListener('click', function(event) {
            console.log('Play button clicked!');
            event.preventDefault();
            event.stopPropagation();
            toggleAudio();
        });

        // Add keyboard support for play button
        playButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                console.log('Play button activated via keyboard!');
                toggleAudio();
            }
        });

        // Add click event listener to CC button
        ccButton.addEventListener('click', function(event) {
            console.log('CC button clicked!');
            event.preventDefault();
            event.stopPropagation();
            toggleSubtitles();
        });

        // Add keyboard support for CC button
        ccButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                console.log('CC button activated via keyboard!');
                toggleSubtitles();
            }
        });

        // Debug: Check if button is properly set up
        console.log('Play button element:', playButton);
        console.log('Play button clickable:', playButton.offsetWidth > 0 && playButton.offsetHeight > 0);
        console.log('Play button style:', window.getComputedStyle(playButton));

        console.log('CC button element:', ccButton);
        console.log('CC button clickable:', ccButton.offsetWidth > 0 && ccButton.offsetHeight > 0);
        console.log('CC button style:', window.getComputedStyle(ccButton));

        audioElement.addEventListener('loadedmetadata', function() {
            updateTimeDisplay();
        });

        audioElement.addEventListener('timeupdate', function() {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = progress + '%';
            updateTimeDisplay();
            updateSubtitles();
        });

        audioElement.addEventListener('ended', function() {
            console.log('Audio ended, resetting state');
            isAudioPlaying = "false";
            playButton.innerHTML = '▶';
            playButton.style.background = '#007bff';
            const audioInfo = document.getElementById('audioInfo');
            if (audioInfo) {
                audioInfo.textContent = 'Ready to play';
            }
        });

        console.log('Audio player injected successfully');
    } catch (error) {
        console.error('Error injecting audio player:', error);
    }
}

/**
 * Toggles audio playback
 * Call this function when the play button is clicked
 */
function toggleAudio() {
    console.log('toggleAudio called, isAudioPlaying:', isAudioPlaying);
    
    // Get the actual audio element to check its real state
    const audioElement = document.getElementById('audioElement');
    if (audioElement) {
        console.log('Audio element paused:', audioElement.paused);
        console.log('Audio element ended:', audioElement.ended);
    }
    
    if (isAudioPlaying === "false") {
        console.log('Starting audio playback');
        playAudio();
    } else {
        console.log('Pausing audio playback');
        pauseAudio();
    }
}

/**
 * Plays audio with the correct URL based on Storyline variables
 * Sets isAudioPlaying to "true"
 */
function playAudio() {
    try {
        // Get variables from Storyline using player.GetVar
        const level = player.GetVar("level");
        const contentId = player.GetVar("content_id");
        const targetLanguage = player.GetVar("targetLanguage");

        console.log('Playing audio with:', { level, contentId, targetLanguage });

        // Use global content data
        if (!window.contentData) {
            console.error('Content data not available');
            return;
        }

        // Find the correct audio URL
        const audioUrl = window.contentData.level[level]?.overview?.context?.audio?.[targetLanguage];
        
        if (!audioUrl) {
            console.error('Audio URL not found for:', { level, contentId, targetLanguage });
            return;
        }

        const audioElement = document.getElementById('audioElement');
        const playButton = document.getElementById('playButton');
        const audioInfo = document.getElementById('audioInfo');

        // Only set the audio source if it's different or if we're starting fresh
        if (audioElement.src !== audioUrl || audioElement.readyState === 0) {
            audioElement.src = audioUrl;
        }
        
        // Play the audio
        audioElement.play().then(() => {
            isAudioPlaying = "true";
            playButton.innerHTML = '⏸';
            playButton.style.background = '#dc3545';
            audioInfo.textContent = `Playing (${targetLanguage.toUpperCase()})`;
        }).catch(error => {
            console.error('Error playing audio:', error);
            isAudioPlaying = "false";
        });

    } catch (error) {
        console.error('Error in playAudio:', error);
    }
}

/**
 * Pauses the currently playing audio
 * Sets isAudioPlaying to "false"
 */
function pauseAudio() {
    try {
        const audioElement = document.getElementById('audioElement');
        const playButton = document.getElementById('playButton');
        const audioInfo = document.getElementById('audioInfo');

        audioElement.pause();
        isAudioPlaying = "false";
        playButton.innerHTML = '▶';
        playButton.style.background = '#007bff';
        audioInfo.textContent = 'Paused';
    } catch (error) {
        console.error('Error pausing audio:', error);
    }
}

/**
 * Seeks to a specific position in the audio
 */
function seekAudio(event) {
    try {
        const audioElement = document.getElementById('audioElement');
        const progressContainer = event.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;
        const seekTime = (clickX / width) * audioElement.duration;
        
        audioElement.currentTime = seekTime;
    } catch (error) {
        console.error('Error seeking audio:', error);
    }
}

/**
 * Updates the time display
 */
function updateTimeDisplay() {
    try {
        const audioElement = document.getElementById('audioElement');
        const timeDisplay = document.getElementById('timeDisplay');
        
        if (audioElement.duration) {
            const currentTime = formatTime(audioElement.currentTime);
            const totalTime = formatTime(audioElement.duration);
            timeDisplay.textContent = `${currentTime} / ${totalTime}`;
        }
    } catch (error) {
        console.error('Error updating time display:', error);
    }
}

/**
 * Formats time in MM:SS format
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Toggles subtitle display
 */
function toggleSubtitles() {
    subtitlesEnabled = !subtitlesEnabled;
    const ccButton = document.getElementById('ccButton');
    const subtitleContainer = document.getElementById('subtitleContainer');
    
    if (subtitlesEnabled) {
        ccButton.style.background = '#007bff';
        ccButton.style.color = 'white';
        subtitleContainer.style.display = 'block';
        loadSubtitles();
    } else {
        ccButton.style.background = '#f8f9fa';
        ccButton.style.color = '#666';
        subtitleContainer.style.display = 'none';
        subtitleContainer.textContent = '';
    }
}

/**
 * Loads subtitles for the current audio
 */
function loadSubtitles() {
    try {
        const level = player.GetVar("level");
        const targetLanguage = player.GetVar("targetLanguage");
        
        if (!window.contentData) {
            console.error('Content data not available');
            return;
        }
        
        const subtitleUrl = window.contentData.level[level]?.overview?.context?.subtitles?.[targetLanguage];
        
        if (!subtitleUrl) {
            console.log('No subtitles available for:', { level, targetLanguage });
            return;
        }
        
        console.log('Loading subtitles from:', subtitleUrl);
        
        fetch(subtitleUrl)
            .then(response => response.text())
            .then(srtContent => {
                currentSubtitles = parseSRT(srtContent);
                currentSubtitleIndex = 0;
                console.log('Subtitles loaded:', currentSubtitles.length, 'entries');
            })
            .catch(error => {
                console.error('Error loading subtitles:', error);
            });
            
    } catch (error) {
        console.error('Error in loadSubtitles:', error);
    }
}

/**
 * Parses SRT content into subtitle objects
 */
function parseSRT(srtContent) {
    const subtitles = [];
    console.log('Raw SRT content:', srtContent);
    
    // Split by double newlines to get subtitle blocks
    const blocks = srtContent.trim().split(/\r?\n\r?\n/);
    console.log('SRT blocks found:', blocks.length);
    
    blocks.forEach((block, index) => {
        console.log(`Processing block ${index}:`, block);
        const lines = block.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length >= 3) {
            // First line should be subtitle number (ignore)
            // Second line should be timestamp
            const timeLine = lines[1];
            // Remaining lines are the subtitle text
            const text = lines.slice(2).join(' ').trim();
            
            console.log('Time line:', timeLine);
            console.log('Text:', text);
            
            const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
            if (timeMatch) {
                const startTime = parseTime(timeMatch[1]);
                const endTime = parseTime(timeMatch[2]);
                
                console.log(`Parsed times: ${startTime}s - ${endTime}s`);
                
                subtitles.push({
                    start: startTime,
                    end: endTime,
                    text: text
                });
            } else {
                console.log('No time match found for line:', timeLine);
            }
        } else {
            console.log('Block too short:', lines);
        }
    });
    
    console.log('Final parsed subtitles:', subtitles);
    return subtitles;
}

/**
 * Parses SRT time format (HH:MM:SS,mmm) to seconds
 */
function parseTime(timeString) {
    const parts = timeString.split(',');
    const timeParts = parts[0].split(':');
    const seconds = parseInt(timeParts[0]) * 3600 + 
                   parseInt(timeParts[1]) * 60 + 
                   parseInt(timeParts[2]) + 
                   parseInt(parts[1]) / 1000;
    return seconds;
}

/**
 * Updates subtitle display based on current audio time
 */
function updateSubtitles() {
    if (!subtitlesEnabled || currentSubtitles.length === 0) {
        return;
    }
    
    const audioElement = document.getElementById('audioElement');
    const subtitleContainer = document.getElementById('subtitleContainer');
    const currentTime = audioElement.currentTime;
    
    console.log('Updating subtitles - current time:', currentTime, 'subtitles:', currentSubtitles);
    
    // Find the current subtitle
    let currentSubtitle = null;
    for (let i = 0; i < currentSubtitles.length; i++) {
        const subtitle = currentSubtitles[i];
        console.log('Checking subtitle:', subtitle, 'time range:', subtitle.start, '-', subtitle.end);
        if (currentTime >= subtitle.start && currentTime <= subtitle.end) {
            currentSubtitle = subtitle;
            console.log('Found matching subtitle:', currentSubtitle);
            break;
        }
    }
    
    // Update subtitle display
    if (currentSubtitle) {
        subtitleContainer.textContent = currentSubtitle.text;
        console.log('Displaying subtitle:', currentSubtitle.text);
    } else {
        subtitleContainer.textContent = '';
        console.log('No subtitle to display');
    }
}

// Make functions available globally for Storyline
window.injectAudioPlayer = injectAudioPlayer;
window.playAudio = playAudio;
window.pauseAudio = pauseAudio;
window.toggleAudio = toggleAudio;
window.isAudioPlaying = isAudioPlaying;
window.toggleSubtitles = toggleSubtitles;
