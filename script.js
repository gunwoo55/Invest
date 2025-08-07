// 공통 JavaScript 기능들

// 로컬스토리지 헬퍼 함수들
const Storage = {
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key, defaultValue = null) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    },
    remove: (key) => localStorage.removeItem(key)
};

// API 헬퍼 함수들
const API = {
    // 뉴스 API (NewsAPI 사용 예정)
    async getNews(category = 'business', country = 'kr') {
        try {
            // 실제 NewsAPI 호출 시도 (API 키 없이는 fallback 사용)
            const apiKey = 'demo'; // 실제 API 키로 교체 필요
            if (apiKey !== 'demo') {
                const response = await fetch(`https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`);
                if (response.ok) {
                    const data = await response.json();
                    return data;
                }
            }
            // API 키가 없거나 요청 실패 시 향상된 mock 데이터 사용
            return this.getEnhancedMockNews();
        } catch (error) {
            console.error('뉴스 데이터 로드 실패:', error);
            return this.getEnhancedMockNews();
        }
    },

    // 향상된 임시 뉴스 데이터 (AI 업데이트 시뮬레이션)
    getEnhancedMockNews() {
        const newsTemplates = [
            {
                title: "한국 증시, 외국인 매수세에 상승 마감",
                description: "코스피가 외국인의 순매수에 힘입어 상승 마감했습니다. 기술주와 바이오주를 중심으로 강세가 이어졌습니다.",
                url: "#",
                urlToImage: "https://via.placeholder.com/300x200?text=KOSPI+UP",
                publishedAt: new Date().toISOString(),
                source: { name: "경제신문" }
            },
            {
                title: "중앙은행, 기준금리 동결 결정",
                description: "한국은행이 기준금리를 현 수준에서 동결하기로 결정했습니다. 인플레이션 압력과 경제성장률을 종합적으로 고려한 결과입니다.",
                url: "#",
                urlToImage: "https://via.placeholder.com/300x200?text=BOK+Rate",
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                source: { name: "금융일보" }
            },
            {
                title: "암호화폐 시장 급등, 비트코인 신고가 경신",
                description: "비트코인이 새로운 최고가를 기록하며 암호화폐 시장 전체가 상승했습니다. 기관투자자들의 관심이 증가하고 있습니다.",
                url: "#",
                urlToImage: "https://via.placeholder.com/300x200?text=Bitcoin+High",
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                source: { name: "디지털경제" }
            },
            {
                title: "국내 주요 기업 3분기 실적 발표",
                description: "삼성전자, SK하이닉스 등 주요 기업들이 양호한 3분기 실적을 발표했습니다. 반도체 업황 회복이 주요 원인으로 분석됩니다.",
                url: "#",
                urlToImage: "https://via.placeholder.com/300x200?text=Q3+Results",
                publishedAt: new Date(Date.now() - 10800000).toISOString(),
                source: { name: "기업뉴스" }
            },
            {
                title: "부동산 시장 안정화 정책 발표",
                description: "정부가 부동산 시장 안정화를 위한 추가 정책을 발표했습니다. 공급 확대와 투기 억제에 중점을 두고 있습니다.",
                url: "#",
                urlToImage: "https://via.placeholder.com/300x200?text=Real+Estate",
                publishedAt: new Date(Date.now() - 14400000).toISOString(),
                source: { name: "부동산뉴스" }
            },
            {
                title: "글로벌 인플레이션 둔화 조짐",
                description: "주요국의 인플레이션이 둔화되고 있어 통화정책 변화에 대한 관심이 높아지고 있습니다.",
                url: "#",
                urlToImage: "https://via.placeholder.com/300x200?text=Global+Inflation",
                publishedAt: new Date(Date.now() - 18000000).toISOString(),
                source: { name: "글로벌경제" }
            }
        ];

        // 랜덤하게 뉴스 선택하여 AI 업데이트 시뮬레이션
        const shuffled = newsTemplates.sort(() => 0.5 - Math.random());
        return {
            articles: shuffled.slice(0, 6),
            status: 'ok',
            totalResults: shuffled.length
        };
    },

    // 기존 임시 뉴스 데이터 (호환성 유지)
    getMockNews() {
        return this.getEnhancedMockNews();
    },

    // 금융 데이터 API (Alpha Vantage 등 사용 예정)
    async getStockPrice(symbol) {
        try {
            // 실제 API 호출 시도 (API 키 없이는 fallback 사용)
            const apiKey = 'demo'; // 실제 API 키로 교체 필요
            if (apiKey !== 'demo') {
                const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data['Global Quote']) {
                        const quote = data['Global Quote'];
                        return {
                            price: parseFloat(quote['05. price']),
                            change: parseFloat(quote['09. change']),
                            changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
                        };
                    }
                }
            }
            // API 키가 없거나 요청 실패 시 향상된 mock 데이터 사용
            return this.getRealtimeMockStockPrice(symbol);
        } catch (error) {
            console.error('주식 데이터 로드 실패:', error);
            return this.getRealtimeMockStockPrice(symbol);
        }
    },

    // 실시간 주식 가격 시뮬레이션
    getRealtimeMockStockPrice(symbol) {
        const basePrices = {
            'AAPL': 150.25,
            'GOOGL': 2650.80,
            'TSLA': 245.60,
            'MSFT': 310.45,
            'AMZN': 135.75
        };
        
        const basePrice = basePrices[symbol] || 100;
        // 실시간 가격 변동 시뮬레이션 (-2% ~ +2%)
        const variation = (Math.random() - 0.5) * 0.04;
        const currentPrice = basePrice * (1 + variation);
        const change = currentPrice - basePrice;
        const changePercent = (change / basePrice) * 100;
        
        return {
            price: currentPrice,
            change: change,
            changePercent: changePercent
        };
    },

    // 기존 임시 주식 데이터 (호환성 유지)
    getMockStockPrice(symbol) {
        return this.getRealtimeMockStockPrice(symbol);
    },

    // 환율 정보
    async getExchangeRate(from = 'USD', to = 'KRW') {
        try {
            // 실제 환율 API 호출 시도
            const apiKey = 'demo'; // 실제 API 키로 교체 필요
            if (apiKey !== 'demo') {
                const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`);
                if (response.ok) {
                    const data = await response.json();
                    return { 
                        rate: data.conversion_rate, 
                        change: (Math.random() - 0.5) * 2 // 임시 변동률
                    };
                }
            }
            // API 키가 없거나 요청 실패 시 시뮬레이션 데이터 사용
            return this.getRealtimeExchangeRate();
        } catch (error) {
            console.error('환율 데이터 로드 실패:', error);
            return this.getRealtimeExchangeRate();
        }
    },

    // 실시간 환율 시뮬레이션
    getRealtimeExchangeRate() {
        const baseRate = 1328.50;
        const variation = (Math.random() - 0.5) * 0.02; // -1% ~ +1% 변동
        const currentRate = baseRate * (1 + variation);
        const change = ((currentRate - baseRate) / baseRate) * 100;
        
        return { 
            rate: currentRate, 
            change: change 
        };
    },

    // AI 기반 콘텐츠 업데이트 시뮬레이션
    async updateFinancialTerms() {
        // 실제로는 AI API를 통해 새로운 금융 용어나 설명을 생성
        const updateTime = Storage.get('lastTermUpdate', 0);
        const now = Date.now();
        
        // 1시간마다 업데이트 체크
        if (now - updateTime > 3600000) {
            console.log('AI 금융 용어 업데이트 시뮬레이션');
            Storage.set('lastTermUpdate', now);
            // 실제 구현에서는 새로운 용어 추가 또는 기존 용어 업데이트
            return true;
        }
        return false;
    },

    // 뉴스 요약 AI 시뮬레이션
    async generateNewsSummary(articles) {
        // 실제로는 AI를 통해 뉴스 요약 생성
        const summary = {
            mainTrends: [
                "국내 증시는 전반적으로 상승세를 보이고 있습니다.",
                "글로벌 경제 불확실성에도 불구하고 기술주가 강세입니다.",
                "중앙은행의 통화정책 변화에 대한 관심이 높아지고 있습니다."
            ],
            keyPoints: [
                "외국인 투자자들의 순매수세가 지속되고 있습니다.",
                "반도체 업종의 실적 개선이 두드러집니다.",
                "부동산 시장 안정화 정책이 논의되고 있습니다."
            ],
            outlook: "단기적으로는 긍정적인 흐름이 지속될 것으로 예상되지만, 글로벌 경제 동향을 주의 깊게 지켜봐야 합니다."
        };
        
        return summary;
    }
};

// 포트폴리오 관리 클래스
class Portfolio {
    constructor() {
        this.data = Storage.get('portfolio', {
            totalAssets: 10000000, // 초기 자금 1천만원
            holdings: {},
            transactions: [],
            ledger: []
        });
    }

    // 포트폴리오 저장
    save() {
        Storage.set('portfolio', this.data);
    }

    // 주식 매수
    buyStock(symbol, quantity, price) {
        const totalCost = quantity * price;
        
        if (this.data.totalAssets < totalCost) {
            throw new Error('잔액이 부족합니다.');
        }

        // 보유 주식 업데이트
        if (!this.data.holdings[symbol]) {
            this.data.holdings[symbol] = { quantity: 0, avgPrice: 0 };
        }

        const holding = this.data.holdings[symbol];
        const newTotalQuantity = holding.quantity + quantity;
        const newAvgPrice = ((holding.quantity * holding.avgPrice) + totalCost) / newTotalQuantity;

        holding.quantity = newTotalQuantity;
        holding.avgPrice = newAvgPrice;

        // 총 자산 업데이트
        this.data.totalAssets -= totalCost;

        // 거래 내역 추가
        this.data.transactions.push({
            date: new Date().toISOString(),
            type: 'buy',
            symbol,
            quantity,
            price,
            total: totalCost
        });

        this.save();
        return true;
    }

    // 주식 매도
    sellStock(symbol, quantity, price) {
        if (!this.data.holdings[symbol] || this.data.holdings[symbol].quantity < quantity) {
            throw new Error('보유 수량이 부족합니다.');
        }

        const totalRevenue = quantity * price;
        
        // 보유 주식 업데이트
        this.data.holdings[symbol].quantity -= quantity;
        
        if (this.data.holdings[symbol].quantity === 0) {
            delete this.data.holdings[symbol];
        }

        // 총 자산 업데이트
        this.data.totalAssets += totalRevenue;

        // 거래 내역 추가
        this.data.transactions.push({
            date: new Date().toISOString(),
            type: 'sell',
            symbol,
            quantity,
            price,
            total: totalRevenue
        });

        this.save();
        return true;
    }

    // 예적금 추가
    addSavings(amount, type, interestRate, term) {
        if (this.data.totalAssets < amount) {
            throw new Error('잔액이 부족합니다.');
        }
        
        this.data.totalAssets -= amount;
        
        const maturityDate = new Date(Date.now() + (term * 30 * 24 * 60 * 60 * 1000));
        const expectedReturn = amount * (1 + (interestRate / 100) * (term / 12));
        
        const savingsRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: 'savings',
            amount,
            savingsType: type,
            interestRate,
            term,
            maturityDate: maturityDate.toISOString(),
            expectedReturn
        };

        this.data.transactions.push(savingsRecord);

        // 가계부에 자동 기록
        this.addToLedger({
            date: new Date().toISOString(),
            category: '금융상품',
            description: `${type} 가입 (${term}개월, 연 ${interestRate}%)`,
            amount: -amount,
            type: 'expense',
            relatedSavingsId: savingsRecord.id
        });

        this.save();
        return savingsRecord;
    }

    // 가계부 항목 추가
    addToLedger(entry) {
        this.data.ledger.push({
            id: Date.now(),
            ...entry
        });
        this.save();
    }

    // 가계부 항목 수정
    updateLedgerEntry(id, updates) {
        const index = this.data.ledger.findIndex(entry => entry.id === id);
        if (index !== -1) {
            this.data.ledger[index] = { ...this.data.ledger[index], ...updates };
            this.save();
            return true;
        }
        return false;
    }

    // 가계부 항목 삭제
    deleteLedgerEntry(id) {
        this.data.ledger = this.data.ledger.filter(entry => entry.id !== id);
        this.save();
    }

    // 만기 예적금 체크 및 자동 만기 처리
    checkMaturedSavings() {
        const now = new Date();
        let maturedSavings = [];
        
        this.data.transactions.forEach(transaction => {
            if (transaction.type === 'savings' && !transaction.matured) {
                const maturityDate = new Date(transaction.maturityDate);
                if (maturityDate <= now) {
                    // 만기 처리
                    transaction.matured = true;
                    const returnAmount = transaction.expectedReturn || transaction.amount;
                    this.data.totalAssets += returnAmount;
                    
                    // 가계부에 만기 수익 기록
                    this.addToLedger({
                        date: new Date().toISOString(),
                        category: '금융상품',
                        description: `${transaction.savingsType} 만기 (원금: ${formatCurrency(transaction.amount)})`,
                        amount: returnAmount,
                        type: 'income',
                        relatedSavingsId: transaction.id
                    });
                    
                    maturedSavings.push(transaction);
                }
            }
        });
        
        if (maturedSavings.length > 0) {
            this.save();
        }
        
        return maturedSavings;
    }

    // 현재 포트폴리오 가치 계산 (실제 가격 반영)
    async getCurrentValue() {
        let totalValue = this.data.totalAssets;
        
        for (const [symbol, holding] of Object.entries(this.data.holdings)) {
            const currentPrice = await API.getStockPrice(symbol);
            totalValue += holding.quantity * currentPrice.price;
        }
        
        return totalValue;
    }

    // 수익률 계산
    async getReturn() {
        const currentValue = await this.getCurrentValue();
        const initialInvestment = 10000000; // 초기 투자금
        const returnAmount = currentValue - initialInvestment;
        const returnPercent = (returnAmount / initialInvestment) * 100;
        
        return { amount: returnAmount, percent: returnPercent };
    }
}

// 날짜 포맷팅 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 숫자 포맷팅 함수
function formatNumber(number) {
    return number.toLocaleString('ko-KR');
}

// 통화 포맷팅 함수
function formatCurrency(amount) {
    return `₩${formatNumber(Math.round(amount))}`;
}

// 퍼센트 포맷팅 함수
function formatPercent(percent) {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
}

// 탭 네비게이션 기능
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // 모든 탭 버튼과 콘텐츠에서 active 클래스 제거
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 클릭된 탭 버튼과 해당 콘텐츠에 active 클래스 추가
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// 로딩 상태 표시
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>데이터를 불러오는 중...</p>
        </div>
    `;
}

// 에러 메시지 표시
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="text-center" style="color: #e74c3c; padding: 2rem;">
            <p>⚠️ ${message}</p>
        </div>
    `;
}

// 성공 메시지 표시
function showSuccess(message) {
    // 간단한 성공 메시지 표시 (실제로는 토스트 메시지 등 구현)
    alert(`✅ ${message}`);
}

// 전역 포트폴리오 인스턴스
let portfolio = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    portfolio = new Portfolio();
    
    // 탭 기능 초기화 (탭이 있는 페이지에서)
    if (document.querySelector('.tab-button')) {
        initTabs();
    }
    
    // 네비게이션 active 상태 설정
    setActiveNavigation();
});

// 네비게이션 active 상태 설정
function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}