// Safe YouTube Ad Blocker - Won't interfere with search
(function() {
    'use strict';
    
    console.log('🛡️ SAFE YOUTUBE AD BLOCKER: Starting...');
    
    let adBlockedCount = 0;
    const playbackState = {
        mutedByScript: false,
        rateBoosted: false,
        prevRate: 1
    };
    
    // Block only specific YouTube ad requests
    function blockYouTubeAdRequests() {
        // Override XMLHttpRequest for specific YouTube ad URLs only
        const originalXHROpen = XMLHttpRequest.prototype.open;
        
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            // Never block media streams from googlevideo (prevents black screen)
            if (typeof url === 'string' && url.includes('googlevideo.com')) {
                return originalXHROpen.call(this, method, url, async, user, password);
            }
            if (isSpecificYouTubeAdURL(url)) {
                console.log('🚫 BLOCKED YOUTUBE AD REQUEST:', url);
                adBlockedCount++;
                return originalXHROpen.call(this, method, 'data:text/plain,', async, user, password);
            }
            return originalXHROpen.call(this, method, url, async, user, password);
        };
        
        // Override fetch for specific YouTube ad URLs only
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input && input.url;
            // Never block media streams from googlevideo (prevents black screen)
            if (typeof url === 'string' && url.includes('googlevideo.com')) {
                return originalFetch.call(this, input, init);
            }
            if (typeof url === 'string' && isSpecificYouTubeAdURL(url)) {
                console.log('🚫 BLOCKED YOUTUBE AD FETCH:', url);
                adBlockedCount++;
                return Promise.resolve(new Response('', {status: 204}));
            }
            return originalFetch.call(this, input, init);
        };
    }
    
    function isSpecificYouTubeAdURL(url) {
        // Never treat googlevideo (media) as ad
        if (typeof url === 'string' && url.includes('googlevideo.com')) {
            return false;
        }

        // Very specific YouTube ad indicators only (non-media)
        const youtubeAdIndicators = [
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
        
        // Only block if it's clearly a YouTube/ytimg endpoint AND has ad indicators
        const isYouTubeEndpoint = url.includes('youtube.com') || url.includes('ytimg.com');
        
        return isYouTubeEndpoint && youtubeAdIndicators.some(indicator => url.includes(indicator));
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
    
    function isAdActive() {
        // Robust ad detection
        const player = document.getElementById('movie_player');
        if (player && player.classList.contains('ad-showing')) return true;
        return [
            '.ytp-ad-player-overlay',
            '.ytp-ad-text',
            '.ytp-ad-overlay-container',
            '.video-ads',
            '.ytp-ad-preview-container'
        ].some(sel => {
            const el = document.querySelector(sel);
            return el && el.offsetParent !== null;
        });
    }

    function skipVideoAds() {
        const video = document.querySelector('video');
        if (!video) return;

        if (isAdActive()) {
            // Prefer clicking skip when available
            const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
            if (skipButton && skipButton.offsetParent !== null && !skipButton.disabled) {
                skipButton.click();
                // Prevent focus from staying on a control (keeps Space toggling play/pause)
                try { skipButton.blur(); } catch (e) {}
                const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
                try { if (player) player.focus(); } catch (e) {}
                console.log('⏭️ Clicked skip button');
                return;
            }

            // For unskippable/bumper ads: fast-forward safely
            try {
                if (!video.muted) {
                    video.muted = true;
                    playbackState.mutedByScript = true;
                }
                if (video.duration && video.duration > 0 && video.duration <= 90) {
                    video.currentTime = Math.max(video.currentTime, video.duration - 0.1);
                    console.log('⏭️ Jumped to end of short ad');
                } else {
                    // Long unskippable: speed up, but don't affect real content later
                    if (video.playbackRate < 16) {
                        if (!playbackState.rateBoosted) {
                            playbackState.prevRate = video.playbackRate || 1;
                        }
                        video.playbackRate = 16;
                        playbackState.rateBoosted = true;
                    }
                }
            } catch (e) {}
        } else {
            // Restore normal playback when not in ad
            try {
                if (playbackState.rateBoosted && video.playbackRate !== playbackState.prevRate) {
                    video.playbackRate = playbackState.prevRate;
                    playbackState.rateBoosted = false;
                }
                if (playbackState.mutedByScript && video.muted) {
                    video.muted = false;
                    playbackState.mutedByScript = false;
                }
            } catch (e) {}
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

    // Ensure the video and player are always visible
    function ensureVideoVisible() {
        try {
            const playerContainers = [
                '#movie_player',
                '.html5-video-player',
                '#player-container',
                '#player'
            ];
            playerContainers.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) {
                    if (getComputedStyle(el).display === 'none') el.style.display = 'block';
                    if (getComputedStyle(el).visibility === 'hidden') el.style.visibility = 'visible';
                    if (getComputedStyle(el).opacity === '0') el.style.opacity = '1';
                }
            });

            const video = document.querySelector('video.html5-main-video, #movie_player video');
            if (video) {
                if (getComputedStyle(video).display === 'none') video.style.display = 'block';
                if (getComputedStyle(video).visibility === 'hidden') video.style.visibility = 'visible';
                if (getComputedStyle(video).opacity === '0') video.style.opacity = '1';
            }
        } catch (e) {}
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
            try { button.blur(); } catch (e) {}
            const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
            try { if (player) player.focus(); } catch (e) {}
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
        
    // Keep video visible
    setInterval(ensureVideoVisible, 1000);
        
        console.log('🛡️ Safe YouTube ad blocker initialized');
    }
    
})();
