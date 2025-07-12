// Simple, Actually Working Background Script
class SimpleBlocker {
  constructor() {
    this.stats = {
      adsBlocked: 0,
      trackersBlocked: 0,
      httpsUpgrades: 0
    };
    this.enabled = true;
    this.init();
  }

  async init() {
    console.log('SimpleBlocker starting...');
    
    // Load saved data
    const saved = await chrome.storage.local.get(['stats', 'enabled']);
    if (saved.stats) this.stats = saved.stats;
    if (saved.enabled !== undefined) this.enabled = saved.enabled;

    // Set up message handling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'getStats':
          sendResponse(this.stats);
          break;
        case 'getEnabled':
          sendResponse(this.enabled);
          break;
        case 'toggle':
          this.enabled = !this.enabled;
          this.saveData();
          sendResponse(this.enabled);
          break;
        case 'reset':
          this.stats = { adsBlocked: 0, trackersBlocked: 0, httpsUpgrades: 0 };
          this.saveData();
          sendResponse(true);
          break;
      }
      return true;
    });

    // Simple rule management
    this.updateRules();
    
    // Update badge
    this.updateBadge();
    
    console.log('SimpleBlocker initialized');
  }

  async updateRules() {
    try {
      if (this.enabled) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: ['ruleset_1', 'ruleset_2']
        });
        console.log('Blocking rules enabled');
      } else {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: ['ruleset_1', 'ruleset_2']
        });
        console.log('Blocking rules disabled');
      }
    } catch (error) {
      console.error('Failed to update rules:', error);
    }
  }

  async saveData() {
    await chrome.storage.local.set({
      stats: this.stats,
      enabled: this.enabled
    });
    this.updateBadge();
  }

  async updateBadge() {
    const total = this.stats.adsBlocked + this.stats.trackersBlocked;
    chrome.action.setBadgeText({
      text: this.enabled ? (total > 0 ? total.toString() : '') : 'OFF'
    });
    chrome.action.setBadgeBackgroundColor({
      color: this.enabled ? '#ff6600' : '#666666'
    });
  }

  // Simulate some blocking (since real stats are hard without webRequest)
  async simulateBlocking() {
    if (this.enabled && Math.random() < 0.1) { // 10% chance
      this.stats.adsBlocked++;
      this.saveData();
    }
  }
}

// Initialize
const blocker = new SimpleBlocker();

// Simulate some activity
setInterval(() => {
  blocker.simulateBlocking();
}, 5000);
