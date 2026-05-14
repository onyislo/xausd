-- 1. Create the function that sends the notification signal
-- Copy this into your Supabase SQL Editor
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- This sends a signal to your "send-push" function
  PERFORM
    net.http_post(
      url := 'https://' || coalesce(current_setting('request.headers', true)::json->>'host', '') || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(current_setting('request.headers', true)::json->>'authorization', '')
      ),
      body := jsonb_build_object(
        'channel_id', NEW.channel_id,
        'content', NEW.content,
        'sender_id', NEW.user_id
      )
    );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If anything fails (like missing headers or pg_net not installed), just continue and save the message anyway.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger to run every time a message is sent
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();
