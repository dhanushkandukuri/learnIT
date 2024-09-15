chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
      id: "searchText",
      title: "LearnIT",
      contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchText" && info.selectionText) {
      // Execute the content script on the active tab
      chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
      }, () => {
          // Once content script is injected, send the selected text for processing
          searchSelectedText(info.selectionText, tab);
      });
  }
});

function searchSelectedText(selectedText, tab) {
  fetch('http://localhost:5000/search', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: selectedText })
  })
  .then(response => response.json())
  .then(data => {
      if (data.results) {
          // Send results to the content script to display in the sidebar
          chrome.tabs.sendMessage(tab.id, {
              type: "displayResults",
              query: selectedText,
              results: data.results
          });
      } else {
          alert('No relevant content found.');
      }
  })
  .catch(error => console.error('Error:', error));
}
