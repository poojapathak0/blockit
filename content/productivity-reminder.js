// Productivity Reminder System
// Shows smart reminders instead of auto-blocking

class ProductivityReminder {
    constructor() {
        this.reminderInterval = null;
        this.init();
    }

    init() {
        console.log('🎯 Productivity Reminder System initialized');
        this.checkForActiveUnblocks();
        this.startPeriodicCheck();
    }

    checkForActiveUnblocks() {
        try {
            const unblockData = localStorage.getItem('unblock_data');
            if (unblockData) {
                const data = JSON.parse(unblockData);
                if (data.status === 'active') {
                    this.scheduleReminder(data);
                }
            }
        } catch (error) {
            console.error('Error checking unblock status:', error);
        }
    }

    scheduleReminder(unblockData) {
        const currentTime = Date.now();
        const reminderTime = unblockData.next_check || (unblockData.unblockTime + (3 * 60 * 60 * 1000));
        const timeUntilReminder = reminderTime - currentTime;

        console.log('⏰ Reminder scheduled for:', new Date(reminderTime));

        if (timeUntilReminder > 0) {
            setTimeout(() => {
                this.showProductivityReminder(unblockData);
            }, timeUntilReminder);
        } else {
            // Should show reminder now
            this.showProductivityReminder(unblockData);
        }
    }

    showProductivityReminder(unblockData) {
        // Create reminder overlay
        const overlay = this.createReminderOverlay(unblockData);
        document.body.appendChild(overlay);
    }

    createReminderOverlay(unblockData) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.5s ease-out;
        `;

        const hoursUsed = Math.floor((Date.now() - unblockData.unblockTime) / (1000 * 60 * 60));
        const minutesUsed = Math.floor(((Date.now() - unblockData.unblockTime) % (1000 * 60 * 60)) / (1000 * 60));

        modal.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">🎯</div>
            <h2 style="margin-bottom: 20px; font-size: 28px;">Productivity Check-in</h2>
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 25px;">
                You've been on <strong>${unblockData.domain || unblockData.url}</strong> for 
                <strong>${hoursUsed}h ${minutesUsed}m</strong>.
            </p>
            <p style="font-size: 16px; margin-bottom: 30px; color: #ffd700;">
                Time for a productivity check! What would you like to do?
            </p>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button id="stayHereBtn" style="
                    padding: 15px 25px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    📚 Continue Here (Remind in 1h)
                </button>
                
                <button id="blockNowBtn" style="
                    padding: 15px 25px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    🚫 Block Site Now
                </button>
                
                <button id="productiveActivityBtn" style="
                    padding: 15px 25px;
                    background: #6f42c1;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    💪 Do Something Productive
                </button>
            </div>
            
            <p style="font-size: 14px; margin-top: 20px; opacity: 0.8;">
                💡 Remember: Time spent on meaningful activities compounds over time!
            </p>
        `;

        // Add event listeners
        modal.querySelector('#stayHereBtn').addEventListener('click', () => {
            this.handleStayHere(unblockData, overlay);
        });

        modal.querySelector('#blockNowBtn').addEventListener('click', () => {
            this.handleBlockNow(unblockData, overlay);
        });

        modal.querySelector('#productiveActivityBtn').addEventListener('click', () => {
            this.handleProductiveActivity(overlay);
        });

        overlay.appendChild(modal);
        return overlay;
    }

    handleStayHere(unblockData, overlay) {
        // Update next reminder time to 1 hour from now
        unblockData.next_check = Date.now() + (60 * 60 * 1000); // 1 hour
        localStorage.setItem('unblock_data', JSON.stringify(unblockData));
        
        overlay.remove();
        
        // Schedule next reminder
        setTimeout(() => {
            this.showProductivityReminder(unblockData);
        }, 60 * 60 * 1000); // 1 hour
        
        this.showNotification('⏰ You\'ll be reminded again in 1 hour!', 'info');
    }

    handleBlockNow(unblockData, overlay) {
        // Re-activate blocking
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                action: 'reactivate_block',
                domain: unblockData.domain || this.extractDomain(unblockData.url)
            });
        }
        
        // Clear unblock data
        localStorage.removeItem('unblock_data');
        localStorage.removeItem('unblock_status');
        localStorage.removeItem('unblocked_domain');
        
        overlay.remove();
        
        this.showNotification('🚫 Site blocking reactivated. Good choice for productivity!', 'success');
        
        // Redirect to a productive page
        setTimeout(() => {
            window.location.href = 'chrome://newtab/';
        }, 2000);
    }

    handleProductiveActivity(overlay) {
        overlay.remove();
        
        // Show productive activity suggestions
        const suggestions = [
            'https://www.coursera.org',
            'https://www.khanacademy.org',
            'https://github.com',
            'https://stackoverflow.com',
            'https://medium.com',
            'https://www.ted.com',
            'chrome://newtab/'
        ];
        
        const randomSite = suggestions[Math.floor(Math.random() * suggestions.length)];
        
        this.showNotification('💪 Great choice! Redirecting to something productive...', 'success');
        
        setTimeout(() => {
            window.location.href = randomSite;
        }, 2000);
    }

    extractDomain(url) {
        try {
            let domain = url.replace(/^https?:\/\//, '');
            domain = domain.replace(/^www\./, '');
            domain = domain.split('/')[0].split('?')[0];
            return domain;
        } catch (error) {
            return url;
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'info' ? '#17a2b8' : '#ffc107'};
            color: white;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideInRight 0.5s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    startPeriodicCheck() {
        // Check every 5 minutes if reminder should be shown
        setInterval(() => {
            this.checkForActiveUnblocks();
        }, 5 * 60 * 1000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize the productivity reminder system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProductivityReminder();
    });
} else {
    new ProductivityReminder();
}
