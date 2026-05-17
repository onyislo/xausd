-- database/news/video_feeds.sql

CREATE TABLE IF NOT EXISTS public.video_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    is_live BOOLEAN DEFAULT false,
    viewers TEXT,
    source TEXT NOT NULL,
    video_url TEXT UNIQUE,
    thumbnail_color TEXT DEFAULT 'bg-slate-900/40',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_feeds;
