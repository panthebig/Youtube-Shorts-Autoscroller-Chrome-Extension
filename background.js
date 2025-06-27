/**
 * background.js (Service Worker)
 * This script ensures the content script is always active on YouTube Shorts pages.
 */

// This function handles the logic for checking and injecting the content script.
function ensureScriptInjected(tabId, url) {
    // Correctly check for the YouTube Shorts URL
    if (url && url.includes("youtube.com/shorts/")) {
        // First, try to send a message to the content script in the target tab.
        // This is a "ping" to see if the script is already there and active.
        chrome.tabs.sendMessage(tabId, { type: "PING" }, (response) => {
            // chrome.runtime.lastError is a special variable that gets set if
            // the message fails to send (i.e., there's no listener on the other end).
            if (chrome.runtime.lastError) {
                console.log("AUTOSCROLL (Background): Content script not found. Injecting now.");
                
                // If the ping fails, inject the content script. CSS is handled by the script itself.
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });

            } else {
                // If the ping succeeds, we get a response and know the script is already running.
                console.log("AUTOSCROLL (Background): Content script is already active. Response:", response);
            }
        });
    }
}

// Listen for when a tab is updated (e.g., URL changes, page reloads).
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // We only act when the tab has finished loading.
    if (changeInfo.status === 'complete' && tab.url) {
        ensureScriptInjected(tabId, tab.url);
    }
});
