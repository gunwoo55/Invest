// Main page (index.html) JavaScript

class MainPageManager {
    constructor() {
        this.initializeData();
        this.loadMarketData();
        this.loadRecentNews();
        this.updatePortfolioDisplay();
        this.startDataRefresh();
    }

    initializeData() {
        // Initialize with demo data if no portfolio exists
        if (!localStorage.getItem('userPortfolio')) {
            const demoPortfolio = {
                totalInvestment: 10000000,
                currentValue: 10250000,
                holdings: [
                    {
                        symbol: 'AAPL',
                        quantity: 10,
                        averagePrice: 150,
                        type: 'stock',
                        addedDate: new Date().toISOString()
                    },
                    {
                        symbol: 'BTC',
                        quantity: 0.1,
                        averagePrice: 42000,
                        type: 'crypto',
                        addedDate: new Date().toISOString()
                    }
                ],
                transactions: []
            };
            StorageManager.setItem('userPortfolio', demoPortfolio);
        }
    }

    updatePortfolioDisplay() {
        const portfolio = StorageManager.getItem('userPortfolio');
        if (!portfolio) return;

        const totalAssetsElement = document.getElementById('totalAssets');
        const profitRateElement = document.getElementById('profitRate');

        if (totalAssetsElement) {
            totalAssetsElement.textContent = APIHelper.formatCurrency(portfolio.currentValue);
        }

        if (profitRateElement) {
            const profit = portfolio.currentValue - portfolio.totalInvestment;
            const profitRate = (profit / portfolio.totalInvestment) * 100;
            
            profitRateElement.textContent = `${APIHelper.formatPercentage(profitRate)} (${APIHelper.formatCurrency(profit)})`;
            profitRateElement.className = `value ${profit >= 0 ? 'positive' : 'negative'}`;
        }
    }

    async loadMarketData() {
        try {
            // Load KOSPI data (using mock data for demo)
            this.updateMarketIndex('kospiValue', 'kospiChange', 2450.32, 12.45);
            
            // Load NASDAQ data (using mock data for demo)
            this.updateMarketIndex('nasdaqValue', 'nasdaqChange', 15235.71, -25.83);
            
            // Load Bitcoin data from CoinGecko
            await this.loadCryptoData();
            
        } catch (error) {
            console.error('Error loading market data:', error);
            this.showMarketDataError();
        }
    }

    async loadCryptoData() {
        try {
            const response = await APIHelper.fetchWithTimeout(
                `${API_CONFIG.COINGECKO_BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`
            );
            
            if (response.ok) {
                const data = await response.json();
                const bitcoinData = data.bitcoin;
                
                if (bitcoinData) {
                    const price = bitcoinData.usd;
                    const change = bitcoinData.usd_24h_change || 0;
                    
                    this.updateMarketIndex('bitcoinValue', 'bitcoinChange', price, change, true);
                }
            } else {
                throw new Error('Failed to fetch Bitcoin data');
            }
        } catch (error) {
            console.error('Error loading crypto data:', error);
            // Use fallback data
            this.updateMarketIndex('bitcoinValue', 'bitcoinChange', 43250, 1230);
        }
    }

    updateMarketIndex(valueId, changeId, value, change, isPercentage = false) {
        const valueElement = document.getElementById(valueId);
        const changeElement = document.getElementById(changeId);

        if (valueElement) {
            if (valueId === 'bitcoinValue') {
                valueElement.textContent = APIHelper.formatCurrency(value, 'USD');
            } else {
                valueElement.textContent = value.toLocaleString();
            }
        }

        if (changeElement) {
            const changeText = isPercentage ? 
                `${APIHelper.formatPercentage(change)}` : 
                `${change >= 0 ? '+' : ''}${change.toLocaleString()} (${APIHelper.formatPercentage(change / value * 100)})`;
            
            changeElement.textContent = changeText;
            changeElement.className = `index-change ${change >= 0 ? 'positive' : 'negative'}`;
        }
    }

    async loadRecentNews() {
        const newsListElement = document.getElementById('recentNewsList');
        if (!newsListElement) return;

        try {
            // Try to load real news from NewsAPI
            const response = await APIHelper.fetchWithTimeout(
                `${API_CONFIG.NEWS_API_BASE_URL}/everything?q=경제 OR 투자 OR 주식&language=ko&pageSize=5&apiKey=${API_CONFIG.NEWS_API_KEY}`
            );

            if (response.ok) {
                const data = await response.json();
                this.displayNews(data.articles || []);
            } else {
                throw new Error('News API failed');
            }
        } catch (error) {
            console.error('Error loading news:', error);
            // Show fallback news
            this.displayFallbackNews();
        }
    }

    displayNews(articles) {
        const newsListElement = document.getElementById('recentNewsList');
        if (!newsListElement) return;

        if (articles.length === 0) {
            this.displayFallbackNews();
            return;
        }

        const newsHTML = articles.slice(0, 3).map(article => {
            const publishedDate = new Date(article.publishedAt);
            const timeAgo = this.getTimeAgo(publishedDate);
            
            return `
                <div class="news-item">
                    <div class="news-content">
                        <h4>${article.title}</h4>
                        <p>${article.description || '내용을 불러올 수 없습니다.'}</p>
                        <span class="news-time">${timeAgo}</span>
                    </div>
                </div>
            `;
        }).join('');

        newsListElement.innerHTML = newsHTML;
    }

    displayFallbackNews() {
        const newsListElement = document.getElementById('recentNewsList');
        if (!newsListElement) return;

        const fallbackNews = [
            {
                title: '한국은행, 기준금리 3.50% 동결 결정',
                description: '한국은행이 기준금리를 현행 3.50% 수준에서 동결하기로 결정했습니다.',
                timeAgo: '2시간 전'
            },
            {
                title: '삼성전자, 4분기 실적 발표 예정',
                description: '삼성전자가 다음 주 4분기 실적을 발표할 예정입니다.',
                timeAgo: '4시간 전'
            },
            {
                title: '비트코인, 4만 3천 달러 돌파',
                description: '비트코인이 최근 상승세를 보이며 4만 3천 달러를 돌파했습니다.',
                timeAgo: '6시간 전'
            }
        ];

        const newsHTML = fallbackNews.map(news => `
            <div class="news-item">
                <div class="news-content">
                    <h4>${news.title}</h4>
                    <p>${news.description}</p>
                    <span class="news-time">${news.timeAgo}</span>
                </div>
            </div>
        `).join('');

        newsListElement.innerHTML = newsHTML;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes}분 전`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}시간 전`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)}일 전`;
        }
    }

    showMarketDataError() {
        console.log('Using fallback market data due to API errors');
        // Fallback data is already set in the HTML
    }

    startDataRefresh() {
        // Refresh market data every 5 minutes
        setInterval(() => {
            this.loadMarketData();
        }, 5 * 60 * 1000);

        // Refresh news every 30 minutes
        setInterval(() => {
            this.loadRecentNews();
        }, 30 * 60 * 1000);
    }
}

// Quick action functions
function navigateToInvest(type) {
    const tabMapping = {
        'stock': 'stocks',
        'crypto': 'crypto',
        'bond': 'bonds',
        'savings': 'savings'
    };
    
    const tab = tabMapping[type] || 'stocks';
    window.location.href = `a5.html?tab=${tab}`;
}

// Initialize main page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new MainPageManager();
});