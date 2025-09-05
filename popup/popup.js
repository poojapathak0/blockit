// Popup JavaScript - Brave Clone Interface
class BravePopup {
  constructor() {
    this.currentTab = null;
    this.stats = {
      adsBlocked: 0,
      trackersBlocked: 0,
      httpsUpgrades: 0,
      scriptsBlocked: 0,
      fingerprintingBlocked: 0
    };
    this.settings = {};
    this.init();
  }

  async init() {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tabs[0];
    
    // Load data
    await this.loadStats();
    await this.loadSettings();
    
    // Update UI
    this.updateUI();
    this.setupEventListeners();
  }

  async loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (response) {
        this.stats = response;
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response) {
        this.settings = response;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  updateUI() {
    // Update site info
    if (this.currentTab && this.currentTab.url) {
      const url = new URL(this.currentTab.url);
      document.getElementById('currentSite').textContent = url.hostname;
      
      // Update site status
      const statusElement = document.getElementById('siteStatus');
      if (this.settings.shieldsUp) {
        statusElement.textContent = 'Protected';
        statusElement.className = 'site-status';
      } else {
        statusElement.textContent = 'Unprotected';
        statusElement.className = 'site-status unsafe';
      }
    }

    // Update stats
    document.getElementById('adsBlocked').textContent = this.stats.adsBlocked || 0;
    document.getElementById('trackersBlocked').textContent = this.stats.trackersBlocked || 0;
    document.getElementById('httpsUpgrades').textContent = this.stats.httpsUpgrades || 0;

    // Update total blocked
    const totalBlocked = (this.stats.adsBlocked || 0) + 
                        (this.stats.trackersBlocked || 0) + 
                        (this.stats.scriptsBlocked || 0);
    document.getElementById('totalBlocked').textContent = totalBlocked;

    // Update toggle states
    this.updateToggleStates();
  }

  updateToggleStates() {
    const toggles = {
      'shieldsToggle': this.settings.shieldsUp,
      'adBlocking': this.settings.adBlocking,
      'httpsUpgrade': this.settings.httpsUpgrade,
      'scriptBlocking': this.settings.scriptBlocking,
      'fingerprintingProtection': this.settings.fingerprintingProtection,
      'cookieBlocking': this.settings.cookieBlocking
    };

    Object.entries(toggles).forEach(([id, state]) => {
      const element = document.getElementById(id);
      if (element) {
        element.checked = state || false;
      }
    });
  }

  setupEventListeners() {
    // Toggle switches
    const toggles = [
      'shieldsToggle',
      'adBlocking', 
      'httpsUpgrade',
      'scriptBlocking',
      'fingerprintingProtection',
      'cookieBlocking'
    ];

    toggles.forEach(toggleId => {
      const element = document.getElementById(toggleId);
      if (element) {
        element.addEventListener('change', (e) => {
          this.handleToggleChange(toggleId, e.target.checked);
        });
      }
    });

    // Action buttons
    document.getElementById('reportSite')?.addEventListener('click', this.reportSite.bind(this));
    document.getElementById('advancedSettings')?.addEventListener('click', this.openAdvancedSettings.bind(this));
    document.getElementById('reloadPage')?.addEventListener('click', this.reloadPage.bind(this));
    document.getElementById('resetStats')?.addEventListener('click', this.resetStats.bind(this));

    // Footer links
    document.getElementById('openOptions')?.addEventListener('click', this.openOptions.bind(this));
    document.getElementById('helpSupport')?.addEventListener('click', this.openHelp.bind(this));
    document.getElementById('aboutBrave')?.addEventListener('click', this.showAbout.bind(this));

    // Real-time stats updates
    this.setupStatsUpdates();
  }

  async handleToggleChange(settingKey, value) {
    // Map toggle IDs to setting keys
    const settingMapping = {
      'shieldsToggle': 'shieldsUp',
      'adBlocking': 'adBlocking',
      'httpsUpgrade': 'httpsUpgrade',
      'scriptBlocking': 'scriptBlocking',
      'fingerprintingProtection': 'fingerprintingProtection',
      'cookieBlocking': 'cookieBlocking'
    };

    const actualKey = settingMapping[settingKey] || settingKey;
    this.settings[actualKey] = value;

    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { [actualKey]: value }
      });

      // Update UI to reflect changes
      this.updateUI();

      // Show visual feedback
      this.showToast(`${this.getSettingDisplayName(actualKey)} ${value ? 'enabled' : 'disabled'}`);

      // If shields are turned off, disable other protections visually
      if (settingKey === 'shieldsToggle') {
        this.updateShieldsState(value);
      }

    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert toggle state
      document.getElementById(settingKey).checked = !value;
      this.showToast('Failed to update setting', 'error');
    }
  }

  updateShieldsState(enabled) {
    const protectionToggles = [
      'adBlocking',
      'httpsUpgrade', 
      'scriptBlocking',
      'fingerprintingProtection',
      'cookieBlocking'
    ];

    protectionToggles.forEach(toggleId => {
      const element = document.getElementById(toggleId);
      if (element) {
        element.disabled = !enabled;
        element.parentElement.style.opacity = enabled ? '1' : '0.5';
      }
    });

    // Update site status
    const statusElement = document.getElementById('siteStatus');
    if (enabled) {
      statusElement.textContent = 'Protected';
      statusElement.className = 'site-status';
    } else {
      statusElement.textContent = 'Unprotected';
      statusElement.className = 'site-status unsafe';
    }
  }

  getSettingDisplayName(key) {
    const displayNames = {
      'shieldsUp': 'Brave Shields',
      'adBlocking': 'Ad Blocking',
      'httpsUpgrade': 'HTTPS Upgrade',
      'scriptBlocking': 'Script Blocking',
      'fingerprintingProtection': 'Fingerprinting Protection',
      'cookieBlocking': 'Cookie Blocking'
    };
    return displayNames[key] || key;
  }

  async reportSite() {
    if (this.currentTab && this.currentTab.url) {
      const reportUrl = `https://github.com/brave/brave-browser/issues/new?template=bug_report.md&title=Site%20Issue:%20${encodeURIComponent(this.currentTab.url)}`;
      await chrome.tabs.create({ url: reportUrl });
      window.close();
    }
  }

  async openAdvancedSettings() {
    // Show advanced settings modal or navigate to options page
    await chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    window.close();
  }

  async reloadPage() {
    if (this.currentTab) {
      await chrome.tabs.reload(this.currentTab.id);
      window.close();
    }
  }

  async resetStats() {
    try {
      await chrome.runtime.sendMessage({ action: 'resetStats' });
      this.stats = {
        adsBlocked: 0,
        trackersBlocked: 0,
        httpsUpgrades: 0,
        scriptsBlocked: 0,
        fingerprintingBlocked: 0
      };
      this.updateUI();
      this.showToast('Statistics reset');
    } catch (error) {
      console.error('Failed to reset stats:', error);
      this.showToast('Failed to reset statistics', 'error');
    }
  }

  async openOptions() {
    await chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    window.close();
  }

  async openHelp() {
    await chrome.tabs.create({ url: 'https://support.brave.com/' });
    window.close();
  }

  showAbout() {
    const aboutInfo = `
      BlockIt - Brave Browser Clone v1.0.0
      
      A comprehensive privacy-focused browser extension that replicates Brave browser functionality.
      
      Features:
      • Ad & Tracker Blocking
      • HTTPS Upgrades
      • Script Blocking
      • Fingerprinting Protection
      • Cookie Blocking
      • Real-time Statistics
      
      Built with Chrome Extension Manifest V3
    `;
    
    alert(aboutInfo);
  }

  setupStatsUpdates() {
    // Update stats every 5 seconds
    setInterval(async () => {
      const oldStats = { ...this.stats };
      await this.loadStats();
      
      // Animate changed numbers
      this.animateChangedStats(oldStats, this.stats);
      this.updateUI();
    }, 5000);
  }

  animateChangedStats(oldStats, newStats) {
    Object.keys(newStats).forEach(key => {
      if (oldStats[key] !== newStats[key]) {
        const element = document.getElementById(this.getStatElementId(key));
        if (element) {
          element.classList.add('updated');
          setTimeout(() => {
            element.classList.remove('updated');
          }, 300);
        }
      }
    });
  }

  getStatElementId(statKey) {
    const mapping = {
      'adsBlocked': 'adsBlocked',
      'trackersBlocked': 'trackersBlocked',
      'httpsUpgrades': 'httpsUpgrades',
      'scriptsBlocked': 'scriptsBlocked',
      'fingerprintingBlocked': 'fingerprintingBlocked'
    };
    return mapping[statKey];
  }

  showToast(message, type = 'success') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#dc3545' : '#28a745'};
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Handles toggles and site block list management

document.addEventListener('DOMContentLoaded', () => {
  const adblockToggle = document.getElementById('adblock-toggle');
  const siteblockToggle = document.getElementById('siteblock-toggle');
  const siteList = document.getElementById('site-list');
  const addSiteInput = document.getElementById('add-site-input');
  const addSiteBtn = document.getElementById('add-site-btn');

  // Load state from storage
  chrome.storage.local.get({ adblockEnabled: true, siteBlockEnabled: true, blockedSites: [] }, ({ adblockEnabled, siteBlockEnabled, blockedSites }) => {
    adblockToggle.checked = adblockEnabled;
    siteblockToggle.checked = siteBlockEnabled;
    renderSiteList(blockedSites);
  });

  // Toggle ad-blocking
  adblockToggle.addEventListener('change', () => {
    const enabled = adblockToggle.checked;
    chrome.storage.local.set({ adblockEnabled: enabled }, () => {
      chrome.runtime.sendMessage({ type: 'TOGGLE_ADBLOCK', enabled });
    });
  });

  // Toggle site-blocking
  siteblockToggle.addEventListener('change', () => {
    const enabled = siteblockToggle.checked;
    chrome.storage.local.set({ siteBlockEnabled: enabled }, () => {
      chrome.runtime.sendMessage({ type: 'TOGGLE_SITEBLOCK', enabled });
    });
  });

  // Add site to block list
  addSiteBtn.addEventListener('click', () => {
    const domain = addSiteInput.value.trim();
    if (!domain) return;
    chrome.storage.local.get({ blockedSites: [] }, ({ blockedSites }) => {
      if (!blockedSites.includes(domain)) {
        const updated = [...blockedSites, domain];
        chrome.storage.local.set({ blockedSites: updated }, () => {
          chrome.runtime.sendMessage({ type: 'UPDATE_BLOCKED_SITES', blockedSites: updated });
          renderSiteList(updated);
          addSiteInput.value = '';
        });
      }
    });
  });

  // Remove site from block list
  function removeSite(domain) {
    chrome.storage.local.get({ blockedSites: [] }, ({ blockedSites }) => {
      const updated = blockedSites.filter(d => d !== domain);
      chrome.storage.local.set({ blockedSites: updated }, () => {
        chrome.runtime.sendMessage({ type: 'UPDATE_BLOCKED_SITES', blockedSites: updated });
        renderSiteList(updated);
      });
    });
  }

  // Render block list
  function renderSiteList(sites) {
    siteList.innerHTML = '';
    if (sites.length === 0) {
      siteList.innerHTML = '<em>No sites blocked.</em>';
      return;
    }
    sites.forEach(domain => {
      const div = document.createElement('div');
      div.className = 'site-item';
      div.innerHTML = `<span class="site-domain">${domain}</span>`;
      const btn = document.createElement('button');
      btn.className = 'remove-btn';
      btn.textContent = 'Remove';
      btn.onclick = () => removeSite(domain);
      div.appendChild(btn);
      siteList.appendChild(div);
    });
  }
});
