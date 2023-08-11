console.log("content script loaded");

window.isSeekingEventListenerAttached = false;


function scrollShortsContainer() {
  let shortsContainer = document.getElementById('shorts-container');
  let videoPlayer = document.querySelector('video[src]:not([src=""])');
  // if (videoPlayer ) {
  //   videoPlayer.removeEventListener('seeking', scrollShortsContainer);
  //   videoPlayer.removeEventListener('ended', scrollShortsContainer);
  //   console.log('removed event listener');
  // }
  if (shortsContainer) {
    shortsContainer.scrollBy(0, 1);
  }
}

function attachSeekingEventListener() {
  if( window.isSeekingEventListenerAttached === false){
    let videoPlayer = document.querySelector('video[src]:not([src=""])');
    if (videoPlayer ) {
      // videoPlayer.removeEventListener('seeking', scrollShortsContainer);
      // videoPlayer.removeEventListener('ended', scrollShortsContainer);

      videoPlayer.addEventListener('seeking', scrollShortsContainer, { passive: true });
      videoPlayer.addEventListener('ended', scrollShortsContainer, { passive: true });
      window.isSeekingEventListenerAttached = true;
      console.log('Seeking event listener attached');
    }
  }
  
}

// Function to periodically check for the Shorts container and video element
function waitForShortsContainer() {
  let intervalId = setInterval(function() {
    let shortsContainer = document.getElementById('shorts-container');
    if (shortsContainer) {
      let videoPlayer = document.querySelector('video[src]:not([src=""])');
      if (videoPlayer ) {
        videoPlayer.removeEventListener('seeking', scrollShortsContainer);
        videoPlayer.removeEventListener('ended', scrollShortsContainer);
      }
      attachSeekingEventListener();
      clearInterval(intervalId); // Stop checking once the Shorts container is found
      // Start observing the Shorts container for changes
      let observer = new MutationObserver(attachSeekingEventListener);
      observer.observe(shortsContainer, { childList: true, subtree: true });
    }
  }, 500); // Check every 500 milliseconds
}

// Start checking for the Shorts container when the content script is executed
waitForShortsContainer();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scrollDown') {
    scrollShortsContainer();
  }
});
