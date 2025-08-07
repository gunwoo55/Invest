// Common JavaScript functions for FINE U Mock Investment App

// API Keys and Configuration
const API_CONFIG = {
    NEWS_API_KEY: '85aa1c2ff9884dd489ef7e9a8e85b8d5', // Demo key - replace with real one
    ALPHA_VANTAGE_KEY: 'demo', // Demo key - replace with real one
    COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
    NEWS_API_BASE_URL: 'https://newsapi.org/v2',
    ALPHA_VANTAGE_BASE_URL: 'https://www.alphavantage.co/query',
    YAHOO_FINANCE_PROXY: 'https://query1.finance.yahoo.com/v8/finance/chart'
};

// Profile Image Management
class ProfileManager {
    constructor() {
        this.initProfileImage();
        this.setupProfileImageUpload();
    }

    initProfileImage() {
        const profileImages = document.querySelectorAll('#profileImage');
        const savedImage = localStorage.getItem('userProfileImage');
        
        profileImages.forEach(img => {
            if (savedImage) {
                img.src = savedImage;
            } else {
                img.src = this.getDefaultProfileSVG();
            }
            
            // Add click event for image upload
            img.addEventListener('click', () => {
                const input = document.getElementById('profileImageInput');
                if (input) input.click();
            });
        });
    }

    setupProfileImageUpload() {
        const input = document.getElementById('profileImageInput');
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.handleImageUpload(file);
                }
            });
        }
    }

    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            localStorage.setItem('userProfileImage', imageData);
            this.updateAllProfileImages(imageData);
        };
        reader.readAsDataURL(file);
    }

    updateAllProfileImages(imageData) {
        const profileImages = document.querySelectorAll('#profileImage');
        profileImages.forEach(img => {
            img.src = imageData;
        });
    }

    getDefaultProfileSVG() {
        return `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="20" fill="#667eea"/>
                <circle cx="20" cy="16" r="6" fill="white"/>
                <path d="M8 32c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="white"/>
            </svg>
        `)}`;
    }
}

// API Helper Functions
class APIHelper {
    static async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    static handleApiError(error, fallbackData = null) {
        console.error('API Error:', error);
        
        if (error.name === 'AbortError') {
            throw new Error('요청 시간이 초과되었습니다.');
        }
        
        if (fallbackData) {
            return fallbackData;
        }
        
        throw new Error('데이터를 불러오는 중 오류가 발생했습니다.');
    }

    static formatCurrency(amount, currency = 'KRW') {
        if (currency === 'KRW') {
            return `₩${amount.toLocaleString()}`;
        } else if (currency === 'USD') {
            return `$${amount.toLocaleString()}`;
        }
        return amount.toLocaleString();
    }

    static formatPercentage(value) {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    }
}

// Local Storage Manager
class StorageManager {
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
}

// Tab Manager
class TabManager {
    static initTabs(tabSelector = '.tab-btn', contentSelector = '.tab-content') {
        const tabButtons = document.querySelectorAll(tabSelector);
        const tabContents = document.querySelectorAll(contentSelector);

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
}

// Portfolio Manager
class PortfolioManager {
    constructor() {
        this.portfolio = StorageManager.getItem('userPortfolio', {
            totalInvestment: 10000000,
            currentValue: 10250000,
            holdings: [],
            transactions: []
        });
    }

    getTotalAssets() {
        return this.portfolio.currentValue;
    }

    getProfitLoss() {
        const profit = this.portfolio.currentValue - this.portfolio.totalInvestment;
        const profitRate = (profit / this.portfolio.totalInvestment) * 100;
        return {
            amount: profit,
            percentage: profitRate
        };
    }

    addTransaction(transaction) {
        transaction.id = Date.now();
        transaction.date = transaction.date || new Date().toISOString();
        this.portfolio.transactions.push(transaction);
        this.savePortfolio();
    }

    savePortfolio() {
        StorageManager.setItem('userPortfolio', this.portfolio);
    }

    updateHolding(symbol, quantity, price, type = 'stock') {
        const existingHolding = this.portfolio.holdings.find(h => h.symbol === symbol);
        
        if (existingHolding) {
            existingHolding.quantity += quantity;
            existingHolding.averagePrice = ((existingHolding.averagePrice * existingHolding.quantity) + (price * quantity)) / existingHolding.quantity;
        } else {
            this.portfolio.holdings.push({
                symbol,
                quantity,
                averagePrice: price,
                type,
                addedDate: new Date().toISOString()
            });
        }
        
        this.savePortfolio();
    }
}

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile manager
    new ProfileManager();
    
    // Initialize tab manager
    TabManager.initTabs();
    
    // Initialize portfolio manager
    window.portfolioManager = new PortfolioManager();
    
    // Update profile image on all pages
    const profileImages = document.querySelectorAll('#profileImage');
    const savedImage = localStorage.getItem('userProfileImage');
    
    if (savedImage) {
        profileImages.forEach(img => {
            img.src = savedImage;
        });
    }
});

// Global utility functions
window.APIHelper = APIHelper;
window.StorageManager = StorageManager;
window.TabManager = TabManager;
window.PortfolioManager = PortfolioManager;

// Navigation functions
function navigateToInvest(type) {
    window.location.href = `a5.html?tab=${type}`;
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">데이터를 불러오는 중...</div>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}