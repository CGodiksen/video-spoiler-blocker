browser.tabs.onUpdated.addListener(() => {
  browser.tabs.executeScript(null, { file: "spoiler_blocker.js" })
});

browser.webRequest.onCompleted.addListener((_details) => {
  setTimeout(() => browser.tabs.executeScript(null, { file: "spoiler_blocker.js" }), 1000);
}, { urls: ["*://*.youtube.com/*"] })

// Send a message to all Youtube tabs notifying them that the filters have been changed.
const notifyTabs = async () => {
  const tabs = await browser.tabs.query({ url: "*://*.youtube.com/*" })

  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, { blockSpoilers: true })
  }
}