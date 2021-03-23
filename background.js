// Create a context menu item that is visible when the user right-clicks a channel link.
browser.contextMenus.create({
  id: "add-channel-filter",
  title: "Block Spoilers From Channel",
  contexts: ["link"],
  command: "_execute_browser_action",
  targetUrlPatterns: ["*://*.youtube.com/user/*", "*://*.youtube.com/c/*", "*://*.youtube.com/channel/*"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  // Send a message to the browser action, requesting the channel to be added to the filters.
  if (info.menuItemId === "add-channel-filter") {
    // Exclude when the user right-clicks a channel image that has the complete channel url as the linkText.
    if (!info.linkText.includes("https://www.youtube.com/")) {
      setTimeout(() => browser.tabs.sendMessage(tab.id, { addFilter: true, channelName: info.linkText }), 500);
    }
  }
})