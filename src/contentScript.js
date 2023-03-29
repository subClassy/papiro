'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
function addOrRemoveFromReadingList() {
  // Get the current article title and URL
  const title = document.title;
  const url = window.location.href;

  // Check if the article is already in the reading list
  chrome.storage.local.get(['readingList'], function(result) {
      const readingList = result.readingList || [];
      const index = readingList.findIndex(item => item.url === url);

      if (index > -1) {
          // Remove the article from the reading list
          readingList.splice(index, 1);
          chrome.storage.local.set({ readingList: readingList });
      } else {
          // Add the article to the reading list
          readingList.push({ title, url });
          chrome.storage.local.set({ readingList: readingList });
      }
  });
}

// Add a button to each search result
const results = document.getElementsByClassName('gs_ri');
for (let i = 0; i < results.length; i++) {
  const result = results[i];

  // Create a new button
  const button = document.createElement('button');
  button.innerHTML = 'Add to reading list';
  button.addEventListener('click', addOrRemoveFromReadingList);

  // Add the button to the result
  result.appendChild(button);
}
