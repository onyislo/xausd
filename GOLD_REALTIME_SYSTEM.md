# 🥇 GOLD/USD + USD INDEX Real-Time Trading System Documentation

## 📊 Project Overview
**Goal:** Build MT5-level real-time trading system for **GOLD/USD (XAU/USD) + US Dollar Index (DXY)** with millisecond updates, correlation analysis, and professional trading interface.

## ⚡ Real-Time Requirements (MT5-Level)
- **Update Frequency:** Every 100-500ms (like MT5)
- **Instruments:** XAU/USD + DXY + correlation pairs
- **Data Sources:** 5+ simultaneous feeds per instrument
- **Latency:** Sub-100ms price delivery
- **Reliability:** 99.99% uptime
- **Features:** Tick charts, volume, bid/ask spreads, correlation analysis

---

## 🌐 Data Sources Strategy

### **🥇 GOLD (XAU/USD) Data Sources**

#### **Tier 1: Professional Trading APIs (Millisecond Updates)**
1. **Alpha Vantage** - `FX_INTRADAY&from_symbol=XAU&to_symbol=USD`
2. **IEX Cloud** - Precious metals real-time WebSocket
3. **Finnhub** - `wss://ws.finnhub.io` - XAU/USD streams
4. **Polygon.io** - `wss://socket.polygon.io/forex` - Real-time gold
5. **Twelve Data** - `GOLD` symbol real-time API

#### **Tier 2: Forex Brokers APIs (Sub-second)**
1. **OANDA API** - `EUR_USD,XAU_USD` streaming rates
2. **FXCM REST API** - Live XAU/USD pricing  
3. **IG Markets API** - Professional gold feeds
4. **XTB API** - Real-time gold commodity prices
5. **Plus500 WebSocket** - Live gold CFD streams

#### **Tier 3: Crypto/Alternative Gold Sources**
1. **Binance** - `PAXGUSD` (PAX Gold/USD - gold-backed token)
2. **BullionVault API** - Physical gold spot prices
3. **APMEX API** - Live precious metals dealers
4. **JM Bullion** - Real-time gold dealer rates
5. **Perth Mint** - Official gold prices

### **💵 US DOLLAR INDEX (DXY) Data Sources**

#### **Tier 1: Professional Trading APIs**
1. **Alpha Vantage** - `FX_INTRADAY&from_symbol=USD&to_symbol=DXY`
2. **IEX Cloud** - `DX-Y.NYB` (Dollar Index futures)
3. **Finnhub** - `wss://ws.finnhub.io` - DXY real-time
4. **Polygon.io** - `I:DXY` (Dollar Index)
5. **Twelve Data** - `DXY` symbol streaming

#### **Tier 2: Forex & Futures APIs**
1. **OANDA** - USD basket calculation (EUR/USD, GBP/USD, etc.)
2. **CME Group API** - `DX` (Dollar Index futures)
3. **Interactive Brokers** - DXY real-time data
4. **TD Ameritrade** - Dollar Index streaming
5. **Charles Schwab** - USD Index data

#### **Tier 3: Major Currency Pairs (DXY Calculation)**
1. **EUR/USD** (57.6% weight in DXY)
2. **JPY/USD** (13.6% weight)  
3. **GBP/USD** (11.9% weight)
4. **CAD/USD** (9.1% weight)
5. **SEK/USD** (4.2% weight)
6. **CHF/USD** (3.6% weight)

### **Tier 4: Web Scraping (Backup for Both)**

#### **Gold Scraping Sources:**
1. **Investing.com** - `/currencies/xau-usd` + WebSocket
2. **Yahoo Finance** - `GC=F` (Gold futures)
3. **MarketWatch** - `/investing/metal/gold`
4. **Kitco.com** - Live gold prices API
5. **GoldPrice.org** - Real-time spot gold

#### **Dollar Index Scraping Sources:**
1. **Investing.com** - `/indices/usdollar-index` + WebSocket  
2. **Yahoo Finance** - `DX-Y.NYB` (DXY futures)
3. **MarketWatch** - `/investing/index/dxy`
4. **TradingView** - DXY chart WebSocket scraping
5. **FRED (St. Louis Fed)** - `DEXUSEU` (USD/EUR rate)

---

## 🏗️ Technical Architecture

### **WebSocket Infrastructure**
```javascript
// Multiple WebSocket connections for GOLD + USD redundancy
const goldDataSources = [
  'wss://ws.finnhub.io?token=XAU_USD_STREAM',
  'wss://socket.polygon.io/forex?XAU/USD', 
  'wss://ws-feed.iexcloud.io?symbols=GOLD',
  'wss://stream.tradingview.com/socket.io/?symbol=XAUUSD',
  'wss://ws.investing.com/echo/websocket'
];

const usdDataSources = [
  'wss://ws.finnhub.io?token=DXY_STREAM',
  'wss://socket.polygon.io/indices?I:DXY',
  'wss://ws-feed.iexcloud.io?symbols=DX-Y.NYB',
  'wss://stream.tradingview.com/socket.io/?symbol=TVC:DXY',
  'wss://ws.investing.com/echo/websocket'
];

// Price aggregation and correlation analysis
const priceAggregator = {
  instruments: ['XAU/USD', 'DXY', 'EUR/USD', 'GBP/USD'],
  sources: 5,
  consensusThreshold: 3, // Need 3/5 sources to agree
  maxDeviation: 0.05, // $0.05 max difference for gold, 0.1 for DXY
  updateInterval: 100, // 100ms updates
  correlationWindow: 1000 // 1000 ticks for correlation calc
};
```

### **Database Schema (Optimized for Speed)**
```sql
-- Real-time tick data for GOLD (partitioned by hour)
CREATE TABLE gold_ticks (
    id BIGSERIAL PRIMARY KEY,
    price DECIMAL(10,4) NOT NULL,
    bid DECIMAL(10,4),
    ask DECIMAL(10,4),
    volume INTEGER,
    source TEXT NOT NULL,
    tick_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (tick_time);

-- Real-time USD Index tick data
CREATE TABLE usd_ticks (
    id BIGSERIAL PRIMARY KEY,
    dxy_price DECIMAL(8,4) NOT NULL,
    bid DECIMAL(8,4),
    ask DECIMAL(8,4),
    volume INTEGER,
    source TEXT NOT NULL,
    tick_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (tick_time);

-- Major currency pairs for DXY calculation
CREATE TABLE currency_ticks (
    id BIGSERIAL PRIMARY KEY,
    pair TEXT NOT NULL, -- 'EUR/USD', 'GBP/USD', etc.
    price DECIMAL(8,6) NOT NULL,
    bid DECIMAL(8,6),
    ask DECIMAL(8,6),
    volume INTEGER,
    weight DECIMAL(4,3), -- DXY weight (0.576 for EUR/USD)
    source TEXT NOT NULL,
    tick_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (tick_time);

-- Correlation analysis between Gold and USD
CREATE TABLE gold_usd_correlation (
    id BIGSERIAL PRIMARY KEY,
    gold_price DECIMAL(10,4) NOT NULL,
    usd_index DECIMAL(8,4) NOT NULL,
    correlation_1m DECIMAL(5,4), -- 1-minute correlation
    correlation_5m DECIMAL(5,4), -- 5-minute correlation  
    correlation_1h DECIMAL(5,4), -- 1-hour correlation
    strength TEXT, -- 'strong_negative', 'weak_positive', etc.
    tick_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price consensus (from multiple sources)
CREATE TABLE price_consensus (
    id BIGSERIAL PRIMARY KEY,
    instrument TEXT NOT NULL, -- 'XAU/USD', 'DXY'
    consensus_price DECIMAL(10,4) NOT NULL,
    price_sources INTEGER NOT NULL,
    deviation DECIMAL(6,4),
    confidence DECIMAL(3,2), -- 0.95 = 95% confidence
    tick_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time WebSocket connections status
CREATE TABLE websocket_health (
    id UUID PRIMARY KEY,
    instrument TEXT NOT NULL, -- 'GOLD', 'USD', 'EUR/USD'
    source TEXT NOT NULL,
    status TEXT NOT NULL, -- 'connected', 'disconnected', 'error'
    last_ping TIMESTAMPTZ,
    latency_ms INTEGER,
    error_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📅 PHASE IMPLEMENTATION PLAN

## **PHASE 1: WebSocket Foundation (Week 1)**
**Goal:** Real-time WebSocket connections with 500ms updates

### **Day 1-2: WebSocket Setup**
- [ ] Create WebSocket manager class for multiple instruments
- [ ] Connect to Finnhub: XAU/USD + DXY WebSockets  
- [ ] Connect to Polygon.io: Gold + Dollar Index streams
- [ ] Add major currency pairs (EUR/USD, GBP/USD, JPY/USD)
- [ ] Add connection health monitoring for all instruments
- [ ] Implement reconnection logic with exponential backoff

### **Day 3-4: Data Processing**
- [ ] Build price aggregation engine for Gold + USD
- [ ] Add bid/ask spread calculation for both instruments
- [ ] Create tick data storage system (partitioned tables)
- [ ] Implement cross-instrument price validation
- [ ] Build real-time correlation calculator
- [ ] Add DXY calculation from major currency pairs

### **Day 5-7: UI Integration**
- [ ] Replace static cards with live Gold + USD tickers
- [ ] Add dual-chart display (Gold on left, USD on right)
- [ ] Create real-time price animations for both
- [ ] Build correlation strength indicator
- [ ] Add percentage change calculations
- [ ] Create simple dual-line correlation chart

**Success Metrics:**
- ✅ 4+ WebSocket connections active (Gold + USD + EUR/USD + GBP/USD)
- ✅ Price updates every 500ms for both instruments
- ✅ Real-time UI animations for Gold and Dollar Index
- ✅ Correlation calculation working
- ✅ 99% uptime for all data streams

---

## **PHASE 2: Multi-Source Aggregation (Week 2)**
**Goal:** 5+ data sources with consensus pricing

### **Day 1-3: Additional WebSockets**
- [ ] Add IEX Cloud WebSocket for both Gold and DXY
- [ ] Connect to Alpha Vantage streaming (XAU/USD + DXY)
- [ ] Integrate OANDA API WebSocket (Gold + USD basket)
- [ ] Add TradingView WebSocket scraping for both
- [ ] Connect to CME Group for DXY futures data

### **Day 4-5: Price Consensus & Correlation**
- [ ] Build multi-source price validation for both instruments  
- [ ] Create consensus algorithm for Gold and USD separately
- [ ] Add outlier detection for cross-instrument validation
- [ ] Implement source reliability scoring
- [ ] Build real-time correlation matrix (Gold vs USD, EUR/USD, GBP/USD)
- [ ] Add correlation strength alerts

### **Day 6-7: Advanced Features**
- [ ] Add volume-weighted pricing for both instruments
- [ ] Create cross-instrument price deviation alerts
- [ ] Build inverse correlation detection (Gold up, USD down)
- [ ] Add automatic source switching per instrument  
- [ ] Implement correlation-based trading signals

**Success Metrics:**
- ✅ 8+ simultaneous data sources (5+ Gold, 5+ USD, major pairs)
- ✅ Consensus pricing algorithm for both instruments
- ✅ Real-time correlation analysis working
- ✅ Sub-1% price deviation across sources
- ✅ Automatic failover for each instrument
- ✅ Correlation alerts triggering properly

---

## **PHASE 3: MT5-Level Performance (Week 3)**
**Goal:** 100ms updates with professional features

### **Day 1-2: Performance Optimization**
- [ ] Optimize WebSocket processing
- [ ] Add Redis caching layer
- [ ] Implement price streaming buffers
- [ ] Create tick data compression

### **Day 3-4: Advanced Charts**
- [ ] Build dual candlestick charts (Gold + USD side-by-side)
- [ ] Add tick charts for both instruments (volume-based)
- [ ] Create correlation overlay chart
- [ ] Implement synchronized timeframes
- [ ] Build dual depth of market display
- [ ] Add cross-instrument price ladder
- [ ] Create correlation heatmap visualization

### **Day 5-7: Trading Features**
- [ ] Add technical indicators for both (real-time RSI, MACD)
- [ ] Create correlation-based price alerts
- [ ] Build order book simulation for Gold and USD
- [ ] Add market depth visualization for both
- [ ] Implement divergence detection (Gold vs USD)
- [ ] Create correlation strength gauge

**Success Metrics:**
- ✅ 100ms price updates for both Gold and USD
- ✅ Professional dual-chart MT5-style interface
- ✅ Real-time technical indicators for both instruments
- ✅ Correlation analysis with sub-50ms latency  
- ✅ Cross-instrument alerts working
- ✅ Divergence detection active

---

## **PHASE 4: Professional Trading Interface (Week 4)**
**Goal:** Complete MT5-equivalent platform

### **Day 1-3: Advanced Charting**
- [ ] Multi-timeframe charts
- [ ] Custom indicators (RSI, MACD, Bollinger)
- [ ] Drawing tools (trend lines, fibonacci)
- [ ] Chart pattern recognition

### **Day 4-5: Market Analysis**
- [ ] Economic calendar integration (USD-impacting events)
- [ ] News sentiment analysis (Gold and Dollar related)
- [ ] Correlation with other markets (bonds, stocks, crypto)
- [ ] Add volatility indicators for both instruments
- [ ] Cross-market analysis (Gold vs US10Y, USD vs Oil)
- [ ] Central bank policy impact tracker

### **Day 6-7: Risk Management**
- [ ] Position sizing calculator
- [ ] Risk/reward analysis
- [ ] Portfolio tracking
- [ ] P&L calculations

**Success Metrics:**
- ✅ Full MT5-equivalent features
- ✅ Professional trading tools
- ✅ Real-time market analysis
- ✅ Risk management suite

---

## **PHASE 5: Enterprise Features (Week 5)**
**Goal:** Institutional-grade trading platform

### **Day 1-2: Advanced Analytics**
- [ ] Machine learning price prediction
- [ ] Algorithmic trading signals
- [ ] Market microstructure analysis
- [ ] High-frequency data analysis

### **Day 3-4: API & Integration**
- [ ] RESTful API for external access
- [ ] WebSocket API for real-time data
- [ ] Webhook notifications
- [ ] Third-party integrations

### **Day 5-7: Monitoring & Alerts**
- [ ] Real-time system monitoring
- [ ] Performance dashboards
- [ ] Automated alerts system
- [ ] System health reporting

**Success Metrics:**
- ✅ ML-powered predictions
- ✅ Enterprise API access
- ✅ Institutional-grade monitoring
- ✅ 99.99% system availability

---

## ⚙️ Configuration Settings

### **Update Frequencies**
```javascript
const UPDATE_INTERVALS = {
  GOLD_TICK_UPDATES: 100,    // 100ms (10 times per second)
  USD_TICK_UPDATES: 100,     // 100ms for DXY  
  MAJOR_PAIRS_UPDATES: 200,  // 200ms for EUR/USD, GBP/USD
  CORRELATION_CALC: 500,     // 500ms correlation updates
  CHART_UPDATES: 500,        // 500ms chart redraws  
  INDICATOR_UPDATES: 1000,   // 1 second technical indicators
  NEWS_UPDATES: 5000,        // 5 seconds news/events
  HEALTH_CHECKS: 10000       // 10 seconds connection health
};
```

### **Instrument Configuration**
```javascript
const INSTRUMENTS = {
  PRIMARY: {
    GOLD: 'XAU/USD',
    USD_INDEX: 'DXY'
  },
  MAJOR_PAIRS: {
    'EUR/USD': { weight: 0.576, priority: 1 },
    'JPY/USD': { weight: 0.136, priority: 2 },  
    'GBP/USD': { weight: 0.119, priority: 3 },
    'CAD/USD': { weight: 0.091, priority: 4 },
    'SEK/USD': { weight: 0.042, priority: 5 },
    'CHF/USD': { weight: 0.036, priority: 6 }
  },
  CORRELATION_PAIRS: ['US10Y', 'SPX', 'VIX', 'BTC/USD']
};
```

### **WebSocket Configuration**
```javascript
const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_DELAY: 1000,
  PING_INTERVAL: 30000,
  CONNECTION_TIMEOUT: 5000,
  MAX_BUFFER_SIZE: 1000,
  COMPRESSION: true
};
```

### **Price Validation Rules**
```javascript
const PRICE_VALIDATION = {
  GOLD: {
    MIN_PRICE: 1500,         // $1,500/oz minimum
    MAX_PRICE: 3000,         // $3,000/oz maximum  
    MAX_CHANGE_PERCENT: 5,   // 5% max change per minute
    MIN_SOURCES_REQUIRED: 3, // Need 3+ sources for consensus
    OUTLIER_THRESHOLD: 0.1   // 0.1% deviation = outlier
  },
  USD_INDEX: {
    MIN_PRICE: 80,           // DXY minimum value
    MAX_PRICE: 130,          // DXY maximum value
    MAX_CHANGE_PERCENT: 2,   // 2% max change per minute
    MIN_SOURCES_REQUIRED: 3,
    OUTLIER_THRESHOLD: 0.05  // 0.05% deviation
  },
  CORRELATION: {
    MIN_HISTORY_POINTS: 100, // Need 100 ticks for correlation
    UPDATE_FREQUENCY: 500,   // Recalc every 500ms
    STRONG_THRESHOLD: 0.7,   // >0.7 = strong correlation
    WEAK_THRESHOLD: 0.3      // <0.3 = weak correlation
  }
};
```

---

## 📊 Performance Targets

### **Latency Requirements**
- **WebSocket Connection:** < 50ms
- **Price Processing:** < 10ms
- **UI Updates:** < 20ms
- **Database Writes:** < 30ms
- **Total Latency:** < 100ms

### **Throughput Targets**
- **Gold Price Updates:** 10/second minimum  
- **USD Index Updates:** 10/second minimum
- **Major Pairs Updates:** 5/second each
- **Correlation Calculations:** 2/second
- **Concurrent Users:** 1,000+
- **Data Points:** 5M+ ticks/day (Gold + USD + pairs)
- **API Requests:** 50,000/minute across all sources

### **Reliability Metrics**
- **Uptime:** 99.99%
- **Data Accuracy:** 99.9%
- **WebSocket Health:** 99%
- **Error Rate:** < 0.1%

---

## 🔧 Technology Stack

### **Backend**
- **Runtime:** Node.js/Next.js
- **Database:** PostgreSQL (time-series optimized)
- **Cache:** Redis (real-time data)
- **WebSockets:** Socket.io / ws library
- **Message Queue:** Redis Pub/Sub

### **Frontend**  
- **Framework:** React/Next.js
- **Charts:** TradingView Lightweight Charts
- **Real-time:** WebSocket + React hooks
- **State:** Zustand/Redux for real-time data
- **UI:** Tailwind CSS (current)

### **Infrastructure**
- **Hosting:** Vercel/AWS
- **Database:** Supabase/AWS RDS
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry + Custom dashboard
- **Alerts:** Email + WebHook notifications

---

## 🚀 Getting Started

### **Prerequisites**
```bash
# Primary API Keys (Gold + USD)
FINNHUB_API_KEY=your_key           # XAU/USD + DXY streams
POLYGON_API_KEY=your_key           # Gold + Dollar Index + Major pairs
IEX_CLOUD_TOKEN=your_token         # GOLD + DX-Y.NYB futures
ALPHA_VANTAGE_KEY=your_key         # XAU/USD + EUR/USD + GBP/USD  
TWELVE_DATA_KEY=your_key           # Gold + DXY + correlation pairs

# Forex Broker APIs (Optional but recommended)
OANDA_API_KEY=your_key             # XAU/USD + major currency pairs
FXCM_API_KEY=your_key              # Professional gold + forex
CME_GROUP_API=your_key             # DXY futures (official)

# Backup/Scraping (No keys needed)
INVESTING_COM_SCRAPING=enabled     # Gold + DXY backup
YAHOO_FINANCE_SCRAPING=enabled     # GC=F + DX-Y.NYB backup  
TRADINGVIEW_SCRAPING=enabled       # XAUUSD + TVC:DXY
```

### **Installation Steps**
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations
5. Start development server: `npm run dev`
6. Open WebSocket connections
7. Verify real-time data flow

---

## 📈 Success Measurement

### **Week 1 Goals:**
- [ ] Real-time price updates for Gold AND USD working
- [ ] 4+ WebSocket connections active (Gold + USD + major pairs)  
- [ ] Basic dual-chart UI showing live prices for both
- [ ] Price change animations for Gold and Dollar Index
- [ ] Real-time correlation calculation working

### **Week 2 Goals:**
- [ ] 8+ data sources integrated (Gold + USD + pairs)
- [ ] Consensus pricing algorithm for both instruments
- [ ] Automatic source failover per instrument
- [ ] Cross-instrument price validation working
- [ ] Correlation strength alerts active

### **Week 3 Goals:**  
- [ ] 100ms update frequency for both instruments
- [ ] Professional dual-chart interface implemented
- [ ] Technical indicators working for Gold and USD
- [ ] MT5-level performance achieved
- [ ] Correlation analysis with sub-50ms latency

### **Week 4 Goals:**
- [ ] Complete dual-instrument trading interface
- [ ] All professional features for Gold + USD
- [ ] Cross-market correlation analysis
- [ ] Risk management tools for both instruments
- [ ] Market analysis suite with USD impact tracking

### **Week 5 Goals:**
- [ ] Enterprise-grade platform with correlation ML
- [ ] ML predictions for Gold-USD relationship working
- [ ] API access for both instruments available
- [ ] Production-ready system with 99.99% uptime
- [ ] Advanced correlation trading signals

---

**Ready to begin Phase 1? Let me start implementing the WebSocket foundation for real-time gold prices!**