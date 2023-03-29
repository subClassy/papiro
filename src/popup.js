function clearList() {
  const readingList = document.getElementById("reading-list");
  readingList.innerHTML = "";
  chrome.storage.local.set({ 'readingList': [] });
}

document.addEventListener("DOMContentLoaded", () => {
  const clearButton = document.getElementById("clear-button");
  clearButton.addEventListener("click", clearList);

  // Get the reading list from local storage
  chrome.storage.local.get(['readingList'], function(result) {
    const readingList = result.readingList || [];

    // Update the popup with the reading list
    const readingListElement = document.getElementById('reading-list');
    readingListElement.innerHTML = '';

    for (let i = 0; i < readingList.length; i++) {
        const item = readingList[i];

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.url;
        a.target = '_blank';
        a.textContent = item.title;

        li.appendChild(a);
        readingListElement.appendChild(li);
    }
  });
});