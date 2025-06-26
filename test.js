/**
 * content.js
 * * This script is injected into YouTube Shorts pages.
 * It periodically checks if the active video is within its last 200ms and simulates
 * a down arrow key press to navigate to the next video when the current one is finished.
 */

// A variable to hold the setInterval ID, allowing us to start and stop it.
let autoscrollInterval = null;
// A variable to keep track of the SRC of the last video we scrolled from.
// This prevents re-triggering on the same video, even if YouTube reuses the player element.
let lastScrolledVideoSrc = null;

/**
 * The core function that checks the active Short's video time and scrolls if it's near the end.
 */
function checkVideoAndScroll() {
    // Find the currently active short. YouTube uses the 'is-active' attribute for this.
    const activeShort = document.querySelector('ytd-reel-video-renderer[is-active]');

    // Proceed only if we found an active short.
    if (!activeShort) {
        return;
    }

    const video = activeShort.querySelector('video');

    // Proceed only if the short contains a video with a valid source.
    if (!video || !video.src) {
        return;
    }

    // Check if the video has a valid duration and is currently playing.
    const isVideoPlaying = video.currentTime > 0 && !video.paused && !video.ended;
    const hasDuration = !isNaN(video.duration);

    if (isVideoPlaying && hasDuration) {
        // --- MODIFIED TRIGGER CONDITION ---
        // Check if the remaining time is less than 200ms (0.2 seconds).
        const isNearEnd = (video.duration - video.currentTime) < 0.2;
        
        // The crucial check is comparing the current video's SRC to the last one we scrolled from.
        if (isNearEnd && video.src !== lastScrolledVideoSrc) {
            
            console.log("AUTOSCROLL: Video is in last 200ms. Simulating ArrowDown key press.");
            
            // Mark this video's SRC as processed to prevent our interval from immediately re-triggering.
            lastScrolledVideoSrc = video.src;

            // This is the most robust method. We programmatically create and dispatch
            // a keyboard event for the "ArrowDown" key. YouTube's own keyboard shortcuts
            // will catch this event and trigger the navigation to the next Short.
            document.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "ArrowDown",
                    code: "ArrowDown",
                    keyCode: 40,
                    which: 40,
                    bubbles: true,
                    cancelable: true
                })
            );
            
            console.log("AUTOSCROLL: 'ArrowDown' keydown event dispatched for video:", video.src);
        }
    }
}


/**
 * Starts the autoscrolling functionality by creating an interval.
 */
function startAutoscroll() {
    if (autoscrollInterval) return; // Prevent multiple intervals.
    console.log("AUTOSCROLL: Starting the autoscroll feature (Final Version).");
    // Check the video status frequently for a responsive scroll.
    autoscrollInterval = setInterval(checkVideoAndScroll, 100); // Check every 100ms.
}

/**
 * Stops the autoscrolling functionality by clearing the interval.
 */
function stopAutoscroll() {
    if (autoscrollInterval) {
        clearInterval(autoscrollInterval);
        autoscrollInterval = null;
        lastScrolledVideoSrc = null; // Reset the state.
        console.log("AUTOSCROLL: Stopped the autoscroll feature.");
    }
}

/**
 * A controller function to turn the feature on or off based on user settings.
 * @param {boolean} isEnabled - The desired state of the autoscroll feature.
 */
function controlAutoscroll(isEnabled) {
    if (isEnabled) {
        startAutoscroll();
    } else {
        stopAutoscroll();
    }
}

// --- INITIALIZATION AND STORAGE LISTENING ---

// 1. When the script first loads, get the current setting from storage.
chrome.storage.sync.get({ autoscrollEnabled: true }, (data) => {
    console.log(`AUTOSCROLL: Initial state is ${data.autoscrollEnabled ? 'enabled' : 'disabled'}.`);
    // Use a short timeout to ensure the YouTube page has had a moment to load its initial elements.
    setTimeout(() => controlAutoscroll(data.autoscrollEnabled), 500);
});

// 2. Listen for any changes to the setting (i.e., when the user clicks the popup toggle).
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.autoscrollEnabled) {
        const isEnabled = changes.autoscrollEnabled.newValue;
        console.log(`AUTOSCROLL: State changed to ${isEnabled ? 'enabled' : 'disabled'}.`);
        controlAutoscroll(isEnabled);
    }
});
