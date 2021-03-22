browser.contextMenus.create({
  id: "add-channel-filter",
  title: "Block Spoilers From Channel",
  contexts: ["link"],
  targetUrlPatterns: ["*://*.youtube.com/user/*", "*://*.youtube.com/c/*", "*://*.youtube.com/channel/*"]
});

browser.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === "add-channel-filter") {
    console.log(info.linkText);
  }
})