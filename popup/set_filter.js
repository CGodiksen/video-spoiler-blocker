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

// Add a filter to the display and storage if it does not already exist in storage.
const addFilter = (inputField, filterType) => {
  const filter = inputField.value;
  const gettingFilters = browser.storage.local.get(filterType);

  gettingFilters
    .then((result) => {
      const existingFilters = result[filterType]

      if (!existingFilters.includes(filter) && filter !== "") {
        inputField.value = '';
        storeFilter(filter, filterType, existingFilters);
      }
    })
    .catch(error => {
      onError(error)
    });
}

// Add event listeners to buttons.
addChannelFilterBtn.addEventListener("click", () => addFilter(inputChannelFilter, "channel"))
addTitleFilterBtn.addEventListener("click", () => addFilter(inputTitleFilter, "title"))

// Storing the filter. Also storing the type of the filter to simplify displaying stored filters.
const storeFilter = (filter, filterType, existingFilters) => {
  const storingFilter = browser.storage.local.set({ [filterType]: existingFilters.concat(filter) });

  storingFilter
    .then(() => {
      displayFilter(filter, filterType);
    })
    .catch(error => {
      onError(error)
    });
}

// Show the already existing filters in the popup.
const initialize = () => {
  const gettingAllFilters = browser.storage.local.get(null);

  gettingAllFilters
    .then(results => {
      const keys = Object.keys(results);

      for (let key of keys) {
        displayFilter(key, results[key]);
      }
    })
    .catch(error => {
      onError(error)
    });
}

initialize();

// Adding the filter to one of the unordered display lists based on the filter type.
const displayFilter = (filter, filterType) => {
  const li = document.createElement("li")
  li.textContent = filter

  if (filterType === "channel") {
    channelFilterList.appendChild(li)
  } else {
    titleFilterList.appendChild(li)
  }
}