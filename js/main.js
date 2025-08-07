// Main JavaScript functionality for Invest platform

class InvestApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        // Navigation buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const startInvestingBtn = document.getElementById('startInvestingBtn');
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        const profileBtn = document.getElementById('profileBtn');

        // Add click handlers
        if (loginBtn) {
            loginBtn.addEventListener('click', this.handleLogin.bind(this));
        }

        if (signupBtn) {
            signupBtn.addEventListener('click', this.handleSignup.bind(this));
        }

        if (startInvestingBtn) {
            startInvestingBtn.addEventListener('click', this.handleStartInvesting.bind(this));
        }

        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', this.handleLearnMore.bind(this));
        }

        if (profileBtn) {
            profileBtn.addEventListener('click', this.handleProfile.bind(this));
        }

        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', this.toggleMobileMenu.bind(this));
        }
    }

    setupSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        // Mobile menu functionality
        this.mobileMenuOpen = false;
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const navAuth = document.querySelector('.nav-auth');
        const hamburger = document.querySelector('.hamburger');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (this.mobileMenuOpen) {
            // Show mobile menu
            if (navMenu) navMenu.style.display = 'flex';
            if (navAuth) navAuth.style.display = 'flex';
            hamburger.classList.add('active');
        } else {
            // Hide mobile menu
            if (navMenu) navMenu.style.display = 'none';
            if (navAuth) navAuth.style.display = 'none';
            hamburger.classList.remove('active');
        }
    }

    setupScrollEffects() {
        // Add scroll effects and animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.feature-card, .about-content, .stats-card').forEach(el => {
            observer.observe(el);
        });

        // Header background change on scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });
    }

    handleLogin() {
        this.showMessage('로그인 기능은 현재 개발 중입니다.', 'info');
        // TODO: Implement login functionality
        console.log('Login button clicked');
    }

    handleSignup() {
        this.showMessage('회원가입 기능은 현재 개발 중입니다.', 'info');
        // TODO: Implement signup functionality
        console.log('Signup button clicked');
    }

    handleStartInvesting() {
        // Show profile section for demo purposes
        this.showProfileSection();
        this.showMessage('모의투자를 시작하기 전에 프로필을 설정해주세요!', 'info');
    }

    handleLearnMore() {
        // Scroll to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    handleProfile() {
        this.showProfileSection();
    }

    showProfileSection() {
        const profileSection = document.getElementById('profile-upload');
        if (profileSection) {
            profileSection.style.display = 'block';
            profileSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    hideProfileSection() {
        const profileSection = document.getElementById('profile-upload');
        if (profileSection) {
            profileSection.style.display = 'none';
        }
    }

    showMessage(message, type = 'info') {
        // Create and show a temporary message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'info' ? '#d1ecf1' : type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'info' ? '#0c5460' : type === 'success' ? '#155724' : '#721c24'};
            border: 1px solid ${type === 'info' ? '#bee5eb' : type === 'success' ? '#c3e6cb' : '#f5c6cb'};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            z-index: 1001;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    showWelcomeMessage() {
        // Show welcome message when page loads
        setTimeout(() => {
            this.showMessage('Invest 모의투자 플랫폼에 오신 것을 환영합니다!', 'info');
        }, 1000);
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('ko-KR').format(number);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// CSS for message animations
const messageStyles = document.createElement('style');
messageStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(messageStyles);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.investApp = new InvestApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvestApp;
}