/* GHD Recruiting Center: installable home-screen app */
(() => {
  "use strict";
  let pendingPrompt = null;
  const buttons = [...document.querySelectorAll(".install-app-btn")];
  const notice = document.getElementById("install-app-notice");
  const installed = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  function message(title, body) {
    if (!notice) return;
    notice.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = title;
    const detail = document.createElement("p");
    detail.textContent = body;
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "Got it";
    close.addEventListener("click", () => { notice.hidden = true; });
    notice.append(heading, detail, close);
    notice.hidden = false;
    notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function refresh() {
    const isInstalled = installed();
    for (const button of buttons) {
      button.disabled = isInstalled;
      button.textContent = isInstalled ? "✓ GHD App installed" : "↓ Install GHD App";
      if (isInstalled) button.title = "Already running as a home-screen app";
    }
  }
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    pendingPrompt = event;
    refresh();
  });
  window.addEventListener("appinstalled", () => {
    pendingPrompt = null;
    message("GHD Recruiting Center installed", "Find the GHD logo on your home screen. Tap it to open Recruiting Center.");
    refresh();
  });
  async function install() {
    if (installed()) {
      message("Already on your home screen", "You are using the installed GHD Recruiting Center.");
      return;
    }
    if (pendingPrompt) {
      const event = pendingPrompt;
      pendingPrompt = null;
      try {
        await event.prompt();
        const response = await event.userChoice;
        if (response.outcome !== "accepted") {
          message("Installation not completed", "You can install the GHD app later using this button or your browser menu.");
        }
      } catch {
        manualInstructions();
      }
      return;
    }
    manualInstructions();
  }
  function manualInstructions() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    if (isIOS) {
      message("Install on iPhone or iPad", "Open this page in Safari, tap Share, then choose Add to Home Screen and tap Add. The GHD logo will be your app icon.");
    } else if (isAndroid) {
      message("Install on Android", "Open this page in Chrome, tap the three-dot menu (⋮), choose Install app or Add to Home screen, and confirm. The GHD logo will appear on your home screen.");
    } else {
      message("Install on your device", "In Chrome or Edge, use the Install icon in the address bar, or open the browser menu and choose Install GHD Recruiting Center / Install app. Some browsers only support a home-screen shortcut.");
    }
  }
  buttons.forEach(button => button.addEventListener("click", install));
  refresh();
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
        /* Site stays available online if service workers are disabled. */
      });
    });
  }
})();