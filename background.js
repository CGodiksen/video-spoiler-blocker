browser.contextMenus.create({
  id: "add-channel-filter",
  title: "Add Channel Filter",
  contexts: ["link"]
}, () => console.log("Created"));