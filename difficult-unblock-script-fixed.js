// Fixed Difficult Unblock Script - WORKING REDIRECT VERSION
// This version ACTUALLY redirects you to the site after completing challenges

class DifficultUnblockProcess {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 7;
        this.challenges = {};
        this.attempts = 0;
        this.startTime = Date.now();
        this.isProcessStarted = false;
        
        this.init();
    }

    init() {
        console.log('🔓 FIXED Difficult Unblock Process initialized');
        this.updateBlockedSite();
        this.setupEventListeners();
        this.generateChallenges();
        this.updateProgress();
    }

    updateBlockedSite() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const blockedUrl = urlParams.get('url') || 'unknown-site.com';
            document.getElementById('blockedSite').textContent = blockedUrl;
            console.log('🎯 Target site to unblock:', blockedUrl);
        } catch (error) {
            console.log('Error getting blocked URL:', error);
            document.getElementById('blockedSite').textContent = 'blocked-site.com';
        }
    }

    setupEventListeners() {
        // Initial buttons
        document.getElementById('testBtn').addEventListener('click', () => this.testExtension());
        document.getElementById('startChallengeBtn').addEventListener('click', () => this.startChallengeProcess());
        document.getElementById('backBtn').addEventListener('click', () => this.goBack());

        // Challenge 1: Math
        document.getElementById('mathSubmit').addEventListener('click', () => this.checkMathAnswer());
        document.getElementById('mathAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkMathAnswer();
        });

        // Challenge 3: Captcha
        document.getElementById('captchaSubmit').addEventListener('click', () => this.checkCaptcha());
        document.getElementById('captchaRefresh').addEventListener('click', () => this.generateCaptcha());
        document.getElementById('captchaAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkCaptcha();
        });

        // Challenge 4: Typing
        document.getElementById('typingSubmit').addEventListener('click', () => this.checkTyping());

        // Challenge 5: Sequence
        document.getElementById('sequenceSubmit').addEventListener('click', () => this.checkSequence());
        document.getElementById('sequenceAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkSequence();
        });

        // Challenge 6: Reflection
        document.getElementById('reflectionSubmit').addEventListener('click', () => this.checkReflection());
        document.getElementById('reflectionAnswer').addEventListener('input', () => this.updateWordCount());

        // Challenge 7: Final
        document.getElementById('finalSubmit').addEventListener('click', () => this.checkFinalConfirmation());
        document.getElementById('cancelProcess').addEventListener('click', () => this.cancelProcess());
        document.getElementById('finalAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkFinalConfirmation();
        });

        // Prevent copy/paste
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                this.showStatus('Copy/paste is disabled!', 'error');
            });
        });
    }

    generateChallenges() {
        // Math problem
        const operators = ['+', '-', '*'];
        const num1 = Math.floor(Math.random() * 47) + 13;
        const num2 = Math.floor(Math.random() * 23) + 7;
        const num3 = Math.floor(Math.random() * 15) + 5;
        const op1 = operators[Math.floor(Math.random() * operators.length)];
        const op2 = operators[Math.floor(Math.random() * operators.length)];
        
        this.challenges.mathProblem = `${num1} ${op1} ${num2} ${op2} ${num3}`;
        this.challenges.mathAnswer = this.evaluateMathExpression(num1, op1, num2, op2, num3);

        // Captcha
        this.generateCaptcha();

        // Typing challenge
        const typingTexts = [
            "I understand that accessing distracting websites reduces my productivity and focus.",
            "I commit to spending time on meaningful activities that contribute to my growth.",
            "Focused effort produces better results than scattered attention."
        ];
        this.challenges.typingText = typingTexts[Math.floor(Math.random() * typingTexts.length)];

        // Sequence
        const patterns = [
            { sequence: [2, 6, 18, 54], answer: 162 },
            { sequence: [1, 4, 9, 16], answer: 25 },
            { sequence: [3, 7, 15, 31], answer: 63 }
        ];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        this.challenges.sequence = pattern.sequence;
        this.challenges.sequenceAnswer = pattern.answer;
    }

    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.challenges.captcha = captcha;
        document.getElementById('captchaText').textContent = captcha;
    }

    evaluateMathExpression(num1, op1, num2, op2, num3) {
        // Handle order of operations
        if (op1 === '*' && op2 === '*') {
            return num1 * num2 * num3;
        } else if (op1 === '*') {
            const firstPart = num1 * num2;
            return op2 === '+' ? firstPart + num3 : op2 === '-' ? firstPart - num3 : firstPart * num3;
        } else if (op2 === '*') {
            const secondPart = num2 * num3;
            return op1 === '+' ? num1 + secondPart : op1 === '-' ? num1 - secondPart : num1 * secondPart;
        } else {
            const firstPart = op1 === '+' ? num1 + num2 : num1 - num2;
            return op2 === '+' ? firstPart + num3 : firstPart - num3;
        }
    }

    startChallengeProcess() {
        this.isProcessStarted = true;
        document.getElementById('initialButtons').style.display = 'none';
        this.showChallenge(1);
        this.showStatus('Challenge process started!', 'success');
    }

    showChallenge(stepNumber) {
        const challenges = document.querySelectorAll('.challenge-container');
        challenges.forEach(challenge => challenge.classList.remove('active'));

        const currentChallenge = document.getElementById(`challenge${stepNumber}`);
        if (currentChallenge) {
            currentChallenge.classList.add('active');
            this.currentStep = stepNumber;
            this.updateProgress();
            this.setupCurrentChallenge(stepNumber);
        }
    }

    setupCurrentChallenge(stepNumber) {
        switch (stepNumber) {
            case 1:
                document.getElementById('mathProblem').textContent = this.challenges.mathProblem + ' = ?';
                break;
            case 2:
                this.startWaitTimer();
                this.startMotivationalQuotes();
                break;
            case 4:
                document.getElementById('typingText').textContent = this.challenges.typingText;
                break;
            case 5:
                document.getElementById('sequenceProblem').textContent = 
                    this.challenges.sequence.join(', ') + ', ?';
                break;
        }
    }

    checkMathAnswer() {
        const userAnswer = parseFloat(document.getElementById('mathAnswer').value);
        const resultDiv = document.getElementById('mathResult');

        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="status error">Please enter a valid number!</div>';
            return;
        }

        if (Math.abs(userAnswer - this.challenges.mathAnswer) < 0.001) {
            resultDiv.innerHTML = '<div class="status success">✅ Correct! Moving to next challenge...</div>';
            setTimeout(() => this.showChallenge(2), 2000);
        } else {
            resultDiv.innerHTML = `<div class="status error">❌ Incorrect. The answer is ${this.challenges.mathAnswer}. Try again!</div>`;
            this.generateChallenges();
            setTimeout(() => {
                document.getElementById('mathProblem').textContent = this.challenges.mathProblem + ' = ?';
                document.getElementById('mathAnswer').value = '';
                resultDiv.innerHTML = '';
            }, 3000);
        }
    }

    startWaitTimer() {
        let timeLeft = 120; // 2 minutes
        const timerElement = document.getElementById('waitTimer');
        
        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.stopMotivationalQuotes();
                timerElement.textContent = 'Time\'s up!';
                setTimeout(() => this.showChallenge(3), 2000);
            }
            timeLeft--;
        }, 1000);
    }

    startMotivationalQuotes() {
        const quotes = [
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Focus on being productive instead of being busy.", author: "Tim Ferriss" },
            { text: "Time is the only capital any human being has.", author: "Thomas Edison" }
        ];

        let currentQuoteIndex = 0;
        const quoteElement = document.getElementById('motivationalQuote');
        const authorElement = document.getElementById('quoteAuthor');

        this.displayQuote(quotes[currentQuoteIndex], quoteElement, authorElement);
        currentQuoteIndex++;

        this.quoteTimer = setInterval(() => {
            if (currentQuoteIndex >= quotes.length) currentQuoteIndex = 0;
            this.displayQuote(quotes[currentQuoteIndex], quoteElement, authorElement);
            currentQuoteIndex++;
        }, 15000);
    }

    displayQuote(quote, quoteElement, authorElement) {
        if (quoteElement && authorElement) {
            quoteElement.style.opacity = '0';
            authorElement.style.opacity = '0';
            
            setTimeout(() => {
                quoteElement.textContent = `"${quote.text}"`;
                authorElement.textContent = `— ${quote.author}`;
                quoteElement.style.opacity = '1';
                authorElement.style.opacity = '1';
            }, 300);
        }
    }

    stopMotivationalQuotes() {
        if (this.quoteTimer) {
            clearInterval(this.quoteTimer);
            this.quoteTimer = null;
        }
    }

    checkCaptcha() {
        const userAnswer = document.getElementById('captchaAnswer').value;
        const resultDiv = document.getElementById('captchaResult');

        if (userAnswer === this.challenges.captcha) {
            resultDiv.innerHTML = '<div class="status success">✅ Captcha verified! Moving to next challenge...</div>';
            setTimeout(() => this.showChallenge(4), 2000);
        } else {
            resultDiv.innerHTML = '<div class="status error">❌ Captcha incorrect. Try again!</div>';
            this.generateCaptcha();
            document.getElementById('captchaAnswer').value = '';
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    }

    checkTyping() {
        const userText = document.getElementById('typingAnswer').value.trim();
        const targetText = this.challenges.typingText.trim();
        const resultDiv = document.getElementById('typingResult');

        if (userText === targetText) {
            resultDiv.innerHTML = '<div class="status success">✅ Perfect typing! Moving to next challenge...</div>';
            setTimeout(() => this.showChallenge(5), 2000);
        } else {
            resultDiv.innerHTML = '<div class="status error">❌ Text doesn\'t match exactly. Must be 100% accurate!</div>';
        }
    }

    checkSequence() {
        const userAnswer = parseInt(document.getElementById('sequenceAnswer').value);
        const resultDiv = document.getElementById('sequenceResult');

        if (userAnswer === this.challenges.sequenceAnswer) {
            resultDiv.innerHTML = '<div class="status success">✅ Sequence completed! Moving to next challenge...</div>';
            setTimeout(() => this.showChallenge(6), 2000);
        } else {
            resultDiv.innerHTML = '<div class="status error">❌ Incorrect sequence. Think about the pattern!</div>';
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        }
    }

    updateWordCount() {
        const text = document.getElementById('reflectionAnswer').value;
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        document.getElementById('wordCount').textContent = `Word count: ${wordCount}`;
    }

    checkReflection() {
        const text = document.getElementById('reflectionAnswer').value.trim();
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const resultDiv = document.getElementById('reflectionResult');

        if (wordCount < 100) {
            resultDiv.innerHTML = `<div class="status error">❌ Need at least 100 words (current: ${wordCount}).</div>`;
            return;
        }

        resultDiv.innerHTML = '<div class="status success">✅ Reflection accepted. Moving to final step...</div>';
        setTimeout(() => this.showChallenge(7), 2000);
    }

    checkFinalConfirmation() {
        const userText = document.getElementById('finalAnswer').value.trim();
        const targetText = "I UNDERSTAND THE CONSEQUENCES";
        const resultDiv = document.getElementById('finalResult');

        if (userText === targetText) {
            resultDiv.innerHTML = '<div class="status success">✅ Confirmation accepted. Unblocking NOW...</div>';
            setTimeout(() => this.actuallyUnblockSite(), 1000);
        } else {
            resultDiv.innerHTML = '<div class="status error">❌ Must type exactly: I UNDERSTAND THE CONSEQUENCES</div>';
            document.getElementById('finalAnswer').value = '';
        }
    }

    async actuallyUnblockSite() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const targetUrl = urlParams.get('url');
            
            if (!targetUrl) {
                this.showStatus('❌ No target URL found!', 'error');
                return;
            }

            console.log('🔓 ACTUALLY UNBLOCKING:', targetUrl);
            this.showStatus('🔓 Unblocking site...', 'success');

            // Extract domain
            const domain = this.extractDomain(targetUrl);
            
            // Store unblock data
            localStorage.setItem('unblock_status', 'active');
            localStorage.setItem('unblocked_domain', domain);
            localStorage.setItem('unblock_time', Date.now().toString());

            // Try extension communication
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({
                    action: 'remove_site_block',
                    domain: domain,
                    url: targetUrl
                }, (response) => {
                    console.log('Extension response:', response);
                    this.immediateRedirect(targetUrl);
                });
            } else {
                this.immediateRedirect(targetUrl);
            }
        } catch (error) {
            console.error('❌ Unblock error:', error);
            this.showStatus('❌ Error: ' + error.message, 'error');
        }
    }

    immediateRedirect(targetUrl) {
        console.log('🚀 IMMEDIATE REDIRECT TO:', targetUrl);
        
        // Clean URL
        let cleanUrl = targetUrl;
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }

        this.showStatus('🎉 SUCCESS! Redirecting to ' + targetUrl, 'success');

        // IMMEDIATE redirect - no delays
        try {
            console.log('🌐 Redirecting to:', cleanUrl);
            
            // Try multiple methods immediately
            window.location.href = cleanUrl;
            window.location.replace(cleanUrl);
            window.location.assign(cleanUrl);
            
            // If all else fails, show manual link
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = cleanUrl;
                link.textContent = 'Click here if not redirected: ' + targetUrl;
                link.style.cssText = 'display:block;margin:20px;padding:15px;background:#007bff;color:white;text-decoration:none;border-radius:5px;text-align:center;';
                document.querySelector('.container').appendChild(link);
            }, 2000);
            
        } catch (error) {
            console.error('❌ Redirect failed:', error);
            this.showStatus('❌ Redirect failed. URL: ' + cleanUrl, 'error');
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

    testExtension() {
        this.showStatus('Extension test successful!', 'success');
    }

    goBack() {
        try {
            window.history.back();
        } catch (error) {
            this.showStatus('Use browser back button', 'info');
        }
    }

    cancelProcess() {
        this.showStatus('Process cancelled', 'info');
        setTimeout(() => this.goBack(), 2000);
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
        console.log(`Status (${type}):`, message);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🔓 Initializing FIXED unblock process...');
        window.unblockProcess = new DifficultUnblockProcess();
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
});

// Handle extension messages
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'unblock_complete') {
            if (window.unblockProcess) {
                window.unblockProcess.immediateRedirect(request.url);
            }
        }
        sendResponse({success: true});
    });
}
