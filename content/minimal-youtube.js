// Minimal YouTube Ad Blocker - Safe for page display
(function() {
    'use strict';
    
    // Only run on YouTube
    if (!window.location.hostname.includes('youtube.com')) {
        return;
    }
    
    console.log('🛡️ Minimal YouTube Ad Blocker: Starting...');
    
    // Do not override network requests in minimal mode
    function blockYouTubeAds() {}
    
    // Skip video ads safely
    function skipVideoAds() {
        const video = document.querySelector('video');
        if (!video) return;
        
        // Only skip if we detect an ad is playing
        const adSkipButton = document.querySelector('.ytp-ad-skip-button');
        if (adSkipButton && adSkipButton.offsetParent !== null) {
            // Click skip button and preserve keyboard focus on player
            adSkipButton.click();
            try { adSkipButton.blur(); } catch (_) {}
            const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
            try { if (player) player.focus(); } catch (_) {}
            console.log('⏭️ Clicked skip button');
        }
        
    // Minimal mode: do not change playback or mute
    }
    
    // Minimal mode: do not hide containers
    function hideYouTubeAdContainers() {}
    
    // Initialize YouTube ad blocking
    blockYouTubeAds();
    
    // Run ad skipping every second
    setInterval(skipVideoAds, 1000);
    
    // Hide ad containers every 3 seconds
    setInterval(hideYouTubeAdContainers, 3000);
    
    console.log('🛡️ Minimal YouTube protection initialized');
    
})();
