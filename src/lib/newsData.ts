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
    title: 'Global Tension Spike: Naval Confrontation in South China Sea',
    source: 'REUTERS & BBC',
    impact: 'HIGH',
    timestamp: '14:38:05 UTC',
    category: 'GEOPOLITICAL',
    content: 'Naval confrontation in South China Sea. This has increased demand for safe haven assets as a new geopolitical conflict has triggered a secure asset run mainly by institutions. Gold (XAUUSD) is expected to see significant flow report.'
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
