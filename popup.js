/**
 * popup.js
 * This script runs in the extension's popup window.
 * It initializes the controls based on saved settings and
 * updates the settings when the user interacts with them.
 */
document.addEventListener('DOMContentLoaded', () => {
    const autoscrollToggle = document.getElementById('autoscrollToggle');
    const speedSelect = document.getElementById('speedSelect');

    // 1. Get the current saved settings from chrome.storage.
    chrome.storage.sync.get({
        autoscrollEnabled: true,
        speedIndex: 0
    }, (data) => {
        // 2. Set the controls to match the saved settings.
        autoscrollToggle.checked = data.autoscrollEnabled;
        speedSelect.value = String(data.speedIndex);
    });

    // 3. Add listeners for when the user changes the controls.
    autoscrollToggle.addEventListener('change', () => {
        chrome.storage.sync.set({ autoscrollEnabled: autoscrollToggle.checked });
    });

    speedSelect.addEventListener('change', () => {
        chrome.storage.sync.set({ speedIndex: parseInt(speedSelect.value, 10) });
    });
});
