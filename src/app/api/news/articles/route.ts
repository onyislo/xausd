import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  }
});

// Text article RSS feeds - focused on gold, dollar, forex, commodities
const ARTICLE_FEEDS = [
  { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC', icon: '📺' },
  { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC=F&region=US&lang=en-US', source: 'YAHOO FINANCE', icon: '📈' },
  { url: 'https://www.kitco.com/rss/news', source: 'KITCO', icon: '🥇' }, // Fixed kitco URL
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MARKETWATCH', icon: '📊' },
  { url: 'https://www.investing.com/rss/news_14.rss', source: 'INVESTING.COM', icon: '💹' },
  { url: 'https://www.investing.com/rss/market_overview_Fundamental.rss', source: 'INVESTING FOREX', icon: '💱' },
  { url: 'https://www.fxempire.com/api/v1/en/rss/news', source: 'FX EMPIRE', icon: '💱' },
  { url: 'https://www.dailyfx.com/feeds/forex-market-news', source: 'DAILYFX', icon: '📉' },
  { url: 'https://www.forexlive.com/feed', source: 'FOREXLIVE', icon: '🔴' },
  { url: 'https://cointelegraph.com/rss', source: 'COINTELEGRAPH', icon: '₿' },
  { url: 'https://www.reutersagency.com/feed/?best-topics=political-general&post_type=best', source: 'REUTERS', icon: '📰' },
];

interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  icon: string;
  url: string;
  publishedAt: string;
  category: string;
  isBreaking: boolean;
}

function categorize(title: string): string {
  const t = title.toUpperCase();
  if (t.includes('GOLD') || t.includes('XAU') || t.includes('BULLION')) return 'GOLD';
  if (t.includes('DOLLAR') || t.includes('DXY') || t.includes('USD')) return 'USD';
  if (t.includes('FOREX') || t.includes('EUR') || t.includes('GBP') || t.includes('JPY')) return 'FOREX';
  if (t.includes('OIL') || t.includes('CRUDE') || t.includes('ENERGY')) return 'ENERGY';
  if (t.includes('SILVER') || t.includes('PLATINUM')) return 'METALS';
  if (t.includes('FED') || t.includes('RATE') || t.includes('INFLATION') || t.includes('CPI')) return 'FED/RATES';
  if (t.includes('STOCK') || t.includes('S&P') || t.includes('NASDAQ')) return 'EQUITIES';
  if (t.includes('CRYPTO') || t.includes('BITCOIN')) return 'CRYPTO';
  return 'MARKET';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filterCategory = searchParams.get('category'); // optional filter
  const limit = parseInt(searchParams.get('limit') || '60');

  try {
    const allArticles: ArticleItem[] = [];

    const promises = ARTICLE_FEEDS.map(async (feedConfig) => {
      try {
        const feed = await parser.parseURL(feedConfig.url);
        for (const item of (feed.items || []).slice(0, 12)) {
          if (!item.title || !item.link) continue;

          const summary = item.contentSnippet || item.content || item.summary || '';
          const cleanSummary = summary.replace(/<[^>]*>/g, '').substring(0, 280);
          const isBreaking = item.title.toUpperCase().includes('BREAKING') || item.title.toUpperCase().includes('ALERT');

          allArticles.push({
            id: Buffer.from(item.link).toString('base64').substring(0, 24),
            title: item.title.trim(),
            summary: cleanSummary.trim(),
            source: feedConfig.source,
            icon: feedConfig.icon,
            url: item.link,
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            category: categorize(item.title),
            isBreaking,
          });
        }
      } catch {
        // Skip failed feeds silently
      }
    });

    await Promise.allSettled(promises);

    // Sort by date (newest first), breaking news prioritized
    allArticles.sort((a, b) => {
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    let filtered = allArticles;
    if (filterCategory) {
      filtered = allArticles.filter(a => a.category === filterCategory.toUpperCase());
    }

    return NextResponse.json({
      success: true,
      articles: filtered.slice(0, limit),
      count: filtered.length,
      sources: ARTICLE_FEEDS.map(f => f.source),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
