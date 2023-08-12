// console.log("content script loaded");  //TODO

// document.getElementById('shorts-container').addEventListener('wheel', function(event) {
//   // console.log('The user is scrolling with the mouse wheel within the specific element.');
//   // You can add your custom logic here
//   // if (event.deltaY > 0) {
//     // You can add your custom logic for scrolling down here
//     let videoPlayer = document.querySelector('video[src]:not([src=""])');
//     if (videoPlayer ) {
//       videoPlayer.removeEventListener('seeking', scrollShortsContainer);
//       videoPlayer.removeEventListener('ended', scrollShortsContainer);
//       console.log('removed event listener');
//     }
//     // scrollShortsContainer();
//     // // If you want to prevent the default scrolling behavior:
//     // event.preventDefault();
//   // } else if (event.deltaY < 0) {
//     // You can add your custom logic for scrolling up here
//   // }

// });



window.isSeekingEventListenerAttached = false;


function scrollShortsContainer() {
  let shortsContainer = document.getElementById('shorts-container');
  let videoPlayer = document.querySelector('video[src]:not([src=""])');
          if (videoPlayer ) {
            videoPlayer.removeEventListener('seeking', scrollShortsContainer);
            videoPlayer.removeEventListener('ended', scrollShortsContainer);
            // console.log('removed event listener'); //TODO
          }


  if (shortsContainer) {
    shortsContainer.scrollBy(0, 1);
  }
}

function attachSeekingEventListener() {
  if( window.isSeekingEventListenerAttached === false){
    let videoPlayer = document.querySelector('video[src]:not([src=""])');
    if (videoPlayer ) {
      videoPlayer.removeEventListener('seeking', scrollShortsContainer);
      videoPlayer.removeEventListener('ended', scrollShortsContainer);

      videoPlayer.addEventListener('seeking', scrollShortsContainer, { passive: true });
      videoPlayer.addEventListener('ended', scrollShortsContainer, { passive: true });
      window.isSeekingEventListenerAttached = true;
      // console.log('Seeking event listener attached');  //TODO
    }
  }
  
}

// Function to periodically check for the Shorts container and video element
function waitForShortsContainer() {
  let intervalId = setInterval(function() {
    let shortsContainer = document.getElementById('shorts-container');
    if (shortsContainer) {

      shortsContainer.addEventListener('wheel', function(event) {
          let videoPlayer = document.querySelector('video[src]:not([src=""])');
          if (videoPlayer ) {
            videoPlayer.removeEventListener('seeking', scrollShortsContainer);
            videoPlayer.removeEventListener('ended', scrollShortsContainer);
            // console.log('removed event listener'); //TODO
          }
        });

      
      let videoPlayer = document.querySelector('video[src]:not([src=""])');
      // if (videoPlayer ) {
        // videoPlayer.removeEventListener('seeking', scrollShortsContainer);
        // videoPlayer.removeEventListener('ended', scrollShortsContainer);
      // }
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
