// Check all videos in the current document for spoilers and block them if any are found.
const blockSpoilers = () => {
  const pageType = getPageType()
  const videos = getVideoElements(pageType)

  if (pageType === "video") {
    blockPlayerSpoiler()
  }

  for (const video of videos) {
    const timeDisplay = video.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];

    if (timeDisplay) {
      blockThumbnailSpoiler(video, timeDisplay)
    }
  }
}

const getPageType = () => {
  const url = window.location.href

  if (url.includes("/watch?")) {
    return "video"
  } else if (url.includes("/c/") || url.includes("/channel/") || url.includes("/user/")) {
    return "channel"
  } else if (url.includes("/results?")) {
    return "search"
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
      className = "style-scope ytd-grid-video-renderer"
      break;
    case "search":
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

// Removing video length infomation from the bottom left of the Youtube player if necessary. 
const blockPlayerSpoiler = async () => {
  try {
    const timeDisplay = document.getElementsByClassName("ytp-time-duration")[0]

    if (timeDisplay && timeDisplay.innerHTML) {
      const [titleFilters, channelFilters] = await getExistingsFilters()

      const videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0].textContent
      const channelName = document.getElementsByClassName("style-scope ytd-video-owner-renderer").namedItem("channel-name").innerText

      removeBlocked(titleFilters, videoTitle, channelFilters, channelName, timeDisplay, (time) => time.innerHTML = "")
    }
  } catch (error) {
    console.error(error);
  }
}

// Removing video length infomation from the bottom right of a thumbnail if necessary.
const blockThumbnailSpoiler = async (video, timeDisplay) => {
  try {
    const [titleFilters, channelFilters] = await getExistingsFilters()

    const pageType = getPageType()
    const metadata = getVideoMetadata(pageType, video)

    removeBlocked(titleFilters, metadata.title, channelFilters, metadata.channel, timeDisplay, (time) => time.remove())
  } catch (error) {
    console.error(error);
  }
}

// Return a promise to deliver all filters from local storage. 
const getExistingsFilters = async () => {
  const result = await browser.storage.local.get(null).catch(error => console.error(error));

  const titleFilters = (Object.keys(result).length !== 0) ? result["title"] : []
  const channelFilters = (Object.keys(result).length !== 0) ? result["channel"] : []

  return [titleFilters, channelFilters]
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
      const splitUrl = window.location.href.split("/")
      channelName = (splitUrl.length === 5) ? splitUrl.slice(-1)[0] : splitUrl.slice(-2)[0]
      break;
    case "search":
      videoTitle = video.getElementsByTagName("a").namedItem("video-title").title
      channelName = video.getElementsByClassName("yt-simple-endpoint style-scope yt-formatted-string")[1].innerHTML
  }

  return { title: videoTitle, channel: channelName }
}

// Remove the given time display with the callback if either its title or channel is blocked by the filters.
const removeBlocked = (titleFilters, videoTitle, channelFilters, channelName, timeDisplay, removeCallback) => {
  if (titleFilters.some(filter => videoTitle.toLowerCase().includes(filter.toLowerCase()))) {
    removeCallback(timeDisplay)
  }

  if (channelFilters.some(filter => channelName.toLowerCase() === filter.toLowerCase())) {
    removeCallback(timeDisplay)
  }
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
  if (request.blockSpoilers) {
    blockSpoilers()
  }
});