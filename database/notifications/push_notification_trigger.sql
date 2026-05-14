-- 1. Create the function that sends the notification signal
-- Copy this into your Supabase SQL Editor
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- This sends a signal to your "send-push" function
  -- You will need to replace 'your-project-id' with your actual project ID
  PERFORM
    net.http_post(
      url := 'https://' || current_setting('request.headers')::json->>'host' || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.headers')::json->>'authorization'
      ),
      body := jsonb_build_object(
        'channel_id', NEW.channel_id,
        'content', NEW.content,
        'sender_id', NEW.user_id
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger to run every time a message is sent
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();
