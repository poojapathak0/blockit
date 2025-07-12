// Safe YouTube Ad Blocker - Won't interfere with search
(function() {
    'use strict';
    
    console.log('🛡️ SAFE YOUTUBE AD BLOCKER: Starting...');
    
    let adBlockedCount = 0;
    
    // Block only specific YouTube ad requests
    function blockYouTubeAdRequests() {
        // Override XMLHttpRequest for specific YouTube ad URLs only
        const originalXHROpen = XMLHttpRequest.prototype.open;
        
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            if (isSpecificYouTubeAdURL(url)) {
                console.log('🚫 BLOCKED YOUTUBE AD REQUEST:', url);
                adBlockedCount++;
                return originalXHROpen.call(this, method, 'data:text/plain,', async, user, password);
            }
            return originalXHROpen.call(this, method, url, async, user, password);
        };
        
        // Override fetch for specific YouTube ad URLs only
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string' && isSpecificYouTubeAdURL(url)) {
                console.log('🚫 BLOCKED YOUTUBE AD FETCH:', url);
                adBlockedCount++;
                return Promise.resolve(new Response('', {status: 204}));
            }
            return originalFetch.apply(this, args);
        };
    }
    
    function isSpecificYouTubeAdURL(url) {
        // Very specific YouTube ad indicators only
        const youtubeAdIndicators = [
            'googlevideo.com/videoplayback?',
            '/youtubei/v1/player/ad',
            '&ad_type=video',
            '&adformat=',
            '/api/stats/ads',
            'video_ads_',
            '&adsystem=',
            '/ad_status',
            'doubleclick.net/pagead',
            'googlesyndication.com/pagead'
        ];
        
        // Only block if it's clearly a YouTube domain AND has ad indicators
        const isYouTubeDomain = url.includes('youtube.com') || 
                               url.includes('googlevideo.com') || 
                               url.includes('ytimg.com');
        
        return isYouTubeDomain && youtubeAdIndicators.some(indicator => url.includes(indicator));
    }
    
    // Safe ad blocking function
    function blockYouTubeAds() {
        try {
            // Method 1: Remove only specific YouTube ad elements
            removeSpecificYouTubeAdElements();
            
            // Method 2: Skip video ads safely
            skipVideoAds();
            
            // Method 3: Remove overlay ads
            removeYouTubeOverlayAds();
            
        } catch (error) {
            console.log('YouTube ad blocking error:', error);
        }
    }
    
    function removeSpecificYouTubeAdElements() {
        // Very specific YouTube ad selectors - won't interfere with search
        const specificYouTubeAdSelectors = [
            // Video player ads only
            '.ytp-ad-module',
            '.ytp-ad-overlay-container', 
            '.ytp-ad-text',
            '.ytp-ad-player-overlay',
            '.ytp-ad-image-overlay',
            '.ytp-ad-text-overlay',
            '.ytp-ad-overlay-close-button',
            '#player-ads',
            
            // Specific YouTube ad renderers
            'ytd-promoted-sparkles-web-renderer',
            'ytd-ad-slot-renderer',
            'ytd-banner-promo-renderer',
            'ytd-video-masthead-ad-v3-renderer',
            'ytd-display-ad-renderer',
            
            // Masthead ads
            '.ytd-rich-item-renderer .ytd-ad-slot-renderer'
        ];
        
        let removedCount = 0;
        specificYouTubeAdSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.style.display !== 'none') {
                        element.style.display = 'none !important';
                        element.style.visibility = 'hidden !important';
                        element.style.opacity = '0 !important';
                        element.style.height = '0px !important';
                        removedCount++;
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });
        
        if (removedCount > 0) {
            console.log(`🗑️ Removed ${removedCount} YouTube ad elements`);
            adBlockedCount += removedCount;
        }
    }
    
    function skipVideoAds() {
        const video = document.querySelector('video');
        if (!video) return;
        
        // Check if ad is playing using specific YouTube indicators
        const youtubeAdIndicators = [
            '.ytp-ad-text',
            '.ytp-ad-skip-button',
            '.ytp-ad-overlay-container'
        ];
        
        const isAdPlaying = youtubeAdIndicators.some(selector => {
            const element = document.querySelector(selector);
            return element && element.offsetParent !== null;
        });
        
        if (isAdPlaying) {
            console.log('🎯 YOUTUBE AD DETECTED - SKIPPING...');
            
            // Skip to end of ad
            try {
                if (video.duration && video.duration > 0 && video.duration < 120) { // Only skip short ads
                    video.currentTime = video.duration;
                    console.log('⏭️ Skipped YouTube ad');
                }
            } catch (e) {}
            
            // Auto-click skip button if available
            const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
            if (skipButton && skipButton.offsetParent !== null) {
                skipButton.click();
                console.log('⏭️ Clicked skip button');
            }
        }
    }
    
    function removeYouTubeOverlayAds() {
        // Remove YouTube overlay ads specifically
        const overlaySelectors = [
            '.ytp-ad-overlay-container',
            '.ytp-ad-text-overlay',
            '.ytp-ad-image-overlay',
            '.ytp-ce-covering-overlay',
            '.ytp-suggested-action-badge'
        ];
        
        overlaySelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.display = 'none !important';
                });
            } catch (e) {}
        });
    }
    
    // Enhanced skip button clicking
    function autoClickSkipButton() {
        const skipButtons = [
            '.ytp-ad-skip-button',
            '.ytp-skip-ad-button',
            '[aria-label*="Skip ad"]',
            'button[class*="skip"]'
        ];
        
        skipButtons.forEach(selector => {
            try {
                const button = document.querySelector(selector);
                if (button && button.offsetParent !== null && !button.disabled) {
                    // Only click if it's clearly a YouTube skip button
                    const isYouTubeSkip = button.className.includes('ytp') || 
                                         button.getAttribute('aria-label')?.toLowerCase().includes('skip');
                    if (isYouTubeSkip) {
                        button.click();
                        console.log('⏭️ Auto-clicked skip button');
                    }
                }
            } catch (e) {}
        });
    }
    
    // Initialize only on YouTube
    if (window.location.hostname.includes('youtube.com')) {
        // Block ad requests
        blockYouTubeAdRequests();
        
        // Run ad blocking every 500ms
        setInterval(blockYouTubeAds, 500);
        
        // Auto-click skip buttons
        setInterval(autoClickSkipButton, 1000);
        
        console.log('🛡️ Safe YouTube ad blocker initialized');
    }
    
})();
