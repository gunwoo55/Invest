// Investment page (a5.html) JavaScript

class InvestmentPageManager {
    constructor() {
        this.currentStockCategory = 'popular';
        this.currentBondCategory = 'government';
        this.cryptoData = [];
        this.stockData = [];
        this.portfolioData = [];
        this.transactions = [];
        
        this.initializePage();
        this.loadInvestmentData();
        this.loadPortfolioData();
        this.loadAccountingData();
        this.setupURLParams();
    }

    initializePage() {
        TabManager.initTabs('.tab-btn', '.tab-content');
        this.setupEventListeners();
        this.updateInvestorGrade();
    }

    setupURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        
        if (tab) {
            const tabButton = document.querySelector(`[data-tab="${tab}"]`);
            const tabContent = document.getElementById(tab);
            
            if (tabButton && tabContent) {
                // Remove active from all tabs
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Activate target tab
                tabButton.classList.add('active');
                tabContent.classList.add('active');
            }
        }
    }

    setupEventListeners() {
        // Stock category buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                if (category) {
                    this.switchCategory(category, e.target);
                }
            });
        });

        // Transaction form
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTransaction();
            });
        }
    }

    switchCategory(category, button) {
        // Update active category button
        const categoryContainer = button.parentElement;
        categoryContainer.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Load data based on category
        if (categoryContainer.classList.contains('stock-categories')) {
            this.currentStockCategory = category;
            this.loadStockData();
        } else if (categoryContainer.classList.contains('bond-categories')) {
            this.currentBondCategory = category;
            this.loadBondData();
        }
    }

    updateInvestorGrade() {
        const portfolio = StorageManager.getItem('userPortfolio');
        if (!portfolio) return;

        const totalValue = portfolio.currentValue;
        let grade = '브론즈';
        let progress = 0;

        if (totalValue >= 100000000) { // 1억 이상
            grade = '다이아몬드';
            progress = 100;
        } else if (totalValue >= 50000000) { // 5천만 이상
            grade = '플래티넘';
            progress = (totalValue - 50000000) / 50000000 * 100;
        } else if (totalValue >= 20000000) { // 2천만 이상
            grade = '골드';
            progress = (totalValue - 20000000) / 30000000 * 100;
        } else if (totalValue >= 10000000) { // 1천만 이상
            grade = '실버';
            progress = (totalValue - 10000000) / 10000000 * 100;
        } else {
            grade = '브론즈';
            progress = totalValue / 10000000 * 100;
        }

        const gradeElement = document.getElementById('userGrade');
        const progressFill = document.querySelector('.progress-fill');

        if (gradeElement) gradeElement.textContent = grade;
        if (progressFill) progressFill.style.width = `${Math.min(progress, 100)}%`;
    }

    async loadInvestmentData() {
        await Promise.all([
            this.loadStockData(),
            this.loadCryptoData(),
            this.loadBondData(),
            this.loadSavingsData()
        ]);
    }

    async loadStockData() {
        const stockList = document.getElementById('stockList');
        if (!stockList) return;

        showLoading('stockList');

        try {
            const stockData = await this.fetchStockData();
            this.displayStockData(stockData);
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.displayFallbackStockData();
        }
    }

    async fetchStockData() {
        // Try multiple APIs for stock data
        const symbols = this.getSymbolsByCategory(this.currentStockCategory);
        const stockPromises = symbols.map(symbol => this.fetchSingleStock(symbol));
        
        const results = await Promise.allSettled(stockPromises);
        return results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value)
            .filter(data => data !== null);
    }

    getSymbolsByCategory(category) {
        const symbolMaps = {
            popular: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
            kospi: ['005930.KS', '000660.KS', '035420.KS', '051910.KS'],
            kosdaq: ['035720.KQ', '036570.KQ', '263750.KQ'],
            us: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']
        };
        return symbolMaps[category] || symbolMaps.popular;
    }

    async fetchSingleStock(symbol) {
        try {
            // Try Yahoo Finance API first
            const response = await APIHelper.fetchWithTimeout(
                `${API_CONFIG.YAHOO_FINANCE_PROXY}/${symbol}?interval=1d&range=1d`
            );

            if (response.ok) {
                const data = await response.json();
                return this.parseYahooFinanceData(data, symbol);
            }
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
        }

        // Return fallback data
        return this.getFallbackStockData(symbol);
    }

    parseYahooFinanceData(data, symbol) {
        try {
            const result = data.chart?.result?.[0];
            if (!result) return null;

            const meta = result.meta;
            const currentPrice = meta.regularMarketPrice;
            const previousClose = meta.previousClose;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;

            return {
                symbol: symbol,
                name: meta.shortName || symbol,
                price: currentPrice,
                change: change,
                changePercent: changePercent,
                volume: meta.regularMarketVolume || 0
            };
        } catch (error) {
            console.error('Error parsing Yahoo Finance data:', error);
            return null;
        }
    }

    getFallbackStockData(symbol) {
        const fallbackData = {
            'AAPL': { name: 'Apple Inc.', price: 150.25, change: 2.15, changePercent: 1.45 },
            'GOOGL': { name: 'Alphabet Inc.', price: 2750.80, change: -15.20, changePercent: -0.55 },
            'MSFT': { name: 'Microsoft Corp.', price: 310.50, change: 5.75, changePercent: 1.89 },
            'TSLA': { name: 'Tesla Inc.', price: 245.30, change: -8.20, changePercent: -3.23 },
            '005930.KS': { name: '삼성전자', price: 75000, change: 1000, changePercent: 1.35 }
        };

        const data = fallbackData[symbol] || { name: symbol, price: 100, change: 0, changePercent: 0 };
        return { symbol, ...data, volume: 1000000 };
    }

    displayStockData(stockData) {
        const stockList = document.getElementById('stockList');
        if (!stockList) return;

        if (stockData.length === 0) {
            stockList.innerHTML = '<div class="loading">주식 데이터를 불러올 수 없습니다.</div>';
            return;
        }

        const stockHTML = stockData.map(stock => `
            <div class="stock-item" onclick="investInStock('${stock.symbol}', ${stock.price})">
                <div class="stock-info">
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-symbol">${stock.symbol}</div>
                </div>
                <div class="stock-price">
                    <div class="current-price">${APIHelper.formatCurrency(stock.price, stock.symbol.includes('.KS') ? 'KRW' : 'USD')}</div>
                    <div class="price-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                        ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${APIHelper.formatPercentage(stock.changePercent)})
                    </div>
                </div>
            </div>
        `).join('');

        stockList.innerHTML = stockHTML;
    }

    displayFallbackStockData() {
        const fallbackData = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.15, changePercent: 1.45 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: -15.20, changePercent: -0.55 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 310.50, change: 5.75, changePercent: 1.89 }
        ];
        this.displayStockData(fallbackData);
    }

    async loadCryptoData() {
        const cryptoList = document.getElementById('cryptoList');
        const totalMarketCap = document.getElementById('totalMarketCap');
        const totalVolume = document.getElementById('totalVolume');

        if (!cryptoList) return;

        showLoading('cryptoList');

        try {
            const response = await APIHelper.fetchWithTimeout(
                `${API_CONFIG.COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
            );

            if (response.ok) {
                const data = await response.json();
                this.displayCryptoData(data);
                
                // Update market summary
                const totalMcap = data.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
                const totalVol = data.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
                
                if (totalMarketCap) totalMarketCap.textContent = APIHelper.formatCurrency(totalMcap / 1e12, 'USD') + 'T';
                if (totalVolume) totalVolume.textContent = APIHelper.formatCurrency(totalVol / 1e9, 'USD') + 'B';
            } else {
                throw new Error('CoinGecko API failed');
            }
        } catch (error) {
            console.error('Error loading crypto data:', error);
            this.displayFallbackCryptoData();
        }
    }

    displayCryptoData(cryptoData) {
        const cryptoList = document.getElementById('cryptoList');
        if (!cryptoList) return;

        const cryptoHTML = cryptoData.map(crypto => `
            <div class="crypto-item" onclick="investInCrypto('${crypto.id}', ${crypto.current_price})">
                <div class="crypto-info">
                    <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon" width="32" height="32">
                    <div>
                        <div class="crypto-name">${crypto.name}</div>
                        <div class="crypto-symbol">${crypto.symbol.toUpperCase()}</div>
                    </div>
                </div>
                <div class="crypto-price">
                    <div class="current-price">${APIHelper.formatCurrency(crypto.current_price, 'USD')}</div>
                    <div class="price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${APIHelper.formatPercentage(crypto.price_change_percentage_24h || 0)}
                    </div>
                </div>
            </div>
        `).join('');

        cryptoList.innerHTML = cryptoHTML;
    }

    displayFallbackCryptoData() {
        const fallbackData = [
            { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 43250, price_change_percentage_24h: 2.5, image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
            { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 2650, price_change_percentage_24h: -1.2, image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' }
        ];
        this.displayCryptoData(fallbackData);
    }

    async loadBondData() {
        const bondList = document.getElementById('bondList');
        if (!bondList) return;

        showLoading('bondList');

        // Simulate bond data loading
        setTimeout(() => {
            this.displayBondData(this.getFallbackBondData());
        }, 1000);
    }

    getFallbackBondData() {
        const bondData = {
            government: [
                { name: '국고채권 10년', yield: 3.2, rating: 'AAA', maturity: '2034-01-15' },
                { name: '국고채권 5년', yield: 3.0, rating: 'AAA', maturity: '2029-01-15' },
                { name: '국고채권 3년', yield: 2.8, rating: 'AAA', maturity: '2027-01-15' }
            ],
            corporate: [
                { name: '삼성전자 회사채', yield: 3.5, rating: 'AA+', maturity: '2026-12-15' },
                { name: 'LG화학 회사채', yield: 3.8, rating: 'AA', maturity: '2027-06-15' },
                { name: '현대자동차 회사채', yield: 4.0, rating: 'AA-', maturity: '2025-09-15' }
            ],
            municipal: [
                { name: '서울시 지방채', yield: 3.3, rating: 'AA+', maturity: '2028-03-15' },
                { name: '부산시 지방채', yield: 3.4, rating: 'AA', maturity: '2026-11-15' }
            ]
        };

        return bondData[this.currentBondCategory] || bondData.government;
    }

    displayBondData(bondData) {
        const bondList = document.getElementById('bondList');
        if (!bondList) return;

        const bondHTML = bondData.map(bond => `
            <div class="bond-item" onclick="investInBond('${bond.name}', ${bond.yield})">
                <div class="bond-info">
                    <div class="bond-name">${bond.name}</div>
                    <div class="bond-details">
                        <span class="bond-rating">${bond.rating}</span>
                        <span class="bond-maturity">만기: ${bond.maturity}</span>
                    </div>
                </div>
                <div class="bond-yield">
                    <div class="yield-value">${bond.yield.toFixed(2)}%</div>
                    <div class="yield-label">연 수익률</div>
                </div>
            </div>
        `).join('');

        bondList.innerHTML = bondHTML;
    }

    async loadSavingsData() {
        const savingsProducts = document.getElementById('savingsProducts');
        if (!savingsProducts) return;

        showLoading('savingsProducts');

        setTimeout(() => {
            this.displaySavingsData();
        }, 1000);
    }

    displaySavingsData() {
        const savingsProducts = document.getElementById('savingsProducts');
        if (!savingsProducts) return;

        const products = [
            { bank: '국민은행', name: 'KB Star 정기예금', rate: 3.5, period: 12, type: '정기예금' },
            { bank: '신한은행', name: 'Sh 정기적금', rate: 3.8, period: 24, type: '정기적금' },
            { bank: '우리은행', name: '우리 정기예금', rate: 3.3, period: 6, type: '정기예금' },
            { bank: '하나은행', name: '하나 적금', rate: 4.0, period: 36, type: '정기적금' }
        ];

        const productsHTML = products.map(product => `
            <div class="savings-product" onclick="investInSavings('${product.name}', ${product.rate}, ${product.period})">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-details">
                        <span class="bank-name">${product.bank}</span>
                        <span class="product-type">${product.type}</span>
                    </div>
                </div>
                <div class="product-rate">
                    <div class="rate-value">${product.rate.toFixed(2)}%</div>
                    <div class="rate-period">${product.period}개월</div>
                </div>
            </div>
        `).join('');

        savingsProducts.innerHTML = productsHTML;
    }

    loadPortfolioData() {
        const portfolio = StorageManager.getItem('userPortfolio');
        if (!portfolio) return;

        this.updatePortfolioStats(portfolio);
        this.displayHoldings(portfolio.holdings || []);
        this.drawPortfolioChart(portfolio);
    }

    updatePortfolioStats(portfolio) {
        const totalInvestment = document.getElementById('totalInvestment');
        const currentValue = document.getElementById('currentValue');
        const portfolioReturn = document.getElementById('portfolioReturn');

        if (totalInvestment) totalInvestment.textContent = APIHelper.formatCurrency(portfolio.totalInvestment);
        if (currentValue) currentValue.textContent = APIHelper.formatCurrency(portfolio.currentValue);
        
        if (portfolioReturn) {
            const returnAmount = portfolio.currentValue - portfolio.totalInvestment;
            const returnPercent = (returnAmount / portfolio.totalInvestment) * 100;
            portfolioReturn.textContent = APIHelper.formatPercentage(returnPercent);
            portfolioReturn.className = `stat-value ${returnAmount >= 0 ? 'positive' : 'negative'}`;
        }
    }

    displayHoldings(holdings) {
        const holdingsList = document.getElementById('holdingsList');
        if (!holdingsList) return;

        if (holdings.length === 0) {
            holdingsList.innerHTML = '<div class="empty-portfolio">보유 종목이 없습니다.</div>';
            return;
        }

        const holdingsHTML = holdings.map(holding => {
            const currentValue = holding.quantity * holding.averagePrice; // Simplified calculation
            return `
                <div class="holding-item">
                    <div class="holding-info">
                        <div class="holding-symbol">${holding.symbol}</div>
                        <div class="holding-type">${this.getHoldingTypeLabel(holding.type)}</div>
                    </div>
                    <div class="holding-stats">
                        <div class="holding-quantity">${holding.quantity}주</div>
                        <div class="holding-value">${APIHelper.formatCurrency(currentValue)}</div>
                    </div>
                </div>
            `;
        }).join('');

        holdingsList.innerHTML = holdingsHTML;
    }

    getHoldingTypeLabel(type) {
        const labels = {
            stock: '주식',
            crypto: '암호화폐',
            bond: '채권',
            savings: '예적금'
        };
        return labels[type] || type;
    }

    drawPortfolioChart(portfolio) {
        const canvas = document.getElementById('portfolioChart');
        if (!canvas || !canvas.getContext) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = 200;

        // Simple line chart simulation
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;

        // Draw sample portfolio value over time
        ctx.beginPath();
        const points = [
            { x: 0, y: height * 0.7 },
            { x: width * 0.2, y: height * 0.6 },
            { x: width * 0.4, y: height * 0.5 },
            { x: width * 0.6, y: height * 0.4 },
            { x: width * 0.8, y: height * 0.3 },
            { x: width, y: height * 0.25 }
        ];

        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();
    }

    loadAccountingData() {
        const transactions = StorageManager.getItem('userTransactions', []);
        this.transactions = transactions;
        
        this.updateAccountingSummary();
        this.displayTransactionList(transactions);
    }

    updateAccountingSummary() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        });

        const income = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const profit = income - expense;

        const monthlyIncome = document.getElementById('monthlyIncome');
        const monthlyExpense = document.getElementById('monthlyExpense');
        const monthlyProfit = document.getElementById('monthlyProfit');

        if (monthlyIncome) monthlyIncome.textContent = APIHelper.formatCurrency(income);
        if (monthlyExpense) monthlyExpense.textContent = `-${APIHelper.formatCurrency(expense)}`;
        if (monthlyProfit) {
            monthlyProfit.textContent = `${profit >= 0 ? '+' : ''}${APIHelper.formatCurrency(profit)}`;
            monthlyProfit.className = `value ${profit >= 0 ? 'profit' : 'expense'}`;
        }
    }

    displayTransactionList(transactions) {
        const transactionList = document.getElementById('transactionList');
        if (!transactionList) return;

        if (transactions.length === 0) {
            transactionList.innerHTML = '<h4>최근 거래 내역</h4><div class="empty-transactions">거래 내역이 없습니다.</div>';
            return;
        }

        const recentTransactions = transactions.slice(-10).reverse();
        const transactionsHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-memo">${transaction.memo || ''}</div>
                    <div class="transaction-date">${new Date(transaction.date).toLocaleDateString('ko-KR')}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${APIHelper.formatCurrency(transaction.amount)}
                </div>
                <button class="delete-transaction" onclick="deleteTransaction(${transaction.id})">삭제</button>
            </div>
        `).join('');

        transactionList.innerHTML = `<h4>최근 거래 내역</h4>${transactionsHTML}`;
    }

    addTransaction() {
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const category = document.getElementById('transactionCategory').value;
        const memo = document.getElementById('transactionMemo').value;
        const date = document.getElementById('transactionDate').value;
        const type = document.getElementById('transactionModal').dataset.type;

        if (!amount || !category || !date) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        const transaction = {
            id: Date.now(),
            type: type,
            amount: amount,
            category: category,
            memo: memo,
            date: date
        };

        this.transactions.push(transaction);
        StorageManager.setItem('userTransactions', this.transactions);

        // If it's a savings investment, add to portfolio
        if (type === 'investment' && category.includes('예적금')) {
            const portfolio = StorageManager.getItem('userPortfolio');
            portfolio.currentValue += amount;
            portfolio.totalInvestment += amount;
            StorageManager.setItem('userPortfolio', portfolio);
        }

        this.loadAccountingData();
        this.closeTransactionModal();
        this.updatePortfolioDisplay();
    }

    closeTransactionModal() {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Global functions for investment actions
function investInStock(symbol, price) {
    const amount = prompt(`${symbol} 주식에 투자할 금액을 입력하세요:`);
    if (amount && !isNaN(amount)) {
        const quantity = Math.floor(parseFloat(amount) / price);
        if (quantity > 0) {
            window.portfolioManager?.updateHolding(symbol, quantity, price, 'stock');
            alert(`${symbol} ${quantity}주를 ${APIHelper.formatCurrency(quantity * price)}에 매수했습니다.`);
            location.reload();
        }
    }
}

function investInCrypto(id, price) {
    const amount = prompt(`${id} 암호화폐에 투자할 금액을 입력하세요:`);
    if (amount && !isNaN(amount)) {
        const quantity = parseFloat(amount) / price;
        if (quantity > 0) {
            window.portfolioManager?.updateHolding(id, quantity, price, 'crypto');
            alert(`${id} ${quantity.toFixed(6)}개를 ${APIHelper.formatCurrency(parseFloat(amount), 'USD')}에 매수했습니다.`);
            location.reload();
        }
    }
}

function investInBond(name, yield_rate) {
    const amount = prompt(`${name}에 투자할 금액을 입력하세요:`);
    if (amount && !isNaN(amount)) {
        window.portfolioManager?.updateHolding(name, 1, parseFloat(amount), 'bond');
        alert(`${name}에 ${APIHelper.formatCurrency(parseFloat(amount))}를 투자했습니다.`);
        location.reload();
    }
}

function investInSavings(name, rate, period) {
    const amount = prompt(`${name}에 투자할 금액을 입력하세요:`);
    if (amount && !isNaN(amount)) {
        // Add to portfolio
        window.portfolioManager?.updateHolding(name, 1, parseFloat(amount), 'savings');
        
        // Add to accounting
        const transaction = {
            id: Date.now(),
            type: 'investment',
            amount: parseFloat(amount),
            category: `예적금 - ${name}`,
            memo: `${rate}% ${period}개월`,
            date: new Date().toISOString().split('T')[0]
        };
        
        const transactions = StorageManager.getItem('userTransactions', []);
        transactions.push(transaction);
        StorageManager.setItem('userTransactions', transactions);
        
        alert(`${name}에 ${APIHelper.formatCurrency(parseFloat(amount))}를 투자했습니다.`);
        location.reload();
    }
}

function calculateSavings() {
    const amount = parseFloat(document.getElementById('investAmount').value);
    const period = parseInt(document.getElementById('investPeriod').value);
    const rate = parseFloat(document.getElementById('interestRate').value);

    if (!amount || !period || !rate) {
        alert('모든 값을 입력해주세요.');
        return;
    }

    const monthlyRate = rate / 100 / 12;
    const maturityAmount = amount * Math.pow(1 + monthlyRate, period);
    const totalInterest = maturityAmount - amount;

    const savingsResult = document.getElementById('savingsResult');
    const maturityAmountEl = document.getElementById('maturityAmount');
    const totalInterestEl = document.getElementById('totalInterest');

    if (maturityAmountEl) maturityAmountEl.textContent = APIHelper.formatCurrency(maturityAmount);
    if (totalInterestEl) totalInterestEl.textContent = APIHelper.formatCurrency(totalInterest);
    if (savingsResult) savingsResult.style.display = 'block';
}

function investInSavingsCalculated() {
    const amount = parseFloat(document.getElementById('investAmount').value);
    const period = parseInt(document.getElementById('investPeriod').value);
    const rate = parseFloat(document.getElementById('interestRate').value);

    if (amount && period && rate) {
        investInSavings(`사용자 정의 상품 (${rate}% ${period}개월)`, rate, period);
    }
}

function searchStocks() {
    const searchTerm = document.getElementById('stockSearch').value;
    if (searchTerm) {
        alert(`"${searchTerm}" 검색 기능은 향후 구현 예정입니다.`);
    }
}

function showAddTransactionModal(type) {
    const modal = document.getElementById('transactionModal');
    const modalTitle = document.getElementById('modalTitle');
    const categorySelect = document.getElementById('transactionCategory');
    const dateInput = document.getElementById('transactionDate');

    if (!modal || !modalTitle || !categorySelect) return;

    modal.dataset.type = type;
    modal.style.display = 'flex';
    
    // Set default date to today
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Update modal title and categories
    const titles = {
        income: '수입 추가',
        expense: '지출 추가',
        investment: '투자 기록'
    };

    const categories = {
        income: ['급여', '상여금', '투자수익', '기타수입'],
        expense: ['식비', '교통비', '쇼핑', '문화생활', '기타지출'],
        investment: ['주식투자', '암호화폐투자', '예적금투자', '채권투자']
    };

    modalTitle.textContent = titles[type];
    categorySelect.innerHTML = categories[type].map(cat => 
        `<option value="${cat}">${cat}</option>`
    ).join('');
}

function closeTransactionModal() {
    const modal = document.getElementById('transactionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function deleteTransaction(transactionId) {
    if (confirm('이 거래 내역을 삭제하시겠습니까?')) {
        let transactions = StorageManager.getItem('userTransactions', []);
        transactions = transactions.filter(t => t.id !== transactionId);
        StorageManager.setItem('userTransactions', transactions);
        
        if (window.investmentPageManager) {
            window.investmentPageManager.loadAccountingData();
        }
    }
}

// Initialize investment page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.investmentPageManager = new InvestmentPageManager();
});