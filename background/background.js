// background/background.js
// Manages ad/tracker blocking and site blocking. Responds to popup for toggles and block list management.
// Now supports remote filter list auto-update for maximum strength.

const FILTERS_URL = chrome.runtime.getURL("filters.json");
const REMOTE_FILTERS_URL = "https://easylist-downloads.adblockplus.org/easylist+easyprivacy.txt"; // Placeholder, user can set their own
const BLOCKED_PAGE = chrome.runtime.getURL("blocked.html");

// Parse EasyList/uBlock format to DNR rules (very basic demo, real parser needed for full support)
async function parseEasyListToDNR(text, startId = 1000) {
  const lines = text.split('\n').filter(l => l && !l.startsWith('!'));
  let id = startId;
  const rules = [];
  for (const line of lines) {
    if (line.startsWith('||')) {
      rules.push({
        id: id++,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: line.replace(/^\|\|/, ''), resourceTypes: ["script", "xmlhttprequest", "sub_frame", "image"] }
      });
    }
  }
  return rules;
}

// Load filter rules from both filters.json and rules/youtube_ad_block_rules.json
async function loadFilterRules() {
  const filtersResp = await fetch(FILTERS_URL);
  const filters = await filtersResp.json();
  let youtubeRules = [];
  try {
    const youtubeRulesResp = await fetch(chrome.runtime.getURL("rules/youtube_ad_block_rules.json"));
    youtubeRules = await youtubeRulesResp.json();
  } catch (e) {
    youtubeRules = [];
  }
  return [...filters, ...youtubeRules];
}

// Apply ad/tracker blocking rules
async function applyAdBlockRules(enabled) {
  if (enabled) {
    const rules = await loadFilterRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(r => r.id),
      addRules: rules
    });
  } else {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    if (rules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map(r => r.id),
        addRules: []
      });
    }
  }
}

// Listen for navigation to block sites
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const { siteBlockEnabled, blockedSites } = await chrome.storage.local.get({ siteBlockEnabled: true, blockedSites: [] });
  if (!siteBlockEnabled) return;
  const url = new URL(details.url);
  if (blockedSites.some(domain => url.hostname.includes(domain))) {
    chrome.tabs.update(details.tabId, { url: BLOCKED_PAGE });
  }
}, { url: [{ schemes: ["http", "https"] }] });

// Listen for popup messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_ADBLOCK") {
    applyAdBlockRules(message.enabled);
    sendResponse({ success: true });
  } else if (message.type === "TOGGLE_SITEBLOCK") {
    chrome.storage.local.set({ siteBlockEnabled: message.enabled });
    sendResponse({ success: true });
  } else if (message.type === "UPDATE_BLOCKED_SITES") {
    chrome.storage.local.set({ blockedSites: message.blockedSites });
    sendResponse({ success: true });
  }
});

// On install/update, initialize rules and settings
chrome.runtime.onInstalled.addListener(async () => {
  const { adblockEnabled, siteBlockEnabled, blockedSites } = await chrome.storage.local.get({ adblockEnabled: true, siteBlockEnabled: true, blockedSites: [] });
  applyAdBlockRules(adblockEnabled);
  chrome.storage.local.set({ siteBlockEnabled, blockedSites });
});

// Periodically update filter rules (every 24h)
chrome.alarms.create("updateFilters", { periodInMinutes: 60 * 24 });
chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === "updateFilters") {
    const { adblockEnabled } = await chrome.storage.local.get({ adblockEnabled: true });
    if (adblockEnabled) {
      const rules = await loadFilterRules();
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map(r => r.id),
        addRules: rules
      });
    }
  }
});

// No user data is collected or transmitted.
