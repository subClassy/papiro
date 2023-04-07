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

function createListItem(title, url, repositoryURL, tags) {
  const listItem = document.createElement("li");
  const itemInfo = document.createElement("div");
  const itemDetails = document.createElement("div");
  const itemAnchor = document.createElement("a")
  const itemTitle = document.createElement("span");
  const itemDomain = document.createElement("span");
  const itemRemove = document.createElement("span");
  const itemTagContainer = document.createElement("div");
  const itemTagInput = document.createElement("input");

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

  itemDetails.appendChild(itemAnchor);

  if (repositoryURL != null) {
    const itemAccess = document.createElement("div");
    const itemAccessLink = document.createElement("a");

    const accessDomainMatch = repositoryURL.match(/^https?:\/\/([^/]+)/);
    if (accessDomainMatch) {
      itemAccessLink.textContent = "[Code] " + accessDomainMatch[1];
    }

    itemAccessLink.href = repositoryURL;
    itemAccessLink.target = "_blank";
    itemAccess.appendChild(itemAccessLink);
    itemAccess.classList.add("item-access");
    itemDetails.appendChild(itemAccess);
  }

  itemDetails.classList.add("item-details");

  // Add the tags to the item
  for (let i = 0; i < tags.length; i++) {
    const label = document.createElement("div");
    label.classList.add("item-label");
    label.textContent = tags[i];
    itemTagContainer.appendChild(label);
  }

  if (tags.length < 2) {
    itemTagInput.type = "text";
    itemTagInput.placeholder = "Add Tags";
    itemTagInput.classList.add("item-tag-input");
    itemTagInput.id = "item-tag-input-" + title;

    // Add event listener to the label input field
    tagEventListener(itemTagInput, itemTagContainer, url);

    itemTagContainer.appendChild(itemTagInput);
  }

  itemTagContainer.classList.add("item-tag-container");
  itemDetails.appendChild(itemTagContainer);

  itemInfo.appendChild(itemDetails);
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
  chrome.storage.local.get(['readingList'], function (result) {
    const readingList = result.readingList || [];

    if (readingList.length > 0) {
      document.getElementById("no-items-msg").style.display = "none";
    }

    // Update the popup with the reading list
    readingListItem.innerHTML = '';

    for (let i = 0; i < readingList.length; i++) {
      const item = readingList[i];
      const listItem = createListItem(item.title, item.url, item.repositoryURL, item.tags);

      readingListItem.appendChild(listItem);
    }
  });
});


function tagEventListener(itemTagInput, itemTagContainer, url) {
  itemTagInput.addEventListener("keyup", (event) => {
    // Check if enter key was pressed
    if (event.key === 'Enter') {
      const labelName = itemTagInput.value.trim();
      if (labelName !== "") {
        // Create a new label element and append it to the labels container
        const label = document.createElement("div");
        label.classList.add("item-label");
        label.textContent = labelName;
        itemTagContainer.appendChild(label);

        chrome.storage.local.get({ readingList: [] }, ({ readingList: items }) => {
          const index = items.findIndex(item => item.url === url);
          if (index !== -1) {
            items[index].tags.push(labelName);
            chrome.storage.local.set({ readingList: items });
          }
        });

        // Clear the input field
        itemTagInput.value = "";
      }
    }
  });
}
