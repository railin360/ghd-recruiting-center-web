"use strict";
(() => {
  const pages = {
    statistics: {title: "Recruiting Statistics", subtitle: "Verified recruitment numbers for Hopewell, Virginia."},
    candidates: {title: "Candidate Inboxes", subtitle: "Separate private submissions for Package, AVP and candidate questions."},
    sources: {title: "Talent Sources", subtitle: "Real job-seeker programs and active recruiting partners."},
    activity: {title: "Recruitment Activity", subtitle: "Confirmed scout actions and referral outreach history."},
    automation: {title: "Auto Recruit Control", subtitle: "Protected settings for the scheduled GHD sourcing process."}
  };
  const links = [...document.querySelectorAll("[data-dashboard-target]")];
  const panels = [...document.querySelectorAll("[data-dashboard-panel]")];
  const sidebar = document.getElementById("dash-sidebar");
  const overlay = document.getElementById("dash-overlay");
  const toggle = document.getElementById("dash-menu");
  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }
  function show(page, updateHash = true) {
    const id = Object.hasOwn(pages, page) ? page : "statistics";
    panels.forEach(panel => { panel.hidden = panel.dataset.dashboardPanel !== id; });
    links.forEach(link => { if (link.closest(".dash-side-links")) { if (link.dataset.dashboardTarget === id) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current"); } });
    document.getElementById("dash-page-title").textContent = pages[id].title;
    document.getElementById("dash-page-subtitle").textContent = pages[id].subtitle;
    if (updateHash && location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    closeMenu();
    window.scrollTo({top:0,behavior:"instant"});
  }
  links.forEach(link => link.addEventListener("click", () => show(link.dataset.dashboardTarget)));
  toggle.addEventListener("click", () => {
    const open = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", open);
    overlay.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  });
  overlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", event => {if (event.key === "Escape") closeMenu();});
  window.addEventListener("hashchange", () => show(location.hash.slice(1), false));
  show(location.hash.slice(1), false);
})();
