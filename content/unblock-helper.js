// Unblock Helper Content Script
// This script helps with the unblocking process by checking for unblock signals

console.log('🔓 Unblock helper content script loaded');

// Check for unblock signals on page load
function checkUnblockSignals() {
    try {
        const currentDomain = window.location.hostname.replace(/^www\./, '');
        
        // Check localStorage for unblock signals
        const unblockKey = 'tempUnblock_' + currentDomain;
        const unblockData = localStorage.getItem(unblockKey);
        
        if (unblockData) {
            try {
                const data = JSON.parse(unblockData);
                console.log('🔓 Found unblock data for', currentDomain, data);
                
                // Check if unblock is still valid (within 2 hours)
                const now = Date.now();
                if (data.reblockTime && now < data.reblockTime) {
                    console.log('✅ Site is temporarily unblocked');
                    
                    // Notify extension that this site should be accessible
                    if (typeof chrome !== 'undefined' && chrome.runtime) {
                        chrome.runtime.sendMessage({
                            action: 'confirmUnblock',
                            domain: currentDomain,
                            data: data
                        });
                    }
                    
                    // Show a subtle notification
                    showUnblockNotification(data);
                } else {
                    console.log('⏰ Unblock expired, removing data');
                    localStorage.removeItem(unblockKey);
                }
            } catch (e) {
                console.log('❌ Invalid unblock data, removing');
                localStorage.removeItem(unblockKey);
            }
        }
        
        // Check for global unblock signal
        const globalUnblock = localStorage.getItem('extensionUnblock');
        if (globalUnblock) {
            try {
                const data = JSON.parse(globalUnblock);
                if (data.domain === currentDomain && (Date.now() - data.timestamp) < 30000) {
                    console.log('🔓 Found global unblock signal for', currentDomain);
                    // Clear the signal
                    localStorage.removeItem('extensionUnblock');
                }
            } catch (e) {
                localStorage.removeItem('extensionUnblock');
            }
        }
        
    } catch (error) {
        console.log('Error checking unblock signals:', error);
    }
}

// Show unblock notification
function showUnblockNotification(data) {
    // Create a subtle notification banner
    const banner = document.createElement('div');
    banner.id = 'unblock-notification';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 10px 20px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        border-bottom: 2px solid rgba(255,255,255,0.2);
    `;
    
    const reblockTime = new Date(data.reblockTime);
    const remainingHours = Math.ceil((data.reblockTime - Date.now()) / (1000 * 60 * 60));
    
    banner.innerHTML = `
        🔓 <strong>Site Temporarily Unblocked</strong> - 
        Will be re-blocked in approximately ${remainingHours} hour${remainingHours !== 1 ? 's' : ''} 
        (${reblockTime.toLocaleTimeString()})
        <button onclick="this.parentElement.remove()" style="
            margin-left: 15px; 
            background: rgba(255,255,255,0.2); 
            border: none; 
            color: white; 
            padding: 5px 10px; 
            border-radius: 3px; 
            cursor: pointer;
            font-size: 12px;
        ">×</button>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (banner.parentElement) {
            banner.style.transition = 'opacity 0.5s ease';
            banner.style.opacity = '0';
            setTimeout(() => {
                if (banner.parentElement) {
                    banner.remove();
                }
            }, 500);
        }
    }, 10000);
}

// Listen for messages from background script
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'checkUnblockStatus') {
            checkUnblockSignals();
            sendResponse(true);
        } else if (request.action === 'showUnblockSuccess') {
            showUnblockNotification(request.data);
            sendResponse(true);
        }
    });
}

// Check on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkUnblockSignals);
} else {
    checkUnblockSignals();
}

// Also check after a short delay to ensure page is fully loaded
setTimeout(checkUnblockSignals, 1000);

console.log('🔓 Unblock helper ready for domain:', window.location.hostname);
