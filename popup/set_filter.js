// Generic error handler.
const onError = (error) => {
  console.error(error);
}

// Initialize elements from the popup html file.
const inputChannelFilter = document.querySelector("div.popup-content input[name='channel-filter']");
const inputTitleFilter = document.querySelector("div.popup-content input[name='title-filter']");

const channelFilterList = document.querySelector("ul.channel-filter-list");
const titleFilterList = document.querySelector("ul.title-filter-list")

const addChannelFilterBtn = document.querySelector('.add-channel-filter');
const addTitleFilterBtn = document.querySelector('.add-title-filter');

// Add event listeners to buttons.
addChannelFilterBtn.addEventListener("click", () => addFilter(inputChannelFilter, "channel"))
addTitleFilterBtn.addEventListener("click", () => addFilter(inputTitleFilter, "title"))

// Add a filter to the display and storage if it does not already exist in storage.
const addFilter = async (inputField, filterType) => {
  const existingFilters = await getExistingsFilters(filterType)

  const filter = inputField.value;

  if (!existingFilters.includes(filter) && filter !== "") {
    inputField.value = '';

    await browser.storage.local.set({ [filterType]: existingFilters.concat(filter) }).catch(error => onError(error));
    displayFilter(filter, filterType)
  }
}

// Adding the filter to one of the unordered display lists based on the filter type.
const displayFilter = (filter, filterType) => {
  const li = document.createElement("li")
  li.textContent = filter

  const deleteButton = document.createElement("button")
  deleteButton.textContent = "Delete"
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