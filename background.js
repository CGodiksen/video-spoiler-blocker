browser.tabs.onUpdated.addListener(() => {
  browser.tabs.executeScript(null, { file: "spoiler_blocker.js" })
});