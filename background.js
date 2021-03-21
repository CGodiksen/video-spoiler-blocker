browser.tabs.onUpdated.addListener(() => {
  requestBlock()
});

browser.webRequest.onCompleted.addListener((_details) => {
  setTimeout(() => requestBlock(), 1000);
}, { urls: ["*://*.youtube.com/*"] })

// Send a message to all Youtube tabs notifying them that they should block spoilers.
const requestBlock = async () => {
  const tabs = await browser.tabs.query({ url: "*://*.youtube.com/*" })

  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, { blockSpoilers: true })
  }
}