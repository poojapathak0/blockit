// YouTube-Specific Ad Blocker Content Script
// This script specifically targets YouTube's ad system

(function() {
    'use strict';
    
    let adBlockedCount = 0;
    let videoPlayer = null;
    
    console.log('🎯 YouTube Ad Blocker: Initializing aggressive ad blocking');
    
    // Block YouTube ads by intercepting ad-related requests
    function blockYouTubeAds() {
        // Override XMLHttpRequest to block ad requests
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            // Check if this is an ad-related request
            if (isAdRequest(url)) {
                console.log('🚫 Blocked YouTube ad request:', url);
                adBlockedCount++;
                // Replace with a dummy request that will fail silently
                return originalOpen.call(this, method, 'data:text/plain,blocked', async, user, password);
            }
            return originalOpen.call(this, method, url, async, user, password);
        };
        
        XMLHttpRequest.prototype.send = function(data) {
            return originalSend.call(this, data);
        };
        
        // Override fetch API as well
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            if (isAdRequest(url)) {
                console.log('🚫 Blocked YouTube ad fetch:', url);
                adBlockedCount++;
                return Promise.reject(new Error('Ad request blocked'));
            }
            return originalFetch.call(this, input, init);
        };
    }
    
    function isAdRequest(url) {
        const adPatterns = [
            '/pagead/',
            '/ptracking',
            'doubleclick.net',
            'googleadservices.com',
            'googlesyndication.com',
            'googletagmanager.com',
            'googletagservices.com',
            '/api/stats/ads',
            '/youtubei/v1/player/ad_',
            'get_video_info.*&ad_',
            '&dur=.*&sq=',  // Duration and sequence parameters often indicate ads
            'manifest.googlevideo.com.*dur=.*sq=',
            '/generate_204.*adformat',
            'video_ads_',
            '&ad_type=',
            '&ad_tag=',
            '/ad_status',
            'ads.youtube.com',
            '&adsystem='
        ];
        
        return adPatterns.some(pattern => {
            if (pattern.includes('.*')) {
                // Regex pattern
                try {
                    return new RegExp(pattern).test(url);
                } catch (e) {
                    return url.includes(pattern.replace('.*', ''));
                }
            }
            return url.includes(pattern);
        });
    }
    
    // Skip ads by manipulating video player
    function skipAds() {
        // Find and click skip button
        const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button, [class*="skip"]');
        if (skipButton && skipButton.offsetParent !== null) {
            skipButton.click();
            console.log('⏭️ Clicked skip ad button');
            return true;
        }
        
        // Try to skip by manipulating video time
        const video = document.querySelector('video');
        if (video) {
            const adIndicator = document.querySelector('.ytp-ad-text, .video-ads, [class*="ad-showing"]');
            if (adIndicator) {
                // Try to skip to end of ad
                try {
                    video.currentTime = video.duration;
                    console.log('⏭️ Skipped ad by jumping to end');
                    return true;
                } catch (e) {
                    // If that fails, try muting and speeding up
                    video.muted = true;
                    video.playbackRate = 16;
                    console.log('🔇 Muted and sped up ad');
                }
            }
        }
        return false;
    }
    
    // Remove ad elements from DOM
    function removeAdElements() {
        const adSelectors = [
            '.video-ads',
            '.ytp-ad-module',
            '.ytp-ad-overlay-container',
            '.ytp-ad-text',
            '.ytp-ad-image-overlay',
            '[class*="masthead-ad"]',
            '[id*="player-ads"]',
            '.ytp-ad-player-overlay',
            '.ytp-ad-skip-button-container',
            '#player-ads',
            '.advertisement-shelf',
            '[data-ad-slot-id]',
            '.ytd-promoted-sparkles-web-renderer',
            '.ytd-ad-slot-renderer',
            '.ytd-banner-promo-renderer-background',
            '.sparkles-light-cta',
            '.ytd-video-masthead-ad-advertiser-info-renderer',
            '.ytd-video-masthead-ad-primary-video-renderer',
            '.ytp-ad-overlay-container',
            '.ytp-ad-text-overlay'
        ];
        
        let removedCount = 0;
        adSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none !important';
                element.remove();
                removedCount++;
            });
        });
        
        if (removedCount > 0) {
            console.log(`🗑️ Removed ${removedCount} ad elements from DOM`);
        }
    }
    
    // Bypass ad overlay by clicking video
    function bypassAdOverlay() {
        const video = document.querySelector('video');
        const adOverlay = document.querySelector('.ytp-ad-overlay-container, .ytp-ad-text-overlay');
        
        if (video && adOverlay) {
            // Click on video to potentially skip overlay
            video.click();
            console.log('👆 Clicked video to bypass ad overlay');
        }
    }
    
    // Main ad blocking logic
    function initYouTubeAdBlocker() {
        blockYouTubeAds();
        
        // Continuous monitoring (reduced frequency)
        setInterval(() => {
            removeAdElements();
            if (skipAds()) {
                adBlockedCount++;
            }
            bypassAdOverlay();
            // Only check speed limit occasionally
            remove2xSpeedOption();
        }, 2000); // Check every 2 seconds instead of 500ms
        
        // Observer for dynamically loaded content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if added node is an ad
                        if (node.matches && node.matches('[class*="ad"], [id*="ad"], .video-ads, .ytp-ad-module')) {
                            node.style.display = 'none !important';
                            node.remove();
                            console.log('🚫 Blocked dynamically loaded ad element');
                            adBlockedCount++;
                        }
                        
                        // Check child elements too
                        const adElements = node.querySelectorAll && node.querySelectorAll('[class*="ad"], [id*="ad"], .video-ads, .ytp-ad-module');
                        if (adElements) {
                            adElements.forEach(adEl => {
                                adEl.style.display = 'none !important';
                                adEl.remove();
                                adBlockedCount++;
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Monitor video element specifically
        const videoObserver = new MutationObserver(() => {
            const video = document.querySelector('video');
            if (video && video !== videoPlayer) {
                videoPlayer = video;
                
                // Add event listeners to video
                video.addEventListener('loadstart', () => {
                    setTimeout(() => {
                        removeAdElements();
                        skipAds();
                    }, 100);
                });
                
                video.addEventListener('timeupdate', () => {
                    // Check if we're in an ad and try to skip
                    const adText = document.querySelector('.ytp-ad-text');
                    if (adText) {
                        skipAds();
                    }
                });
            }
        });
        
        videoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Simple function to just limit playback speed to prevent 2x
    function remove2xSpeedOption() {
        try {
            const video = document.querySelector('video');
            if (video && video.playbackRate >= 2) {
                video.playbackRate = 1.75; // Limit to 1.75x max
                console.log('🚫 Limited playback speed to 1.75x');
            }
        } catch (error) {
            // Fail silently to avoid breaking YouTube
        }
    }
    
    // Simple function to disable playback speed options (non-invasive)
    function disablePlaybackSpeedOptions() {
        // This function is now empty to avoid breaking YouTube
        // We'll only use the playback rate limiting above
    }
    
    // Wait for YouTube to load
    if (window.location.hostname.includes('youtube.com')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initYouTubeAdBlocker);
        } else {
            initYouTubeAdBlocker();
        }
        
        // Also initialize on navigation (YouTube is SPA)
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(initYouTubeAdBlocker, 1000); // Delay for page to load
            }
        }).observe(document, { subtree: true, childList: true });
        
        console.log('🎯 YouTube Ad Blocker: Initialized for', window.location.href);
    }
    
})();
