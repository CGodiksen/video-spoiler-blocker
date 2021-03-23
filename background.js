// Create a context menu item that is visible when the user right-clicks a channel link.
browser.contextMenus.create({
  id: "add-channel-filter",
  title: "Block Spoilers From Channel",
  contexts: ["link"],
  command: "_execute_browser_action",
  targetUrlPatterns: ["*://*.youtube.com/user/*", "*://*.youtube.com/c/*", "*://*.youtube.com/channel/*"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  // When the "add-channel-filter" is clicked, send a message to the browser action, requesting the channel to be added to the filters.
  if (info.menuItemId === "add-channel-filter") {
    setTimeout(() => browser.tabs.sendMessage(tab.id, { addFilter: true, channelName: info.linkText }), 500);
  }
})