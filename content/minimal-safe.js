// Minimal Safe Content Script - Only blocks specific ads, won't break pages
(function() {
    'use strict';
    
    console.log('🛡️ Minimal Safe Shield: Starting...');
    
    // Only block very specific, known ad domains - nothing else
    const specificAdDomains = [
        'doubleclick.net',
        'googlesyndication.com',
        'googleadservices.com',
        'googletagmanager.com',
        'facebook.com/tr',
        'amazon-adsystem.com'
    ];
    
    // Block network requests to known ad domains only
    function blockSpecificAdRequests() {
        // Only override network requests to specific ad domains
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string') {
                // Only block if URL contains specific ad domains
                const isAdDomain = specificAdDomains.some(domain => url.includes(domain));
                if (isAdDomain) {
                    console.log('🚫 Blocked ad request:', url);
                    return Promise.resolve(new Response('', {status: 204}));
                }
            }
            return originalFetch.apply(this, args);
        };
    }
    
    // Remove only very specific ad elements - nothing else
    function removeSpecificAds() {
        // Only target very specific ad selectors that won't affect normal content
        const specificAdSelectors = [
            'iframe[src*="doubleclick.net"]',
            'iframe[src*="googlesyndication.com"]',
            'script[src*="googletagmanager.com"]',
            'img[src*="doubleclick.net"]',
            'img[width="1"][height="1"][src*="analytics"]'
        ];
        
        specificAdSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Only hide, don't remove completely
                    element.style.display = 'none';
                    console.log('🚫 Hidden ad element:', selector);
                });
            } catch (e) {
                // Ignore any errors
            }
        });
    }
    
    // Initialize minimal protection
    function init() {
        // Only run ad blocking functions
        blockSpecificAdRequests();
        
        // Remove specific ads periodically (very conservative)
        setInterval(removeSpecificAds, 5000);
        
        console.log('🛡️ Minimal protection initialized - page display preserved');
    }
    
    // Start when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
