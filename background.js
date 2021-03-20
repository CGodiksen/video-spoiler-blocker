browser.webRequest.onCompleted.addListener((_details) => {
  setTimeout(() => browser.tabs.executeScript(null, { file: "spoiler_blocker.js" }), 1000);
}, { urls: ["*://*.youtube.com/*"] })