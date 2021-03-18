// Initialize elements from the popup html file.
const inputChannelFilter = document.querySelector("div.popup-content input[name='channel-filter']");
const inputTitleFilter= document.querySelector("div.popup-contnet input[name='title-fitler']");

const channelFilterContainer = document.querySelector("div.channel-filter-container");
const titleFilterContainer = document.querySelector(".div.title-filter-container")

const addChannelFilterBtn = document.querySelector('.add-channel-filter');
const addTitleFilterBtn = document.querySelector('.add-title-filter');

// Add event listeners to buttons.
addChannelFilterBtn.addEventListener("click", addChannelFilter)
addTitleFilterBtn.addEventListener("click", addTitleFilter)

// Generic error handler.
const onError = (error) => {
  console.error(error);;
}

