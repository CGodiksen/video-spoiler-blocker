// Initialize elements from the popup html file.
const inputChannelFilter = document.querySelector("div.popup-content input[name='channel-filter']");
const inputTitleFilter = document.querySelector("div.popup-contnet input[name='title-fitler']");

const channelFilterContainer = document.querySelector("div.channel-filter-container");
const titleFilterContainer = document.querySelector(".div.title-filter-container")

const addChannelFilterBtn = document.querySelector('.add-channel-filter');
const addTitleFilterBtn = document.querySelector('.add-title-filter');

// Add event listeners to buttons.
addChannelFilterBtn.addEventListener("click", addChannelFilter)

const addChannelFilter = () => {
  const channelFilter = inputChannelFilter.value;
  const gettingItem = browser.storage.local.get(channelFilter);

  gettingItem
    .then((result) => {
      const objTest = Object.keys(result);

      if (objTest.length < 1 && channelFilter !== "") {
        inputChannelFilter.value = '';
        storeChannelFilter(channelFilter);
      }
    })
    .catch(error => {
      onError(error)
    })
}


addTitleFilterBtn.addEventListener("click", addTitleFilter)

// Generic error handler.
const onError = (error) => {
  console.error(error);;
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
        displayFilter(key, results[key]);
      }
    })
    .catch(error => {
      onError(error)
    });
}