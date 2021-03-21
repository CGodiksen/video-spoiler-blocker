// const blockSpoiler = async (video, timeDisplay) => {
//   console.log("Blocking spoilers");
//   const titleFilters = await getExistingsFilters("title")
//   const channelFilters = await getExistingsFilters("channel")

// }

// Removing video length infomation from the bottom left of the Youtube player if necessary. 
const blockPlayerSpoilers = (titleFilters, channelFilters) => {
  const timeDisplay = document.getElementsByClassName("ytp-time-duration")[0]

  const videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0].textContent
  const channelName = document.getElementsByClassName("style-scope ytd-video-owner-renderer").namedItem("channel-name").innerText

  removeBlocked(titleFilters, videoTitle, channelFilters, channelName, timeDisplay, (time) => time.innerHTML = "")
}

// Removing video length infomation from the bottom right of a thumbnail if necessary.
const blockThumbnailSpoiler = async (video, timeDisplay) => {
  const titleFilters = await getExistingsFilters("title")
  const channelFilters = await getExistingsFilters("channel")
  
  const pageType = getPageType()
  const metadata = getVideoMetadata(pageType, video)

  removeBlocked(titleFilters, metadata.title, channelFilters, metadata.channel, timeDisplay, (time) => time.remove())
}

const getPageType = () => {
  const url = window.location.href

  if (url.includes("/watch?")) {
    return "video"
  } else if (url.includes("/c/") || url.includes("/channel/") || url.includes("/user/")) {
    return "channel"
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

// Blocking spoilers when the browser action requests it.
browser.runtime.onMessage.addListener(request => {
  if (request.blockSpoilers) {
    blockSpoiler()
  }
});

// Create an observer that blocks spoilers each time a new time display is added to the DOM.
const observer = new MutationObserver((mutationList, _observer) => {
  mutationList.forEach(mutation => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        // If the new node is a video length then check if it should be blocked.
        if (node.nodeName.toLowerCase() === "ytd-thumbnail-overlay-time-status-renderer") {
          // Going up the tree through the parents to find the corresponding video.
          const video = node.parentNode.parentNode.parentNode.parentNode
          blockThumbnailSpoiler(video, node)
        }
      })
    }
  })
});

observer.observe(document, { childList: true, subtree: true });