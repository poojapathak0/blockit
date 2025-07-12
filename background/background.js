// Background Service Worker - Core Engine
class BraveCloneEngine {
  constructor() {
    this.stats = {
      adsBlocked: 0,
      trackersBlocked: 0,
      httpsUpgrades: 0,
      scriptsBlocked: 0,
      fingerprintingBlocked: 0
    };
    this.settings = {
      adBlocking: true,
      trackerBlocking: true,
      httpsUpgrade: true,
      scriptBlocking: false,
      fingerprintingProtection: true,
      cookieBlocking: true,
      shieldsUp: true
    };
    this.init();
  }

  async init() {
    // Load saved settings
    const savedSettings = await chrome.storage.sync.get('braveSettings');
    if (savedSettings.braveSettings) {
      this.settings = { ...this.settings, ...savedSettings.braveSettings };
    }

    // Load saved stats
    const savedStats = await chrome.storage.local.get('braveStats');
    if (savedStats.braveStats) {
      this.stats = { ...this.stats, ...savedStats.braveStats };
    }

    this.setupEventListeners();
    this.setupContextMenus();
    this.setupAlarms();
    this.updateDeclarativeRules();
  }

  async updateDeclarativeRules() {
    try {
      // Enable/disable rulesets based on settings
      const enabledRulesets = [];
      const disabledRulesets = [];
      
      if (this.settings.adBlocking && this.settings.shieldsUp) {
        enabledRulesets.push('ruleset_1');
      } else {
        disabledRulesets.push('ruleset_1');
      }
      
      if (this.settings.trackerBlocking && this.settings.shieldsUp) {
        enabledRulesets.push('ruleset_2');
      } else {
        disabledRulesets.push('ruleset_2');
      }
      
      if (this.settings.httpsUpgrade && this.settings.shieldsUp) {
        enabledRulesets.push('ruleset_3');
      } else {
        disabledRulesets.push('ruleset_3');
      }

      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enabledRulesets,
        disableRulesetIds: disabledRulesets
      });
      
      console.log('Declarative rules updated:', enabledRulesets);
    } catch (error) {
      console.error('Failed to update declarative rules:', error);
    }
  }

  setupEventListeners() {
    // Tab events
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));

    // Navigation events
    chrome.webNavigation.onBeforeNavigate.addListener(this.handleBeforeNavigate.bind(this));
    chrome.webNavigation.onCompleted.addListener(this.handleNavigationCompleted.bind(this));

    // Message handling
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  setupContextMenus() {
    // Remove all existing context menus first
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "brave-shields-toggle",
        title: "Toggle Brave Shields",
        contexts: ["page"]
      });

      chrome.contextMenus.create({
        id: "brave-block-scripts",
        title: "Block Scripts on this Site",
        contexts: ["page"]
      });

      chrome.contextMenus.create({
        id: "brave-report-site",
        title: "Report Broken Site",
        contexts: ["page"]
      });
    });

    chrome.contextMenus.onClicked.addListener(this.handleContextMenu.bind(this));
  }

  setupAlarms() {
    // Save stats periodically
    chrome.alarms.create('saveStats', { periodInMinutes: 5 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'saveStats') {
        this.saveStats();
      }
    });
  }

  async handleTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      // HTTPS upgrade is handled by declarative rules
      this.updateBadge(tabId);
    }
  }

  async handleTabActivated(activeInfo) {
    this.updateBadge(activeInfo.tabId);
  }

  async handleBeforeNavigate(details) {
    if (details.frameId === 0) { // Main frame
      // Reset tab-specific stats
      await this.resetTabStats(details.tabId);
    }
  }

  async handleNavigationCompleted(details) {
    if (details.frameId === 0) { // Main frame
      // Inject content scripts if needed
      if (this.settings.shieldsUp) {
        await this.injectProtectionScripts(details.tabId);
      }
    }
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'getStats':
        sendResponse(this.stats);
        break;
      case 'getSettings':
        sendResponse(this.settings);
        break;
      case 'updateSettings':
        this.settings = { ...this.settings, ...request.settings };
        await chrome.storage.sync.set({ braveSettings: this.settings });
        await this.updateDeclarativeRules();
        sendResponse({ success: true });
        break;
      case 'resetStats':
        this.stats = {
          adsBlocked: 0,
          trackersBlocked: 0,
          httpsUpgrades: 0,
          scriptsBlocked: 0,
          fingerprintingBlocked: 0
        };
        await this.saveStats();
        sendResponse({ success: true });
        break;
    }
  }

  async handleContextMenu(info, tab) {
    switch (info.menuItemId) {
      case 'brave-shields-toggle':
        this.settings.shieldsUp = !this.settings.shieldsUp;
        await chrome.storage.sync.set({ braveSettings: this.settings });
        await chrome.tabs.reload(tab.id);
        break;
      case 'brave-block-scripts':
        this.settings.scriptBlocking = !this.settings.scriptBlocking;
        await chrome.storage.sync.set({ braveSettings: this.settings });
        await chrome.tabs.reload(tab.id);
        break;
      case 'brave-report-site':
        await chrome.tabs.create({
          url: `https://github.com/brave/brave-browser/issues/new?template=bug_report.md&title=Site%20Issue:%20${encodeURIComponent(tab.url)}`
        });
        break;
    }
  }

  isAd(url) {
    const adPatterns = [
      /doubleclick\.net/,
      /googleadservices\.com/,
      /googlesyndication\.com/,
      /amazon-adsystem\.com/,
      /adsystem\.amazon/,
      /facebook\.com\/tr/,
      /connect\.facebook\.net/,
      /ads\.yahoo\.com/,
      /advertising\.com/,
      /adsystem\.amazon\.com/,
      /googletag/,
      /\/ads\//,
      /\/advertisement/,
      /\/adsense/,
      /\/adnxs/,
      /\/adform/,
      /\/outbrain/,
      /\/taboola/
    ];
    return adPatterns.some(pattern => pattern.test(url));
  }

  isTracker(url) {
    const trackerPatterns = [
      /google-analytics\.com/,
      /googletagmanager\.com/,
      /facebook\.com\/tr/,
      /scorecardresearch\.com/,
      /quantserve\.com/,
      /mixpanel\.com/,
      /hotjar\.com/,
      /crazyegg\.com/,
      /mouseflow\.com/,
      /fullstory\.com/,
      /segment\.com/,
      /amplitude\.com/,
      /kissmetrics\.com/,
      /analytics/,
      /tracking/,
      /telemetry/
    ];
    return trackerPatterns.some(pattern => pattern.test(url));
  }

  isScript(url) {
    return url.includes('.js') || url.includes('javascript:');
  }

  isTrackingPixel(url) {
    const pixelPatterns = [
      /\.gif\?/,
      /\.png\?/,
      /\/pixel/,
      /\/beacon/,
      /\/collect/,
      /\/track/
    ];
    return pixelPatterns.some(pattern => pattern.test(url));
  }

  isTrackingHeader(headerName) {
    const trackingHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'cf-connecting-ip',
      'true-client-ip'
    ];
    return trackingHeaders.includes(headerName);
  }

  sanitizeHeaders(headers) {
    // Remove/modify fingerprinting headers
    return headers.map(header => {
      if (header.name.toLowerCase() === 'user-agent') {
        header.value = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      }
      if (header.name.toLowerCase() === 'accept-language') {
        header.value = 'en-US,en;q=0.9';
      }
      return header;
    });
  }

  addSecurityHeaders(headers) {
    const securityHeaders = [
      { name: 'X-Frame-Options', value: 'DENY' },
      { name: 'X-Content-Type-Options', value: 'nosniff' },
      { name: 'X-XSS-Protection', value: '1; mode=block' },
      { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
    ];

    securityHeaders.forEach(secHeader => {
      if (!headers.find(h => h.name.toLowerCase() === secHeader.name.toLowerCase())) {
        headers.push(secHeader);
      }
    });

    return headers;
  }

  async updateBadge(tabId) {
    const totalBlocked = this.stats.adsBlocked + this.stats.trackersBlocked + this.stats.scriptsBlocked;
    await chrome.action.setBadgeText({
      text: totalBlocked > 0 ? totalBlocked.toString() : '',
      tabId: tabId
    });
    await chrome.action.setBadgeBackgroundColor({ color: '#ff6600' });
  }

  async resetTabStats(tabId) {
    // Reset per-tab statistics if needed
  }

  async injectProtectionScripts(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['scripts/fingerprint-protection.js']
      });
    } catch (error) {
      console.log('Failed to inject protection scripts:', error);
    }
  }

  async saveStats() {
    await chrome.storage.local.set({ braveStats: this.stats });
  }
}

// Initialize the Brave Clone Engine
const braveEngine = new BraveCloneEngine();
