/**
 * content.js (v7)
 * This script is injected into YouTube Shorts pages.
 * It uses a MutationObserver to inject custom control buttons into each Short's player.
 * It handles the logic for autoscrolling and playback speed based on user settings.
 *
 * v7 Changes:
 *   - Removed No Replay feature.
 *   - Added Speed modifier button (cycles 1x → 1.25x → 1.5x → 2x).
 *   - Self-contained button styles (no YouTube CSS class dependency).
 */

// --- STATE AND CONFIGURATION ---
let autoscrollInterval = null;
let lastScrolledVideoSrc = null;
let a_s_enabled = true;

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];
let currentSpeedIndex = 0; // Default: 1x

// --- SVG ICONS FOR BUTTONS ---
const AUTO_SCROLL_ICON_SVG = `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="width:24px;height:24px;fill:currentColor;"><g><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z M7.41 14.59 12 19.17l4.59-4.58L18 16l-6 6-6-6 1.41-1.41z"></path></g></svg>`;
const SPEED_ICON_SVG = `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="width:24px;height:24px;fill:currentColor;"><g><path d="M10 8v8l6-4-6-4zM6.3 5L5 6.3l3 3V14l4-2.7 1.3.9 3.3-3.3C17.5 10 18 11.5 18 13c0 3.3-2.7 6-6 6s-6-2.7-6-6c0-1.5.5-3 1.5-4.2L5 6.3C3.2 8 2 10.3 2 13c0 5.5 4.5 10 10 10s10-4.5 10-10c0-2.7-1-5.2-2.8-7L10 8z"></path></g></svg>`;

// --- CORE LOGIC ---

function checkVideoAndAct() {
    let activeShort = document.querySelector('ytd-reel-video-renderer[is-active]');

    // Fallback: find the renderer containing the playing video
    if (!activeShort) {
        const videos = document.querySelectorAll('ytd-reel-video-renderer video');
        for (const v of videos) {
            if (v.currentTime > 0 && !v.paused && !v.ended) {
                activeShort = v.closest('ytd-reel-video-renderer');
                break;
            }
        }
    }

    if (!activeShort) return;

    const video = activeShort.querySelector('video');
    if (!video || !video.src) return;

    // Apply the current speed to the active video
    const targetSpeed = SPEED_OPTIONS[currentSpeedIndex];
    if (video.playbackRate !== targetSpeed) {
        video.playbackRate = targetSpeed;
    }

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

    // Retry button injection for renderers that don't have buttons yet.
    // This handles the first short where #actions loads after the initial injection attempt.
    if (!activeShort.querySelector('.autoscroll-button')) {
        addButtonsToPlayer(activeShort);
    }
}

function updateFeatureState(autoscroll, speedIndex) {
    a_s_enabled = autoscroll;
    if (speedIndex !== undefined) {
        currentSpeedIndex = speedIndex;
    }
    document.querySelectorAll('.autoscroll-button').forEach(btn => btn.classList.toggle('active', a_s_enabled));
    updateSpeedLabels();
}

function updateSpeedLabels() {
    const speed = SPEED_OPTIONS[currentSpeedIndex];
    const label = speed === 1 ? '1x' : speed + 'x';
    document.querySelectorAll('.speed-button .ext-shorts-btn__label').forEach(el => {
        el.textContent = label;
    });
    document.querySelectorAll('.speed-button').forEach(btn => {
        btn.classList.toggle('active', currentSpeedIndex > 0);
    });
}

// --- BUTTON INJECTION ---

function addButtonsToPlayer(rendererNode) {
    // If we've already added our buttons, stop.
    if (rendererNode.querySelector('.autoscroll-button')) return;

    // Find the actions container with multiple fallback strategies
    let actionsContainer = rendererNode.querySelector('ytd-reel-player-overlay-renderer #actions');

    if (!actionsContainer) {
        actionsContainer = rendererNode.querySelector('reel-action-bar-view-model');
    }

    if (!actionsContainer) {
        const likeBtn = rendererNode.querySelector('like-button-view-model');
        if (likeBtn) actionsContainer = likeBtn.parentElement;
    }

    if (!actionsContainer) {
        const legacyLikeBtn = rendererNode.querySelector('ytd-like-button-renderer');
        if (legacyLikeBtn) actionsContainer = legacyLikeBtn.parentElement;
    }

    if (!actionsContainer) return;

    console.log("AUTOSCROLL: Found actions container, injecting buttons...", actionsContainer);

    // --- Autoscroll Button ---
    const autoscrollButton = createStyledButton('autoscroll-button', 'Toggle Autoscroll', AUTO_SCROLL_ICON_SVG, 'Scroll');
    autoscrollButton.classList.toggle('active', a_s_enabled);
    autoscrollButton.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        chrome.storage.sync.set({ autoscrollEnabled: !a_s_enabled });
    });

    // --- Speed Button ---
    const speedLabel = SPEED_OPTIONS[currentSpeedIndex] === 1 ? '1x' : SPEED_OPTIONS[currentSpeedIndex] + 'x';
    const speedButton = createStyledButton('speed-button', 'Change Playback Speed', SPEED_ICON_SVG, speedLabel);
    speedButton.classList.toggle('active', currentSpeedIndex > 0);
    speedButton.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const newIndex = (currentSpeedIndex + 1) % SPEED_OPTIONS.length;
        chrome.storage.sync.set({ speedIndex: newIndex });
    });

    actionsContainer.prepend(speedButton);
    actionsContainer.prepend(autoscrollButton);
}

/**
 * Creates a fully self-styled button that visually matches YouTube Shorts action buttons.
 */
function createStyledButton(className, title, svgHtml, labelText) {
    const wrapper = document.createElement('div');
    wrapper.className = `ext-shorts-btn ${className}`;
    wrapper.title = title;

    const button = document.createElement('button');
    button.className = 'ext-shorts-btn__circle';
    button.setAttribute('aria-label', title);

    const iconDiv = document.createElement('div');
    iconDiv.className = 'ext-shorts-btn__icon';
    iconDiv.innerHTML = svgHtml;

    button.appendChild(iconDiv);
    wrapper.appendChild(button);

    if (labelText) {
        const label = document.createElement('span');
        label.className = 'ext-shorts-btn__label';
        label.textContent = labelText;
        wrapper.appendChild(label);
    }

    return wrapper;
}

// --- INITIALIZATION AND OBSERVERS ---

function initialize() {
    console.log("AUTOSCROLL: Content script v7 loaded.");

    const style = document.createElement('style');
    style.textContent = `
        /* === AutoScroll Extension — Self-Contained Button Styles === */
        .ext-shorts-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            margin-bottom: 12px;
            -webkit-user-select: none;
            user-select: none;
        }

        .ext-shorts-btn__circle {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            background-color: rgba(255, 255, 255, 0.1);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
            padding: 0;
            outline: none;
        }

        .ext-shorts-btn__circle:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }

        .ext-shorts-btn__circle:active {
            transform: scale(0.92);
        }

        .ext-shorts-btn__icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        }

        .ext-shorts-btn__icon svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        .ext-shorts-btn__label {
            font-family: "Roboto", "Arial", sans-serif;
            font-size: 12px;
            color: #fff;
            margin-top: 4px;
            line-height: 1.2;
            text-align: center;
            pointer-events: none;
        }

        /* Active state — blue highlight */
        .ext-shorts-btn.active .ext-shorts-btn__circle {
            background-color: rgba(62, 166, 255, 0.3);
            color: #3ea6ff;
        }

        .ext-shorts-btn.active .ext-shorts-btn__label {
            color: #3ea6ff;
        }

        .ext-shorts-btn.active .ext-shorts-btn__circle:hover {
            background-color: rgba(62, 166, 255, 0.45);
        }
    `;
    document.head.appendChild(style);

    chrome.storage.sync.get({ autoscrollEnabled: true, speedIndex: 0 }, (data) => {
        updateFeatureState(data.autoscrollEnabled, data.speedIndex);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            chrome.storage.sync.get({ autoscrollEnabled: a_s_enabled, speedIndex: currentSpeedIndex }, (data) => {
                updateFeatureState(data.autoscrollEnabled, data.speedIndex);
            });
        }
    });

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
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
