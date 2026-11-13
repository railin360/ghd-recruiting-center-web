"use strict";
(() => {
  const $ = selector => document.querySelector(selector);
  const text = (selector,value) => { const el = $(selector); if (el) el.textContent = value; };
  const sourceList = $("#source-list");
  const activityList = $("#activity-list");
  const filters = [...document.querySelectorAll("[data-filter]")];
  let feed = null;
  let roleFilter = "all";
  const dateLabel = date => { if (!date) return "Not recorded"; const d = new Date(date); return Number.isNaN(d.getTime()) ? date : new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(d); };
  const make = (tag, value, className) => { const el=document.createElement(tag); if(value !== undefined && value !== null) el.textContent=String(value); if(className)el.className=className; return el; };
  const safeLink = url => { try { const result = new URL(url); if(result.protocol!=="https:") return null; return result.href; } catch { return null; } };
  const renderSources = () => {
    if(!feed) return;
    const sources = (Array.isArray(feed.sources) ? feed.sources : []).filter(x => roleFilter==="all" || x.role==="Both roles" || x.role===roleFilter);
    sourceList.replaceChildren();
    if(!sources.length) { sourceList.append(make("p","No matching sources in this activity report.","scout-loading")); return; }
    for(const s of sources){
      const card=make("article",null,"scout-source");
      const top=make("div",null,"scout-source-top");
      top.append(make("h3",s.name),make("span",s.stage || "Unverified","scout-stage"));
      card.append(top,make("p",s.type || "Referral channel","scout-type"),make("p",s.note || "No activity recorded.","scout-note"));
      const bottom=make("div",null,"scout-source-bottom");
      const link=make("a","Explore employer program ↗");const href=safeLink(s.url);
      if(href){link.href=href;link.rel="noopener noreferrer";link.target="_blank";} else {link.textContent="Program URL not available";}
      bottom.append(link,make("small","Last action: "+dateLabel(s.last_action)));
      card.append(bottom);sourceList.append(card);
    }
  };
  const renderActions = () => {
    activityList.replaceChildren();
    const actions=Array.isArray(feed.actions)?feed.actions.slice(0,8):[];
    if(!actions.length){activityList.append(make("li","No completed actions reported yet."));return;}
    for(const a of actions){
      const li=make("li");li.append(make("time",dateLabel(a.date)),make("strong",a.title),make("span",a.detail));activityList.append(li);
    }
  };
  const render = data => {
    feed=data;
    const nums=data.numbers || {};
    text("#count-channels",Number.isInteger(nums.verified_referral_channels)?nums.verified_referral_channels:"—");
    text("#count-sends",Number.isInteger(nums.outreach_sent)?nums.outreach_sent:"—");
    text("#count-matches",Number.isInteger(nums.candidate_matches_confirmed)?nums.candidate_matches_confirmed:"—");
    text("#count-interviews",Number.isInteger(nums.interviews_confirmed)?nums.interviews_confirmed:"—");
    text("#scout-status",data.status || "No reported status");
    text("#scout-schedule",data.scout_schedule || "Schedule unavailable");
    text("#last-checked",data.last_checked_at?"Activity feed updated "+dateLabel(data.last_checked_at):"Not updated yet");
    text("#scout-disclosure",data.disclosure || "No private applicant information is published.");
    renderSources();renderActions();
  };
  async function refresh(){
    const btn=$("#scout-refresh");btn.disabled=true;btn.textContent="Checking…";$("#scout-error").hidden=true;
    try{
      const response=await fetch("scout-feed.json?nocache="+Date.now(),{cache:"no-store"});
      if(!response.ok)throw new Error("Recruiting feed is unavailable ("+response.status+").");
      const data=await response.json();
      if(data.schema_version!==1 || !Array.isArray(data.sources))throw new Error("Recruiting feed is invalid.");
      render(data);
    }catch(error){text("#scout-error","Unable to refresh: "+error.message);$("#scout-error").hidden=false;}
    finally{btn.disabled=false;btn.textContent="↻ Refresh activity";}
  }
  filters.forEach(button=>button.addEventListener("click",()=>{
    roleFilter=button.dataset.filter;
    for(const b of filters){const active=b===button;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));}
    renderSources();
  }));
  $("#scout-refresh").addEventListener("click",refresh);
  text("#scout-year",new Date().getFullYear());
  refresh();
  window.addEventListener("focus",()=>{if(document.visibilityState==="visible")refresh();});
})();
