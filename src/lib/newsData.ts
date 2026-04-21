export interface NewsItem {
  id: string;
  title: string;
  source: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  timestamp: string;
  content?: string;
  category: string;
}

export const newsData: NewsItem[] = [
  {
    id: '1',
    title: 'Hormuz Blockade: Institutional Liquidity Sell-Off',
    source: 'AI SENTIMENT / REUTERS',
    impact: 'HIGH',
    timestamp: 'LIVE UTC',
    category: 'GEOPOLITICAL / MARKET',
    content: 'CRITICAL ALERT: The US Navy has fired upon and seized the Iranian-flagged tanker M/V Touska in the Arabian Sea. While standard market behavior dictates gold prices rise during conflict, AI detection shows threat levels have hit peak thresholds, triggering massive institutional sell-offs. Large entities are liquidating gold to secure cash (USD) in anticipation of broader market crashes. \n\nAI SIGNAL DETECTED: STRONG SELL.\nTarget Zone: 4750.00 to 4723.00.'
  },
  {
    id: '2',
    title: 'Central Bank Meeting: ECB Hints at Rate Hike',
    source: 'BLOOMBERG',
    impact: 'MED',
    timestamp: '14:35:05 UTC',
    category: 'MARKET',
    content: 'The European Central Bank officials have signaled a more aggressive stance towards inflation, suggesting a potential rate hike in the coming quarter.'
  },
  {
    id: '3',
    title: 'Gold Demand Update: India Imports Rise',
    source: 'MINING.COM',
    impact: 'LOW',
    timestamp: '14:31:05 UTC',
    category: 'ECONOMIC',
    content: 'India, one of the world\'s largest gold consumers, has seen a sharp increase in imports as festival season approaches and prices stabilize.'
  },
  {
    id: '4',
    title: 'US Treasury Yields Edge Higher Amid Economic Optimism',
    source: 'CNBC',
    impact: 'MED',
    timestamp: '14:28:10 UTC',
    category: 'MARKET',
    content: 'Treasury yields rose on Monday as investors weighed the latest economic data and corporate earnings reports.'
  },
  {
    id: '5',
    title: 'OPEC+ Considers Further Output Cuts',
    source: 'WALL STREET JOURNAL',
    impact: 'HIGH',
    timestamp: '14:20:45 UTC',
    category: 'ENERGY',
    content: 'OPEC and its allies are discussing additional production cuts to support oil prices amid global economic uncertainty.'
  },
  {
    id: '6',
    title: 'Tech Sector Faces Regulatory Headwinds in EU',
    source: 'FINANCIAL TIMES',
    impact: 'LOW',
    timestamp: '14:15:30 UTC',
    category: 'TECHNOLOGY',
    content: 'New EU regulations targeting big tech companies could impact competition and innovation in the digital market.'
  }
];
