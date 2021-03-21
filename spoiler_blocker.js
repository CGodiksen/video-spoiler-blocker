const blockSpoilers = async () => {
  console.log("Blocking spoilers");
  const titleFilters = await getExistingsFilters("title")
  const channelFilters = await getExistingsFilters("channel")

  const url = window.location.href
  if (url.includes("/watch?")) {
    blockPlayerSpoilers(titleFilters, channelFilters)
    blockThumbnailSpoilers("video", titleFilters, channelFilters)
  } else if (url.includes("/c/") || url.includes("/channel/") || url.includes("/user/")) {
    blockThumbnailSpoilers("channel", titleFilters, channelFilters)
  } else {
    blockThumbnailSpoilers("home", titleFilters, channelFilters)
  }
}

// Removing video length infomation from the bottom left of the Youtube player if necessary. 
const blockPlayerSpoilers = (titleFilters, channelFilters) => {
  const timeDisplay = document.getElementsByClassName("ytp-time-duration")[0]

  const videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0].textContent
  const channelName = document.getElementsByClassName("style-scope ytd-video-owner-renderer").namedItem("channel-name").innerText

  removeBlocked(titleFilters, videoTitle, channelFilters, channelName, timeDisplay, (time) => time.innerHTML = "")
}

// Removing video length infomation from the bottom right of thumbnails if necessary.
const blockThumbnailSpoilers = (pageType, titleFilters, channelFilters) => {
  const videos = getVideoElements(pageType)

  for (const video of videos) {
    try {
      const timeDisplay = video.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];
      const metadata = getVideoMetadata(pageType, video)

      removeBlocked(titleFilters, metadata.title, channelFilters, metadata.channel, timeDisplay, (time) => time.remove())
    } catch (error) {
      console.error(error);
    }
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
  }

  return { title: videoTitle, channel: channelName }
}

// Remove the given time display with the callback if either its title or channel is blocked by the filters.
const removeBlocked = (titleFilters, videoTitle, channelFilters, channelName, timeDisplay, removeCallback) => {
  const titleBlocked = titleFilters.some(filter => videoTitle.toLowerCase().includes(filter.toLowerCase()))
  if (titleBlocked && timeDisplay) {
    removeCallback(timeDisplay)
  }

  const channelBlocked = channelFilters.some(filter => channelName.toLowerCase() === filter.toLowerCase())
  if (channelBlocked && timeDisplay) {
    removeCallback(timeDisplay)
  }
}

// Return a promise to deliver all filters of a specific type from local storage. 
const getExistingsFilters = async (filterType) => {
  const result = await browser.storage.local.get(filterType).catch(error => onError(error));
  return (Object.keys(result).length !== 0) ? result[filterType] : []
}

// Calling the block function when the video length information has loaded in.
const blockWhenReady = () => {
  const timeDisplays = document.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer");

  if (timeDisplays.length > 1) {
    blockSpoilers()
  } else {
    setTimeout(blockWhenReady, 200);
  }
}

blockWhenReady()

// Blocking spoilers when the background script or browser action requests it.
browser.runtime.onMessage.addListener(request => {
  if (request.blockSpoilers) {
    blockSpoilers()
  }
});

// Create an observer instance linked to the callback function
const observer = new MutationObserver((mutationsList, _observer) => {
  mutationsList.forEach(mutation => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName.toLowerCase() === "ytd-thumbnail-overlay-time-status-renderer") {
          blockSpoilers()
        }
      })
    }
  })
});

// Start observing the target node for configured mutations
observer.observe(document, { attributes: true, childList: true, subtree: true });