if (window.location.href.includes("watch")) {
  const videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0]
  const timeDisplay = document.getElementsByClassName("ytp-time-display notranslate")[0]

  console.log(videoTitle.textContent)
  console.log(timeDisplay);

  if (videoTitle.textContent.includes("Positive Mood")) {
    timeDisplay.remove()
  }
} else {
  const grid_media = document.getElementsByClassName("style-scope ytd-rich-grid-media")
  const videos = []
  for (let i = 0; i < grid_media.length; i++) {
    if (grid_media[i].id === "dismissible") {
      videos.push(grid_media[i])
    }
  }
  console.log(videos);
  
  videos.forEach(video => {
    const [thumbnail, details] = video.childNodes

    const videoLength = thumbnail.getElementsByTagName("ytd-thumbnail-overlay-time-status-renderer")[0];
    console.log(videoLength);

    const channelName = details.childNodes[0].title
    console.log(channelName);

    if (channelName.includes("Relax Cafe")) {
      videoLength.remove()
    }
  });
}