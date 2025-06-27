/**
 * popup.js
 * This script runs in the extension's popup window.
 * It initializes the toggle switches based on saved settings and
 * updates the settings when the user interacts with them.
 */
document.addEventListener('DOMContentLoaded', () => {
    const autoscrollToggle = document.getElementById('autoscrollToggle');
    const noReplayToggle = document.getElementById('noReplayToggle');

    // 1. Get the current saved settings from chrome.storage.
    // Provide default values in case they have never been set.
    chrome.storage.sync.get({
        autoscrollEnabled: true,
        noReplayEnabled: false
    }, (data) => {
        // 2. Set the toggles' checked states to match the saved settings.
        autoscrollToggle.checked = data.autoscrollEnabled;
        noReplayToggle.checked = data.noReplayEnabled;
    });

    // 3. Add listeners for when the user clicks the toggles.
    autoscrollToggle.addEventListener('change', () => {
        chrome.storage.sync.set({ autoscrollEnabled: autoscrollToggle.checked });
    });

    noReplayToggle.addEventListener('change', () => {
        chrome.storage.sync.set({ noReplayEnabled: noReplayToggle.checked });
    });
});
