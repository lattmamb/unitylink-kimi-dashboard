// UnityLink Platform - Advanced AI-Powered Main JavaScript
// iOS Tahoe-inspired liquid glassmorphism with Agent Zero framework integration

class UnityLinkPlatform {
    constructor() {
        this.aiAgent = new UnityLinkAIAgent();
        this.currentPlan = null;
        this.userPreferences = this.loadUserPreferences();
        this.init();
    }

    init() {
        this.setupLoadingScreen();
        this.setupTypedText();
        this.setupScrollAnimations();
        this.setupNavigation();
        this.setupCounters();
        this.setupInteractions();
        this.setupAIAgent();
        this.setupNotifications();
        this.setupLiquidEffects();
    }

    // Loading Screen Management
    setupLoadingScreen() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loading = document.getElementById('loading');
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                    this.startAnimations();
                    this.showWelcomeNotification();
                }, 500);
            }, 2000);
        });
    }

    showWelcomeNotification() {
        setTimeout(() => {
            this.showNotification('🚀 Welcome to UnityLink! Your AI assistant is ready to help.', 'info', 5000);
        }, 1000);
    }

    // Typed Text Animation for Hero
    setupTypedText() {
        if (document.getElementById('typed-text')) {
            new Typed('#typed-text', {
                strings: [
                    'AI Transportation',
                    'Autonomous Mobility',
                    'Smart Fleet Management',
                    'Neural Navigation',
                    'Intelligent Rides'
                ],
                typeSpeed: 80,
                backSpeed: 50,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });
        }
    }

    // Scroll-based Animations with Liquid Effects
    setupScrollAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('subscription-card')) {
                        entry.target.classList.add('fade-in');
                    } else if (entry.target.classList.contains('feature-card')) {
                        entry.target.classList.add('fade-in');
                    } else if (entry.target.classList.contains('job-card')) {
                        entry.target.classList.add('slide-in-left');
                    }
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.subscription-card, .feature-card, .job-card').forEach(el => {
                observer.observe(el);
            });
        });

        // Header scroll effect with liquid blur
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const scrolled = window.scrollY;
            
            if (scrolled > 100) {
                header.style.background = 'rgba(11, 11, 15, 0.98)';
                header.style.backdropFilter = 'blur(40px) saturate(200%)';
            } else {
                header.style.background = 'rgba(11, 11, 15, 0.95)';
                header.style.backdropFilter = 'blur(30px) saturate(180%)';
            }

            // Liquid scroll parallax effect
            this.updateLiquidScrollEffects(scrolled);
        });
    }

    updateLiquidScrollEffects(scrolled) {
        const hero = document.querySelector('.hero');
        const heroVisual = document.querySelector('.hero-visual');
        
        if (hero && heroVisual) {
            const rate = scrolled * -0.5;
            heroVisual.style.transform = `translateY(${rate}px) rotateY(${scrolled * 0.01}deg)`;
        }
    }

    // Smooth Navigation
    setupNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile menu toggle (if implemented)
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuButton && navLinks) {
            mobileMenuButton.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    }

    // Animated Counters with Liquid Animation
    setupCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2500;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                    // Add liquid pulse effect when complete
                    counter.style.animation = 'liquidPulse 1s ease-in-out';
                }
            };

            updateCounter();
        };

        // Trigger counters when stats section is visible
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => animateCounter(counter));
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    // Interactive Elements with Liquid Effects
    setupInteractions() {
        // Subscription card interactions
        this.setupSubscriptionCards();
        
        // Button interactions
        this.setupButtonEffects();
        
        // Form interactions
        this.setupFormValidation();
        
        // Modal interactions
        this.setupModals();
    }

    setupSubscriptionCards() {
        const cards = document.querySelectorAll('.subscription-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    scale: 1.02,
                    translateY: -10,
                    duration: 400,
                    easing: 'easeOutCubic'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    scale: 1,
                    translateY: 0,
                    duration: 400,
                    easing: 'easeOutCubic'
                });
            });
        });
    }

    setupButtonEffects() {
        document.querySelectorAll('.card-button, .cta-button, .btn-secondary').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createLiquidRipple(e, button);
                this.handleButtonClick(button);
            });
        });
    }

    createLiquidRipple(e, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.4)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'liquidRipple 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        ripple.style.pointerEvents = 'none';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 800);
    }

    handleButtonClick(button) {
        const buttonText = button.textContent.trim();
        
        // Add liquid feedback
        anime({
            targets: button,
            scale: [1, 0.95, 1],
            duration: 300,
            easing: 'easeOutCubic'
        });

        // Handle different button types
        if (buttonText.includes('Choose')) {
            this.handleSubscriptionSelection(button);
        } else if (buttonText.includes('Request Ride')) {
            this.handleRideRequest();
        } else if (buttonText.includes('Get Started')) {
            this.handleGetStarted();
        }
    }

    // AI Agent Integration
    setupAIAgent() {
        this.aiAgent.initialize();
        this.setupAIChat();
    }

    setupAIChat() {
        const aiInput = document.getElementById('aiInput');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAIMessage();
                }
            });
        }
    }

    toggleAIChat() {
        const chatWindow = document.getElementById('aiChatWindow');
        const aiButton = document.querySelector('.ai-agent-button');
        
        if (chatWindow.classList.contains('show')) {
            chatWindow.classList.remove('show');
            aiButton.classList.add('pulse');
        } else {
            chatWindow.classList.add('show');
            aiButton.classList.remove('pulse');
        }
    }

    sendAIMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addAIMessage(message, 'user');
        input.value = '';

        // Process with AI agent
        setTimeout(() => {
            const response = this.aiAgent.processMessage(message);
            this.addAIMessage(response, 'agent');
        }, 1000);
    }

    handleAIKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendAIMessage();
        }
    }

    addAIMessage(message, sender) {
        const messagesContainer = document.getElementById('aiChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        messageDiv.textContent = message;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animate message appearance
        anime({
            targets: messageDiv,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 300,
            easing: 'easeOutCubic'
        });
    }

    // Subscription Management with AI Integration
    handleSubscriptionSelection(button) {
        const plan = button.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (plan) {
            this.currentPlan = plan;
            this.showNotification(`🎯 AI has selected the ${plan} plan for you! Analyzing your preferences...`, 'success');
            
            // AI analysis simulation
            setTimeout(() => {
                this.showSubscriptionModal(plan);
            }, 1500);
        }
    }

    showSubscriptionModal(plan) {
        const modal = this.createModal('subscription-modal', `
            <div style="padding: 2rem; max-width: 500px; background: var(--surface-glass); border-radius: 20px; border: 1px solid var(--accent-glass);">
                <h3 style="color: var(--liquid-blue); margin-bottom: 1rem; font-size: 1.5rem;">🚀 AI-Powered Setup: ${plan} Plan</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Our AI has analyzed your preferences and recommends this personalized setup:</p>
                
                <form id="subscription-form">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Full Name *</label>
                        <input type="text" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent-glass); background: var(--surface-glass); color: white; font-size: 0.9rem;" required>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Email Address *</label>
                        <input type="email" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent-glass); background: var(--surface-glass); color: white; font-size: 0.9rem;" required>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Phone Number *</label>
                        <input type="tel" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent-glass); background: var(--surface-glass); color: white; font-size: 0.9rem;" required>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Preferred Pickup Location *</label>
                        <select style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent-glass); background: var(--surface-glass); color: white; font-size: 0.9rem;">
                            <option>Decatur, IL</option>
                            <option>Springfield, IL</option>
                            <option>Champaign, IL</option>
                            <option>Other Rural Location</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">AI Assistant Preferences</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <input type="checkbox" style="accent-color: var(--liquid-blue);">
                                <span>Route Optimization</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <input type="checkbox" style="accent-color: var(--liquid-blue);">
                                <span>Predictive Maintenance</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <input type="checkbox" style="accent-color: var(--liquid-blue);">
                                <span>Smart Scheduling</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <input type="checkbox" style="accent-color: var(--liquid-blue);">
                                <span>Energy Optimization</span>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" class="card-button" style="background: linear-gradient(135deg, var(--liquid-blue), var(--liquid-mint)); color: var(--dark-void);">Complete AI Setup</button>
                </form>
            </div>
        `);

        document.getElementById('subscription-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('🎉 AI setup complete! Welcome to the future of transportation.', 'success');
            this.closeModal('subscription-modal');
            
            // AI welcome message
            setTimeout(() => {
                this.addAIMessage(`Welcome to UnityLink! I've completed your ${this.currentPlan} plan setup. How can I assist you today?`, 'agent');
            }, 2000);
        });
    }

    // AI Ride Request System
    handleRideRequest() {
        this.showNotification('🚗 AI is analyzing ride requests in your area...', 'info');
        
        // AI analysis simulation
        setTimeout(() => {
            this.showNotification('✅ AI found 3 optimal vehicles nearby! Opening request interface...', 'success');
            this.showRideRequestModal();
        }, 2000);
    }

    showRideRequestModal() {
        const modal = this.createModal('ride-modal', `
            <div style="padding: 2rem; max-width: 500px; background: var(--surface-glass); border-radius: 20px; border: 1px solid var(--accent-glass);">
                <h3 style="color: var(--liquid-blue); margin-bottom: 1rem; font-size: 1.5rem;">🚗 AI-Powered Ride Request</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Our AI has identified the optimal vehicle and route for your journey:</p>
                
                <form id="ride-form">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Pickup Location *</label>
                        <input type="text" placeholder="Enter pickup address or use current location" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent-glass); background: var(--surface-glass); color: white; font-size: 0.9rem;" required>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Destination *</label>
                        <input type="text" placeholder="Where would you like to go?" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent-glass); background: var(--surface-glass); color: white; font-size: 0.9rem;" required>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">AI-Optimized Vehicle</label>
                        <select style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent-glass); background: var(--surface-glass); color: white; font-size: 0.9rem;">
                            <option>Tesla Model Y (Recommended)</option>
                            <option>Tesla Model 3 (Eco Option)</option>
                            <option>Tesla Model X (Premium)</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Journey Preferences</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <input type="radio" name="preference" value="fastest" style="accent-color: var(--liquid-blue);" checked>
                                <span>Fastest Route</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <input type="radio" name="preference" value="scenic" style="accent-color: var(--liquid-blue);">
                                <span>Scenic Route</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <input type="radio" name="preference" value="efficient" style="accent-color: var(--liquid-blue);">
                                <span>Most Efficient</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <input type="radio" name="preference" value="quiet" style="accent-color: var(--liquid-blue);">
                                <span>Quiet Roads</span>
                            </label>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">Scheduled Time</label>
                        <input type="datetime-local" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent-glass); background: var(--surface-glass); color: white; font-size: 0.9rem;" required>
                    </div>
                    
                    <button type="submit" class="card-button" style="background: linear-gradient(135deg, var(--liquid-blue), var(--liquid-mint)); color: var(--dark-void);">Request AI Ride</button>
                </form>
            </div>
        `);

        document.getElementById('ride-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('🚗 AI ride request submitted! Vehicle will arrive at your scheduled time with optimal routing.', 'success');
            this.closeModal('ride-modal');
        });
    }

    // Get Started Flow with AI
    handleGetStarted() {
        this.showNotification('🚀 AI is analyzing your needs...', 'info');
        
        setTimeout(() => {
            this.showGetStartedModal();
        }, 1000);
    }

    showGetStartedModal() {
        const modal = this.createModal('getstarted-modal', `
            <div style="padding: 2rem; max-width: 600px; background: var(--surface-glass); border-radius: 20px; border: 1px solid var(--accent-glass);">
                <h3 style="color: var(--liquid-blue); margin-bottom: 1rem; text-align: center; font-size: 1.8rem;">🚀 Welcome to UnityLink AI</h3>
                <p style="text-align: center; margin-bottom: 2rem; color: var(--text-secondary);">
                    Our AI has analyzed your preferences and recommends the best way to get started
                </p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    <button class="cta-button" onclick="unityLink.showNotification('Redirecting to AI-powered subscription setup...', 'info')" style="padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; background: linear-gradient(135deg, var(--liquid-blue), var(--liquid-mint));">
                        <i class="fas fa-car" style="display: block; font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--dark-void);"></i>
                        <span style="font-weight: 600; color: var(--dark-void);">Get Vehicle Subscription</span>
                        <small style="color: var(--dark-void); opacity: 0.8;">AI-Optimized Plans</small>
                    </button>
                    
                    <button class="btn-secondary" onclick="unityLink.showNotification('Redirecting to AI job matching...', 'info')" style="padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <i class="fas fa-briefcase" style="display: block; font-size: 2.5rem; margin-bottom: 0.5rem;"></i>
                        <span style="font-weight: 600;">Find Job Opportunities</span>
                        <small style="color: var(--text-secondary);">AI Career Matching</small>
                    </button>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="unityLink.closeModal('getstarted-modal')" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.9rem;">
                        I'll explore on my own
                    </button>
                </div>
            </div>
        `);
    }

    // Liquid Effects System
    setupLiquidEffects() {
        this.createLiquidBackground();
        this.setupLiquidCursor();
    }

    createLiquidBackground() {
        // Create animated liquid background elements
        const liquidElements = document.createElement('div');
        liquidElements.className = 'liquid-background';
        liquidElements.innerHTML = `
            <div class="liquid-blob liquid-blob-1"></div>
            <div class="liquid-blob liquid-blob-2"></div>
            <div class="liquid-blob liquid-blob-3"></div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .liquid-background {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                overflow: hidden;
            }
            
            .liquid-blob {
                position: absolute;
                border-radius: 50%;
                filter: blur(40px);
                opacity: 0.1;
                animation: liquidFloat 20s infinite ease-in-out;
            }
            
            .liquid-blob-1 {
                width: 400px;
                height: 400px;
                background: linear-gradient(135deg, var(--liquid-blue), var(--liquid-mint));
                top: 20%;
                left: 10%;
                animation-delay: 0s;
            }
            
            .liquid-blob-2 {
                width: 300px;
                height: 300px;
                background: linear-gradient(135deg, var(--liquid-mint), var(--liquid-blue));
                top: 60%;
                right: 10%;
                animation-delay: 7s;
            }
            
            .liquid-blob-3 {
                width: 250px;
                height: 250px;
                background: linear-gradient(135deg, var(--liquid-blue), var(--liquid-mint));
                bottom: 20%;
                left: 30%;
                animation-delay: 14s;
            }
            
            @keyframes liquidFloat {
                0%, 100% { transform: translateY(0px) scale(1); }
                33% { transform: translateY(-30px) scale(1.1); }
                66% { transform: translateY(20px) scale(0.9); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(liquidElements);
    }

    setupLiquidCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'liquid-cursor';
        cursor.innerHTML = '<div class="cursor-dot"></div>';
        
        const style = document.createElement('style');
        style.textContent = `
            .liquid-cursor {
                position: fixed;
                top: 0;
                left: 0;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: radial-gradient(circle, var(--liquid-blue), transparent);
                pointer-events: none;
                z-index: 9998;
                mix-blend-mode: difference;
                transition: transform 0.1s ease;
            }
            
            .cursor-dot {
                width: 4px;
                height: 4px;
                background: var(--liquid-white);
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        });
    }

    // Form Validation
    setupFormValidation() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'This field is required');
                isValid = false;
            } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
                this.showFieldError(input, 'Please enter a valid email address');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        const error = document.createElement('div');
        error.className = 'field-error';
        error.style.color = '#ff4757';
        error.style.fontSize = '0.8rem';
        error.style.marginTop = '0.25rem';
        error.textContent = message;
        input.parentNode.appendChild(error);
        input.style.borderColor = '#ff4757';
        
        // Liquid shake animation
        anime({
            targets: input,
            translateX: [-10, 10, -5, 5, 0],
            duration: 400,
            easing: 'easeOutCubic'
        });
    }

    clearFieldError(input) {
        const error = input.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
        input.style.borderColor = '';
    }

    // Notification System
    setupNotifications() {
        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 2rem;
                padding: 1rem 1.5rem;
                border-radius: 15px;
                color: white;
                font-weight: 500;
                z-index: 10001;
                transform: translateX(100%) translateY(-20px);
                transition: var(--liquid-transition);
                max-width: 350px;
                box-shadow: var(--neumorphic-shadow);
                backdrop-filter: blur(20px);
                border: 1px solid var(--accent-glass);
            }
            .notification.show {
                transform: translateX(0) translateY(0);
            }
            .notification.success {
                background: linear-gradient(135deg, rgba(46, 213, 115, 0.9), rgba(164, 222, 108, 0.9));
                border-color: rgba(46, 213, 115, 0.3);
            }
            .notification.error {
                background: linear-gradient(135deg, rgba(255, 71, 87, 0.9), rgba(255, 107, 122, 0.9));
                border-color: rgba(255, 71, 87, 0.3);
            }
            .notification.warning {
                background: linear-gradient(135deg, rgba(255, 165, 2, 0.9), rgba(255, 192, 72, 0.9));
                border-color: rgba(255, 165, 2, 0.3);
            }
            .notification.info {
                background: linear-gradient(135deg, var(--liquid-blue), var(--liquid-mint));
                border-color: rgba(0, 224, 255, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    // Modal Management
    setupModals() {
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes liquidRipple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(10px);
                opacity: 0;
                visibility: hidden;
                transition: var(--liquid-transition);
            }
            .modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            .modal-content {
                background: var(--surface-glass);
                border: 1px solid var(--accent-glass);
                border-radius: 25px;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                backdrop-filter: blur(30px) saturate(180%);
                -webkit-backdrop-filter: blur(30px) saturate(180%);
                box-shadow: var(--neumorphic-shadow);
            }
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.5rem;
                cursor: pointer;
                z-index: 1;
                transition: var(--liquid-transition);
            }
            .modal-close:hover {
                color: var(--liquid-blue);
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    createModal(id, content) {
        const existingModal = document.getElementById(id);
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="unityLink.closeModal('${id}')">&times;</button>
                ${content}
            </div>
        `;

        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);

        anime({
            targets: modal.querySelector('.modal-content'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutCubic'
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(id);
            }
        });

        return modal;
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
            anime({
                targets: modal,
                opacity: [1, 0],
                duration: 300,
                easing: 'easeOutCubic',
                complete: () => {
                    modal.remove();
                }
            });
        }
    }

    // User Preferences Management
    loadUserPreferences() {
        const saved = localStorage.getItem('unitylink-preferences');
        return saved ? JSON.parse(saved) : {
            theme: 'dark',
            notifications: true,
            aiAssistant: true,
            locationServices: true
        };
    }

    saveUserPreferences() {
        localStorage.setItem('unitylink-preferences', JSON.stringify(this.userPreferences));
    }

    // Animation Starters
    startAnimations() {
        // Stagger animation for cards with liquid timing
        anime({
            targets: '.subscription-card',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(150),
            duration: 800,
            easing: 'easeOutCubic'
        });

        anime({
            targets: '.feature-card',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(150, {start: 400}),
            duration: 800,
            easing: 'easeOutCubic'
        });

        anime({
            targets: '.job-card',
            opacity: [0, 1],
            translateX: [-30, 0],
            delay: anime.stagger(150, {start: 800}),
            duration: 800,
            easing: 'easeOutCubic'
        });

        // Liquid background animation
        anime({
            targets: '.liquid-blob',
            rotate: '1turn',
            duration: 20000,
            loop: true,
            easing: 'linear'
        });
    }
}

// AI Agent Class with Agent Zero Framework Integration
class UnityLinkAIAgent {
    constructor() {
        this.context = {
            userPreferences: {},
            conversationHistory: [],
            platformData: this.initializePlatformData()
        };
        this.intents = this.initializeIntents();
        this.responses = this.initializeResponses();
    }

    initialize() {
        console.log('🤖 UnityLink AI Agent initialized with Agent Zero framework');
    }

    initializePlatformData() {
        return {
            vehicles: 50,
            activeRides: 28,
            chargingStations: 12,
            subscribers: 523,
            availableJobs: 45
        };
    }

    initializeIntents() {
        return {
            SUBSCRIPTION: 'subscription',
            TRACKING: 'tracking',
            JOBS: 'jobs',
            RIDE: 'ride',
            HELP: 'help',
            GENERAL: 'general'
        };
    }

    initializeResponses() {
        return {
            greeting: [
                "Hello! I'm your UnityLink AI assistant. I can help you with subscriptions, track vehicles, find jobs, and answer any questions about our autonomous transportation platform.",
                "Welcome to UnityLink! I'm here to assist you with our AI-powered transportation services. What can I help you with today?",
                "Hi there! I'm UnityLink's AI assistant. I can help you find the perfect subscription, track our fleet, or explore job opportunities."
            ],
            subscription: [
                "I can help you choose the perfect subscription plan! We offer 6 different tiers with AI-powered features. Would you like me to recommend one based on your needs?",
                "Our AI analyzes your usage patterns to recommend the best subscription. We have plans from $99/month to $600/month with various AI features.",
                "Let me show you our AI-powered subscription options! Each plan includes different levels of artificial intelligence assistance and optimization."
            ],
            tracking: [
                "You can track our entire fleet in real-time! We have 50 vehicles across Illinois with AI-powered route optimization.",
                "Our tracking system shows live positions of all vehicles, charging status, and estimated arrival times with AI predictions.",
                "I can help you find the nearest available vehicle or track a specific ride. Our AI monitors all vehicles 24/7 for optimal performance."
            ],
            jobs: [
                "We have 45 active job openings! From vehicle operations to AI development, we're building the future of rural transportation.",
                "Our job platform offers opportunities in operations, community relations, technical maintenance, and AI development across Illinois.",
                "I can help you find the perfect position at UnityLink! We offer competitive pay and the chance to revolutionize rural transportation."
            ],
            ride: [
                "I can help you request an AI-powered ride! Just tell me your pickup location and destination, and I'll find the optimal vehicle for you.",
                "Our AI dispatch system finds the nearest available vehicle and calculates the most efficient route. Ready to book a ride?",
                "Requesting a ride is easy! I can help you schedule immediate or future rides with our AI-optimized fleet."
            ],
            help: [
                "I can assist you with: subscriptions, ride requests, job applications, fleet tracking, or general questions about UnityLink.",
                "Try asking me about: getting started, subscription plans, available jobs, or requesting a ride. I'm here to help!",
                "I understand natural language, so feel free to ask me anything about UnityLink's services in your own words."
            ]
        };
    }

    processMessage(message) {
        const intent = this.detectIntent(message);
        const response = this.generateResponse(intent, message);
        
        // Store conversation history
        this.context.conversationHistory.push({
            timestamp: new Date(),
            message: message,
            intent: intent,
            response: response
        });

        return response;
    }

    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // Intent detection logic
        if (this.containsKeywords(lowerMessage, ['subscription', 'plan', 'price', 'cost', 'pay'])) {
            return this.intents.SUBSCRIPTION;
        } else if (this.containsKeywords(lowerMessage, ['track', 'vehicle', 'location', 'where', 'find'])) {
            return this.intents.TRACKING;
        } else if (this.containsKeywords(lowerMessage, ['job', 'work', 'career', 'employment', 'hire'])) {
            return this.intents.JOBS;
        } else if (this.containsKeywords(lowerMessage, ['ride', 'book', 'request', 'pickup', 'destination'])) {
            return this.intents.RIDE;
        } else if (this.containsKeywords(lowerMessage, ['help', 'assist', 'support', 'how', 'what'])) {
            return this.intents.HELP;
        } else {
            return this.intents.GENERAL;
        }
    }

    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    generateResponse(intent, message) {
        switch (intent) {
            case this.intents.SUBSCRIPTION:
                return this.getRandomResponse('subscription');
            case this.intents.TRACKING:
                return this.getRandomResponse('tracking');
            case this.intents.JOBS:
                return this.getRandomResponse('jobs');
            case this.intents.RIDE:
                return this.getRandomResponse('ride');
            case this.intents.HELP:
                return this.getRandomResponse('help');
            default:
                return this.handleGeneralQuery(message);
        }
    }

    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handleGeneralQuery(message) {
        // Advanced NLP simulation
        if (message.length < 10) {
            return "I'd love to help! Could you tell me more about what you're looking for? I can assist with subscriptions, rides, jobs, or general questions.";
        }
        
        return "I understand you're asking about UnityLink. I'm here to help with any questions about our AI-powered transportation platform. What specific information would you like?";
    }
}

// Global functions for onclick handlers
function selectPlan(plan) {
    unityLink.handleSubscriptionSelection({ target: { getAttribute: () => `selectPlan('${plan}')` } });
}

function requestRide() {
    unityLink.handleRideRequest();
}

function toggleAIChat() {
    unityLink.toggleAIChat();
}

function sendAIMessage() {
    unityLink.sendAIMessage();
}

function handleAIKeyPress(event) {
    unityLink.handleAIKeyPress(event);
}

// Initialize the platform
const unityLink = new UnityLinkPlatform();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UnityLinkPlatform, UnityLinkAIAgent };
}