'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Fetch Papers With Code data
async function fetchPapersWithCodeData(paperTitle) {
  const PAPERS_WITH_CODE_URL = `https://paperswithcode.com/api/v1/search/?q=${paperTitle}`;
  const proxyURL = 'https://cors-anywhere.herokuapp.com/';

  try {
    const response = await fetch(proxyURL + PAPERS_WITH_CODE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    var repositoryURL = null;
    if (data.results.length > 0) {
      const index = data.results.findIndex(item => item.paper.title.toLowerCase() === paperTitle.toLowerCase());
      if (index > -1) {
        const paper = data.results[index];
        if (paper.repository != null) {
          repositoryURL = paper.repository.url;
          return repositoryURL
        }
      }
    }
    return repositoryURL;
  } catch (error) {
    return console.log(error);
  }
}

// Log `title` of current active web page
function addOrRemoveFromReadingList(button) {
  // Get the title and URL of the paper associated with the button
  const result = button.closest('.gs_ri');
  const title = result.querySelector('.gs_rt a').innerText;
  const url = result.querySelector('.gs_rt a').href;


  // Check if the article is already in the reading list
  chrome.storage.local.get(['readingList'], async function (result) {
    const readingList = result.readingList || [];
    const index = readingList.findIndex(item => item.url === url);

    if (index <= -1) {
      // Add the article to the reading list
      const repositoryURL = await fetchPapersWithCodeData(title);
      readingList.push({ title, url, repositoryURL, tags: [] });
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
  button.addEventListener('click', function () {
    addOrRemoveFromReadingList(button);
  });

  // Add the button to the result
  result.appendChild(button);
}
