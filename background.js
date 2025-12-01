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
  api.tabs.sendMessage(tab.id, { type: "toggle-panel" });
}

/*async function capture(api, windowId) {
  return new Promise((resolve, reject) => {
    if (currentBrowser === "firefox") {
      api.tabs.captureVisibleTab({ format: "png" }).then(resolve).catch(reject);
    } else {
      if (currentBrowser === "opera") {
        api.tabs.captureVisibleTab(
          windowId ?? null,
          { format: "png" },
          (res) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(res);
          }
        );
      } else {
        api.tabs.captureVisibleTab(windowId, { format: "png" }, (res) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(res);
        });
      }
    }
  });
}*/

/*api.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === "pageClick") {
    const { id: tabId, windowId } = sender.tab;

    try {
      const dataUrl = await capture(api, windowId);

      api.tabs.sendMessage(tabId, {
        type: "screenshot",
        dataUrl,
        x: msg?.x || null,
        y: msg?.y || null,
      });
    } catch (e) {
      console.error(e);
    }
  }
});

*/
