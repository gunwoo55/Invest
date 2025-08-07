// News page (a2.html) JavaScript

class NewsPageManager {
    constructor() {
        this.currentNewsPage = 1;
        this.newsCategory = 'general';
        this.cardNewsIndex = 0;
        this.cardNewsData = [];
        
        this.initializePage();
        this.loadTodayTerm();
        this.generateDailyNewsletter();
        this.loadEconomicNews();
    }

    initializePage() {
        // Initialize tabs
        TabManager.initTabs('.tab-btn', '.tab-content');
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const newsCategory = document.getElementById('newsCategory');
        if (newsCategory) {
            newsCategory.addEventListener('change', (e) => {
                this.newsCategory = e.target.value;
                this.currentNewsPage = 1;
                this.loadEconomicNews();
            });
        }
    }

    async loadTodayTerm() {
        const termName = document.getElementById('termName');
        const termDefinition = document.getElementById('termDefinition');
        const termExample = document.getElementById('termExample');

        if (!termName || !termDefinition || !termExample) return;

        try {
            // Get cached term or generate new one
            const cachedTerm = this.getCachedTodayTerm();
            
            if (cachedTerm) {
                this.displayTerm(cachedTerm);
            } else {
                const newTerm = await this.generateTodayTerm();
                this.displayTerm(newTerm);
                this.cacheTodayTerm(newTerm);
            }
        } catch (error) {
            console.error('Error loading today\'s term:', error);
            this.displayFallbackTerm();
        }
    }

    getCachedTodayTerm() {
        const cached = StorageManager.getItem('todayTerm');
        const today = new Date().toDateString();
        
        if (cached && cached.date === today) {
            return cached.term;
        }
        return null;
    }

    cacheTodayTerm(term) {
        const today = new Date().toDateString();
        StorageManager.setItem('todayTerm', {
            date: today,
            term: term
        });
    }

    async generateTodayTerm() {
        // List of financial terms with definitions and examples
        const financialTerms = [
            {
                name: "포트폴리오 (Portfolio)",
                definition: "투자자가 보유하고 있는 모든 투자 자산의 집합을 의미합니다. 주식, 채권, 현금 등 다양한 자산을 적절히 분산하여 위험을 줄이고 수익을 극대화하는 것이 목적입니다.",
                example: "김씨는 주식 60%, 채권 30%, 현금 10%로 구성된 포트폴리오를 보유하고 있어 시장 변동성에 대비하고 있습니다."
            },
            {
                name: "다양화 (Diversification)",
                definition: "투자 위험을 줄이기 위해 서로 다른 자산이나 시장에 투자 자금을 분산하는 투자 전략입니다. '모든 계란을 한 바구니에 담지 말라'는 격언으로 설명됩니다.",
                example: "투자자가 IT, 금융, 헬스케어 등 다양한 업종의 주식에 투자하여 특정 업종의 위험을 분산시켰습니다."
            },
            {
                name: "ROI (투자수익률)",
                definition: "Return on Investment의 약자로, 투자한 금액 대비 얻은 수익의 비율을 나타냅니다. (수익 / 투자금액) × 100으로 계산됩니다.",
                example: "100만원을 투자하여 110만원이 되었다면 ROI는 (10만원/100만원) × 100 = 10%입니다."
            },
            {
                name: "변동성 (Volatility)",
                definition: "자산 가격의 변동 정도를 나타내는 지표입니다. 변동성이 높을수록 가격이 크게 오르내리며, 높은 수익과 높은 위험을 동시에 가집니다.",
                example: "암호화폐는 하루에 10% 이상 오르내리는 경우가 많아 변동성이 매우 높은 자산으로 분류됩니다."
            },
            {
                name: "PER (주가수익비율)",
                definition: "Price Earnings Ratio의 약자로, 주가를 주당순이익으로 나눈 값입니다. 주식이 얼마나 비싸게 거래되고 있는지 판단하는 지표입니다.",
                example: "주가가 10,000원이고 주당순이익이 1,000원이라면 PER은 10배입니다. 일반적으로 PER이 낮을수록 저평가된 것으로 봅니다."
            }
        ];

        // Select random term
        const randomIndex = Math.floor(Math.random() * financialTerms.length);
        return financialTerms[randomIndex];
    }

    displayTerm(term) {
        const termName = document.getElementById('termName');
        const termDefinition = document.getElementById('termDefinition');
        const termExample = document.getElementById('termExample');

        if (termName) termName.textContent = term.name;
        if (termDefinition) termDefinition.textContent = term.definition;
        if (termExample) termExample.textContent = term.example;
    }

    displayFallbackTerm() {
        this.displayTerm({
            name: "투자 (Investment)",
            definition: "미래의 수익을 기대하고 현재의 자본을 특정 자산에 투입하는 행위입니다.",
            example: "주식, 부동산, 채권 등에 돈을 투자하여 장기적인 자산 증식을 목표로 합니다."
        });
    }

    async generateDailyNewsletter() {
        const dailySummary = document.getElementById('dailySummary');
        const newsletterTopics = document.getElementById('newsletterTopics');

        if (!dailySummary || !newsletterTopics) return;

        try {
            showLoading('dailySummary');
            
            // Simulate AI-generated newsletter content
            setTimeout(() => {
                const newsletterContent = this.createDailyNewsletterContent();
                
                dailySummary.innerHTML = `
                    <h4>오늘의 주요 경제 이슈</h4>
                    <p>${newsletterContent.summary}</p>
                `;

                newsletterTopics.innerHTML = newsletterContent.topics.map(topic => `
                    <div class="newsletter-topic">
                        <h5>${topic.title}</h5>
                        <p>${topic.content}</p>
                        <span class="topic-tags">${topic.tags.map(tag => `#${tag}`).join(' ')}</span>
                    </div>
                `).join('');
            }, 2000);

        } catch (error) {
            console.error('Error generating newsletter:', error);
            dailySummary.innerHTML = '<p>뉴스레터 생성 중 오류가 발생했습니다.</p>';
        }
    }

    createDailyNewsletterContent() {
        const topics = [
            {
                title: "국내 증시 동향",
                content: "코스피가 전일 대비 0.5% 상승하며 2,450선을 회복했습니다. 대형주 중심의 매수세가 유입되면서 시장 심리가 개선되고 있습니다.",
                tags: ["코스피", "증시", "대형주"]
            },
            {
                title: "금리 정책 전망",
                content: "한국은행이 다음 주 금융통화위원회에서 기준금리 동결을 유지할 것으로 예상됩니다. 물가 안정세와 경제 성장률을 고려한 결정으로 보입니다.",
                tags: ["금리", "한국은행", "통화정책"]
            },
            {
                title: "글로벌 경제 이슈",
                content: "미국 연준의 금리 인하 기대감이 높아지면서 신흥국 자산에 대한 관심이 증가하고 있습니다. 원화 강세 요인으로 작용할 전망입니다.",
                tags: ["연준", "금리", "환율"]
            }
        ];

        return {
            summary: "오늘은 국내외 금리 정책과 증시 동향이 주요 이슈로 부각되고 있습니다. 코스피 상승세와 함께 투자 심리가 개선되고 있으며, 글로벌 금리 정책 변화가 국내 시장에 미치는 영향을 주목해야 할 시점입니다.",
            topics: topics
        };
    }

    async generateWeeklyNewsletter() {
        const weeklySummary = document.getElementById('weeklySummary');
        const marketAnalysis = document.getElementById('marketAnalysis');

        if (!weeklySummary || !marketAnalysis) return;

        showLoading('weeklySummary');

        setTimeout(() => {
            const weeklyContent = this.createWeeklyNewsletterContent();
            
            weeklySummary.innerHTML = `
                <h4>이번 주 시장 동향</h4>
                <p>${weeklyContent.summary}</p>
            `;

            marketAnalysis.innerHTML = `
                <div class="analysis-section">
                    <h5>주식 시장 분석</h5>
                    <p>${weeklyContent.stockAnalysis}</p>
                </div>
                <div class="analysis-section">
                    <h5>채권 시장 분석</h5>
                    <p>${weeklyContent.bondAnalysis}</p>
                </div>
                <div class="analysis-section">
                    <h5>다음 주 전망</h5>
                    <p>${weeklyContent.outlook}</p>
                </div>
            `;
        }, 3000);
    }

    createWeeklyNewsletterContent() {
        return {
            summary: "이번 주 국내 증시는 대형주 중심의 상승세를 보였으며, 외국인 투자자들의 순매수가 시장 상승을 이끌었습니다. 금리 인하 기대감과 함께 성장주에 대한 관심이 높아지고 있습니다.",
            stockAnalysis: "코스피는 주간 1.2% 상승하며 2,450선을 안정적으로 유지했습니다. 특히 반도체와 바이오 업종이 강세를 보였으며, 개별 종목들의 실적 개선 기대감이 반영되었습니다.",
            bondAnalysis: "국고채 10년물 금리는 3.2% 수준에서 등락을 반복했습니다. 미국 장기 금리 하락과 국내 물가 안정세가 채권 시장에 긍정적 영향을 미쳤습니다.",
            outlook: "다음 주에는 주요 기업들의 4분기 실적 발표가 예정되어 있어 개별 종목의 변동성이 클 것으로 예상됩니다. 미국 경제지표 발표에 따른 글로벌 시장 동향도 주의 깊게 살펴봐야 할 포인트입니다."
        };
    }

    async generateCardNews() {
        const cardNewsSlider = document.getElementById('cardNewsSlider');
        if (!cardNewsSlider) return;

        cardNewsSlider.innerHTML = '<div class="loading">카드뉴스를 생성하는 중...</div>';

        setTimeout(() => {
            this.cardNewsData = this.createCardNewsData();
            this.displayCardNews();
        }, 2000);
    }

    createCardNewsData() {
        return [
            {
                title: "투자의 기본 원칙",
                content: "분산투자를 통해 위험을 줄이고, 장기 투자로 복리 효과를 누리세요.",
                background: "#667eea"
            },
            {
                title: "주식 투자 시작하기",
                content: "우량주부터 시작하여 점진적으로 포트폴리오를 확장해보세요.",
                background: "#764ba2"
            },
            {
                title: "예적금 vs 주식",
                content: "안정성을 원한다면 예적금, 높은 수익을 원한다면 주식을 고려하세요.",
                background: "#f093fb"
            },
            {
                title: "투자 위험 관리",
                content: "투자 가능한 여유 자금의 범위 내에서 투자하는 것이 중요합니다.",
                background: "#f5576c"
            },
            {
                title: "경제 뉴스 읽기",
                content: "일간 경제 뉴스를 통해 시장 흐름을 파악하고 투자에 활용하세요.",
                background: "#4facfe"
            }
        ];
    }

    displayCardNews() {
        const cardNewsSlider = document.getElementById('cardNewsSlider');
        const cardIndicator = document.getElementById('cardIndicator');

        if (!cardNewsSlider || this.cardNewsData.length === 0) return;

        const currentCard = this.cardNewsData[this.cardNewsIndex];
        
        cardNewsSlider.innerHTML = `
            <div class="card-news-item" style="background: ${currentCard.background}; color: white; padding: 40px; text-align: center; border-radius: 8px;">
                <h4 style="margin-bottom: 20px; font-size: 24px;">${currentCard.title}</h4>
                <p style="font-size: 16px; line-height: 1.6;">${currentCard.content}</p>
            </div>
        `;

        if (cardIndicator) {
            cardIndicator.textContent = `${this.cardNewsIndex + 1} / ${this.cardNewsData.length}`;
        }
    }

    async loadEconomicNews() {
        const economicNewsList = document.getElementById('economicNewsList');
        if (!economicNewsList) return;

        showLoading('economicNewsList');

        try {
            // Try to load real news
            let query = '경제';
            switch (this.newsCategory) {
                case 'stock':
                    query = '주식 OR 증시';
                    break;
                case 'crypto':
                    query = '비트코인 OR 암호화폐';
                    break;
                case 'forex':
                    query = '환율 OR 달러';
                    break;
                case 'economy':
                    query = '경제정책 OR 금리';
                    break;
            }

            const response = await APIHelper.fetchWithTimeout(
                `${API_CONFIG.NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&language=ko&pageSize=10&page=${this.currentNewsPage}&apiKey=${API_CONFIG.NEWS_API_KEY}`
            );

            if (response.ok) {
                const data = await response.json();
                this.displayEconomicNews(data.articles || []);
            } else {
                throw new Error('News API failed');
            }
        } catch (error) {
            console.error('Error loading economic news:', error);
            this.displayFallbackEconomicNews();
        }
    }

    displayEconomicNews(articles) {
        const economicNewsList = document.getElementById('economicNewsList');
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (!economicNewsList) return;

        if (articles.length === 0) {
            this.displayFallbackEconomicNews();
            return;
        }

        const newsHTML = articles.map(article => `
            <div class="news-item">
                <div class="news-content">
                    <h4>${article.title}</h4>
                    <p>${article.description || '내용을 불러올 수 없습니다.'}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source?.name || '출처 미상'}</span>
                        <span class="news-time">${new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                </div>
            </div>
        `).join('');

        if (this.currentNewsPage === 1) {
            economicNewsList.innerHTML = newsHTML;
        } else {
            economicNewsList.innerHTML += newsHTML;
        }

        if (loadMoreBtn) {
            loadMoreBtn.style.display = articles.length >= 10 ? 'block' : 'none';
        }
    }

    displayFallbackEconomicNews() {
        const economicNewsList = document.getElementById('economicNewsList');
        if (!economicNewsList) return;

        const fallbackNews = [
            {
                title: "한국은행, 기준금리 3.50% 동결",
                description: "한국은행이 물가 안정과 경제 성장률을 고려하여 기준금리를 현행 수준에서 유지하기로 결정했습니다.",
                source: "한국경제",
                date: "2024-01-15"
            },
            {
                title: "코스피, 외국인 순매수에 상승 마감",
                description: "외국인 투자자들의 순매수세가 이어지면서 코스피가 상승 마감했습니다.",
                source: "매일경제",
                date: "2024-01-15"
            },
            {
                title: "비트코인, 4만 3천 달러 돌파",
                description: "주요 암호화폐들이 강세를 보이며 비트코인이 4만 3천 달러를 돌파했습니다.",
                source: "블록체인뉴스",
                date: "2024-01-15"
            }
        ];

        const newsHTML = fallbackNews.map(news => `
            <div class="news-item">
                <div class="news-content">
                    <h4>${news.title}</h4>
                    <p>${news.description}</p>
                    <div class="news-meta">
                        <span class="news-source">${news.source}</span>
                        <span class="news-time">${news.date}</span>
                    </div>
                </div>
            </div>
        `).join('');

        economicNewsList.innerHTML = newsHTML;
    }
}

// Global functions for button actions
function loadTodayTerm() {
    if (window.newsPageManager) {
        window.newsPageManager.loadTodayTerm();
    }
}

function generateDailyNewsletter() {
    if (window.newsPageManager) {
        window.newsPageManager.generateDailyNewsletter();
    }
}

function generateWeeklyNewsletter() {
    if (window.newsPageManager) {
        window.newsPageManager.generateWeeklyNewsletter();
    }
}

function generateCardNews() {
    if (window.newsPageManager) {
        window.newsPageManager.generateCardNews();
    }
}

function previousCard() {
    if (window.newsPageManager) {
        window.newsPageManager.cardNewsIndex = Math.max(0, window.newsPageManager.cardNewsIndex - 1);
        window.newsPageManager.displayCardNews();
    }
}

function nextCard() {
    if (window.newsPageManager) {
        const maxIndex = window.newsPageManager.cardNewsData.length - 1;
        window.newsPageManager.cardNewsIndex = Math.min(maxIndex, window.newsPageManager.cardNewsIndex + 1);
        window.newsPageManager.displayCardNews();
    }
}

function filterNews() {
    if (window.newsPageManager) {
        window.newsPageManager.currentNewsPage = 1;
        window.newsPageManager.loadEconomicNews();
    }
}

function loadMoreNews() {
    if (window.newsPageManager) {
        window.newsPageManager.currentNewsPage++;
        window.newsPageManager.loadEconomicNews();
    }
}

// Initialize news page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.newsPageManager = new NewsPageManager();
});