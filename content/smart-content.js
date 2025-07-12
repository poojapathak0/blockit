// Enhanced Content Script with AI-driven Protection
(function() {
    'use strict';
    
    class SmartContentProtection {
        constructor() {
            this.protectionActive = true;
            this.stats = {
                adsBlocked: 0,
                trackersBlocked: 0,
                fingerprintingAttempts: 0
            };
            this.init();
        }
        
        init() {
            this.injectAdvancedProtection();
            this.setupObservers();
            this.blockTrackingElements();
            this.protectAgainstFingerprinting();
            console.log('🛡️ Smart Shield: Advanced protection activated');
        }
        
        injectAdvancedProtection() {
            // Anti-fingerprinting measures
            this.spoofNavigatorProperties();
            this.protectCanvasFingerprinting();
            this.blockWebRTCLeaks();
            this.protectWebGL();
            this.spoofScreenProperties();
        }
        
        spoofNavigatorProperties() {
            // Randomize navigator properties to prevent fingerprinting
            const originalNavigator = window.navigator;
            
            // Spoof user agent slightly
            Object.defineProperty(navigator, 'userAgent', {
                get: function() {
                    const ua = originalNavigator.userAgent;
                    // Add slight randomization to Chrome version
                    const randomVersion = 90 + Math.floor(Math.random() * 20);
                    return ua.replace(/Chrome\/[\d.]+/, `Chrome/${randomVersion}.0.0.0`);
                },
                configurable: true
            });
            
            // Spoof language to prevent tracking
            Object.defineProperty(navigator, 'language', {
                get: function() {
                    const languages = ['en-US', 'en-GB', 'en-CA'];
                    return languages[Math.floor(Math.random() * languages.length)];
                },
                configurable: true
            });
            
            // Spoof platform
            Object.defineProperty(navigator, 'platform', {
                get: function() {
                    const platforms = ['Win32', 'Win64', 'MacIntel', 'Linux x86_64'];
                    return platforms[Math.floor(Math.random() * platforms.length)];
                },
                configurable: true
            });
            
            // Block hardware concurrency fingerprinting
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: function() {
                    return 4; // Always return 4 cores
                },
                configurable: true
            });
        }
        
        protectCanvasFingerprinting() {
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
            
            HTMLCanvasElement.prototype.getContext = function(type, attributes) {
                const context = originalGetContext.call(this, type, attributes);
                
                if (type === '2d' && context) {
                    // Override methods that can be used for fingerprinting
                    const originalGetImageData = context.getImageData;
                    context.getImageData = function() {
                        const imageData = originalGetImageData.apply(this, arguments);
                        // Add random noise to break fingerprinting
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            imageData.data[i] += Math.random() * 4 - 2; // Red
                            imageData.data[i + 1] += Math.random() * 4 - 2; // Green  
                            imageData.data[i + 2] += Math.random() * 4 - 2; // Blue
                        }
                        return imageData;
                    };
                }
                
                return context;
            };
            
            // Protect toDataURL
            HTMLCanvasElement.prototype.toDataURL = function() {
                // Add random noise to data URL
                const result = originalToDataURL.apply(this, arguments);
                return result.replace(/,$/, Math.random().toString(36).substr(2, 9));
            };
        }
        
        blockWebRTCLeaks() {
            // Block WebRTC IP leaks
            if (window.RTCPeerConnection) {
                const OriginalRTCPeerConnection = window.RTCPeerConnection;
                window.RTCPeerConnection = function() {
                    console.log('🛡️ Blocked WebRTC connection attempt');
                    throw new Error('WebRTC blocked for privacy protection');
                };
                
                // Also block other WebRTC constructors
                if (window.webkitRTCPeerConnection) {
                    window.webkitRTCPeerConnection = window.RTCPeerConnection;
                }
                if (window.mozRTCPeerConnection) {
                    window.mozRTCPeerConnection = window.RTCPeerConnection;
                }
            }
        }
        
        protectWebGL() {
            // Protect against WebGL fingerprinting
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type, attributes) {
                if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
                    const context = originalGetContext.call(this, type, attributes);
                    if (context) {
                        // Spoof WebGL parameters
                        const originalGetParameter = context.getParameter;
                        context.getParameter = function(parameter) {
                            // Return fake values for fingerprinting parameters
                            switch(parameter) {
                                case context.RENDERER:
                                    return 'Intel Iris OpenGL Engine';
                                case context.VENDOR:
                                    return 'Intel Inc.';
                                case context.VERSION:
                                    return 'WebGL 1.0';
                                case context.SHADING_LANGUAGE_VERSION:
                                    return 'WebGL GLSL ES 1.0';
                                default:
                                    return originalGetParameter.call(this, parameter);
                            }
                        };
                    }
                    return context;
                }
                return originalGetContext.call(this, type, attributes);
            };
        }
        
        spoofScreenProperties() {
            // Spoof screen resolution to prevent fingerprinting
            Object.defineProperty(screen, 'width', {
                get: function() { return 1920; },
                configurable: true
            });
            Object.defineProperty(screen, 'height', {
                get: function() { return 1080; },
                configurable: true
            });
            Object.defineProperty(screen, 'availWidth', {
                get: function() { return 1920; },
                configurable: true
            });
            Object.defineProperty(screen, 'availHeight', {
                get: function() { return 1040; },
                configurable: true
            });
        }
        
        setupObservers() {
            // Watch for dynamically added elements
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.analyzeAndBlockElement(node);
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        analyzeAndBlockElement(element) {
            // AI-like analysis of elements for blocking
            const suspiciousPatterns = [
                /doubleclick/i,
                /googletagmanager/i,
                /facebook\.com\/tr/i,
                /analytics/i,
                /tracking/i,
                /advertisement/i,
                /popup/i,
                /overlay/i
            ];
            
            // Check element attributes
            const attributes = ['src', 'href', 'data-src', 'class', 'id'];
            attributes.forEach(attr => {
                const value = element.getAttribute && element.getAttribute(attr);
                if (value) {
                    suspiciousPatterns.forEach(pattern => {
                        if (pattern.test(value)) {
                            this.blockElement(element, `Suspicious ${attr}: ${value}`);
                        }
                    });
                }
            });
            
            // Block tracking pixels
            if (element.tagName === 'IMG' && element.width === 1 && element.height === 1) {
                this.blockElement(element, 'Tracking pixel detected');
            }
            
            // Block suspicious iframes
            if (element.tagName === 'IFRAME') {
                const src = element.src || '';
                if (src.includes('ads') || src.includes('track') || src.includes('analytics')) {
                    this.blockElement(element, 'Suspicious iframe');
                }
            }
        }
        
        blockElement(element, reason) {
            element.style.display = 'none !important';
            element.style.visibility = 'hidden !important';
            element.style.opacity = '0 !important';
            element.remove();
            
            console.log(`🛡️ Blocked element: ${reason}`);
            this.stats.adsBlocked++;
        }
        
        blockTrackingElements() {
            // Block common tracking elements
            const trackingSelectors = [
                '[class*="advertisement"]',
                '[class*="ads"]',
                '[id*="advertisement"]',
                '[id*="ads"]',
                'iframe[src*="doubleclick"]',
                'iframe[src*="googlesyndication"]',
                'script[src*="googletagmanager"]',
                'script[src*="facebook.com/tr"]',
                'img[width="1"][height="1"]',
                '[data-ad-client]',
                '.ad-banner',
                '.popup-overlay'
            ];
            
            trackingSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        this.blockElement(element, `Tracking selector: ${selector}`);
                    });
                } catch (e) {
                    // Ignore invalid selectors
                }
            });
        }
        
        protectAgainstFingerprinting() {
            // Block various fingerprinting techniques
            
            // Protect against font fingerprinting
            if (document.fonts && document.fonts.check) {
                const originalCheck = document.fonts.check;
                document.fonts.check = function() {
                    return true; // Always return true to break font fingerprinting
                };
            }
            
            // Protect against audio fingerprinting
            if (window.AudioContext || window.webkitAudioContext) {
                const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
                const audioContexts = [];
                
                window.AudioContext = window.webkitAudioContext = function() {
                    const context = new OriginalAudioContext();
                    
                    // Override createOscillator to return randomized values
                    const originalCreateOscillator = context.createOscillator;
                    context.createOscillator = function() {
                        const oscillator = originalCreateOscillator.call(this);
                        // Add slight randomization to frequency
                        oscillator.frequency.value += Math.random() * 0.1 - 0.05;
                        return oscillator;
                    };
                    
                    audioContexts.push(context);
                    return context;
                };
            }
            
            // Block Battery API
            if (navigator.getBattery) {
                navigator.getBattery = function() {
                    return Promise.reject(new Error('Battery API blocked for privacy'));
                };
            }
            
            // Block GamePad API
            if (navigator.getGamepads) {
                navigator.getGamepads = function() {
                    return [];
                };
            }
        }
    }
    
    // Initialize protection when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new SmartContentProtection();
        });
    } else {
        new SmartContentProtection();
    }
    
})();
