// When a tab url is changed to a Youtube video then request that the potential spoiler in the player is blocked.
browser.tabs.onUpdated.addListener((tabId, changeInfo, _tabInfo) => {
  if (changeInfo.status === "complete") {
    browser.tabs.sendMessage(tabId, { blockPlayerSpoiler: true })
  }
}, {urls: ["*://*.youtube.com/watch*"]});