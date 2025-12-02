const api = typeof browser !== "undefined" ? browser : chrome;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExtension);
} else {
  initExtension();
}

function initExtension() {
  api.runtime.onMessage.addListener((msg) => {
    if (msg.type === "toggle-extension") {
      EXTENSION.toggleExtension();
    }
  });
}
