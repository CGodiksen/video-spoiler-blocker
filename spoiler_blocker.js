if (window.location.href.includes("watch")) {
  console.log("Test");
  var videoTitle = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0]
  var timeDisplay = document.getElementsByClassName("ytp-time-display notranslate")[0]

  console.log(videoTitle.textContent)
  console.log(timeDisplay);

  if (videoTitle.textContent.includes("Positive Mood")) {
    timeDisplay.remove()
  }
}