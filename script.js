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
            // 실제 API 키가 필요하므로 임시 데이터 반환
            return this.getMockNews();
        } catch (error) {
            console.error('뉴스 데이터 로드 실패:', error);
            return this.getMockNews();
        }
    },

    // 임시 뉴스 데이터
    getMockNews() {
        return {
            articles: [
                {
                    title: "한국 증시, 외국인 매수세에 상승 마감",
                    description: "코스피가 외국인의 순매수에 힘입어 상승 마감했습니다.",
                    url: "#",
                    urlToImage: "https://via.placeholder.com/300x200?text=News1",
                    publishedAt: new Date().toISOString(),
                    source: { name: "경제신문" }
                },
                {
                    title: "중앙은행, 기준금리 동결 결정",
                    description: "한국은행이 기준금리를 현 수준에서 동결하기로 결정했습니다.",
                    url: "#",
                    urlToImage: "https://via.placeholder.com/300x200?text=News2",
                    publishedAt: new Date(Date.now() - 3600000).toISOString(),
                    source: { name: "금융일보" }
                },
                {
                    title: "암호화폐 시장 급등, 비트코인 신고가 경신",
                    description: "비트코인이 새로운 최고가를 기록하며 암호화폐 시장 전체가 상승했습니다.",
                    url: "#",
                    urlToImage: "https://via.placeholder.com/300x200?text=News3",
                    publishedAt: new Date(Date.now() - 7200000).toISOString(),
                    source: { name: "디지털경제" }
                }
            ]
        };
    },

    // 금융 데이터 API (Alpha Vantage 등 사용 예정)
    async getStockPrice(symbol) {
        try {
            // 실제 API 호출 대신 임시 데이터 반환
            return this.getMockStockPrice(symbol);
        } catch (error) {
            console.error('주식 데이터 로드 실패:', error);
            return this.getMockStockPrice(symbol);
        }
    },

    // 임시 주식 데이터
    getMockStockPrice(symbol) {
        const mockPrices = {
            'AAPL': { price: 150.25, change: 2.15, changePercent: 1.45 },
            'GOOGL': { price: 2650.80, change: -15.30, changePercent: -0.57 },
            'TSLA': { price: 245.60, change: 8.90, changePercent: 3.76 },
            'MSFT': { price: 310.45, change: 1.20, changePercent: 0.39 },
            'AMZN': { price: 135.75, change: -2.85, changePercent: -2.06 }
        };
        
        return mockPrices[symbol] || { price: 100, change: 0, changePercent: 0 };
    },

    // 환율 정보
    async getExchangeRate(from = 'USD', to = 'KRW') {
        try {
            // 실제 환율 API 호출 대신 임시 데이터 반환
            return { rate: 1328.50, change: 0.78 };
        } catch (error) {
            console.error('환율 데이터 로드 실패:', error);
            return { rate: 1328.50, change: 0 };
        }
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
        this.data.totalAssets -= amount;
        
        const savingsRecord = {
            date: new Date().toISOString(),
            type: 'savings',
            amount,
            savingsType: type,
            interestRate,
            term,
            maturityDate: new Date(Date.now() + (term * 30 * 24 * 60 * 60 * 1000)).toISOString()
        };

        this.data.transactions.push(savingsRecord);

        // 가계부에 자동 기록
        this.addToLedger({
            date: new Date().toISOString(),
            category: '금융상품',
            description: `${type} 가입`,
            amount: -amount,
            type: 'expense'
        });

        this.save();
        return true;
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