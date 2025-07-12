// Enhanced Background Script with Site Blocking
// Combines AI protection with site blocking functionality

class EnhancedExtension {
    constructor() {
        this.stats = {
            adsBlocked: 0,
            trackersBlocked: 0,
            httpsUpgrades: 0,
            fingerprintingBlocked: 0,
            malwareBlocked: 0
        };
        
        // Site blocking properties
        this.blockedSites = new Set();
        this.temporaryBlocks = new Map();
        this.unblockAttempts = new Map();
        
        this.init();
    }

    async init() {
        await this.loadBlockedSites();
        this.setupRequestBlocking();
        this.setupContextMenu();
        this.setupUnblockChallenges();
        this.setupMessageHandling();
        console.log('🛡️ Enhanced Extension: Initialized with site blocking');
    }

    // Site Blocking Methods
    async loadBlockedSites() {
        try {
            const result = await chrome.storage.local.get(['blockedSites', 'temporaryBlocks']);
            if (result.blockedSites) {
                this.blockedSites = new Set(result.blockedSites);
            }
            if (result.temporaryBlocks) {
                this.temporaryBlocks = new Map(Object.entries(result.temporaryBlocks));
            }
            console.log('Loaded blocked sites:', Array.from(this.blockedSites));
        } catch (error) {
            console.error('Error loading blocked sites:', error);
        }
    }

    async saveBlockedSites() {
        try {
            await chrome.storage.local.set({
                blockedSites: Array.from(this.blockedSites),
                temporaryBlocks: Object.fromEntries(this.temporaryBlocks)
            });
        } catch (error) {
            console.error('Error saving blocked sites:', error);
        }
    }

    setupRequestBlocking() {
        this.updateBlockingRules();
    }

    async updateBlockingRules() {
        try {
            // Remove existing site blocking rules
            const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
            const ruleIdsToRemove = existingRules
                .filter(rule => rule.id >= 5000 && rule.id < 6000)
                .map(rule => rule.id);

            // Create new blocking rules
            const newRules = [];
            let ruleId = 5000;

            for (const site of this.blockedSites) {
                newRules.push({
                    id: ruleId++,
                    priority: 100,
                    action: {
                        type: "redirect",
                        redirect: {
                            url: chrome.runtime.getURL("difficult-unblock.html") + "?url=" + encodeURIComponent(site)
                        }
                    },
                    condition: {
                        urlFilter: `*://*.${site}/*`,
                        resourceTypes: ["main_frame"]
                    }
                });

                // Also block without www
                newRules.push({
                    id: ruleId++,
                    priority: 100,
                    action: {
                        type: "redirect",
                        redirect: {
                            url: chrome.runtime.getURL("difficult-unblock.html") + "?url=" + encodeURIComponent(site)
                        }
                    },
                    condition: {
                        urlFilter: `*://${site}/*`,
                        resourceTypes: ["main_frame"]
                    }
                });
            }

            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove,
                addRules: newRules
            });

            console.log('Updated blocking rules for', this.blockedSites.size, 'sites');
        } catch (error) {
            console.error('Error updating blocking rules:', error);
        }
    }

    setupContextMenu() {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'blockThisSite',
                title: '🚫 Block this site',
                contexts: ['page']
            });

            chrome.contextMenus.create({
                id: 'manageBlockedSites',
                title: '⚙️ Manage blocked sites',
                contexts: ['page']
            });
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === 'blockThisSite') {
                this.blockCurrentSite(tab);
            } else if (info.menuItemId === 'manageBlockedSites') {
                chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
            }
        });
    }

    async blockCurrentSite(tab) {
        if (!tab.url) return;

        try {
            const url = new URL(tab.url);
            const domain = url.hostname.replace(/^www\./, '');

            if (domain && !this.blockedSites.has(domain)) {
                this.blockedSites.add(domain);
                await this.saveBlockedSites();
                await this.updateBlockingRules();

                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Site Blocked!',
                    message: `${domain} has been blocked. To unblock, you'll need to complete multiple verification steps.`
                });

                // Immediately redirect current tab
                chrome.tabs.update(tab.id, {
                    url: chrome.runtime.getURL("difficult-unblock.html") + "?url=" + encodeURIComponent(domain)
                });
            }
        } catch (error) {
            console.error('Error blocking site:', error);
        }
    }

    setupUnblockChallenges() {
        // Different types of challenges for unblocking
        this.challenges = [
            {
                type: 'math',
                generate: () => {
                    const a = Math.floor(Math.random() * 50) + 10;
                    const b = Math.floor(Math.random() * 50) + 10;
                    const c = Math.floor(Math.random() * 10) + 5;
                    return {
                        question: `Solve: (${a} × ${b}) ÷ ${c} = ?`,
                        answer: Math.floor((a * b) / c).toString()
                    };
                }
            },
            {
                type: 'sequence',
                generate: () => {
                    const start = Math.floor(Math.random() * 10) + 1;
                    const diff = Math.floor(Math.random() * 5) + 2;
                    const sequence = [];
                    for (let i = 0; i < 5; i++) {
                        sequence.push(start + (i * diff));
                    }
                    const missing = sequence.pop();
                    return {
                        question: `Complete the sequence: ${sequence.join(', ')}, ?`,
                        answer: missing.toString()
                    };
                }
            },
            {
                type: 'typing',
                generate: () => {
                    const phrases = [
                        'I understand that blocking sites helps my productivity',
                        'I will use the internet responsibly and focus on important tasks',
                        'Distraction-free browsing leads to better concentration',
                        'I commit to spending less time on time-wasting websites'
                    ];
                    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
                    return {
                        question: `Type exactly: "${phrase}"`,
                        answer: phrase
                    };
                }
            },
            {
                type: 'wait',
                generate: () => {
                    const minutes = Math.floor(Math.random() * 3) + 3; // 3-5 minutes
                    return {
                        question: `Wait ${minutes} minutes before you can proceed`,
                        answer: 'WAITED',
                        waitTime: minutes * 60 * 1000
                    };
                }
            }
        ];
    }

    async startUnblockProcess(domain) {
        const attemptKey = `unblock_${domain}`;
        const attempts = this.unblockAttempts.get(attemptKey) || 0;
        
        // Increase difficulty with more attempts
        const numChallenges = Math.min(3 + attempts, 7);
        
        const challenges = [];
        for (let i = 0; i < numChallenges; i++) {
            const challengeType = this.challenges[Math.floor(Math.random() * this.challenges.length)];
            challenges.push(challengeType.generate());
        }

        this.unblockAttempts.set(attemptKey, attempts + 1);
        
        return {
            domain,
            challenges,
            currentChallenge: 0,
            startTime: Date.now()
        };
    }

    async completeUnblock(domain) {
        try {
            console.log('🔓 Starting unblock process for:', domain);
            
            // Remove from blocked sites
            const wasBlocked = this.blockedSites.has(domain);
            this.blockedSites.delete(domain);
            await this.saveBlockedSites();
            await this.updateBlockingRules();
            
            console.log('✅ Removed', domain, 'from blocked sites. Was blocked:', wasBlocked);

            // Add temporary block (will be re-blocked after some time)
            const reblockTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
            this.temporaryBlocks.set(domain, reblockTime);

            // Set up automatic re-blocking
            setTimeout(() => {
                console.log('⏰ Re-blocking', domain, 'after 2 hours');
                this.blockedSites.add(domain);
                this.saveBlockedSites();
                this.updateBlockingRules();
                this.temporaryBlocks.delete(domain);
                
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Site Re-blocked',
                    message: `${domain} has been automatically re-blocked for your productivity.`
                });
            }, 2 * 60 * 60 * 1000);

            // Show success notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Site Unblocked!',
                message: `${domain} has been unblocked for 2 hours.`
            });

            console.log('✅ Unblock completed for:', domain);
            return true;
        } catch (error) {
            console.error('❌ Error in completeUnblock:', error);
            return false;
        }
    }

    setupMessageHandling() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'getBlockedSites':
                    sendResponse(Array.from(this.blockedSites));
                    break;
                
                case 'blockSite':
                    if (request.domain) {
                        this.blockedSites.add(request.domain);
                        await this.saveBlockedSites();
                        await this.updateBlockingRules();
                        sendResponse(true);
                    } else {
                        sendResponse(false);
                    }
                    break;
                
                case 'startUnblock':
                    if (request.domain) {
                        const session = await this.startUnblockProcess(request.domain);
                        sendResponse(session);
                    } else {
                        sendResponse(null);
                    }
                    break;
                
                case 'completeUnblock':
                    if (request.domain) {
                        const result = await this.completeUnblock(request.domain);
                        console.log('🔓 Unblock request for', request.domain, 'result:', result);
                        
                        // Also try to update the tab if possible
                        if (result) {
                            try {
                                const tabs = await chrome.tabs.query({});
                                for (const tab of tabs) {
                                    if (tab.url && tab.url.includes(request.domain)) {
                                        chrome.tabs.sendMessage(tab.id, {
                                            action: 'showUnblockSuccess',
                                            domain: request.domain,
                                            data: {
                                                unblockTime: Date.now(),
                                                reblockTime: Date.now() + (2 * 60 * 60 * 1000)
                                            }
                                        });
                                    }
                                }
                            } catch (e) {
                                console.log('Could not notify tabs of unblock');
                            }
                        }
                        
                        sendResponse(result);
                    } else {
                        sendResponse(false);
                    }
                    break;
                
                case 'confirmUnblock':
                    // Content script confirming an unblock is active
                    if (request.domain && request.data) {
                        console.log('🔓 Unblock confirmed for', request.domain, request.data);
                        // Make sure this domain is not in blocked list
                        if (this.blockedSites.has(request.domain)) {
                            console.log('Removing', request.domain, 'from blocked list due to unblock');
                            this.blockedSites.delete(request.domain);
                            await this.saveBlockedSites();
                            await this.updateBlockingRules();
                        }
                        sendResponse(true);
                    } else {
                        sendResponse(false);
                    }
                    break;
                
                case 'getStats':
                    sendResponse(this.stats);
                    break;
                
                case 'switchProtectionMode':
                    if (request.mode) {
                        await this.switchProtectionMode(request.mode);
                        sendResponse(true);
                    } else {
                        sendResponse(false);
                    }
                    break;
                
                case 'unblock_site':
                    if (request.url) {
                        try {
                            // Extract domain from URL
                            const url = new URL(request.url);
                            const domain = url.hostname.replace('www.', '');
                            
                            const result = await this.completeUnblock(domain);
                            console.log('🔓 Unblock request for', domain, 'result:', result);
                            
                            sendResponse({
                                success: result,
                                domain: domain,
                                message: result ? 'Site successfully unblocked!' : 'Failed to unblock site'
                            });
                        } catch (error) {
                            console.error('Error processing unblock_site request:', error);
                            sendResponse({
                                success: false,
                                error: error.message
                            });
                        }
                    } else {
                        sendResponse({
                            success: false,
                            error: 'No URL provided'
                        });
                    }
                    break;
                
                case 'remove_site_block':
                    try {
                        const domain = request.domain;
                        console.log('🔓 REMOVING BLOCK FOR DOMAIN:', domain);
                        
                        if (domain) {
                            // Remove from blocked sites
                            this.blockedSites.delete(domain);
                            
                            // Also remove www version
                            this.blockedSites.delete(`www.${domain}`);
                            
                            // Remove any temporary blocks
                            this.temporaryBlocks.delete(domain);
                            this.temporaryBlocks.delete(`www.${domain}`);
                            
                            // Save the updated lists
                            await this.saveBlockedSites();
                            
                            // Rebuild blocking rules without this domain
                            await this.updateBlockingRules();
                            
                            console.log('✅ BLOCKING RULES UPDATED, DOMAIN UNBLOCKED:', domain);
                            
                            sendResponse({
                                success: true,
                                message: `Successfully unblocked ${domain}`,
                                domain: domain
                            });
                        } else {
                            sendResponse({
                                success: false,
                                error: 'No domain provided'
                            });
                        }
                    } catch (error) {
                        console.error('❌ Error removing site block:', error);
                        sendResponse({
                            success: false,
                            error: error.message
                        });
                    }
                    break;
                
                case 'reactivate_block':
                    try {
                        const domain = request.domain;
                        console.log('🔄 REACTIVATING BLOCK FOR:', domain);
                        
                        if (domain) {
                            // Add back to blocked sites
                            this.blockedSites.add(domain);
                            
                            // Save and update rules
                            await this.saveBlockedSites();
                            await this.updateBlockingRules();
                            
                            console.log('✅ BLOCKING REACTIVATED FOR:', domain);
                            
                            sendResponse({
                                success: true,
                                message: `Blocking reactivated for ${domain}`
                            });
                        } else {
                            sendResponse({
                                success: false,
                                error: 'No domain provided'
                            });
                        }
                    } catch (error) {
                        console.error('❌ Error reactivating block:', error);
                        sendResponse({
                            success: false,
                            error: error.message
                        });
                    }
                    break;
                
                default:
                    sendResponse(null);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse(false);
        }
    }

    async switchProtectionMode(mode) {
        try {
            // Store the mode preference
            await chrome.storage.local.set({ protectionMode: mode });
            
            // Update the manifest content scripts dynamically
            // Note: This requires reloading tabs for full effect
            const tabs = await chrome.tabs.query({});
            
            // Notify all tabs about mode change
            for (const tab of tabs) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'switchMode',
                        mode: mode
                    });
                } catch (e) {
                    // Tab might not have content script loaded
                }
            }
            
            // Show notification about mode change
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Protection Mode Changed',
                message: mode === 'safe' 
                    ? 'Safe mode enabled - Search functionality protected'
                    : 'Aggressive mode enabled - Maximum ad blocking'
            });
            
            console.log(`🔄 Protection mode switched to: ${mode}`);
            return true;
        } catch (error) {
            console.error('Error switching protection mode:', error);
            return false;
        }
    }
}

// Initialize the enhanced extension
const enhancedExtension = new EnhancedExtension();

console.log('🛡️ Enhanced Extension with Site Blocking: Loaded successfully');
