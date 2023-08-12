document.addEventListener('DOMContentLoaded', function() {
  

  // window.EnableAutoScroll = document.getElementById('autoscrollSwitch').checked;

  // document.getElementById('autoscrollSwitch').addEventListener('change', function() {
  //   if (this.checked) {
  //     // Enable autoscroll
  //     window.EnableAutoScroll = true;
  //   } else {
  //     window.EnableAutoScroll = false;
  //     // Disable autoscroll
  //     // You can remove the event listener or add logic to stop autoscrolling
  //   }
  // });

  // Retrieving the value from local storage
chrome.storage.local.get('enableAutoScroll', function(data) {
  // Use the retrieved value to initialize the checkbox or other UI elements
  //console.log('Auto-scrolling on retrieve on popup.js is  ' +  data.enableAutoScroll);
  document.getElementById('autoscrollSwitch').checked = data.enableAutoScroll;
});

// Optionally, you can also listen for changes to the checkbox and update the value in local storage
document.getElementById('autoscrollSwitch').addEventListener('change', function() {
  chrome.storage.local.set({ enableAutoScroll: this.checked });
  //console.log('Auto-scrolling on popup.js is now after change ' +  this.checked);

});



},{ passive: true });