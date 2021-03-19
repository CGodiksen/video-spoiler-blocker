const blockSpoilers = () => {
  if (window.location.href.includes("watch")) {
    blockPlayerSpoilers()
  } else {
    blockThumbnailSpoilers("home")
  }
}

// Removing video length infomation from the bottom left of the Youtube player if necessary. 
const blockPlayerSpoilers = () => {
  const timeDisplay = document.getElementsByClassName("ytp-time-display notranslate")[0]

  // Removing the video length from the player if the title is blocked.
  const videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0].textContent
  if (videoTitle.includes("Positive Mood") && timeDisplay) {
    timeDisplay.remove()
  }

  // Removing the video length from the player if the channel is blocked.
  const channelName = document.getElementsByClassName("style-scope ytd-video-owner-renderer").namedItem("channel-name").innerText
  if (channelName === "Lounge Music" && timeDisplay) {
    timeDisplay.remove()
  }
}

// Removing video length infomation from the bottom right of thumbnails if necessary.
const blockThumbnailSpoilers = (pageType) => {
  const videos = getVideoElements(pageType)

  // Removing the video length on the thumbnail if the video title or channel name is blocked.
  videos.forEach(video => {
    try {
      const videoLength = video.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];
      const metadata = getVideoMetadata(pageType, video)
  
      if (metadata.title.includes("Mikkel") && videoLength) {
        videoLength.remove()
      }
      if (metadata.channel === "Lounge" && videoLength) {
        videoLength.remove()
      }
    } catch (error) {
      console.error(error);
    }
  })
}

// Return all video elements in the current document. These elements contain both the thumbnail and video metadata.
const getVideoElements = (pageType) => {
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

// Returns an object containing the video title and channel.
const getVideoMetadata = (pageType, video) => {
  const videoTitle = video.getElementsByTagName("a").namedItem("video-title-link").title
  const channelName = video.getElementsByTagName("a").namedItem("avatar-link").title
  
  return { title: videoTitle, channel: channelName }
}

blockSpoilers()