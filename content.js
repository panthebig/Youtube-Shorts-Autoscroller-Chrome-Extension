/**
 * content.js (v5)
 * This script is injected into YouTube Shorts pages.
 * It uses a MutationObserver to inject custom control buttons into each Short's player.
 * It handles the logic for autoscrolling and preventing video replays based on user settings.
 * This version uses a more robust selector for the actions container.
 */

// --- STATE AND CONFIGURATION ---
let autoscrollInterval = null;
let lastScrolledVideoSrc = null;
let a_s_enabled = true;
let n_r_enabled = false;

// --- SVG ICONS FOR BUTTONS ---
const AUTO_SCROLL_ICON_SVG = `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon"><g><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z M7.41 14.59 12 19.17l4.59-4.58L18 16l-6 6-6-6 1.41-1.41z"></path></g></svg>`;
const NO_REPLAY_ICON_SVG = `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon"><g><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"></path></g></svg>`;

// --- CORE LOGIC ---

function checkVideoAndAct() {
    // This function is confirmed to be working.
    const activeShort = document.querySelector('ytd-reel-video-renderer[is-active]');
    if (!activeShort) return;

    const video = activeShort.querySelector('video');
    if (!video || !video.src) return;

    if (a_s_enabled) {
        const isVideoPlaying = video.currentTime > 0 && !video.paused && !video.ended;
        const hasDuration = !isNaN(video.duration);
        if (isVideoPlaying && hasDuration) {
            const isNearEnd = (video.duration - video.currentTime) < 0.22;
            if (isNearEnd && video.src !== lastScrolledVideoSrc) {
                lastScrolledVideoSrc = video.src;
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", code: "ArrowDown", keyCode: 40, bubbles: true }));
            }
        }
    }

    if (!a_s_enabled && n_r_enabled) {
        if (video.currentTime >= video.duration - 0.1) {
            video.pause();
        }
    }
}

function updateFeatureState(autoscroll, noReplay) {
    a_s_enabled = autoscroll;
    n_r_enabled = noReplay;
    document.querySelectorAll('.autoscroll-button').forEach(btn => btn.classList.toggle('active', a_s_enabled));
    document.querySelectorAll('.no-replay-button').forEach(btn => btn.classList.toggle('active', n_r_enabled));
}

// --- BUTTON INJECTION ---

function addButtonsToPlayer(rendererNode) {
    // This is the CRITICAL CHANGE. We are using a different, more reliable selector to find the button panel.
    const actionsContainer = rendererNode.querySelector('ytd-reel-player-overlay-renderer #actions');
    
    // If the container isn't found, or if we've already added our button, stop.
    if (!actionsContainer || rendererNode.querySelector('.autoscroll-button')) {
        // If the container is not found, log an error to the console for debugging.
        if (!actionsContainer) {
            // console.error("AUTOSCROLL: Button container not found in this renderer.", rendererNode);
        }
        return;
    }

    console.log("AUTOSCROLL: Found actions container, injecting buttons...", actionsContainer);

    const autoscrollButton = createStyledButton('autoscroll-button', 'Toggle Autoscroll', AUTO_SCROLL_ICON_SVG);
    autoscrollButton.classList.toggle('active', a_s_enabled);
    autoscrollButton.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.storage.sync.set({ autoscrollEnabled: !a_s_enabled });
    });

    const noReplayButton = createStyledButton('no-replay-button', 'Prevent Replay (when Autoscroll is off)', NO_REPLAY_ICON_SVG);
    noReplayButton.classList.toggle('active', n_r_enabled);
    noReplayButton.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.storage.sync.set({ noReplayEnabled: !n_r_enabled });
    });
    
    actionsContainer.prepend(noReplayButton);
    actionsContainer.prepend(autoscrollButton);
}

function createStyledButton(className, title, svgHtml) {
    const button = document.createElement('button');
    button.className = `yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button ${className}`;
    button.title = title;
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'yt-spec-button-shape-next__icon';
    iconDiv.innerHTML = svgHtml;

    button.appendChild(iconDiv);
    return button;
}

// --- INITIALIZATION AND OBSERVERS ---

function initialize() {
    console.log("AUTOSCROLL: Content script v5 loaded. Waiting for Shorts player...");

    const style = document.createElement('style');
    style.textContent = `
        .autoscroll-button,
        .no-replay-button {
            margin-top: 12px;
        }
        .autoscroll-button.active .yt-spec-button-shape-next__icon,
        .no-replay-button.active .yt-spec-button-shape-next__icon {
            color: #3ea6ff !important;
        }
        .autoscroll-button.active,
        .no-replay-button.active {
            background-color: rgba(255, 255, 255, 0.25) !important;
        }
    `;
    document.head.appendChild(style);


    chrome.storage.sync.get({ autoscrollEnabled: true, noReplayEnabled: false }, (data) => {
        updateFeatureState(data.autoscrollEnabled, data.noReplayEnabled);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            chrome.storage.sync.get({ autoscrollEnabled: a_s_enabled, noReplayEnabled: n_r_enabled }, (data) => {
                 updateFeatureState(data.autoscrollEnabled, data.noReplayEnabled);
            });
        }
    });

    // This observer watches for new videos being added to the page
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check any added node to see if it's a shorts renderer or contains one
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // It's an element
                        if (node.matches('ytd-reel-video-renderer')) {
                            addButtonsToPlayer(node);
                        }
                        node.querySelectorAll('ytd-reel-video-renderer').forEach(addButtonsToPlayer);
                    }
                });
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Try to add buttons to any renderers that might already be on the page
    document.querySelectorAll('ytd-reel-video-renderer').forEach(addButtonsToPlayer);

    if (autoscrollInterval) clearInterval(autoscrollInterval);
    autoscrollInterval = setInterval(checkVideoAndAct, 100);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PING') {
        sendResponse({ type: "PONG" });
    }
    return true;
});

initialize();
