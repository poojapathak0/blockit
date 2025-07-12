// Options Page JavaScript
class BraveOptions {
  constructor() {
    this.settings = {};
    this.stats = {};
    this.siteSettings = {};
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadData() {
    try {
      // Load settings
      const settingsResponse = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (settingsResponse) {
        this.settings = settingsResponse;
      }

      // Load stats
      const statsResponse = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (statsResponse) {
        this.stats = statsResponse;
      }

      // Load site-specific settings
      const siteData = await chrome.storage.sync.get('siteSettings');
      this.siteSettings = siteData.siteSettings || {};
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Global settings
    this.setupSettingListeners();

    // Site management
    document.getElementById('addSiteBtn')?.addEventListener('click', () => {
      this.showAddSiteModal();
    });

    // Advanced settings
    this.setupAdvancedListeners();

    // Stats management
    document.getElementById('resetStatsBtn')?.addEventListener('click', () => {
      this.resetStats();
    });

    document.getElementById('exportStatsBtn')?.addEventListener('click', () => {
      this.exportStats();
    });
  }

  setupSettingListeners() {
    const settingIds = [
      'globalShields',
      'httpsUpgradeGlobal',
      'adBlockingLevel',
      'scriptBlockingLevel',
      'fingerprintingProtectionLevel',
      'cookieBlockingLevel',
      'socialBlocking',
      'cryptoMiningBlocking',
      'notificationsEnabled',
      'statisticsEnabled'
    ];

    settingIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => {
          this.updateSetting(id, this.getElementValue(element));
        });
      }
    });
  }

  setupAdvancedListeners() {
    // Custom filter lists
    document.getElementById('addFilterListBtn')?.addEventListener('click', () => {
      this.addCustomFilterList();
    });

    // Import/Export settings
    document.getElementById('exportSettingsBtn')?.addEventListener('click', () => {
      this.exportSettings();
    });

    document.getElementById('importSettingsBtn')?.addEventListener('click', () => {
      this.importSettings();
    });

    // Reset to defaults
    document.getElementById('resetDefaultsBtn')?.addEventListener('click', () => {
      this.resetToDefaults();
    });
  }

  switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content sections
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Load tab-specific data
    this.loadTabData(tabName);
  }

  loadTabData(tabName) {
    switch (tabName) {
      case 'shields':
        this.updateShieldsUI();
        break;
      case 'privacy':
        this.updatePrivacyUI();
        break;
      case 'advanced':
        this.updateAdvancedUI();
        break;
      case 'stats':
        this.updateStatsUI();
        break;
      case 'about':
        this.updateAboutUI();
        break;
    }
  }

  updateUI() {
    this.updateShieldsUI();
    this.updatePrivacyUI();
    this.updateStatsUI();
  }

  updateShieldsUI() {
    // Update global settings
    this.setElementValue('globalShields', this.settings.shieldsUp);
    this.setElementValue('adBlockingLevel', this.settings.adBlockingLevel || 'standard');
    this.setElementValue('httpsUpgradeGlobal', this.settings.httpsUpgrade);
    this.setElementValue('scriptBlockingLevel', this.settings.scriptBlockingLevel || 'disabled');

    // Update site list
    this.updateSiteList();
  }

  updatePrivacyUI() {
    this.setElementValue('fingerprintingProtectionLevel', this.settings.fingerprintingProtectionLevel || 'standard');
    this.setElementValue('cookieBlockingLevel', this.settings.cookieBlockingLevel || 'standard');
    this.setElementValue('socialBlocking', this.settings.socialBlocking);
    this.setElementValue('cryptoMiningBlocking', this.settings.cryptoMiningBlocking);
  }

  updateAdvancedUI() {
    this.setElementValue('notificationsEnabled', this.settings.notificationsEnabled);
    this.setElementValue('statisticsEnabled', this.settings.statisticsEnabled);
    this.updateCustomFilterLists();
  }

  updateStatsUI() {
    const elements = {
      'totalAdsBlocked': this.stats.adsBlocked || 0,
      'totalTrackersBlocked': this.stats.trackersBlocked || 0,
      'totalHttpsUpgrades': this.stats.httpsUpgrades || 0,
      'totalScriptsBlocked': this.stats.scriptsBlocked || 0,
      'totalFingerprintingBlocked': this.stats.fingerprintingBlocked || 0
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value.toLocaleString();
      }
    });

    // Update charts if available
    this.updateStatsCharts();
  }

  updateAboutUI() {
    document.getElementById('extensionVersion').textContent = '1.0.0';
    document.getElementById('manifestVersion').textContent = '3';
  }

  updateSiteList() {
    const container = document.getElementById('siteList');
    if (!container) return;

    container.innerHTML = '';

    Object.entries(this.siteSettings).forEach(([domain, settings]) => {
      const siteItem = this.createSiteItem(domain, settings);
      container.appendChild(siteItem);
    });
  }

  createSiteItem(domain, settings) {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.innerHTML = `
      <div class="site-info">
        <div class="site-domain">${domain}</div>
        <div class="site-settings">
          <span class="setting-badge ${settings.shieldsUp ? 'enabled' : 'disabled'}">
            Shields ${settings.shieldsUp ? 'Up' : 'Down'}
          </span>
          <span class="setting-badge ${settings.adBlocking ? 'enabled' : 'disabled'}">
            Ad Blocking
          </span>
          <span class="setting-badge ${settings.httpsUpgrade ? 'enabled' : 'disabled'}">
            HTTPS
          </span>
        </div>
      </div>
      <div class="site-actions">
        <button class="btn btn-secondary btn-sm" onclick="braveOptions.editSite('${domain}')">
          Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="braveOptions.removeSite('${domain}')">
          Remove
        </button>
      </div>
    `;
    return item;
  }

  async updateSetting(settingId, value) {
    try {
      const settingMap = {
        'globalShields': 'shieldsUp',
        'httpsUpgradeGlobal': 'httpsUpgrade',
        'adBlockingLevel': 'adBlockingLevel',
        'scriptBlockingLevel': 'scriptBlockingLevel',
        'fingerprintingProtectionLevel': 'fingerprintingProtectionLevel',
        'cookieBlockingLevel': 'cookieBlockingLevel',
        'socialBlocking': 'socialBlocking',
        'cryptoMiningBlocking': 'cryptoMiningBlocking',
        'notificationsEnabled': 'notificationsEnabled',
        'statisticsEnabled': 'statisticsEnabled'
      };

      const actualKey = settingMap[settingId] || settingId;
      this.settings[actualKey] = value;

      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { [actualKey]: value }
      });

      this.showNotification(`Setting updated: ${actualKey}`, 'success');
    } catch (error) {
      console.error('Failed to update setting:', error);
      this.showNotification('Failed to update setting', 'error');
    }
  }

  getElementValue(element) {
    if (element.type === 'checkbox') {
      return element.checked;
    } else if (element.tagName === 'SELECT') {
      return element.value;
    } else {
      return element.value;
    }
  }

  setElementValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (element.type === 'checkbox') {
      element.checked = Boolean(value);
    } else if (element.tagName === 'SELECT') {
      element.value = value;
    } else {
      element.value = value;
    }
  }

  showAddSiteModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Site-Specific Settings</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="siteDomain">Domain:</label>
            <input type="text" id="siteDomain" placeholder="example.com" class="form-input">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="siteShields" checked> Enable Shields
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="siteAdBlocking" checked> Block Ads
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="siteHttpsUpgrade" checked> HTTPS Upgrade
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="braveOptions.addSite()">Add Site</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async addSite() {
    const domain = document.getElementById('siteDomain').value.trim();
    if (!domain) return;

    const settings = {
      shieldsUp: document.getElementById('siteShields').checked,
      adBlocking: document.getElementById('siteAdBlocking').checked,
      httpsUpgrade: document.getElementById('siteHttpsUpgrade').checked
    };

    this.siteSettings[domain] = settings;
    await chrome.storage.sync.set({ siteSettings: this.siteSettings });

    this.updateSiteList();
    document.querySelector('.modal').remove();
    this.showNotification(`Site settings added for ${domain}`, 'success');
  }

  async removeSite(domain) {
    if (confirm(`Remove settings for ${domain}?`)) {
      delete this.siteSettings[domain];
      await chrome.storage.sync.set({ siteSettings: this.siteSettings });
      this.updateSiteList();
      this.showNotification(`Site settings removed for ${domain}`, 'success');
    }
  }

  async resetStats() {
    if (confirm('Reset all statistics? This action cannot be undone.')) {
      try {
        await chrome.runtime.sendMessage({ action: 'resetStats' });
        this.stats = {
          adsBlocked: 0,
          trackersBlocked: 0,
          httpsUpgrades: 0,
          scriptsBlocked: 0,
          fingerprintingBlocked: 0
        };
        this.updateStatsUI();
        this.showNotification('Statistics reset successfully', 'success');
      } catch (error) {
        this.showNotification('Failed to reset statistics', 'error');
      }
    }
  }

  exportStats() {
    const data = {
      stats: this.stats,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `brave-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  exportSettings() {
    const data = {
      settings: this.settings,
      siteSettings: this.siteSettings,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `brave-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target.result);
            
            if (data.settings) {
              this.settings = { ...this.settings, ...data.settings };
              await chrome.runtime.sendMessage({
                action: 'updateSettings',
                settings: data.settings
              });
            }
            
            if (data.siteSettings) {
              this.siteSettings = { ...this.siteSettings, ...data.siteSettings };
              await chrome.storage.sync.set({ siteSettings: this.siteSettings });
            }
            
            this.updateUI();
            this.showNotification('Settings imported successfully', 'success');
          } catch (error) {
            this.showNotification('Failed to import settings', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  async resetToDefaults() {
    if (confirm('Reset all settings to defaults? This will remove all customizations.')) {
      const defaultSettings = {
        shieldsUp: true,
        adBlocking: true,
        httpsUpgrade: true,
        scriptBlocking: false,
        fingerprintingProtection: true,
        cookieBlocking: true,
        adBlockingLevel: 'standard',
        scriptBlockingLevel: 'disabled',
        fingerprintingProtectionLevel: 'standard',
        cookieBlockingLevel: 'standard',
        socialBlocking: true,
        cryptoMiningBlocking: true,
        notificationsEnabled: true,
        statisticsEnabled: true
      };

      this.settings = defaultSettings;
      this.siteSettings = {};

      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: defaultSettings
      });
      
      await chrome.storage.sync.set({ siteSettings: {} });
      
      this.updateUI();
      this.showNotification('Settings reset to defaults', 'success');
    }
  }

  updateStatsCharts() {
    // Simple chart implementation using CSS
    const chartData = [
      { label: 'Ads Blocked', value: this.stats.adsBlocked || 0 },
      { label: 'Trackers Blocked', value: this.stats.trackersBlocked || 0 },
      { label: 'HTTPS Upgrades', value: this.stats.httpsUpgrades || 0 },
      { label: 'Scripts Blocked', value: this.stats.scriptsBlocked || 0 }
    ];

    const maxValue = Math.max(...chartData.map(d => d.value));
    const chartContainer = document.getElementById('statsChart');
    
    if (chartContainer) {
      chartContainer.innerHTML = chartData.map(data => `
        <div class="chart-bar">
          <div class="chart-label">${data.label}</div>
          <div class="chart-bar-container">
            <div class="chart-bar-fill" style="width: ${maxValue > 0 ? (data.value / maxValue) * 100 : 0}%"></div>
            <div class="chart-value">${data.value}</div>
          </div>
        </div>
      `).join('');
    }
  }

  updateCustomFilterLists() {
    // Implementation for custom filter lists
    const container = document.getElementById('customFilterLists');
    if (container) {
      container.innerHTML = `
        <div class="filter-list-item">
          <span>Default Brave Lists (Built-in)</span>
          <span class="status enabled">Enabled</span>
        </div>
      `;
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('notificationContainer') || document.body;
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Site Blocking functionality
class SiteBlockingManager {
    constructor() {
        this.blockedSites = new Set();
        this.init();
    }
    
    async init() {
        await this.loadBlockedSites();
        this.setupEventListeners();
        this.updateUI();
    }
    
    async loadBlockedSites() {
        try {
            const result = await chrome.storage.local.get(['blockedSites']);
            if (result.blockedSites) {
                this.blockedSites = new Set(result.blockedSites);
            }
        } catch (error) {
            console.error('Error loading blocked sites:', error);
        }
    }
    
    async saveBlockedSites() {
        try {
            await chrome.storage.local.set({
                blockedSites: Array.from(this.blockedSites)
            });
        } catch (error) {
            console.error('Error saving blocked sites:', error);
        }
    }
    
    setupEventListeners() {
        // Block site button
        document.getElementById('blockSiteBtn').addEventListener('click', () => {
            this.blockSite();
        });
        
        // Enter key in input
        document.getElementById('siteToBlock').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.blockSite();
            }
        });
        
        // Preset site buttons
        document.querySelectorAll('.preset-site-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const site = btn.dataset.site;
                this.blockPresetSite(site, btn);
            });
        });
    }
    
    async blockSite() {
        const input = document.getElementById('siteToBlock');
        const domain = input.value.trim().toLowerCase();
        
        if (!domain) {
            this.showMessage('Please enter a domain name', 'error');
            return;
        }
        
        // Clean domain (remove http/https, www)
        const cleanDomain = domain
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/.*$/, '');
        
        if (this.blockedSites.has(cleanDomain)) {
            this.showMessage('Site is already blocked!', 'warning');
            return;
        }
        
        // Add to blocked sites
        this.blockedSites.add(cleanDomain);
        await this.saveBlockedSites();
        
        // Notify background script
        try {
            await chrome.runtime.sendMessage({
                action: 'blockSite',
                domain: cleanDomain
            });
            
            this.showMessage(`Successfully blocked ${cleanDomain}!`, 'success');
            input.value = '';
            this.updateUI();
        } catch (error) {
            console.error('Error blocking site:', error);
            this.showMessage('Error blocking site', 'error');
        }
    }
    
    async blockPresetSite(domain, button) {
        if (this.blockedSites.has(domain)) {
            this.showMessage('Site is already blocked!', 'warning');
            return;
        }
        
        this.blockedSites.add(domain);
        await this.saveBlockedSites();
        
        try {
            await chrome.runtime.sendMessage({
                action: 'blockSite',
                domain: domain
            });
            
            button.textContent = '✅ Blocked';
            button.classList.add('blocked');
            button.disabled = true;
            
            this.showMessage(`Successfully blocked ${domain}!`, 'success');
            this.updateUI();
        } catch (error) {
            console.error('Error blocking preset site:', error);
            this.showMessage('Error blocking site', 'error');
        }
    }
    
    async unblockSite(domain) {
        // Start the complex unblock process
        try {
            const session = await chrome.runtime.sendMessage({
                action: 'startUnblock',
                domain: domain
            });
            
            if (session) {
                this.showUnblockModal(domain, session);
            }
        } catch (error) {
            console.error('Error starting unblock process:', error);
            this.showMessage('Error starting unblock process', 'error');
        }
    }
    
    showUnblockModal(domain, session) {
        // Create unblock modal
        const modal = document.createElement('div');
        modal.className = 'challenge-modal';
        modal.innerHTML = `
            <div class="challenge-content">
                <h3>🔓 Unblock ${domain}</h3>
                <p style="color: #dc3545; font-weight: bold;">
                    ⚠️ This process is intentionally difficult to maintain your productivity!
                </p>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar" style="width: 0%;"></div>
                </div>
                <div>Challenge <span id="currentStep">1</span> of ${session.challenges.length}</div>
                
                <div id="challengeContent"></div>
                
                <div class="challenge-buttons">
                    <button id="submitAnswer" class="challenge-btn primary">Submit</button>
                    <button id="cancelUnblock" class="challenge-btn secondary">Cancel</button>
                </div>
                
                <div id="challengeMessage"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        let currentChallenge = 0;
        
        const displayChallenge = () => {
            if (currentChallenge >= session.challenges.length) {
                this.completeUnblock(domain, modal);
                return;
            }
            
            const challenge = session.challenges[currentChallenge];
            const progress = ((currentChallenge + 1) / session.challenges.length) * 100;
            
            modal.querySelector('.challenge-progress-bar').style.width = progress + '%';
            modal.querySelector('#currentStep').textContent = currentChallenge + 1;
            
            const content = modal.querySelector('#challengeContent');
            
            if (challenge.waitTime) {
                content.innerHTML = `
                    <p class="challenge-question">${challenge.question}</p>
                    <div class="wait-timer" id="waitDisplay">Preparing...</div>
                `;
                
                this.startWaitChallenge(challenge.waitTime, () => {
                    currentChallenge++;
                    displayChallenge();
                });
            } else {
                content.innerHTML = `
                    <p class="challenge-question">${challenge.question}</p>
                    <input type="text" id="challengeInput" class="challenge-input" placeholder="Enter your answer">
                `;
                
                const input = content.querySelector('#challengeInput');
                input.focus();
            }
        };
        
        const submitAnswer = () => {
            const input = modal.querySelector('#challengeInput');
            if (!input) return;
            
            const answer = input.value.trim();
            const challenge = session.challenges[currentChallenge];
            
            if (answer.toLowerCase() === challenge.answer.toLowerCase()) {
                modal.querySelector('#challengeMessage').innerHTML = 
                    '<div style="color: #28a745;">✅ Correct! Moving to next challenge...</div>';
                
                setTimeout(() => {
                    currentChallenge++;
                    displayChallenge();
                    modal.querySelector('#challengeMessage').innerHTML = '';
                }, 1500);
            } else {
                modal.querySelector('#challengeMessage').innerHTML = 
                    '<div style="color: #dc3545;">❌ Incorrect. Try again.</div>';
            }
        };
        
        modal.querySelector('#submitAnswer').addEventListener('click', submitAnswer);
        modal.querySelector('#cancelUnblock').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Enter key support
        modal.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitAnswer();
            }
        });
        
        displayChallenge();
    }
    
    startWaitChallenge(waitTime, callback) {
        let remaining = waitTime;
        const display = document.getElementById('waitDisplay');
        
        const timer = setInterval(() => {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            display.textContent = `Please wait: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            display.style.fontSize = '24px';
            display.style.color = '#dc3545';
            
            remaining -= 1000;
            
            if (remaining <= 0) {
                clearInterval(timer);
                display.textContent = 'Wait time completed!';
                display.style.color = '#28a745';
                setTimeout(callback, 1000);
            }
        }, 1000);
    }
    
    async completeUnblock(domain, modal) {
        try {
            await chrome.runtime.sendMessage({
                action: 'completeUnblock',
                domain: domain
            });
            
            modal.querySelector('.challenge-content').innerHTML = `
                <h3>✅ Site Unblocked</h3>
                <p style="color: #28a745;">${domain} has been temporarily unblocked.</p>
                <p style="color: #ff6b35; font-weight: bold;">
                    ⚠️ This site will be automatically re-blocked in 2 hours for your productivity.
                </p>
                <button onclick="this.closest('.challenge-modal').remove()" class="challenge-btn primary">
                    Close
                </button>
            `;
            
            // Remove from UI
            this.blockedSites.delete(domain);
            this.updateUI();
            
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 5000);
            
        } catch (error) {
            console.error('Error completing unblock:', error);
        }
    }
    
    updateUI() {
        const container = document.getElementById('blockedSitesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.blockedSites.size === 0) {
            container.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">No sites blocked yet. Add some to improve your focus!</p>';
            return;
        }
        
        Array.from(this.blockedSites).sort().forEach(domain => {
            const item = document.createElement('div');
            item.className = 'blocked-site-item';
            item.innerHTML = `
                <span class="site-domain">${domain}</span>
                <button class="unblock-btn" onclick="siteBlockingManager.unblockSite('${domain}')">
                    🔓 Unblock (Hard)
                </button>
            `;
            container.appendChild(item);
        });
        
        // Update preset buttons
        document.querySelectorAll('.preset-site-btn').forEach(btn => {
            const site = btn.dataset.site;
            if (this.blockedSites.has(site)) {
                btn.textContent = '✅ Blocked';
                btn.classList.add('blocked');
                btn.disabled = true;
            } else {
                btn.textContent = btn.textContent.replace('✅ Blocked', '').trim() || site;
                btn.classList.remove('blocked');
                btn.disabled = false;
            }
        });
    }
    
    showMessage(message, type = 'info') {
        // Create or update message element
        let msgElement = document.getElementById('siteBlockingMessage');
        if (!msgElement) {
            msgElement = document.createElement('div');
            msgElement.id = 'siteBlockingMessage';
            msgElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(msgElement);
        }
        
        // Set color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        msgElement.style.backgroundColor = colors[type] || colors.info;
        msgElement.textContent = message;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (msgElement.parentNode) {
                msgElement.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (msgElement.parentNode) {
                        msgElement.parentNode.removeChild(msgElement);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Add CSS for animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animationStyle);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.braveOptions = new BraveOptions();
  window.siteBlockingManager = new SiteBlockingManager();
});
