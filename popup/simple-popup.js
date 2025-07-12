// Simple, Actually Working Popup
class SimplePopup {
  constructor() {
    this.init();
  }

  async init() {
    console.log('Popup loading...');
    
    // Load current state
    await this.updateDisplay();
    
    // Set up event listeners
    document.getElementById('toggleBtn')?.addEventListener('click', this.toggle.bind(this));
    document.getElementById('resetBtn')?.addEventListener('click', this.reset.bind(this));
    
    // Update every 2 seconds
    setInterval(() => this.updateDisplay(), 2000);
  }

  async updateDisplay() {
    try {
      // Get stats
      const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
      const enabled = await chrome.runtime.sendMessage({ action: 'getEnabled' });
      
      // Update UI
      document.getElementById('adsBlocked').textContent = stats?.adsBlocked || 0;
      document.getElementById('trackersBlocked').textContent = stats?.trackersBlocked || 0;
      document.getElementById('httpsUpgrades').textContent = stats?.httpsUpgrades || 0;
      
      // Update toggle button
      const toggleBtn = document.getElementById('toggleBtn');
      if (toggleBtn) {
        toggleBtn.textContent = enabled ? 'Shields Up' : 'Shields Down';
        toggleBtn.className = enabled ? 'btn-enabled' : 'btn-disabled';
      }
      
      // Update status
      const status = document.getElementById('status');
      if (status) {
        status.textContent = enabled ? 'Protected' : 'Unprotected';
        status.className = enabled ? 'status-protected' : 'status-unprotected';
      }
      
    } catch (error) {
      console.error('Failed to update display:', error);
    }
  }

  async toggle() {
    try {
      const newState = await chrome.runtime.sendMessage({ action: 'toggle' });
      console.log('Toggled to:', newState);
      await this.updateDisplay();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  }

  async reset() {
    try {
      await chrome.runtime.sendMessage({ action: 'reset' });
      console.log('Stats reset');
      await this.updateDisplay();
    } catch (error) {
      console.error('Failed to reset:', error);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SimplePopup();
});
