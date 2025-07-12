// Working Content Script - Blocks ads without breaking functionality
(function() {
    'use strict';
    
    console.log('🛡️ Working Content Protection: Starting...');
    
    let stats = {
        adsBlocked: 0,
        trackersBlocked: 0
    };
    
    // Block only specific, confirmed ad networks
    function blockAdNetworks() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string') {
                const adNetworks = [
                    'doubleclick.net',
                    'googlesyndication.com',
                    'googleadservices.com',
                    'facebook.com/tr',
                    'amazon-adsystem.com'
                ];
                
                const isAdNetwork = adNetworks.some(network => url.includes(network));
                if (isAdNetwork) {
                    console.log('🚫 Blocked ad network:', url);
                    stats.adsBlocked++;
                    return Promise.resolve(new Response('', {status: 204}));
                }
            }
            return originalFetch.apply(this, args);
        };
    }
    
    // Remove only very specific ad elements
    function removeAds() {
        const specificAds = [
            'iframe[src*="doubleclick.net"]',
            'iframe[src*="googlesyndication.com"]',
            'script[src*="googletagmanager.com"]',
            'img[width="1"][height="1"][src*="analytics"]'
        ];
        
        specificAds.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.display = 'none';
                    stats.adsBlocked++;
                });
            } catch (e) {}
        });
    }
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'switchMode') {
            console.log('🔄 Switching protection mode:', request.mode);
            sendResponse(true);
        }
        return true;
    });
    
    // Initialize
    blockAdNetworks();
    setInterval(removeAds, 3000);
    
    console.log('🛡️ Working protection initialized - functionality preserved');
    
})();
