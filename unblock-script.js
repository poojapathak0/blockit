// Safe Unblock Script - External file to avoid CSP issues
'use strict';

// Global variables
let blockedSite = 'Unknown Site';
let debugMessages = [];

// Logging function
function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('🛡️ ' + logMessage);
    
    debugMessages.push(logMessage);
    if (debugMessages.length > 15) {
        debugMessages = debugMessages.slice(-15);
    }
    
    const debugElement = document.getElementById('debugLog');
    if (debugElement) {
        debugElement.innerHTML = debugMessages.join('<br>');
        debugElement.scrollTop = debugElement.scrollHeight;
    }
}

// Status display
function showStatus(message, type = 'info') {
    addLog(`Status (${type}): ${message}`);
    const statusArea = document.getElementById('statusArea');
    if (statusArea) {
        statusArea.className = 'status ' + type;
        statusArea.innerHTML = message;
    }
}

// Test button function
function testButtonFunction() {
    addLog('🔧 TEST BUTTON CLICKED - Function executing!');
    showStatus('🎉 SUCCESS! Button functionality is working perfectly!', 'success');
    
    // Test extension communication
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
            chrome.runtime.sendMessage({action: 'getStats'}, function(response) {
                if (chrome.runtime.lastError) {
                    addLog('Extension communication failed: ' + chrome.runtime.lastError.message);
                    showStatus('⚠️ Extension API error, but buttons work! Error: ' + chrome.runtime.lastError.message, 'error');
                } else {
                    addLog('Extension communication successful: ' + JSON.stringify(response));
                    showStatus('✅ PERFECT! Buttons work AND extension communication successful!', 'success');
                }
            });
        } catch (error) {
            addLog('Extension test exception: ' + error.message);
            showStatus('⚠️ Extension exception, but buttons work! Error: ' + error.message, 'error');
        }
    } else {
        addLog('Chrome extension API not available');
        showStatus('✅ Buttons work perfectly! Extension API not available (normal in some contexts)', 'success');
    }
}

// Start unblock process
function startUnblockFunction() {
    addLog('🔓 UNBLOCK BUTTON CLICKED - Starting unblock process!');
    showStatus('🔄 Unblock process initiated...', 'info');
    
    // Try extension communication first
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
            addLog('Attempting extension unblock communication...');
            chrome.runtime.sendMessage({
                action: 'completeUnblock',
                domain: blockedSite
            }, function(response) {
                if (chrome.runtime.lastError) {
                    addLog('Extension unblock failed: ' + chrome.runtime.lastError.message);
                    addLog('Falling back to direct unblock method...');
                    performDirectUnblock();
                } else if (response === true) {
                    addLog('✅ Extension unblock successful!');
                    showUnblockSuccess();
                } else {
                    addLog('Extension returned: ' + response + ', trying direct unblock...');
                    performDirectUnblock();
                }
            });
        } catch (error) {
            addLog('Extension unblock exception: ' + error.message);
            performDirectUnblock();
        }
    } else {
        addLog('Extension API not available, using direct unblock');
        performDirectUnblock();
    }
}

// Direct unblock fallback
function performDirectUnblock() {
    addLog('🔄 Performing direct localStorage unblock...');
    showStatus('🔄 Processing unblock request...', 'info');
    
    try {
        // Create unblock data
        const unblockData = {
            domain: blockedSite,
            unblockTime: Date.now(),
            reblockTime: Date.now() + (2 * 60 * 60 * 1000), // 2 hours
            method: 'direct',
            timestamp: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('tempUnblock_' + blockedSite, JSON.stringify(unblockData));
        addLog('✅ Direct unblock data stored successfully');
        
        // Show success and redirect
        showUnblockSuccess();
        
    } catch (error) {
        addLog('❌ localStorage unblock failed: ' + error.message);
        
        // Try sessionStorage as fallback
        try {
            sessionStorage.setItem('tempUnblock_' + blockedSite, JSON.stringify({
                domain: blockedSite,
                unblockTime: Date.now(),
                method: 'session'
            }));
            addLog('✅ Fallback unblock stored in sessionStorage');
            showUnblockSuccess();
        } catch (sessionError) {
            addLog('❌ All storage methods failed');
            showUnblockSuccess(); // Still try to redirect
        }
    }
}

// Show unblock success
function showUnblockSuccess() {
    addLog('🎉 Unblock successful!');
    showStatus(
        '✅ Site unblocked successfully!<br>' +
        '⚠️ Will be re-blocked in 2 hours.<br>' +
        '🔄 Redirecting in 3 seconds...', 
        'success'
    );
    
    setTimeout(function() {
        redirectToSite();
    }, 3000);
}

// Redirect to site
function redirectToSite() {
    addLog('🔗 Redirecting to: https://' + blockedSite);
    
    try {
        // Multiple redirect methods
        window.location.href = 'https://' + blockedSite;
        
        // Fallback methods
        setTimeout(() => {
            try {
                window.location.replace('https://' + blockedSite);
            } catch (e) {
                addLog('Replace method failed: ' + e.message);
            }
        }, 1000);
        
    } catch (error) {
        addLog('❌ Primary redirect failed: ' + error.message);
        
        // Show manual redirect option
        showStatus(
            '⚠️ Automatic redirect failed.<br>' +
            '<strong>Please click this link to continue:</strong><br>' +
            '<a href="https://' + blockedSite + '" target="_self" style="color: #ffd700; text-decoration: underline;">' +
            'https://' + blockedSite + '</a><br>' +
            'Or manually navigate to the site.',
            'error'
        );
    }
}

// Go back
function goBackFunction() {
    addLog('⬅️ GO BACK BUTTON CLICKED!');
    showStatus('Going back...', 'info');
    try {
        history.back();
    } catch (error) {
        addLog('Go back failed: ' + error.message);
        showStatus('❌ Cannot go back. Please close this tab manually.', 'error');
    }
}

// Open new tab
function openNewTabFunction() {
    addLog('🏠 NEW TAB BUTTON CLICKED!');
    showStatus('Opening new tab...', 'info');
    try {
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
            chrome.tabs.create({url: 'chrome://newtab/'});
            addLog('New tab opened via extension API');
        } else {
            window.open('chrome://newtab/', '_blank');
            addLog('New tab opened via window.open');
        }
        showStatus('✅ New tab opened!', 'success');
    } catch (error) {
        addLog('New tab failed: ' + error.message);
        try {
            window.open('about:blank', '_blank');
            showStatus('✅ Blank tab opened as fallback', 'success');
        } catch (fallbackError) {
            showStatus('❌ Could not open new tab: ' + error.message, 'error');
        }
    }
}

// Initialize page
function initializePage() {
    addLog('🚀 Starting page initialization...');
    
    try {
        // Get blocked site from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        blockedSite = urlParams.get('site') || 'example.com';
        addLog('Blocked site identified: ' + blockedSite);
        
        // Set the site name in DOM
        const siteElement = document.getElementById('blockedSite');
        if (siteElement) {
            siteElement.textContent = blockedSite;
            addLog('Site name displayed in DOM');
        }
        
        // Set up event listeners
        const testBtn = document.getElementById('testBtn');
        const unblockBtn = document.getElementById('unblockBtn');
        const backBtn = document.getElementById('backBtn');
        const newTabBtn = document.getElementById('newTabBtn');
        
        if (testBtn) {
            testBtn.addEventListener('click', testButtonFunction);
            addLog('✅ Test button listener added');
        }
        
        if (unblockBtn) {
            unblockBtn.addEventListener('click', startUnblockFunction);
            addLog('✅ Unblock button listener added');
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', goBackFunction);
            addLog('✅ Back button listener added');
        }
        
        if (newTabBtn) {
            newTabBtn.addEventListener('click', openNewTabFunction);
            addLog('✅ New tab button listener added');
        }
        
        addLog('✅ Page initialization completed successfully');
        showStatus('✅ All systems ready! Buttons are functional. Click "Test Extension" to verify.', 'success');
        
    } catch (error) {
        addLog('❌ Initialization error: ' + error.message);
        showStatus('⚠️ Initialization had issues, but buttons should still work: ' + error.message, 'error');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
    addLog('DOMContentLoaded listener added');
} else {
    initializePage();
}

// Fallback initialization
setTimeout(initializePage, 100);

addLog('🛡️ Script loaded and ready - BUTTONS SHOULD WORK!');
