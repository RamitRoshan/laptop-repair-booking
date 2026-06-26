# Deployment & Integration Setup

This document contains everything you need to deploy and integrate the Supabase Edge Function with Resend for the email notifications. 

No UI changes, booking flow modifications, or database schema changes were made. All logic operates seamlessly via Database Webhooks.

## 1. Complete Webhook Setup SQL
The complete SQL script for setting up the webhooks is located at: `supabase/webhook_setup.sql`.

*Note: You can run this in your Supabase SQL editor. We have configured the `UPDATE` trigger to ONLY fire when the status strictly changes to `Ready for Delivery` or `Delivered`. This prevents unnecessary edge function invocations.*

## 2. Resend Integration Setup Steps
1. Go to [Resend.com](https://resend.com) and sign up/login.
2. In the Resend Dashboard, go to **API Keys** and click **Create API Key**. Copy the resulting key.
3. Go to **Domains** and verify your sender domain (e.g., `yourdomain.com`). If you don't have a verified domain yet, Resend allows sending to the email address registered on your account using their testing domain.

## 3. Required Environment Variables
The Edge Function requires the following environment variables to be set securely within your Supabase project.

| Variable Name | Purpose | Example Value |
| --- | --- | --- |
| `RESEND_API_KEY` | Authenticates with Resend to dispatch emails. | `re_123456789...` |
| `SENDER_EMAIL` | The verified email address the emails are sent from. | `notifications@yourdomain.com` |
| `PUBLIC_SITE_URL` | Used in email templates to link back to the platform. | `https://your-domain.com` |

## 4. Supabase Deployment Commands
Run these commands in your local terminal (ensure you have the Supabase CLI installed and are logged in):

1. **Deploy the Edge Function:**
   ```bash
   supabase functions deploy email-notifications --no-verify-jwt
   ```

2. **Set the Secrets securely in Supabase:**
   ```bash
   supabase secrets set RESEND_API_KEY="your_resend_api_key"
   supabase secrets set SENDER_EMAIL="notifications@yourdomain.com"
   supabase secrets set PUBLIC_SITE_URL="https://your-domain.com"
   ```

*(Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected into Edge Functions by Supabase).*

## 5. Required Database Changes
**None.** The existing database schema was fully compatible.
- The `notifications` table perfectly matches our required fields (`booking_id`, `customer_id`, `notification_type`, `message`, `sent_via`).
- The status strings we match (`'Ready for Delivery'`, `'Delivered'`) exactly match the `booking_status` ENUM.
- The Edge Function looks up the Technician email dynamically by reading the `assignments` table, extracting the `technician_id`, and safely referencing `auth.users` through the secure Service Role key.

## 6. Testing Checklist
Before going fully live, perform these steps to ensure everything works end-to-end:

- [ ] **Verify Secrets:** Check your Supabase Dashboard -> Edge Functions -> Secrets to confirm `RESEND_API_KEY`, `ADMIN_EMAIL`, and `SENDER_EMAIL` are present.
- [ ] **Verify Webhooks/Triggers:** Check Database -> Triggers to ensure `email_on_new_booking_trigger` and `email_on_status_update_trigger` are active.
- [ ] **Test Customer Creation:** Create a new booking as a customer via the frontend UI.
- [ ] **Check Admin Email:** Verify that `ADMIN_EMAIL` received the "New Booking Alert".
- [ ] **Check Customer Email:** Verify the customer email received the "Booking Confirmed" email.
- [ ] **Verify Success Logs:** Go to the `notifications` table in Supabase and ensure a row exists with `notification_type = 'new_booking_email'` and `message = 'SUCCESS'`.
- [ ] **Test Idempotency (Creation):** Attempt to manually run the webhook payload again (or if two requests hit at exactly the same time); verify only 1 email was sent.
- [ ] **Test Status Update:** Go into the database and update the booking `status` to `Ready for Delivery`.
- [ ] **Verify Completion Emails:** Verify both Admin and Customer receive the "Repair Status Update" email.
- [ ] **Test Status Idempotency:** Update another field on the same booking (like the `rating`) and verify no duplicate status email is sent.
- [ ] **Test Technician Lookup:** Assign a technician to a new booking, then trigger a test payload for a new booking event, and verify the technician receives the email. *(Since assignments happen after booking creation natively, this confirms it works if assignments ever become synchronous).*
