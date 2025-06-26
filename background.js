// console.log("background script loaded")
// let count = 0;

// chrome.webNavigation.onHistoryStateUpdated.addListener(
  
//   function(details) {
//     count++;
//     if(count % 2 === 1 ){
//       chrome.scripting.executeScript({
//         target: { tabId: details.tabId },
//         files: ['./content.js']
//       });
//       console.log("content script from background");
//     }
//   },
//   { url: [{ urlMatches: 'https://www.youtube.com/shorts/*' }] }
// );
