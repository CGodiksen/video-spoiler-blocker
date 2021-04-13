// Generic error handler.
const onError = (error) => {
  console.error(error);
}

// Initialize elements from the popup html file.
const channelFilterInput = document.querySelector("div.popup-content input[name='channel-filter']");
const titleFilterInput = document.querySelector("div.popup-content input[name='title-filter']");

const channelFilterList = document.querySelector("ul.channel-filter-list");
const titleFilterList = document.querySelector("ul.title-filter-list")

const addChannelFilterBtn = document.querySelector('.add-channel-filter');
const addTitleFilterBtn = document.querySelector('.add-title-filter');

// Add event listeners to buttons.
addChannelFilterBtn.addEventListener("click", () => addFilter(channelFilterInput, "channel"))
addTitleFilterBtn.addEventListener("click", () => addFilter(titleFilterInput, "title"))

// Adding filter if the enter key is pressed while a text input is active.
document.addEventListener("keyup", event => {
  const active = document.activeElement

  if (active.name === "channel-filter" && event.key === "Enter") {
    addFilter(channelFilterInput, "channel")
  } else if (active.name === "title-filter" && event.key === "Enter") {
    addFilter(titleFilterInput, "title")
  }
})

// Add a filter to the display and storage if it does not already exist in storage.
const addFilter = async (inputField, filterType) => {
  const existingFilters = await getExistingsFilters(filterType)

  const filter = inputField.value;

  if (!existingFilters.includes(filter) && filter !== "") {
    inputField.value = '';

    await browser.storage.local.set({ [filterType]: existingFilters.concat(filter) }).catch(error => onError(error));
    displayFilter(filter, filterType)

    requestBlock()
  }
}

// Send a message to all Youtube tabs notifying them that they should block spoilers.
const requestBlock = async () => {
  const tabs = await browser.tabs.query({ url: "*://*.youtube.com/*" })

  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, { blockSpoilers: true })
  }
}

// Adding the filter to one of the unordered display lists based on the filter type.
const displayFilter = (filter, filterType) => {
  const li = document.createElement("li")

  if (filter.length <= 15) {
    li.textContent = `${filter} `
  } else {
    li.textContent = `${filter.substring(0, 15)}... `
  }

  const deleteButton = document.createElement("img")
  deleteButton.src = "../icons/remove_16.png"
  deleteButton.alt = "Delete filter"
  deleteButton.height = 13
  deleteButton.width = 13
  li.appendChild(deleteButton)

  deleteButton.addEventListener("click", () => deleteFilter(filter, filterType, li))

  if (filterType === "channel") {
    channelFilterList.appendChild(li)
  } else {
    titleFilterList.appendChild(li)
  }
}

// Delete a single filter from storage and the display.
const deleteFilter = async (filter, filterType, li) => {
  const existingFilters = await getExistingsFilters(filterType)

  await browser.storage.local.set({ [filterType]: existingFilters.filter(f => f !== filter) }).catch(error => onError(error));
  li.remove()
}

// Return a promise to deliver all filters of a specific type from local storage. 
const getExistingsFilters = async (filterType) => {
  const result = await browser.storage.local.get(filterType).catch(error => onError(error));
  return (Object.keys(result).length !== 0) ? result[filterType] : []
}

// Show the already existing filters in the popup.
const initialize = async (filterType) => {
  const existingFilters = await getExistingsFilters(filterType)

  existingFilters.forEach(filter => displayFilter(filter, filterType))
}

initialize("channel");
initialize("title");

// Listen for messages from the background script, sent when the "add-channel-filter" context menu item is clicked.
browser.runtime.onMessage.addListener(request => {
  if (request.addFilter) {
    channelFilterInput.value = request.channelName
    addFilter(channelFilterInput, "channel")
  }
});