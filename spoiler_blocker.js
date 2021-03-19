const blockSpoilers = () => {
  if (window.location.href.includes("watch")) {
    blockPlayerSpoilers()
    blockThumbnailSpoilers("style-scope ytd-compact-video-renderer")
  } else {
    blockThumbnailSpoilers("style-scope ytd-rich-grid-media")
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
const blockThumbnailSpoilers = (videoClassName) => {
  // Extracting every video on the page.
  const grid_media = document.getElementsByClassName(videoClassName)
  const videos = []
  for (let i = 0; i < grid_media.length; i++) {
    if (grid_media[i].id === "dismissible") {
      videos.push(grid_media[i])
    }
  }
  console.log(videos.length);

  // Removing the video length on the thumbnail if the video title or channel name is blocked.
  videos.forEach(video => {
    try {
      console.log("hello");
      const thumbnail = video.childNodes[1]
      const details = video.childNodes[3]

      const videoLength = thumbnail.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];

      const videoTitle = details.getElementsByTagName("span").namedItem("video-title").title
      if (videoTitle.includes("Rihanna") && videoLength) {
        videoLength.remove()
      }

      const channelName = details.getElementsByTagName("a").namedItem("avatar-link").title
      if (channelName === "Lounge" && videoLength) {
        videoLength.remove()
      }
    } catch (error) {
      console.error(error);
    }
  })
}

blockSpoilers()