// Emergency Fix - Restore Page Display
(function() {
    'use strict';
    
    console.log('🚨 Emergency Fix: Restoring page display...');
    
    // Remove any aggressive hiding styles
    const style = document.createElement('style');
    style.textContent = `
        /* Emergency override - restore all hidden elements */
        * {
            display: initial !important;
            visibility: visible !important;
            opacity: 1 !important;
            background: initial !important;
        }
        
        body {
            background: white !important;
            color: black !important;
        }
        
        /* Only hide very specific ads */
        iframe[src*="doubleclick.net"] {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Remove any problematic classes or styles
    document.querySelectorAll('*').forEach(element => {
        if (element.style.display === 'none' && !element.src?.includes('doubleclick')) {
            element.style.display = '';
        }
        if (element.style.visibility === 'hidden') {
            element.style.visibility = '';
        }
        if (element.style.opacity === '0') {
            element.style.opacity = '';
        }
    });
    
    console.log('✅ Emergency fix applied - page should be visible now');
    
})();
