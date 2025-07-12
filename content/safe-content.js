// Safe Content Script - Protects Search Functionality
(function() {
    'use strict';
    
    class SafeContentProtection {
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
            this.setupSafeObservers();
            this.blockSafeTrackingElements();
            this.protectAgainstSafeFingerprinting();
            console.log('🛡️ Safe Shield: Protection activated (search-friendly)');
        }
        
        setupSafeObservers() {
            // Watch for dynamically added elements but be conservative
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.safeAnalyzeElement(node);
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        safeAnalyzeElement(element) {
            // Only block very specific, known ad patterns - avoid search elements
            const specificAdPatterns = [
                /doubleclick\.net/i,
                /googletagmanager\.com/i,
                /googlesyndication\.com/i,
                /facebook\.com\/tr/i,
                /amazon-adsystem\.com/i,
                /adsystem\.amazon/i
            ];
            
            // Protected elements - never block these
            const protectedSelectors = [
                'input[type="search"]',
                '[role="search"]',
                '.search',
                '#search',
                '.searchbox',
                '#searchbox',
                '[class*="search"]',
                '[id*="search"]',
                'form[action*="search"]',
                'button[type="submit"]',
                '[aria-label*="search" i]',
                '[placeholder*="search" i]'
            ];
            
            // Check if element is protected (search-related)
            const isProtected = protectedSelectors.some(selector => {
                try {
                    return element.matches && element.matches(selector);
                } catch (e) {
                    return false;
                }
            });
            
            if (isProtected) {
                return; // Don't block protected elements
            }
            
            // Only check for very specific ad URLs
            const attributes = ['src', 'href', 'data-src'];
            attributes.forEach(attr => {
                const value = element.getAttribute && element.getAttribute(attr);
                if (value) {
                    specificAdPatterns.forEach(pattern => {
                        if (pattern.test(value)) {
                            this.blockElement(element, `Specific ad URL: ${value}`);
                        }
                    });
                }
            });
            
            // Block only 1x1 tracking pixels (very safe)
            if (element.tagName === 'IMG' && 
                element.width === 1 && 
                element.height === 1 && 
                element.src && 
                (element.src.includes('analytics') || element.src.includes('track'))) {
                this.blockElement(element, 'Tracking pixel detected');
            }
        }
        
        blockElement(element, reason) {
            element.style.display = 'none !important';
            element.style.visibility = 'hidden !important';
            element.style.opacity = '0 !important';
            
            console.log(`🛡️ Safely blocked: ${reason}`);
            this.stats.adsBlocked++;
        }
        
        blockSafeTrackingElements() {
            // Only block very specific, confirmed tracking elements
            const safeTrackingSelectors = [
                'iframe[src*="doubleclick.net"]',
                'iframe[src*="googlesyndication.com"]',
                'script[src*="googletagmanager.com"]',
                'script[src*="facebook.com/tr"]',
                'img[src*="doubleclick.net"]',
                'img[src*="analytics.google.com"]',
                'img[width="1"][height="1"][src*="analytics"]',
                'img[width="1"][height="1"][src*="track"]'
            ];
            
            safeTrackingSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        this.blockElement(element, `Safe tracking selector: ${selector}`);
                    });
                } catch (e) {
                    // Ignore invalid selectors
                }
            });
        }
        
        protectAgainstSafeFingerprinting() {
            // Minimal fingerprinting protection that won't break functionality
            
            // Block Battery API (safe - not used by search)
            if (navigator.getBattery) {
                navigator.getBattery = function() {
                    return Promise.reject(new Error('Battery API blocked for privacy'));
                };
            }
            
            // Block GamePad API (safe - not used by search)
            if (navigator.getGamepads) {
                navigator.getGamepads = function() {
                    return [];
                };
            }
            
            // Light WebRTC protection (may affect some features but preserves search)
            if (window.RTCPeerConnection && !window.searchProtectedRTC) {
                const OriginalRTCPeerConnection = window.RTCPeerConnection;
                window.RTCPeerConnection = function(config) {
                    // Allow WebRTC for specific domains that might need it for search
                    const allowedDomains = ['google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com'];
                    const currentDomain = window.location.hostname;
                    
                    if (allowedDomains.some(domain => currentDomain.includes(domain))) {
                        return new OriginalRTCPeerConnection(config);
                    }
                    
                    console.log('🛡️ WebRTC blocked (not search domain)');
                    throw new Error('WebRTC blocked for privacy protection');
                };
                window.searchProtectedRTC = true;
            }
        }
    }
    
    // Initialize safe protection when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new SafeContentProtection();
        });
    } else {
        new SafeContentProtection();
    }
    
})();
