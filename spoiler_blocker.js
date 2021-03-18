if (window.location.href.includes("watch")) {
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

} else {
  // Extracting every video on the homepage.
  const grid_media = document.getElementsByClassName("style-scope ytd-rich-grid-media")
  const videos = []
  for (let i = 0; i < grid_media.length; i++) {
    if (grid_media[i].id === "dismissible") {
      videos.push(grid_media[i])
    }
  }
  
  // Removing the video length on the thumbnail if the video title or channel name is blocked.
  videos.forEach(video => {
    const [thumbnail, details] = video.childNodes
    const videoLength = thumbnail.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];
    
    const videoTitle = details.getElementsByTagName("a").namedItem("video-title-link").title
    if (videoTitle.includes("Mars") && videoLength) {
      videoLength.remove()
    }

    const channelName = details.getElementsByTagName("a").namedItem("avatar-link").title
    if (channelName.includes("Lounge") && videoLength) {
      videoLength.remove()
    }
  });
}