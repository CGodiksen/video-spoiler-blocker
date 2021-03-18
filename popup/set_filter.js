// Generic error handler.
const onError = (error) => {
  console.error(error);
}

// Initialize elements from the popup html file.
const inputChannelFilter = document.querySelector("div.popup-content input[name='channel-filter']");
const inputTitleFilter = document.querySelector("div.popup-contnet input[name='title-fitler']");

const channelFilterContainer = document.querySelector("div.channel-filter-container");
const titleFilterContainer = document.querySelector(".div.title-filter-container")

const addChannelFilterBtn = document.querySelector('.add-channel-filter');
const addTitleFilterBtn = document.querySelector('.add-title-filter');

// Add event listeners to buttons.
addChannelFilterBtn.addEventListener("click", () => addFilter(inputChannelFilter, "channel"))
addTitleFilterBtn.addEventListener("click", () => addFilter(inputTitleFilter, "title"))

// Add a filter to the display and storage if it does not already exist in storage.
const addFilter = (inputField, filterType) => {
  const filter = inputField.value;
  const gettingItem = browser.storage.local.get(filter);

  gettingItem
    .then((result) => {
      const existingFilter = Object.keys(result);

      if (existingFilter.length < 1 && filter !== "") {
        inputField.value = '';
        storeFilter(filter, filterType);
      }
    })
    .catch(error => {
      onError(error)
    })
}

const storeFilter = (filter, filterType) => {
  const storingFilter = browser.storage.local.set({ [filter]: filterType });

  storingFilter.then(() => {
    displayFilter(filter);
  }, onError);
}

initialize("channel-filter");
initialize("title-filter")

// Show the already existing filters in the popup.
const initialize = (filter) => {
  const gettingAllStorageItems = browser.storage.local.get(filter);

  gettingAllStorageItems
    .then(results => {
      const keys = Object.keys(results);

      for (let key of keys) {
        displayFilter(key);
      }
    })
    .catch(error => {
      onError(error)
    });
}