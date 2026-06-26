# Webhook Integration Setup

To trigger the `email-notifications` Edge Function automatically when bookings are created or updated, you need to configure Database Webhooks in Supabase.

The recommended and most secure way to do this is via the Supabase Dashboard, as it handles the injection of the `Authorization` header seamlessly.

## Step 1: Deploy the Edge Function

First, deploy your new edge function to Supabase:

```bash
supabase functions deploy email-notifications --no-verify-jwt
```

## Step 2: Set Environment Variables

Set the required environment variables in your Supabase project:

```bash
supabase secrets set RESEND_API_KEY="re_your_resend_api_key"
supabase secrets set SENDER_EMAIL="notifications@yourdomain.com"
supabase secrets set PUBLIC_SITE_URL="https://your-domain.com"
```
*(Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions).*

## Step 3: Create the Database Webhooks

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard.
2. Navigate to **Database** -> **Webhooks**.
3. Click **Enable Webhooks** (if not already enabled) and then **Create Webhook**.

#### Webhook 1: New Booking (INSERT)
- **Name:** `email_on_new_booking`
- **Table:** `bookings`
- **Events:** Select **Insert**
- **Type:** Supabase Edge Functions
- **Method:** `POST`
- **Edge Function:** Select `email-notifications`
- **HTTP Headers:** (Handled automatically)
- Click **Create webhook**.

#### Webhook 2: Status Update (UPDATE)
- **Name:** `email_on_status_update`
- **Table:** `bookings`
- **Events:** Select **Update**
- **Type:** Supabase Edge Functions
- **Method:** `POST`
- **Edge Function:** Select `email-notifications`
- **HTTP Headers:** (Handled automatically)
- Click **Create webhook**.

#### Webhook 3: Technician Assignment (INSERT)
- **Name:** `email_on_technician_assignment`
- **Table:** `assignments`
- **Events:** Select **Insert**
- **Type:** Supabase Edge Functions
- **Method:** `POST`
- **Edge Function:** Select `email-notifications`
- **HTTP Headers:** (Handled automatically)
- Click **Create webhook**.

### Option B: Via SQL (Advanced)

If you prefer SQL, ensure `pg_net` is enabled, and then run this in the SQL Editor:

```sql
-- Create Webhook for INSERT
CREATE TRIGGER email_on_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'http://[YOUR_PROJECT_REF].supabase.co/functions/v1/email-notifications',
    'POST',
    '{"Content-type":"application/json"}',
    '{}',
    '5000'
  );

-- Create Webhook for UPDATE
CREATE TRIGGER email_on_status_update
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'http://[YOUR_PROJECT_REF].supabase.co/functions/v1/email-notifications',
    'POST',
    '{"Content-type":"application/json"}',
    '{}',
    '5000'
  );

-- Create Webhook for Technician Assignment (INSERT)
CREATE TRIGGER email_on_technician_assignment
  AFTER INSERT ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'http://[YOUR_PROJECT_REF].supabase.co/functions/v1/email-notifications',
    'POST',
    '{"Content-type":"application/json"}',
    '{}',
    '5000'
  );
```
*(Note: The SQL approach requires passing the `Authorization: Bearer <ANON_KEY>` header if the function requires JWT verification. Since we deployed with `--no-verify-jwt`, it will accept requests, but for production, use the Dashboard approach for better security).*
