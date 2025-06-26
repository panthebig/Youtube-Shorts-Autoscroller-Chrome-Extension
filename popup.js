/**
 * popup.js
 * * This script runs in the extension's popup window.
 * It initializes the toggle switch based on the saved setting and
 * updates the setting when the user interacts with the switch.
 */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('autoscrollToggle');

  // 1. Get the current saved setting from chrome.storage.
  // We provide a default value of 'true' in case it has never been set.
  chrome.storage.sync.get({ autoscrollEnabled: true }, (data) => {
      // 2. Set the toggle's checked state to match the saved setting.
      toggle.checked = data.autoscrollEnabled;
  });

  // 3. Add a listener for when the user clicks the toggle.
  toggle.addEventListener('change', () => {
      // 4. Save the new value of the toggle to chrome.storage.
      chrome.storage.sync.set({ autoscrollEnabled: toggle.checked });
  });
});
