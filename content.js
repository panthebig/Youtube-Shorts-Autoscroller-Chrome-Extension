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

// Retrieving the value from local storage
chrome.storage.local.get('enableAutoScroll', function(data) {
  // Use the retrieved value in your script
  if (data.enableAutoScroll) {
    window.EnableAutoScroll = true;
    // Code to enable autoscrolling
  } else {
    window.EnableAutoScroll = false;
    // Code to disable autoscrolling
  }
});

// Listening for changes to the enableAutoScroll value in local storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.enableAutoScroll) {
    // Get the new value
    let newValue = changes.enableAutoScroll.newValue;
    //console.log('this is newValue ' + newValue);
    // Use the new value to update the behavior of your extension
    if (newValue) {
      // Code to enable autoscrolling
      window.EnableAutoScroll = true;
    } else {
      window.EnableAutoScroll = false;
      // Code to disable autoscrolling
    }

    //console.log('Auto-scrolling on content.js is now after change' +  window.EnableAutoScroll);
  }
});




window.isSeekingEventListenerAttached = false;


function scrollShortsContainer() {
  
  if(window.EnableAutoScroll === true){
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
}

function attachSeekingEventListener() {
  if( window.isSeekingEventListenerAttached === false && window.EnableAutoScroll===true){
    let videoPlayer = document.querySelector('video[src]:not([src=""])');
    if (videoPlayer ) {
      videoPlayer.removeEventListener('seeking', scrollShortsContainer);
      videoPlayer.removeEventListener('ended', scrollShortsContainer);
      
      //console.log('window switch is before attach eseeking event : ' + window.EnableAutoScroll)
      
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
