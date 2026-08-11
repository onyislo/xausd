-- Create table for Push Notification Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, subscription)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/edit their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
ON public.push_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);
