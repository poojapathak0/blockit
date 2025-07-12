// Minimal YouTube Ad Blocker - Safe for page display
(function() {
    'use strict';
    
    // Only run on YouTube
    if (!window.location.hostname.includes('youtube.com')) {
        return;
    }
    
    console.log('🛡️ Minimal YouTube Ad Blocker: Starting...');
    
    // Only block specific YouTube ad requests
    function blockYouTubeAds() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string' && url.includes('youtube.com')) {
                // Only block very specific YouTube ad URLs
                const youtubeAdPatterns = [
                    '/youtubei/v1/player/ad',
                    '&ad_type=video',
                    'googlevideo.com/videoplayback?',
                    '/api/stats/ads'
                ];
                
                const isYouTubeAd = youtubeAdPatterns.some(pattern => url.includes(pattern));
                if (isYouTubeAd) {
                    console.log('🚫 Blocked YouTube ad:', url);
                    return Promise.resolve(new Response('', {status: 204}));
                }
            }
            return originalFetch.apply(this, args);
        };
    }
    
    // Skip video ads safely
    function skipVideoAds() {
        const video = document.querySelector('video');
        if (!video) return;
        
        // Only skip if we detect an ad is playing
        const adSkipButton = document.querySelector('.ytp-ad-skip-button');
        if (adSkipButton && adSkipButton.offsetParent !== null) {
            // Click skip button
            adSkipButton.click();
            console.log('⏭️ Clicked skip button');
        }
        
        // Check for ad text indicator
        const adText = document.querySelector('.ytp-ad-text');
        if (adText && adText.offsetParent !== null) {
            // Speed up ad
            try {
                video.playbackRate = 16;
                video.muted = true;
            } catch (e) {}
        } else {
            // Restore normal playback when not in ad
            try {
                if (video.playbackRate === 16) {
                    video.playbackRate = 1;
                    video.muted = false;
                }
            } catch (e) {}
        }
    }
    
    // Hide only specific YouTube ad containers
    function hideYouTubeAdContainers() {
        const adContainers = [
            '.ytp-ad-module',
            '#player-ads',
            'ytd-promoted-sparkles-web-renderer'
        ];
        
        adContainers.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.display = 'none';
                });
            } catch (e) {}
        });
    }
    
    // Initialize YouTube ad blocking
    blockYouTubeAds();
    
    // Run ad skipping every second
    setInterval(skipVideoAds, 1000);
    
    // Hide ad containers every 3 seconds
    setInterval(hideYouTubeAdContainers, 3000);
    
    console.log('🛡️ Minimal YouTube protection initialized');
    
})();
