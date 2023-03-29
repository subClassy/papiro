function clearList() {
  const readingList = document.getElementById("reading-list");
  readingList.innerHTML = "";
  chrome.storage.local.set({ 'readingList': [] });

  document.getElementById("no-items-msg").style.display = "block";
}

function removeItem(event) {
  const readingList = document.getElementById("reading-list");
  const listItem = event.target.closest("li");
  const itemIndex = Array.from(readingList.children).indexOf(listItem);

  chrome.storage.local.get({ readingList: [] }, ({ readingList: items }) => {
    items.splice(itemIndex, 1);
    chrome.storage.local.set({ readingList: items });

    if (items.length === 0) {
      document.getElementById("no-items-msg").style.display = "block";
    }

    listItem.remove();
  });
}

function createListItem(title, url) {
  const listItem = document.createElement("li");
  const itemInfo = document.createElement("div");
  const itemAnchor = document.createElement("a")
  const itemTitle = document.createElement("span");
  const itemDomain = document.createElement("span");
  const itemRemove = document.createElement("span");

  itemTitle.textContent = title;
  itemTitle.classList.add("item-title");

  const domainMatch = url.match(/^https?:\/\/([^/]+)/);
  if (domainMatch) {
    itemDomain.textContent = domainMatch[1];
    itemDomain.classList.add("item-domain");
  }

  // itemRemove.textContent = "X";
  itemRemove.classList.add("item-remove");
  itemRemove.addEventListener("click", removeItem);

  itemAnchor.appendChild(itemTitle);
  itemAnchor.appendChild(itemDomain);
  itemAnchor.href = url;
  itemAnchor.target = "_blank";
  itemAnchor.classList.add("item-anchor");

  itemInfo.appendChild(itemAnchor);
  itemInfo.appendChild(itemRemove);
  itemInfo.classList.add("item-info");

  listItem.appendChild(itemInfo);

  return listItem;
}

document.addEventListener("DOMContentLoaded", () => {
  const readingListItem = document.getElementById("reading-list");
  const clearButton = document.getElementById("clear-button");
  clearButton.addEventListener("click", clearList);

  // Get the reading list from local storage
  chrome.storage.local.get(['readingList'], function(result) {
    const readingList = result.readingList || [];

    if (readingList.length > 0) {
      document.getElementById("no-items-msg").style.display = "none";
    }

    // Update the popup with the reading list
    readingListItem.innerHTML = '';

    for (let i = 0; i < readingList.length; i++) {
        const item = readingList[i];
        const listItem = createListItem(item.title, item.url);

        readingListItem.appendChild(listItem);
    }
  });
});