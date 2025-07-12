// Aggressive YouTube Ad Blocker - WORKING VERSION
// This script uses proven methods to completely block YouTube ads

(function() {
    'use strict';
    
    console.log('🚫 AGGRESSIVE YOUTUBE AD BLOCKER: Starting...');
    
    let playerObserver;
    let adBlockedCount = 0;
    
    // Immediately block ad-related network requests
    function blockAdRequests() {
        // Override XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            if (isAdURL(url)) {
                console.log('🚫 BLOCKED XHR AD REQUEST:', url);
                adBlockedCount++;
                // Redirect to empty response
                return originalXHROpen.call(this, method, 'data:text/plain,', async, user, password);
            }
            return originalXHROpen.call(this, method, url, async, user, password);
        };
        
        // Override fetch
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string' && isAdURL(url)) {
                console.log('🚫 BLOCKED FETCH AD REQUEST:', url);
                adBlockedCount++;
                return Promise.resolve(new Response('', {status: 204}));
            }
            return originalFetch.apply(this, args);
        };
    }
    
    function isAdURL(url) {
        const adIndicators = [
            '/pagead/',
            '/ptracking',
            'googlesyndication',
            'doubleclick',
            'googleadservices',
            'googletagmanager',
            '/api/stats/ads',
            'get_video_info',
            'generate_204',
            '&ad_type=',
            '&adformat=',
            '/youtubei/v1/player/ad',
            'video_ads_',
            '&adsystem=',
            '/ad_status',
            'ads.youtube.com'
        ];
        
        return adIndicators.some(indicator => url.includes(indicator));
    }
    
    // Main ad blocking function - runs continuously
    function blockAds() {
        try {
            // Method 1: Find and remove ad elements immediately
            removeAdElements();
            
            // Method 2: Skip ads by manipulating player
            skipCurrentAd();
            
            // Method 3: Block overlay ads
            removeOverlayAds();
            
            // Method 4: Auto-click skip button
            clickSkipButton();
            
        } catch (error) {
            console.log('Ad blocking error:', error);
        }
    }
    
    function removeAdElements() {
        // Comprehensive list of ad selectors
        const adSelectors = [
            // Video ads
            '.video-ads',
            '.ytp-ad-module',
            '.ytp-ad-overlay-container', 
            '.ytp-ad-text',
            '.ytp-ad-skip-button-container',
            '.ytp-ad-player-overlay',
            '.ytp-ad-image-overlay',
            '.ytp-ad-text-overlay',
            '.ytp-ad-overlay-close-button',
            
            // Page ads
            '#player-ads',
            '.ytd-promoted-sparkles-web-renderer',
            '.ytd-ad-slot-renderer',
            '.ytd-banner-promo-renderer',
            '.advertisement-shelf',
            '.sparkles-light-cta',
            '.ytd-video-masthead-ad-v3-renderer',
            '.ytd-primetime-promo-renderer',
            
            // Sidebar ads
            '[data-ad-slot-id]',
            '.ytd-display-ad-renderer',
            '.ytd-rich-item-renderer .ytd-ad-slot-renderer',
            
            // Any element with 'ad' in class or id
            '[class*="ad-"]',
            '[id*="ad-"]',
            '[class*="_ad"]',
            '[id*="_ad"]'
        ];
        
        let removedCount = 0;
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.style.display !== 'none') {
                        element.style.display = 'none !important';
                        element.style.visibility = 'hidden !important';
                        element.style.opacity = '0 !important';
                        element.style.height = '0px !important';
                        element.remove();
                        removedCount++;
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });
        
        if (removedCount > 0) {
            console.log(`🗑️ Removed ${removedCount} ad elements`);
            adBlockedCount += removedCount;
        }
    }
    
    function skipCurrentAd() {
        const video = document.querySelector('video');
        if (!video) return;
        
        // Check if ad is playing
        const adIndicators = [
            '.ytp-ad-text',
            '.ytp-ad-skip-button',
            '.ytp-ad-overlay-container',
            '[class*="ad-showing"]'
        ];
        
        const isAdPlaying = adIndicators.some(selector => {
            const element = document.querySelector(selector);
            return element && element.offsetParent !== null;
        });
        
        if (isAdPlaying) {
            console.log('🎯 AD DETECTED - SKIPPING...');
            
            // Method 1: Jump to end of video
            try {
                if (video.duration && video.duration > 0) {
                    video.currentTime = video.duration;
                    console.log('⏭️ Jumped to end of ad');
                }
            } catch (e) {}
            
            // Method 2: Mute and speed up
            try {
                video.muted = true;
                video.playbackRate = 16;
                video.volume = 0;
                console.log('🔇 Muted and sped up ad');
            } catch (e) {}
            
            // Method 3: Hide video during ad
            try {
                video.style.opacity = '0';
                setTimeout(() => {
                    video.style.opacity = '1';
                }, 1000);
            } catch (e) {}
        } else {
            // Restore normal video settings when not in ad
            try {
                if (video.muted && video.playbackRate === 16) {
                    video.muted = false;
                    video.playbackRate = 1;
                    video.style.opacity = '1';
                }
            } catch (e) {}
        }
    }
    
    function removeOverlayAds() {
        // Remove overlay ads that appear on top of videos
        const overlaySelectors = [
            '.ytp-ad-overlay-container',
            '.ytp-ad-text-overlay',
            '.ytp-ad-image-overlay',
            '.iv-branding',
            '.ytp-ce-element',
            '.ytp-cards-teaser',
            '.annotation'
        ];
        
        overlaySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none !important';
                element.remove();
            });
        });
    }
    
    function clickSkipButton() {
        // Find and click skip button
        const skipSelectors = [
            '.ytp-ad-skip-button',
            '.ytp-skip-ad-button',
            '[class*="skip-button"]',
            '[class*="skip-ad"]',
            'button[class*="skip"]'
        ];
        
        skipSelectors.forEach(selector => {
            const button = document.querySelector(selector);
            if (button && button.offsetParent !== null && !button.disabled) {
                button.click();
                console.log('⏭️ Clicked skip button');
                adBlockedCount++;
            }
        });
    }
    
    // Enhanced observer to catch dynamically loaded ads
    function setupAdvancedObserver() {
        if (playerObserver) {
            playerObserver.disconnect();
        }
        
        playerObserver = new MutationObserver((mutations) => {
            let shouldBlock = false;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is an ad
                        const isAd = node.className && (
                            node.className.includes('ad') ||
                            node.className.includes('promo') ||
                            node.className.includes('sponsor')
                        );
                        
                        if (isAd) {
                            shouldBlock = true;
                        }
                        
                        // Check for ad-related child elements
                        if (node.querySelector) {
                            const adElements = node.querySelectorAll('[class*="ad"], [id*="ad"], .video-ads, .ytp-ad-module');
                            if (adElements.length > 0) {
                                shouldBlock = true;
                            }
                        }
                    }
                });
            });
            
            if (shouldBlock) {
                setTimeout(blockAds, 50); // Small delay to ensure elements are rendered
            }
        });
        
        // Observe the entire page
        playerObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }
    
    // Aggressive initialization
    function initializeAdBlocker() {
        console.log('🚫 INITIALIZING AGGRESSIVE AD BLOCKER');
        
        // Block network requests immediately
        blockAdRequests();
        
        // Set up continuous ad blocking
        const blockingInterval = setInterval(blockAds, 100); // Check every 100ms
        
        // Set up observer
        setupAdvancedObserver();
        
        // Enhanced video monitoring
        const videoCheckInterval = setInterval(() => {
            const video = document.querySelector('video');
            if (video) {
                // Add event listeners if not already added
                if (!video.hasAttribute('data-ad-blocker-active')) {
                    video.setAttribute('data-ad-blocker-active', 'true');
                    
                    video.addEventListener('loadstart', () => {
                        setTimeout(blockAds, 100);
                    });
                    
                    video.addEventListener('loadeddata', () => {
                        setTimeout(blockAds, 100);
                    });
                    
                    video.addEventListener('play', () => {
                        setTimeout(blockAds, 100);
                    });
                    
                    video.addEventListener('timeupdate', () => {
                        skipCurrentAd();
                    });
                }
            }
        }, 500);
        
        console.log('🚫 AGGRESSIVE AD BLOCKER: Fully initialized');
        
        // Show stats every 10 seconds
        setInterval(() => {
            if (adBlockedCount > 0) {
                console.log(`🛡️ BLOCKED ${adBlockedCount} ADS SO FAR`);
            }
        }, 10000);
    }
    
    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAdBlocker);
    } else {
        initializeAdBlocker();
    }
    
    // Re-initialize on navigation (YouTube SPA)
    let currentURL = location.href;
    setInterval(() => {
        if (location.href !== currentURL) {
            currentURL = location.href;
            console.log('🔄 Navigation detected, reinitializing ad blocker');
            setTimeout(initializeAdBlocker, 500);
        }
    }, 1000);
    
})();
