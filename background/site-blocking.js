// Site Blocker Background Script
// Easy to block, hard to unblock

class SiteBlocker {
    constructor() {
        this.blockedSites = new Set();
        this.temporaryBlocks = new Map(); // For time-based blocks
        this.unblockAttempts = new Map(); // Track unblock attempts
        this.init();
    }

    async init() {
        await this.loadBlockedSites();
        this.setupRequestBlocking();
        this.setupContextMenu();
        this.setupUnblockChallenges();
    }

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
        // Use declarativeNetRequest for blocking
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
                            url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(site)
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
                            url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(site)
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
                    url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(domain)
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

    async completeUnblock(domain, session) {
        // Add a final confirmation step
        const confirmationSteps = [
            'Are you absolutely sure you want to unblock this site?',
            'This site was blocked to help your productivity. Continue?',
            'Consider: Will visiting this site help you achieve your goals?',
            'Final confirmation: Unblock this potentially distracting site?'
        ];

        // Remove from blocked sites
        this.blockedSites.delete(domain);
        await this.saveBlockedSites();
        await this.updateBlockingRules();

        // Add temporary block (will be re-blocked after some time)
        const reblockTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
        this.temporaryBlocks.set(domain, reblockTime);

        // Set up automatic re-blocking
        setTimeout(() => {
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

        return true;
    }

    // Message handling
    async handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'getBlockedSites':
                return Array.from(this.blockedSites);
            
            case 'blockSite':
                if (request.domain) {
                    this.blockedSites.add(request.domain);
                    await this.saveBlockedSites();
                    await this.updateBlockingRules();
                    return true;
                }
                return false;
            
            case 'startUnblock':
                if (request.domain) {
                    return await this.startUnblockProcess(request.domain);
                }
                return null;
            
            case 'completeUnblock':
                if (request.domain && request.session) {
                    return await this.completeUnblock(request.domain, request.session);
                }
                return false;
            
            case 'getUnblockChallenges':
                if (request.domain) {
                    return await this.startUnblockProcess(request.domain);
                }
                return null;
        }
    }
}

// Initialize site blocker
const siteBlocker = new SiteBlocker();

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    siteBlocker.handleMessage(request, sender, sendResponse).then(sendResponse);
    return true; // Keep message channel open for async response
});
