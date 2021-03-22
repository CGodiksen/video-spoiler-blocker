browser.contextMenus.create({
  id: "add-channel-filter",
  title: "Block Spoilers From Channel",
  contexts: ["link"],
  targetUrlPatterns: ["*://*.youtube.com/user/*", "*://*.youtube.com/c/*", "*://*.youtube.com/channel/*"]
}, () => console.log("Created"));