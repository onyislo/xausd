export interface VideoStream {
  id: string;
  title: string;
  category: string;
  isLive: boolean;
  viewers: string;
  source: string;
  thumbnailColor: string;
}

export const videoStreams: VideoStream[] = [
  {
    id: 'v1',
    title: 'Global Breaking News: Asia-Pacific',
    category: 'GEOPOLITICAL',
    isLive: true,
    viewers: '2.4K',
    source: 'BBG WORLD',
    thumbnailColor: 'bg-blue-900/40'
  },
  {
    id: 'v2',
    title: 'Market Analysis: London Open',
    category: 'MARKET',
    isLive: true,
    viewers: '1.1K',
    source: 'ECB TV',
    thumbnailColor: 'bg-yellow-900/40'
  },
  {
    id: 'v3',
    title: 'Commodities Wrap: Gold & Silver',
    category: 'ECONOMIC',
    isLive: false,
    viewers: 'Prev. 800',
    source: 'MINING NET',
    thumbnailColor: 'bg-green-900/40'
  },
  {
    id: 'v4',
    title: 'US Presidential Briefing (Replay)',
    category: 'GOVERNMENT',
    isLive: false,
    viewers: 'Prev. 15K',
    source: 'WH PRESS',
    thumbnailColor: 'bg-red-900/40'
  },
  {
    id: 'v5',
    title: 'Tech Disruptors Showcase',
    category: 'TECHNOLOGY',
    isLive: true,
    viewers: '450',
    source: 'CNET LIVE',
    thumbnailColor: 'bg-purple-900/40'
  },
  {
    id: 'v6',
    title: 'Oil & Gas Output Update',
    category: 'ENERGY',
    isLive: true,
    viewers: '3.2K',
    source: 'OPEC+ TV',
    thumbnailColor: 'bg-orange-900/40'
  }
];
