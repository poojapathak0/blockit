// Fingerprint Protection Script
// This script provides advanced fingerprinting protection

(function() {
  'use strict';

  // WebGL fingerprinting protection
  function protectWebGL() {
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    const getExtension = WebGLRenderingContext.prototype.getExtension;
    
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // Spoof common fingerprinting parameters
      switch (parameter) {
        case this.VENDOR:
          return 'Intel Inc.';
        case this.RENDERER:
          return 'Intel(R) HD Graphics 620';
        case this.VERSION:
          return 'WebGL 1.0';
        case this.SHADING_LANGUAGE_VERSION:
          return 'WebGL GLSL ES 1.0';
        default:
          return getParameter.apply(this, arguments);
      }
    };
    
    WebGLRenderingContext.prototype.getExtension = function(name) {
      // Block certain extensions that can be used for fingerprinting
      const blockedExtensions = [
        'WEBGL_debug_renderer_info',
        'WEBGL_debug_shaders'
      ];
      
      if (blockedExtensions.includes(name)) {
        return null;
      }
      
      return getExtension.apply(this, arguments);
    };
  }

  // Battery API protection
  function protectBattery() {
    if (navigator.getBattery) {
      navigator.getBattery = function() {
        return Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 1.0,
          addEventListener: function() {},
          removeEventListener: function() {}
        });
      };
    }
  }

  // Geolocation protection
  function protectGeolocation() {
    if (navigator.geolocation) {
      const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
      const originalWatchPosition = navigator.geolocation.watchPosition;
      
      navigator.geolocation.getCurrentPosition = function(success, error) {
        if (error) {
          error({
            code: 1,
            message: 'User denied the request for Geolocation.'
          });
        }
      };
      
      navigator.geolocation.watchPosition = function(success, error) {
        if (error) {
          error({
            code: 1,
            message: 'User denied the request for Geolocation.'
          });
        }
        return 0;
      };
    }
  }

  // Device motion/orientation protection
  function protectMotionSensors() {
    // Block device motion events
    window.DeviceMotionEvent = undefined;
    window.DeviceOrientationEvent = undefined;
    
    // Override addEventListener for motion events
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'devicemotion' || type === 'deviceorientation') {
        return; // Block these events
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // Network information protection
  function protectNetworkInfo() {
    if (navigator.connection) {
      Object.defineProperty(navigator, 'connection', {
        get: () => undefined
      });
    }
    
    if (navigator.mozConnection) {
      Object.defineProperty(navigator, 'mozConnection', {
        get: () => undefined
      });
    }
    
    if (navigator.webkitConnection) {
      Object.defineProperty(navigator, 'webkitConnection', {
        get: () => undefined
      });
    }
  }

  // Plugin enumeration protection
  function protectPlugins() {
    Object.defineProperty(navigator, 'plugins', {
      get: () => ({
        length: 0,
        item: () => null,
        namedItem: () => null,
        [Symbol.iterator]: function* () {}
      })
    });
    
    Object.defineProperty(navigator, 'mimeTypes', {
      get: () => ({
        length: 0,
        item: () => null,
        namedItem: () => null,
        [Symbol.iterator]: function* () {}
      })
    });
  }

  // Speech API protection
  function protectSpeechAPI() {
    if (window.SpeechRecognition) {
      window.SpeechRecognition = undefined;
    }
    if (window.webkitSpeechRecognition) {
      window.webkitSpeechRecognition = undefined;
    }
    if (window.SpeechSynthesis) {
      window.SpeechSynthesis = undefined;
    }
  }

  // Permissions API protection
  function protectPermissions() {
    if (navigator.permissions) {
      const originalQuery = navigator.permissions.query;
      navigator.permissions.query = function() {
        return Promise.resolve({ state: 'denied' });
      };
    }
  }

  // Font enumeration protection
  function protectFonts() {
    // Override font detection methods
    if (document.fonts) {
      const originalCheck = document.fonts.check;
      document.fonts.check = function() {
        return false; // Always return false to prevent font enumeration
      };
    }
  }

  // CSS media queries protection
  function protectMediaQueries() {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      const result = originalMatchMedia(query);
      
      // Block certain media queries that can be used for fingerprinting
      const blockedQueries = [
        'device-width',
        'device-height',
        'color-index',
        'monochrome',
        'resolution'
      ];
      
      if (blockedQueries.some(blocked => query.includes(blocked))) {
        return {
          matches: false,
          media: query,
          addEventListener: function() {},
          removeEventListener: function() {},
          addListener: function() {},
          removeListener: function() {}
        };
      }
      
      return result;
    };
  }

  // Initialize all protections
  function initializeProtections() {
    try {
      protectWebGL();
      protectBattery();
      protectGeolocation();
      protectMotionSensors();
      protectNetworkInfo();
      protectPlugins();
      protectSpeechAPI();
      protectPermissions();
      protectFonts();
      protectMediaQueries();
      
      console.log('🛡️ Brave fingerprinting protection initialized');
    } catch (error) {
      console.error('Error initializing fingerprinting protection:', error);
    }
  }

  // Run immediately
  initializeProtections();

})();
