document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('scrollButton').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'scrollDown'});
    });
  },{ passive: true });
},{ passive: true });
