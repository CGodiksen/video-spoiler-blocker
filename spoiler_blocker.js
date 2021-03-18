if (window.location.href.includes("watch")) {
  const videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0]
  const timeDisplay = document.getElementsByClassName("ytp-time-display notranslate")[0]

  console.log(videoTitle.textContent)
  console.log(timeDisplay);

  if (videoTitle.textContent.includes("Positive Mood")) {
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
  
  // Removing the video length if the video title or channel name is blocked.
  videos.forEach(video => {
    const [thumbnail, details] = video.childNodes
    const videoLength = thumbnail.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];
    
    const videoTitle = details.getElementsByTagName("a").namedItem("video-title-link").title
    if (videoTitle.includes("Mars") && videoLength) {
      videoLength.remove()
    }

    const channelName = details.childNodes[0].title
    if (channelName.includes("Relax Cafe" && videoLength)) {
      videoLength.remove()
    }
  });
}