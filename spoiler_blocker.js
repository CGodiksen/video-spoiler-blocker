// Check all videos in the current document for spoilers and block them if any are found.
const blockSpoilers = async () => {
  const [titleFilters, channelFilters] = await getExistingsFilters()
  const pageType = getPageType()
  const videos = getVideoElements(pageType)

  if (pageType === "video") {
    blockPlayerSpoiler(titleFilters, channelFilters)
  }

  for (const video of videos) {
    const timeDisplay = video.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];

    if (timeDisplay) {
      blockThumbnailSpoiler(pageType, video, titleFilters, channelFilters, timeDisplay)
    }
  }
}

// Return a promise to deliver all filters from local storage. 
const getExistingsFilters = async () => {
  const result = await browser.storage.local.get(null).catch(error => console.error(error));

  const titleFilters = (result["title"]) ? result["title"] : []
  const channelFilters = (result["channel"]) ? result["channel"] : []

  return [titleFilters, channelFilters]
}

const getPageType = () => {
  const url = window.location.href

  if (url.includes("/watch?")) {
    return "video"
  } else if (url.includes("/c/") || url.includes("/channel/") || url.includes("/user/")) {
    return "channel"
  } else if (url.includes("/results?")) {
    return "search"
  } else if (url.includes("/subscriptions")) {
    return "subscriptions"
  } else if (url.includes("/trending") || url.includes("/explore")) {
    return "trending"
  } else {
    return "home"
  }
}

// Return all video elements in the current document. These elements contain both the thumbnail and video metadata. 
const getVideoElements = (pageType) => {
  let className = ""

  switch (pageType) {
    case "home":
      className = "style-scope ytd-rich-grid-media"
      break;
    case "video":
      className = "style-scope ytd-compact-video-renderer"
      break;
    case "channel":
    case "subscriptions":
      className = "style-scope ytd-grid-video-renderer"
      break;
    case "search":
    case "trending":
      className = "style-scope ytd-video-renderer"
      break;
  }
  const grid_media = document.getElementsByClassName(className)

  const videos = []
  for (let i = 0; i < grid_media.length; i++) {
    if (grid_media[i].id === "dismissible") {
      videos.push(grid_media[i])
    }
  }

  return videos
}

// Removing video length infomation from the bottom left of the Youtube player if necessary. Also removing progress bar if chosen in options.
const blockPlayerSpoiler = (titleFilters, channelFilters) => {
  try {
    const timeDisplay = document.getElementsByClassName("ytp-time-display notranslate")[0]

    if (timeDisplay && timeDisplay.innerHTML) {
      const videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0].textContent
      const channelName = document.getElementsByClassName("style-scope ytd-video-owner-renderer").namedItem("channel-name").innerText

      if (isBlocked(titleFilters, videoTitle, channelFilters, channelName)) {
        timeDisplay.style.visibility = "hidden"
      } else {
        timeDisplay.style.visibility = "visible"
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// Removing video length infomation from the bottom right of a thumbnail if necessary.
const blockThumbnailSpoiler = (pageType, video, titleFilters, channelFilters, timeDisplay) => {
  try {
    const metadata = getVideoMetadata(pageType, video)

    if (isBlocked(titleFilters, metadata.title, channelFilters, metadata.channel)) {
      timeDisplay.remove()
    }
  } catch (error) {
    console.error(error);
  }
}

// Return an object containing the video title and channel for a video element.
const getVideoMetadata = (pageType, video) => {
  let videoTitle = ""
  let channelName = ""

  switch (pageType) {
    case "home":
      videoTitle = video.getElementsByTagName("a").namedItem("video-title-link").title
      channelName = video.getElementsByTagName("a").namedItem("avatar-link").title
      break;
    case "video":
      videoTitle = video.getElementsByTagName("span").namedItem("video-title").title
      channelName = video.getElementsByClassName("style-scope ytd-channel-name").namedItem("text").innerHTML
      break;
    case "channel":
      videoTitle = video.getElementsByTagName("a").namedItem("video-title").title
      channelName = document.getElementsByTagName("div").namedItem("inner-header-container").firstElementChild.firstElementChild.innerText.trim()
      break;
    case "subscriptions":
    case "search":
    case "trending":
      videoTitle = video.getElementsByTagName("a").namedItem("video-title").title
      channelName = video.getElementsByClassName("yt-simple-endpoint style-scope yt-formatted-string")[0].innerHTML
  }

  return { title: videoTitle, channel: channelName }
}

// Return true if the given title or channel is blocked by the given title or channel filters.
const isBlocked = (titleFilters, videoTitle, channelFilters, channelName) => {
  return titleFilters.some(filter => videoTitle.toLowerCase().includes(filter.toLowerCase())) ||
    channelFilters.some(filter => channelName.toLowerCase() === filter.toLowerCase())
}

// Create an observer that blocks spoilers each time a new time display is added to the DOM.
const observer = new MutationObserver((mutationList, _observer) => {
  mutationList.forEach(mutation => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        // If the new node is a video length then check if any spoilers should be blocked.
        if (node.nodeName.toLowerCase() === "ytd-thumbnail-overlay-time-status-renderer") {
          blockSpoilers()
        }
      })
    }
  })
});

observer.observe(document, { childList: true, subtree: true });

browser.runtime.onMessage.addListener(request => {
  // Retransmitting message if it is meant for the browser action. This allows the browser action to initialize and start listening itself.
  if (request.addFilter) {
    browser.runtime.sendMessage(request)
  }
  // Message recieved from the browser action, sent when a new filter is added.
  if (request.blockSpoilers) {
    blockSpoilers()
  }
});