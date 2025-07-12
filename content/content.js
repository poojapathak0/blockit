// Content Script - Front-end Protection
class BraveContentProtection {
  constructor() {
    this.isEnabled = true;
    this.protectionLevel = 'standard';
    this.init();
  }

  async init() {
    // Get settings from background
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (response) {
      this.isEnabled = response.shieldsUp;
      this.protectionLevel = response.protectionLevel || 'standard';
    }

    if (this.isEnabled) {
      this.setupProtections();
    }
  }

  setupProtections() {
    // Fingerprinting protection
    this.protectFingerprinting();
    
    // Cookie protection
    this.protectCookies();
    
    // WebRTC protection
    this.protectWebRTC();
    
    // Canvas fingerprinting protection
    this.protectCanvas();
    
    // Audio fingerprinting protection
    this.protectAudio();
    
    // Screen resolution protection
    this.protectScreen();
    
    // Remove tracking elements
    this.removeTrackingElements();
    
    // Block social media widgets
    this.blockSocialWidgets();
    
    // Protect against crypto mining
    this.protectCryptoMining();
    
    // Set up mutation observer for dynamic content
    this.setupMutationObserver();
  }

  protectFingerprinting() {
    // Override navigator properties
    const originalNavigator = window.navigator;
    
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    Object.defineProperty(window.navigator, 'platform', {
      get: () => 'Win32'
    });
    
    Object.defineProperty(window.navigator, 'language', {
      get: () => 'en-US'
    });
    
    Object.defineProperty(window.navigator, 'languages', {
      get: () => ['en-US', 'en']
    });
    
    Object.defineProperty(window.navigator, 'hardwareConcurrency', {
      get: () => 4
    });
    
    Object.defineProperty(window.navigator, 'deviceMemory', {
      get: () => 8
    });
    
    // Override timezone
    const originalDateTimeFormat = Intl.DateTimeFormat;
    Intl.DateTimeFormat = function(locales, options) {
      return originalDateTimeFormat.call(this, 'en-US', options);
    };
    
    // Override getTimezoneOffset
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
    Date.prototype.getTimezoneOffset = function() {
      return 0; // UTC
    };
  }

  protectCookies() {
    // Intercept document.cookie
    let cookieStore = '';
    
    Object.defineProperty(document, 'cookie', {
      get: function() {
        return cookieStore;
      },
      set: function(value) {
        // Filter out tracking cookies
        if (!this.isTrackingCookie(value)) {
          cookieStore = value;
        }
      }.bind(this)
    });
  }

  isTrackingCookie(cookieString) {
    const trackingCookieNames = [
      '_ga', '_gid', '_gat', '__utma', '__utmb', '__utmc', '__utmz',
      '_fbp', '_fbc', 'fr', 'datr', 'sb', 'c_user',
      '_twitter_sess', 'personalization_id',
      'MUID', 'MUIDB', '_uetsid', '_uetvid'
    ];
    
    return trackingCookieNames.some(name => cookieString.includes(name));
  }

  protectWebRTC() {
    // Block WebRTC IP leaks
    const originalRTCPeerConnection = window.RTCPeerConnection;
    const originalWebkitRTCPeerConnection = window.webkitRTCPeerConnection;
    const originalMozRTCPeerConnection = window.mozRTCPeerConnection;
    
    window.RTCPeerConnection = undefined;
    window.webkitRTCPeerConnection = undefined;
    window.mozRTCPeerConnection = undefined;
    
    // Block getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function() {
        return Promise.reject(new Error('Access denied by Brave Shield'));
      };
    }
  }

  protectCanvas() {
    // Canvas fingerprinting protection
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    
    HTMLCanvasElement.prototype.toDataURL = function() {
      // Add noise to canvas data
      const context = this.getContext('2d');
      const imageData = context.getImageData(0, 0, this.width, this.height);
      
      // Add random noise
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] += Math.floor(Math.random() * 3) - 1;
        imageData.data[i + 1] += Math.floor(Math.random() * 3) - 1;
        imageData.data[i + 2] += Math.floor(Math.random() * 3) - 1;
      }
      
      context.putImageData(imageData, 0, 0);
      return originalToDataURL.apply(this, arguments);
    };
    
    CanvasRenderingContext2D.prototype.getImageData = function() {
      const imageData = originalGetImageData.apply(this, arguments);
      
      // Add noise to prevent fingerprinting
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] += Math.floor(Math.random() * 3) - 1;
        imageData.data[i + 1] += Math.floor(Math.random() * 3) - 1;
        imageData.data[i + 2] += Math.floor(Math.random() * 3) - 1;
      }
      
      return imageData;
    };
  }

  protectAudio() {
    // Audio fingerprinting protection
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    
    if (AudioContext) {
      const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
      AudioContext.prototype.createAnalyser = function() {
        const analyser = originalCreateAnalyser.apply(this, arguments);
        
        const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
        analyser.getFloatFrequencyData = function(array) {
          originalGetFloatFrequencyData.apply(this, arguments);
          
          // Add noise to frequency data
          for (let i = 0; i < array.length; i++) {
            array[i] += Math.random() * 0.001 - 0.0005;
          }
        };
        
        return analyser;
      };
    }
  }

  protectScreen() {
    // Screen resolution protection
    Object.defineProperty(window.screen, 'width', {
      get: () => 1920
    });
    
    Object.defineProperty(window.screen, 'height', {
      get: () => 1080
    });
    
    Object.defineProperty(window.screen, 'availWidth', {
      get: () => 1920
    });
    
    Object.defineProperty(window.screen, 'availHeight', {
      get: () => 1040
    });
    
    Object.defineProperty(window.screen, 'colorDepth', {
      get: () => 24
    });
    
    Object.defineProperty(window.screen, 'pixelDepth', {
      get: () => 24
    });
  }

  removeTrackingElements() {
    // Remove known tracking elements
    const trackingSelectors = [
      'script[src*="google-analytics"]',
      'script[src*="googletagmanager"]',
      'script[src*="facebook.com/tr"]',
      'script[src*="connect.facebook.net"]',
      'script[src*="hotjar"]',
      'script[src*="mixpanel"]',
      'script[src*="segment"]',
      'img[src*="facebook.com/tr"]',
      'img[src*="google-analytics"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="googletagmanager"]'
    ];
    
    trackingSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.remove();
        console.log('Blocked tracking element:', selector);
      });
    });
  }

  blockSocialWidgets() {
    // Block social media widgets
    const socialSelectors = [
      '.fb-like',
      '.fb-share-button',
      '.twitter-share-button',
      '.linkedin-share-button',
      'iframe[src*="facebook.com/plugins"]',
      'iframe[src*="twitter.com/widgets"]',
      'iframe[src*="linkedin.com/plugins"]',
      'iframe[src*="instagram.com/embed"]'
    ];
    
    socialSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const placeholder = document.createElement('div');
        placeholder.className = 'brave-social-blocked';
        placeholder.innerHTML = `
          <div style="padding: 20px; background: #f0f0f0; border: 1px solid #ddd; text-align: center;">
            <p>🛡️ Social widget blocked by Brave Shield</p>
            <button onclick="this.parentElement.parentElement.style.display='none'; this.parentElement.parentElement.nextElementSibling.style.display='block';">Show widget</button>
          </div>
        `;
        element.style.display = 'none';
        element.parentNode.insertBefore(placeholder, element);
      });
    });
  }

  protectCryptoMining() {
    // Block crypto mining scripts
    const cryptoMiningKeywords = [
      'coinhive', 'jsecoin', 'minergate', 'cryptonight',
      'webminer', 'minero', 'cryptoloot', 'authedmine'
    ];
    
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src) {
        cryptoMiningKeywords.forEach(keyword => {
          if (script.src.toLowerCase().includes(keyword)) {
            script.remove();
            console.log('Blocked crypto mining script:', script.src);
          }
        });
      }
    });
    
    // Override WebAssembly for mining protection
    if (window.WebAssembly) {
      const originalInstantiate = WebAssembly.instantiate;
      WebAssembly.instantiate = function() {
        console.log('WebAssembly instantiation blocked by Brave Shield');
        return Promise.reject(new Error('WebAssembly blocked'));
      };
    }
  }

  setupMutationObserver() {
    // Monitor DOM changes for new tracking elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for tracking elements in newly added nodes
            this.scanForTrackingElements(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanForTrackingElements(element) {
    // Scan for tracking scripts and elements
    if (element.tagName === 'SCRIPT' && element.src) {
      if (this.isTrackingScript(element.src)) {
        element.remove();
        console.log('Dynamically blocked tracking script:', element.src);
      }
    }
    
    // Scan child elements
    const trackingElements = element.querySelectorAll('script[src], img[src], iframe[src]');
    trackingElements.forEach(el => {
      if (this.isTrackingElement(el)) {
        el.remove();
        console.log('Dynamically blocked tracking element:', el.src);
      }
    });
  }

  isTrackingScript(src) {
    const trackingDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com',
      'connect.facebook.net',
      'mixpanel.com',
      'segment.com',
      'hotjar.com',
      'fullstory.com',
      'mouseflow.com'
    ];
    
    return trackingDomains.some(domain => src.includes(domain));
  }

  isTrackingElement(element) {
    return this.isTrackingScript(element.src || '');
  }

  // Communicate with background script
  async reportBlocked(type, url) {
    try {
      await chrome.runtime.sendMessage({
        action: 'elementBlocked',
        type: type,
        url: url,
        domain: window.location.hostname
      });
    } catch (error) {
      console.log('Failed to report blocked element:', error);
    }
  }
}

// Initialize protection when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BraveContentProtection();
  });
} else {
  new BraveContentProtection();
}
