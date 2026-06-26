-- Supabase Database Webhook Setup for Email Notifications
-- This script creates the triggers required to invoke the Edge Function securely via pg_net.
-- Note: Ensure that the `pg_net` extension is enabled in your database before running this.

-- 1. Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the Trigger Function for INSERT (New Bookings)
CREATE OR REPLACE FUNCTION trigger_email_on_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We invoke the Edge Function using net.http_post
  -- Since the function is deployed with --no-verify-jwt, we do not need the Authorization header.
  PERFORM net.http_post(
      url:='https://ujbyllczghxsxlmjqysp.supabase.co/functions/v1/email-notifications',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:=json_build_object(
        'type', 'INSERT',
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW),
        'old_record', null
      )::jsonb,
      timeout_milliseconds:=5000
  );
  RETURN NEW;
END;
$$;

-- 3. Create the Trigger on the bookings table for INSERT
DROP TRIGGER IF EXISTS email_on_new_booking_trigger ON public.bookings;
CREATE TRIGGER email_on_new_booking_trigger
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_email_on_new_booking();


-- 4. Create the Trigger Function for UPDATE (Status Changes)
CREATE OR REPLACE FUNCTION trigger_email_on_status_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
      url:='https://ujbyllczghxsxlmjqysp.supabase.co/functions/v1/email-notifications',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:=json_build_object(
        'type', 'UPDATE',
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )::jsonb,
      timeout_milliseconds:=5000
  );
  RETURN NEW;
END;
$$;

-- 5. Create the Trigger on the bookings table for UPDATE
-- Note: We only run the trigger if the status column was modified.
DROP TRIGGER IF EXISTS email_on_status_update_trigger ON public.bookings;
CREATE TRIGGER email_on_status_update_trigger
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW
-- Prevent unnecessary network calls if the status didn't actually change
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('Ready for Delivery', 'Delivered'))
EXECUTE FUNCTION trigger_email_on_status_update();

-- 6. Create the Trigger Function for Technician Assignment (INSERT on assignments)
CREATE OR REPLACE FUNCTION trigger_email_on_technician_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Invoke Edge Function for assignment
  PERFORM net.http_post(
      url:='https://ujbyllczghxsxlmjqysp.supabase.co/functions/v1/email-notifications',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:=json_build_object(
        'type', 'INSERT',
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW),
        'old_record', null
      )::jsonb,
      timeout_milliseconds:=5000
  );
  RETURN NEW;
END;
$$;

-- 7. Create the Trigger on the assignments table for INSERT
DROP TRIGGER IF EXISTS email_on_technician_assignment_trigger ON public.assignments;
CREATE TRIGGER email_on_technician_assignment_trigger
AFTER INSERT ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION trigger_email_on_technician_assignment();
