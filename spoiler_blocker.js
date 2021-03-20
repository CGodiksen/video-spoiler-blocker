function blockSpoilers() {
  if (window.location.href.includes("watch")) {
    blockPlayerSpoilers()
    blockThumbnailSpoilers("video")
  } else {
    blockThumbnailSpoilers("home")
  }
}

// Removing video length infomation from the bottom left of the Youtube player if necessary. 
async function blockPlayerSpoilers() {
  const timeDisplay = document.getElementsByClassName("ytp-time-duration")[0]

  const videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0].textContent
  const channelName = document.getElementsByClassName("style-scope ytd-video-owner-renderer").namedItem("channel-name").innerText

  await removeBlocked(videoTitle, channelName, timeDisplay)
}

// Removing video length infomation from the bottom right of thumbnails if necessary.
async function blockThumbnailSpoilers(pageType) {
  const titleFilters = await getExistingsFilters("title")
  const channelFilters = await getExistingsFilters("channel")

  const videos = getVideoElements(pageType)

  for (const video of videos) {
    try {
      const timeDisplay = video.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];
      const metadata = getVideoMetadata(pageType, video)

      const titleBlocked = titleFilters.some(filter => metadata.title.toLowerCase().includes(filter.toLowerCase()))
      if (titleBlocked && timeDisplay) {
        timeDisplay.remove()
      }

      const channelBlocked = channelFilters.some(filter => metadata.channel.toLowerCase() === filter.toLowerCase())
      if (channelBlocked && timeDisplay) {
        timeDisplay.remove()
      }
    } catch (error) {
      console.error(error);
    }
  }
}

// Return all video elements in the current document. These elements contain both the thumbnail and video metadata.
function getVideoElements(pageType) {
  const className = (pageType === "home") ? "style-scope ytd-rich-grid-media" : "style-scope ytd-compact-video-renderer"
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
function getVideoMetadata(pageType, video) {
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
  }

  return { title: videoTitle, channel: channelName }
}

// Return a promise to deliver all filters of a specific type from local storage. 
async function getExistingsFilters(filterType) {
  const result = await browser.storage.local.get(filterType).catch(error => onError(error));
  return (Object.keys(result).length !== 0) ? result[filterType] : []
}

// Calling the block function when the video length information has loaded in.
function blockWhenReady() {
  const timeDisplays = document.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer");

  if (timeDisplays.length > 1) {
    blockSpoilers()
  } else {
    setTimeout(blockWhenReady, 100);
  }
}

blockWhenReady()