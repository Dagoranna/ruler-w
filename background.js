var currentBrowser;

function isOpera() {
  return navigator.userAgent.includes("OPR/");
}

if (isOpera()) {
  currentBrowser = "opera";
  console.log("opera");
} else if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  currentBrowser = "chrome";
  console.log("chrome");
} else {
  currentBrowser = "firefox";
  console.log("firefox");
}

const api = currentBrowser === "firefox" ? browser : chrome;

if (currentBrowser === "firefox") {
  api.browserAction.onClicked.addListener(handleClick);
} else {
  api.action.onClicked.addListener(handleClick);
}

function handleClick(tab) {
  console.log(tab.url);
  api.tabs.sendMessage(tab.id, { type: "toggle-extension" });
}
