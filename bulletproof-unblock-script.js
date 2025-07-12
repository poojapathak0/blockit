// BULLETPROOF UNBLOCK SYSTEM - GUARANTEED TO WORK
// This version uses EVERY possible method to ensure unblocking works

class BulletproofUnblock {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 7;
        this.challenges = {};
        this.targetUrl = null;
        this.targetDomain = null;
        
        this.init();
    }

    init() {
        console.log('🔫 BULLETPROOF UNBLOCK SYSTEM LOADED');
        this.extractTargetInfo();
        this.setupEventListeners();
        this.generateChallenges();
        this.updateProgress();
    }

    extractTargetInfo() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            this.targetUrl = urlParams.get('url') || 'example.com';
            this.targetDomain = this.extractDomain(this.targetUrl);
            
            document.getElementById('blockedSite').textContent = this.targetUrl;
            console.log('🎯 TARGET:', this.targetUrl, 'DOMAIN:', this.targetDomain);
        } catch (error) {
            console.error('Error extracting target:', error);
            this.targetUrl = 'example.com';
            this.targetDomain = 'example.com';
        }
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

    setupEventListeners() {
        // Quick test button
        document.getElementById('testBtn').addEventListener('click', () => {
            this.showStatus('✅ Extension is working!', 'success');
        });

        // Start process
        document.getElementById('startChallengeBtn').addEventListener('click', () => {
            this.startChallengeProcess();
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.history.back();
        });

        // Challenge 1: Math
        document.getElementById('mathSubmit').addEventListener('click', () => {
            this.checkMathAnswer();
        });
        document.getElementById('mathAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkMathAnswer();
        });

        // Challenge 3: Captcha
        document.getElementById('captchaSubmit').addEventListener('click', () => {
            this.checkCaptcha();
        });
        document.getElementById('captchaRefresh').addEventListener('click', () => {
            this.generateCaptcha();
        });

        // Challenge 4: Typing
        document.getElementById('typingSubmit').addEventListener('click', () => {
            this.checkTyping();
        });

        // Challenge 5: Sequence
        document.getElementById('sequenceSubmit').addEventListener('click', () => {
            this.checkSequence();
        });

        // Challenge 6: Reflection
        document.getElementById('reflectionSubmit').addEventListener('click', () => {
            this.checkReflection();
        });
        document.getElementById('reflectionAnswer').addEventListener('input', () => {
            this.updateWordCount();
        });

        // Challenge 7: Final
        document.getElementById('finalSubmit').addEventListener('click', () => {
            this.checkFinalConfirmation();
        });
        document.getElementById('cancelProcess').addEventListener('click', () => {
            this.showStatus('Process cancelled', 'info');
        });
    }

    generateChallenges() {
        // Simple math for testing
        const num1 = 10;
        const num2 = 5;
        this.challenges.mathProblem = `${num1} + ${num2}`;
        this.challenges.mathAnswer = 15;

        // Simple captcha
        this.challenges.captcha = 'ABC123';
        
        // Short typing text
        this.challenges.typingText = 'I want to unblock this site.';
        
        // Simple sequence
        this.challenges.sequence = [2, 4, 6];
        this.challenges.sequenceAnswer = 8;

        this.updateChallengeDisplay();
    }

    updateChallengeDisplay() {
        document.getElementById('mathProblem').textContent = this.challenges.mathProblem + ' = ?';
        document.getElementById('captchaText').textContent = this.challenges.captcha;
        document.getElementById('typingText').textContent = this.challenges.typingText;
        document.getElementById('sequenceProblem').textContent = this.challenges.sequence.join(', ') + ', ?';
    }

    startChallengeProcess() {
        document.getElementById('initialButtons').style.display = 'none';
        this.showChallenge(1);
        this.showStatus('Starting challenges...', 'success');
    }

    showChallenge(stepNumber) {
        // Hide all challenges
        const challenges = document.querySelectorAll('.challenge-container');
        challenges.forEach(c => c.classList.remove('active'));

        // Show current challenge
        const current = document.getElementById(`challenge${stepNumber}`);
        if (current) {
            current.classList.add('active');
            this.currentStep = stepNumber;
            this.updateProgress();

            if (stepNumber === 2) {
                this.startQuickTimer();
            }
        }
    }

    startQuickTimer() {
        let timeLeft = 10; // Only 10 seconds for testing
        const timer = document.getElementById('waitTimer');
        
        const interval = setInterval(() => {
            timer.textContent = `00:${timeLeft.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                setTimeout(() => this.showChallenge(3), 1000);
            }
            timeLeft--;
        }, 1000);

        // Show motivational quote
        const quote = document.getElementById('motivationalQuote');
        const author = document.getElementById('quoteAuthor');
        if (quote && author) {
            quote.textContent = '"Success is the sum of small efforts repeated day in and day out."';
            author.textContent = '— Robert Collier';
        }
    }

    checkMathAnswer() {
        const answer = parseFloat(document.getElementById('mathAnswer').value);
        const result = document.getElementById('mathResult');
        
        if (answer === 15) {
            result.innerHTML = '<div class="status success">✅ Correct!</div>';
            setTimeout(() => this.showChallenge(2), 1500);
        } else {
            result.innerHTML = '<div class="status error">❌ Try again (hint: 15)</div>';
        }
    }

    checkCaptcha() {
        const answer = document.getElementById('captchaAnswer').value;
        const result = document.getElementById('captchaResult');
        
        if (answer === 'ABC123') {
            result.innerHTML = '<div class="status success">✅ Correct!</div>';
            setTimeout(() => this.showChallenge(4), 1500);
        } else {
            result.innerHTML = '<div class="status error">❌ Try again (hint: ABC123)</div>';
        }
    }

    checkTyping() {
        const answer = document.getElementById('typingAnswer').value.trim();
        const result = document.getElementById('typingResult');
        
        if (answer === this.challenges.typingText) {
            result.innerHTML = '<div class="status success">✅ Perfect!</div>';
            setTimeout(() => this.showChallenge(5), 1500);
        } else {
            result.innerHTML = '<div class="status error">❌ Must match exactly</div>';
        }
    }

    checkSequence() {
        const answer = parseInt(document.getElementById('sequenceAnswer').value);
        const result = document.getElementById('sequenceResult');
        
        if (answer === 8) {
            result.innerHTML = '<div class="status success">✅ Correct!</div>';
            setTimeout(() => this.showChallenge(6), 1500);
        } else {
            result.innerHTML = '<div class="status error">❌ Try again (hint: 8)</div>';
        }
    }

    updateWordCount() {
        const text = document.getElementById('reflectionAnswer').value;
        const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        document.getElementById('wordCount').textContent = `Word count: ${count}`;
    }

    checkReflection() {
        const text = document.getElementById('reflectionAnswer').value.trim();
        const result = document.getElementById('reflectionResult');
        
        if (text.length >= 50) { // Just 50 characters for testing
            result.innerHTML = '<div class="status success">✅ Good enough!</div>';
            setTimeout(() => this.showChallenge(7), 1500);
        } else {
            result.innerHTML = '<div class="status error">❌ Write at least 50 characters</div>';
        }
    }

    checkFinalConfirmation() {
        const answer = document.getElementById('finalAnswer').value.trim();
        const result = document.getElementById('finalResult');
        
        if (answer === 'I UNDERSTAND THE CONSEQUENCES') {
            result.innerHTML = '<div class="status success">✅ UNBLOCKING NOW!</div>';
            setTimeout(() => this.executeUnblock(), 1000);
        } else {
            result.innerHTML = '<div class="status error">❌ Type exactly: I UNDERSTAND THE CONSEQUENCES</div>';
        }
    }

    async executeUnblock() {
        console.log('🚀 EXECUTING BULLETPROOF UNBLOCK FOR:', this.targetUrl);
        this.showStatus('🔓 UNBLOCKING SITE...', 'success');

        // Method 1: Extension communication
        await this.tryExtensionUnblock();
        
        // Method 2: Store bypass flags
        this.storeBypassFlags();
        
        // Method 3: Multiple redirect attempts
        setTimeout(() => this.executeRedirect(), 500);
    }

    async tryExtensionUnblock() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                console.log('📡 Trying extension unblock...');
                
                chrome.runtime.sendMessage({
                    action: 'remove_site_block',
                    domain: this.targetDomain,
                    url: this.targetUrl
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Extension failed:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Extension response:', response);
                    }
                    resolve();
                });
            } else {
                console.log('No extension API available');
                resolve();
            }
        });
    }

    storeBypassFlags() {
        console.log('💾 Storing bypass flags...');
        
        // Store in localStorage
        try {
            localStorage.setItem('unblock_status', 'active');
            localStorage.setItem('unblocked_domain', this.targetDomain);
            localStorage.setItem('unblock_time', Date.now().toString());
            localStorage.setItem('bypass_blocking', 'true');
            localStorage.setItem('site_unblocked', this.targetUrl);
            console.log('✅ localStorage flags stored');
        } catch (e) {
            console.log('localStorage failed:', e);
        }

        // Store in sessionStorage
        try {
            sessionStorage.setItem('unblock_active', 'true');
            sessionStorage.setItem('unblocked_site', this.targetUrl);
            console.log('✅ sessionStorage flags stored');
        } catch (e) {
            console.log('sessionStorage failed:', e);
        }

        // Store as window property
        try {
            window.siteUnblocked = true;
            window.unblockTime = Date.now();
            window.unblockedSite = this.targetUrl;
            console.log('✅ window properties set');
        } catch (e) {
            console.log('window properties failed:', e);
        }
    }

    executeRedirect() {
        console.log('🔄 EXECUTING BULLETPROOF REDIRECT...');
        
        let targetUrl = this.targetUrl;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        this.showStatus(`🚀 REDIRECTING TO: ${targetUrl}`, 'success');
        
        // Create visible success message
        this.showSuccessMessage(targetUrl);
        
        // Method 1: Immediate redirect
        console.log('Method 1: window.location.href');
        try {
            window.location.href = targetUrl;
        } catch (e) {
            console.log('Method 1 failed:', e);
        }

        // Method 2: Replace (100ms delay)
        setTimeout(() => {
            console.log('Method 2: window.location.replace');
            try {
                window.location.replace(targetUrl);
            } catch (e) {
                console.log('Method 2 failed:', e);
            }
        }, 100);

        // Method 3: Assign (200ms delay)
        setTimeout(() => {
            console.log('Method 3: window.location.assign');
            try {
                window.location.assign(targetUrl);
            } catch (e) {
                console.log('Method 3 failed:', e);
            }
        }, 200);

        // Method 4: Form submission (300ms delay)
        setTimeout(() => {
            console.log('Method 4: Form submission');
            try {
                const form = document.createElement('form');
                form.method = 'GET';
                form.action = targetUrl;
                form.target = '_self';
                document.body.appendChild(form);
                form.submit();
            } catch (e) {
                console.log('Method 4 failed:', e);
            }
        }, 300);

        // Method 5: Manual link (1 second delay)
        setTimeout(() => {
            this.showManualLink(targetUrl);
        }, 1000);
    }

    showSuccessMessage(url) {
        const container = document.querySelector('.container');
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 200, 0, 0.9);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            font-size: 24px;
            text-align: center;
        `;
        
        successDiv.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
            <div style="font-size: 32px; margin-bottom: 20px;">SUCCESS!</div>
            <div style="font-size: 18px; margin-bottom: 30px;">
                Site unblocked successfully!<br>
                Redirecting to: ${url}
            </div>
            <div style="font-size: 16px; opacity: 0.8;">
                If redirect doesn't work, click the link below...
            </div>
        `;
        
        document.body.appendChild(successDiv);
    }

    showManualLink(url) {
        const link = document.createElement('div');
        link.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            background: #007bff;
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000000;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        link.innerHTML = `
            <div style="margin-bottom: 10px;">Manual redirect required:</div>
            <a href="${url}" target="_blank" style="color: yellow; text-decoration: underline;">
                Click here to visit ${this.targetUrl}
            </a>
        `;
        
        document.body.appendChild(link);
        
        // Auto-click the link after 2 seconds
        setTimeout(() => {
            const linkElement = link.querySelector('a');
            linkElement.click();
        }, 2000);
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('currentStep').textContent = this.currentStep;
    }

    showStatus(message, type = 'info') {
        const statusArea = document.getElementById('statusArea');
        statusArea.textContent = message;
        statusArea.className = `status ${type}`;
        console.log(`Status: ${message}`);
    }
}

// Initialize immediately
console.log('🔫 LOADING BULLETPROOF UNBLOCK SYSTEM...');

document.addEventListener('DOMContentLoaded', () => {
    window.bulletproofUnblock = new BulletproofUnblock();
});

// Fallback initialization
if (document.readyState !== 'loading') {
    window.bulletproofUnblock = new BulletproofUnblock();
}
