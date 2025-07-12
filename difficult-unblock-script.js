// Difficult Unblock Script - Multiple Irritating Steps
// This script creates a very challenging and time-consuming unblock process

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
        console.log('Difficult Unblock Process initialized');
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
        document.getElementById('typingAnswer').addEventListener('input', () => this.preventCopyPaste());

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

        // Prevent copy/paste on all inputs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                this.showStatus('Copy/paste is disabled for security reasons!', 'error');
            });
        });
    }

    generateChallenges() {
        // Generate complex math problem with safe evaluation
        const operators = ['+', '-', '*'];
        const num1 = Math.floor(Math.random() * 47) + 13;
        const num2 = Math.floor(Math.random() * 23) + 7;
        const num3 = Math.floor(Math.random() * 15) + 5;
        const op1 = operators[Math.floor(Math.random() * operators.length)];
        const op2 = operators[Math.floor(Math.random() * operators.length)];
        
        this.challenges.mathProblem = `${num1} ${op1} ${num2} ${op2} ${num3}`;
        
        // Safe math evaluation
        try {
            this.challenges.mathAnswer = this.evaluateMathExpression(num1, op1, num2, op2, num3);
            console.log('Math problem:', this.challenges.mathProblem, '=', this.challenges.mathAnswer);
        } catch (error) {
            console.error('Math evaluation error:', error);
            // Fallback to a simple problem
            this.challenges.mathProblem = `${num1} + ${num2}`;
            this.challenges.mathAnswer = num1 + num2;
        }

        // Generate captcha
        this.generateCaptcha();

        // Generate typing challenge
        const typingTexts = [
            "I understand that accessing distracting websites reduces my productivity and focus. I commit to spending my time on meaningful activities that contribute to my personal and professional growth.",
            "Procrastination is the thief of time. Instead of seeking instant gratification through mindless browsing, I choose to invest in activities that build my skills and advance my goals.",
            "Digital distractions fragment my attention and reduce my ability to engage in deep, meaningful work. I acknowledge that focused effort produces better results than scattered attention."
        ];
        this.challenges.typingText = typingTexts[Math.floor(Math.random() * typingTexts.length)];

        // Generate sequence pattern
        const patterns = [
            { sequence: [2, 6, 18, 54], answer: 162, rule: "multiply by 3" },
            { sequence: [1, 4, 9, 16], answer: 25, rule: "perfect squares" },
            { sequence: [3, 7, 15, 31], answer: 63, rule: "double and add 1" },
            { sequence: [5, 11, 23, 47], answer: 95, rule: "double and add 1" },
            { sequence: [1, 8, 27, 64], answer: 125, rule: "perfect cubes" }
        ];
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
        this.challenges.sequence = selectedPattern.sequence;
        this.challenges.sequenceAnswer = selectedPattern.answer;
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

    testExtension() {
        this.showStatus('Extension is loaded and working correctly!', 'success');
        console.log('Extension test successful');
    }

    startChallengeProcess() {
        if (this.isProcessStarted) {
            this.showStatus('Challenge process already started!', 'error');
            return;
        }

        this.isProcessStarted = true;
        this.attempts++;
        
        // Add extra challenges for multiple attempts
        if (this.attempts > 1) {
            this.totalSteps += this.attempts;
            document.getElementById('totalSteps').textContent = this.totalSteps;
            this.showStatus(`Attempt #${this.attempts} - Additional challenges added!`, 'error');
        }

        document.getElementById('initialButtons').style.display = 'none';
        this.showChallenge(1);
        this.showStatus('Challenge process started. Complete all steps to proceed.', 'success');
    }

    showChallenge(stepNumber) {
        // Hide all challenges
        const challenges = document.querySelectorAll('.challenge-container');
        challenges.forEach(challenge => challenge.classList.remove('active'));

        // Show current challenge
        const currentChallenge = document.getElementById(`challenge${stepNumber}`);
        if (currentChallenge) {
            currentChallenge.classList.add('active');
            this.currentStep = stepNumber;
            this.updateProgress();

            // Set up challenge-specific content
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
                break;
            case 3:
                // Captcha already set up
                break;
            case 4:
                document.getElementById('typingText').textContent = this.challenges.typingText;
                break;
            case 5:
                document.getElementById('sequenceProblem').textContent = 
                    this.challenges.sequence.join(', ') + ', ?';
                break;
            case 6:
                // Reflection setup
                break;
            case 7:
                // Final confirmation
                break;
        }
    }

    checkMathAnswer() {
        const userAnswer = parseFloat(document.getElementById('mathAnswer').value);
        const resultDiv = document.getElementById('mathResult');

        console.log('User answer:', userAnswer, 'Expected answer:', this.challenges.mathAnswer);

        if (isNaN(userAnswer)) {
            resultDiv.innerHTML = '<div class="status error">Please enter a valid number!</div>';
            return;
        }

        // Check if the answer is correct (with some tolerance for floating point)
        const isCorrect = Math.abs(userAnswer - this.challenges.mathAnswer) < 0.001;

        if (isCorrect) {
            resultDiv.innerHTML = '<div class="status success">✅ Correct! Moving to next challenge...</div>';
            setTimeout(() => this.showChallenge(2), 2000);
        } else {
            resultDiv.innerHTML = `<div class="status error">❌ Incorrect. The answer is ${this.challenges.mathAnswer}. Try again!</div>`;
            // Make it harder by generating a new problem
            this.generateChallenges();
            setTimeout(() => {
                document.getElementById('mathProblem').textContent = this.challenges.mathProblem + ' = ?';
                document.getElementById('mathAnswer').value = '';
                resultDiv.innerHTML = '';
            }, 3000);
        }
    }

    startWaitTimer() {
        let timeLeft = 120; // 2 minutes (reduced from 5)
        const timerElement = document.getElementById('waitTimer');
        
        // Initialize motivational quotes
        this.startMotivationalQuotes();
        
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

    preventCopyPaste() {
        // Additional security to prevent copy/paste detection
        const textarea = document.getElementById('typingAnswer');
        const currentText = textarea.value;
        
        // Check for sudden large text additions (likely paste)
        if (currentText.length > this.lastTypingLength + 10) {
            textarea.value = this.lastTypingText || '';
            this.showStatus('Copy/paste detected and blocked!', 'error');
        }
        
        this.lastTypingLength = currentText.length;
        this.lastTypingText = currentText;
    }

    checkTyping() {
        const userText = document.getElementById('typingAnswer').value.trim();
        const targetText = this.challenges.typingText.trim();
        const resultDiv = document.getElementById('typingResult');

        if (userText === targetText) {
            resultDiv.innerHTML = '<div class="status success">✅ Perfect typing! Moving to next challenge...</div>';
            setTimeout(() => this.showChallenge(5), 2000);
        } else {
            const accuracy = this.calculateTypingAccuracy(userText, targetText);
            resultDiv.innerHTML = `<div class="status error">❌ Text doesn't match exactly. Accuracy: ${accuracy}%. Must be 100% accurate!</div>`;
        }
    }

    calculateTypingAccuracy(userText, targetText) {
        const maxLength = Math.max(userText.length, targetText.length);
        let matches = 0;
        
        for (let i = 0; i < maxLength; i++) {
            if (userText[i] === targetText[i]) {
                matches++;
            }
        }
        
        return Math.round((matches / maxLength) * 100);
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
            resultDiv.innerHTML = `<div class="status error">❌ Reflection too short. You need at least 100 words (current: ${wordCount}).</div>`;
            return;
        }

        if (text.length < 300) {
            resultDiv.innerHTML = '<div class="status error">❌ Reflection lacks detail. Please write more thoughtfully.</div>';
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
            resultDiv.innerHTML = '<div class="status success">✅ Confirmation accepted. Proceeding to unblock...</div>';
            setTimeout(() => this.completeUnblockProcess(), 3000);
        } else {
            resultDiv.innerHTML = '<div class="status error">❌ Confirmation text must be typed exactly as shown!</div>';
            document.getElementById('finalAnswer').value = '';
        }
    }

    cancelProcess() {
        this.showStatus('Unblock process cancelled. Good choice for productivity!', 'success');
        setTimeout(() => this.goBack(), 2000);
    }

    async completeUnblockProcess() {
        try {
            this.showStatus('🔓 Processing unblock request...', 'success');
            
            // Get the target URL from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const targetUrl = urlParams.get('url');
            
            if (!targetUrl) {
                this.showStatus('❌ No target URL found!', 'error');
                return;
            }

            console.log('🔓 ATTEMPTING TO UNBLOCK:', targetUrl);

            // Extract domain properly
            const domain = this.extractDomain(targetUrl);
            console.log('🔓 DOMAIN TO UNBLOCK:', domain);

            // First, communicate with extension to remove blocking rules
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                this.showStatus('🔄 Communicating with extension...', 'success');
                
                try {
                    const response = await new Promise((resolve, reject) => {
                        chrome.runtime.sendMessage({
                            action: 'remove_site_block',
                            domain: domain,
                            url: targetUrl,
                            temporary: true,
                            duration: 3 * 60 * 60 * 1000 // 3 hours
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                            } else {
                                resolve(response);
                            }
                        });
                    });

                    console.log('✅ Extension response:', response);
                    
                    if (response && response.success) {
                        this.showStatus('✅ Site successfully unblocked by extension!', 'success');
                        this.finalizeUnblock(targetUrl, domain);
                    } else {
                        this.showStatus('⚠️ Extension unblock failed, trying fallback...', 'error');
                        this.fallbackUnblock(targetUrl, domain);
                    }
                } catch (error) {
                    console.error('❌ Extension communication error:', error);
                    this.showStatus('⚠️ Extension communication failed, trying fallback...', 'error');
                    this.fallbackUnblock(targetUrl, domain);
                }
            } else {
                console.log('⚠️ Chrome extension API not available, using fallback');
                this.fallbackUnblock(targetUrl, domain);
            }
        } catch (error) {
            console.error('❌ Critical unblock error:', error);
            this.showStatus('❌ Unblock failed: ' + error.message, 'error');
        }
    }

    finalizeUnblock(targetUrl, domain) {
        // Store unblock data
        const unblockData = {
            status: 'active',
            url: targetUrl,
            domain: domain,
            unblockTime: Date.now(),
            challenges_completed: true,
            next_check: Date.now() + (3 * 60 * 60 * 1000), // 3 hours
            user_choice_pending: false
        };

        localStorage.setItem('unblock_data', JSON.stringify(unblockData));
        localStorage.setItem('unblock_status', 'active');
        localStorage.setItem('unblock_time', Date.now().toString());
        localStorage.setItem('unblocked_domain', domain);

        this.showStatus('🎉 Site unblocked successfully! Redirecting...', 'success');
        
        // Redirect IMMEDIATELY - no delay
        this.redirectToSite(targetUrl);
    }

    fallbackUnblock(targetUrl, domain) {
        console.log('📝 Using fallback unblock method');
        
        // Store unblock status in multiple ways
        localStorage.setItem('unblock_status', 'active');
        localStorage.setItem('unblock_time', Date.now().toString());
        localStorage.setItem('unblocked_domain', domain);
        localStorage.setItem('bypass_blocking', 'true');
        
        // Also try sessionStorage
        try {
            sessionStorage.setItem('unblock_active', 'true');
            sessionStorage.setItem('unblocked_domain', domain);
        } catch (e) {
            console.log('SessionStorage not available');
        }

        this.showStatus('✅ Fallback unblock applied! Redirecting...', 'success');
        
        // Redirect immediately
        setTimeout(() => {
            this.redirectToSite(targetUrl);
        }, 1500);
    }

    redirectToSite(targetUrl) {
        try {
            console.log('🔄 STARTING REDIRECT TO:', targetUrl);
            
            // Clean the URL and ensure it has protocol
            let cleanUrl = targetUrl;
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                cleanUrl = 'https://' + cleanUrl;
            }

            console.log('🌐 FINAL REDIRECT URL:', cleanUrl);
            
            // IMMEDIATE redirect - don't wait
            this.showStatus('🚀 Redirecting NOW!', 'success');
            
            // Method 1: Direct location change
            console.log('Method 1: window.location.href');
            window.location.href = cleanUrl;
            
            // Method 2: Replace (backup after 500ms)
            setTimeout(() => {
                console.log('Method 2: window.location.replace');
                window.location.replace(cleanUrl);
            }, 500);
            
            // Method 3: Assign (backup after 1s)
            setTimeout(() => {
                console.log('Method 3: window.location.assign');
                window.location.assign(cleanUrl);
            }, 1000);
            
            // Method 4: New window (backup after 1.5s)
            setTimeout(() => {
                console.log('Method 4: window.open with _self');
                window.open(cleanUrl, '_self');
            }, 1500);
            
            // Method 5: Force reload with URL (backup after 2s)
            setTimeout(() => {
                console.log('Method 5: Force reload with URL');
                history.replaceState(null, null, cleanUrl);
                window.location.reload();
            }, 2000);
            
            // Method 6: Ultimate fallback - new tab (after 3s)
            setTimeout(() => {
                console.log('Method 6: Opening in new tab');
                window.open(cleanUrl, '_blank');
            }, 3000);
            
        } catch (error) {
            console.error('❌ ALL REDIRECT METHODS FAILED:', error);
            
            // Show manual redirect option
            const manualDiv = document.createElement('div');
            manualDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fff;
                color: #000;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                z-index: 999999;
                text-align: center;
                max-width: 400px;
            `;
            
            manualDiv.innerHTML = `
                <h3 style="margin-bottom: 15px;">Manual Redirect Required</h3>
                <p style="margin-bottom: 20px;">Click the link below to access the site:</p>
                <a href="${cleanUrl}" target="_blank" style="
                    display: inline-block;
                    padding: 15px 25px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                ">Go to ${targetUrl}</a>
                <p style="margin-top: 15px; font-size: 12px; color: #666;">
                    Copy this URL: ${cleanUrl}
                </p>
            `;
            
            document.body.appendChild(manualDiv);
        }
    }

    extractDomain(url) {
        try {
            // Remove protocol if present
            let domain = url.replace(/^https?:\/\//, '');
            // Remove www. if present
            domain = domain.replace(/^www\./, '');
            // Remove path and query parameters
            domain = domain.split('/')[0].split('?')[0];
            return domain;
        } catch (error) {
            console.error('Error extracting domain:', error);
            return url;
        }
    }
                });
            } else {
                this.proceedWithUnblock(targetUrl);
            }

        } catch (error) {
            console.error('Unblock process error:', error);
            this.showStatus('❌ Unblock failed. Please try again.', 'error');
        }
    }

    extractDomain(url) {
        try {
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch (error) {
            return url.replace('www.', '').split('/')[0];
        }
    }

    proceedWithUnblock(targetUrl) {
        this.showStatus('✅ Site successfully unblocked! Redirecting...', 'success');
        
        // Set up smart re-blocking reminder
        this.setupSmartReblocking();
        
        // Redirect to the target site
        setTimeout(() => {
            try {
                let redirectUrl = targetUrl;
                if (!redirectUrl.startsWith('http')) {
                    redirectUrl = 'https://' + redirectUrl;
                }
                
                console.log('Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            } catch (error) {
                console.error('Redirect error:', error);
                this.showStatus('✅ Unblock successful! Please manually navigate to: ' + targetUrl, 'success');
            }
        }, 2000);
    }

    setupSmartReblocking() {
        // Schedule reminder check after 3 hours
        const reminderTime = 3 * 60 * 60 * 1000; // 3 hours
        
        setTimeout(() => {
            this.showProductivityReminder();
        }, reminderTime);
        
        // Also set up periodic checks every 30 minutes after the initial 3 hours
        setTimeout(() => {
            this.startPeriodicReminders();
        }, reminderTime);
    }

    startPeriodicReminders() {
        setInterval(() => {
            const unblockData = JSON.parse(localStorage.getItem('unblock_data') || '{}');
            if (unblockData.status === 'active' && !unblockData.user_choice_pending) {
                this.showProductivityReminder();
            }
        }, 30 * 60 * 1000); // Every 30 minutes
    }

    finalRedirect() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const targetUrl = urlParams.get('url');
            
            if (targetUrl) {
                window.location.href = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
            } else {
                window.history.back();
            }
        } catch (error) {
            console.log('Redirect error:', error);
            this.showStatus('Unblock completed! You may now navigate to the site.', 'success');
        }
    }

    goBack() {
        try {
            window.history.back();
        } catch (error) {
            console.log('Back navigation error:', error);
            this.showStatus('Use your browser back button to return.', 'success');
        }
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

    startMotivationalQuotes() {
        const quotes = [
            {
                text: "The way to get started is to quit talking and begin doing.",
                author: "Walt Disney"
            },
            {
                text: "Time is really the only capital that any human being has, and the only thing he can't afford to lose.",
                author: "Thomas Edison"
            },
            {
                text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
                author: "Paul J. Meyer"
            },
            {
                text: "Focus on being productive instead of being busy.",
                author: "Tim Ferriss"
            },
            {
                text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
                author: "Stephen Covey"
            },
            {
                text: "Distraction is the enemy of vision. You cannot accomplish anything if you are distracted.",
                author: "Tony Robbins"
            },
            {
                text: "Time you enjoy wasting is not wasted time. But time wasted on meaningless activities is truly lost forever.",
                author: "Marthe Troly-Curtin"
            },
            {
                text: "The successful person has the habit of doing the things failures don't like to do.",
                author: "Thomas Edison"
            },
            {
                text: "Your future is created by what you do today, not tomorrow.",
                author: "Robert Kiyosaki"
            },
            {
                text: "Don't watch the clock; do what it does. Keep going.",
                author: "Sam Levenson"
            },
            {
                text: "The difference between ordinary and extraordinary is that little extra.",
                author: "Jimmy Johnson"
            },
            {
                text: "Procrastination is the art of keeping up with yesterday.",
                author: "Don Marquis"
            },
            {
                text: "Either you run the day, or the day runs you.",
                author: "Jim Rohn"
            },
            {
                text: "The best time to plant a tree was 20 years ago. The second best time is now.",
                author: "Chinese Proverb"
            },
            {
                text: "Success is the sum of small efforts repeated day in and day out.",
                author: "Robert Collier"
            },
            {
                text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
                author: "Alexander Graham Bell"
            },
            {
                text: "The expert in anything was once a beginner who refused to give up.",
                author: "Helen Hayes"
            },
            {
                text: "You don't have to be great to get started, but you have to get started to be great.",
                author: "Les Brown"
            },
            {
                text: "The only impossible journey is the one you never begin.",
                author: "Tony Robbins"
            },
            {
                text: "What we plant in the soil of contemplation, we shall reap in the harvest of action.",
                author: "Meister Eckhart"
            }
        ];

        let currentQuoteIndex = 0;
        const quoteElement = document.getElementById('motivationalQuote');
        const authorElement = document.getElementById('quoteAuthor');

        // Display first quote immediately
        this.displayQuote(quotes[currentQuoteIndex], quoteElement, authorElement);
        currentQuoteIndex++;

        // Rotate quotes every 15 seconds
        this.quoteTimer = setInterval(() => {
            if (currentQuoteIndex >= quotes.length) {
                currentQuoteIndex = 0; // Reset to beginning
            }
            
            this.displayQuote(quotes[currentQuoteIndex], quoteElement, authorElement);
            currentQuoteIndex++;
        }, 15000); // Change quote every 15 seconds
    }

    displayQuote(quote, quoteElement, authorElement) {
        // Fade out
        quoteElement.style.opacity = '0';
        authorElement.style.opacity = '0';
        
        setTimeout(() => {
            // Change content
            quoteElement.textContent = `"${quote.text}"`;
            authorElement.textContent = `— ${quote.author}`;
            
            // Fade in
            quoteElement.style.opacity = '1';
            authorElement.style.opacity = '1';
        }, 300);
    }

    stopMotivationalQuotes() {
        if (this.quoteTimer) {
            clearInterval(this.quoteTimer);
            this.quoteTimer = null;
        }
    }

    // Safe math evaluation method
    evaluateMathExpression(num1, op1, num2, op2, num3) {
        // Follow order of operations: multiplication first, then addition/subtraction
        let result;
        
        if (op1 === '*' && op2 === '*') {
            // num1 * num2 * num3
            result = num1 * num2 * num3;
        } else if (op1 === '*') {
            // num1 * num2 [op2] num3
            const firstPart = num1 * num2;
            if (op2 === '+') {
                result = firstPart + num3;
            } else if (op2 === '-') {
                result = firstPart - num3;
            } else if (op2 === '*') {
                result = firstPart * num3;
            }
        } else if (op2 === '*') {
            // num1 [op1] num2 * num3
            const secondPart = num2 * num3;
            if (op1 === '+') {
                result = num1 + secondPart;
            } else if (op1 === '-') {
                result = num1 - secondPart;
            } else if (op1 === '*') {
                result = num1 * secondPart;
            }
        } else {
            // No multiplication, left to right
            if (op1 === '+') {
                const firstPart = num1 + num2;
                if (op2 === '+') {
                    result = firstPart + num3;
                } else if (op2 === '-') {
                    result = firstPart - num3;
                }
            } else if (op1 === '-') {
                const firstPart = num1 - num2;
                if (op2 === '+') {
                    result = firstPart + num3;
                } else if (op2 === '-') {
                    result = firstPart - num3;
                }
            }
        }
        
        return result;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.unblockProcess = new DifficultUnblockProcess();
    } catch (error) {
        console.error('Failed to initialize unblock process:', error);
    }
});

// Handle extension messages
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'unblock_complete') {
            if (window.unblockProcess) {
                window.unblockProcess.finalRedirect();
            }
        }
        sendResponse({success: true});
    });
}
