import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { Resend } from 'https://esm.sh/resend@3.2.0'

console.log("RESEND_API_KEY exists:", !!Deno.env.get('RESEND_API_KEY'))
console.log("SENDER_EMAIL exists:", !!Deno.env.get('SENDER_EMAIL'))
console.log("PUBLIC_SITE_URL exists:", !!Deno.env.get('PUBLIC_SITE_URL'))

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const senderEmail = Deno.env.get('SENDER_EMAIL') || 'notifications@example.com'
const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || '#'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { type, record, old_record, table } = payload

    if (!record || (!record.id && !record.booking_id)) {
      console.log("Early return: Invalid record in payload")
      return new Response(JSON.stringify({ error: 'Invalid record in payload' }), { status: 400 })
    }

    const bookingId = table === 'assignments' ? record.booking_id : record.id

    // Fetch expanded details for the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        device_types(name),
        brands(name),
        problem_categories(name),
        time_slots(slot_time)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking details:', bookingError)
      console.log("Early return: Failed to fetch booking details")
      return new Response(JSON.stringify({ error: 'Failed to fetch booking details' }), { status: 500 })
    }

    console.log("Booking fetched successfully")

    if (table === 'bookings' && type === 'INSERT') {
      // NEW BOOKING LOGIC
      const notificationType = 'new_booking_email'

      // Idempotency check
      const { data: existingNotifs } = await supabase
        .from('notifications')
        .select('id, message')
        .eq('booking_id', bookingId)
        .eq('notification_type', notificationType)

      const hasSucceeded = existingNotifs?.some(n => n.message === 'SUCCESS')
      if (hasSucceeded) {
        console.log("Early return: Email already sent")
        return new Response(JSON.stringify({ message: 'Email already sent' }), { status: 200 })
      }

      const emailsToSend = []

      // 1. Customer Email
      if (booking.customer_email) {
        console.log("Customer email found:", booking.customer_email)
        emailsToSend.push({
          from: senderEmail,
          to: booking.customer_email,
          subject: `Booking Confirmation - ${booking.booking_number}`,
          html: getCustomerConfirmationHtml(booking)
        })
      }

      // Fetch all Admins and Technicians
      const adminEmails = await getEmailsByRole(supabase, 'admin')
      console.log(`Found ${adminEmails.length} admin emails`)

      const techEmails = await getEmailsByRole(supabase, 'technician')
      console.log(`Found ${techEmails.length} technician emails`)

      // 2. Admin Emails
      for (const email of adminEmails) {
        if (email) {
          emailsToSend.push({
            from: senderEmail,
            to: email,
            subject: `New Booking Received - ${booking.booking_number}`,
            html: getAdminNotificationHtml(booking)
          })
        }
      }

      // 3. Technician Emails
      for (const email of techEmails) {
        if (email) {
          emailsToSend.push({
            from: senderEmail,
            to: email,
            subject: `New Repair Booking Available - ${booking.booking_number}`,
            html: getTechnicianNewBookingHtml(booking)
          })
        }
      }

      if (emailsToSend.length > 0) {
        try {
          console.log("About to call Resend")
          console.log("Number of emails:", emailsToSend.length)
          console.log("Sender email:", senderEmail)
          console.log("Recipients:", emailsToSend.map(e => e.to))
          console.log("Subjects:", emailsToSend.map(e => e.subject))

          // Send emails individually to isolate failures (e.g. if one admin email is invalid, the customer still gets theirs)
          const results = await Promise.allSettled(
            emailsToSend.map(emailPayload => resend.emails.send(emailPayload))
          )

          console.log("========== RESEND RESULTS ==========")
          results.forEach((res, i) => {
            if (res.status === 'rejected' || (res.status === 'fulfilled' && res.value.error)) {
              console.error(`Email ${i} to ${emailsToSend[i].to} FAILED:`, res.status === 'rejected' ? res.reason : res.value.error)
            } else {
              console.log(`Email ${i} to ${emailsToSend[i].to} SUCCEEDED`)
            }
          })

          console.log("Finished calling Resend")

          await logNotification(supabase, bookingId, booking.customer_id, notificationType, 'SUCCESS')
          return new Response(JSON.stringify({ success: true }), { status: 200 })
        } catch (err: any) {
          console.error("SEND FAILED")
          console.error(err)
          console.error(JSON.stringify(err, null, 2))
          await logNotification(supabase, bookingId, booking.customer_id, notificationType, `FAILED: ${err.message}`)
          return new Response(JSON.stringify({ error: err.message }), { status: 500 })
        }
      } else {
        console.log("Early return: No recipients found")
        return new Response(JSON.stringify({ message: 'No recipients found' }), { status: 200 })
      }

    } else if (table === 'bookings' && type === 'UPDATE') {
      // STATUS UPDATE LOGIC
      const newStatus = record.status
      const oldStatus = old_record?.status

      if (newStatus !== oldStatus && ['Ready for Delivery', 'Delivered'].includes(newStatus)) {
        const notificationType = `status_${newStatus.replace(/\s+/g, '_').toLowerCase()}`

        // Idempotency check
        const { data: existingNotifs } = await supabase
          .from('notifications')
          .select('id, message')
          .eq('booking_id', bookingId)
          .eq('notification_type', notificationType)

        const hasSucceeded = existingNotifs?.some(n => n.message === 'SUCCESS')
        if (hasSucceeded) {
          console.log("Early return: Email already sent for this status")
          return new Response(JSON.stringify({ message: 'Email already sent for this status' }), { status: 200 })
        }

        const emailsToSend = []

        // 1. Customer Email
        if (booking.customer_email) {
          console.log("Customer email found:", booking.customer_email)
          emailsToSend.push({
            from: senderEmail,
            to: booking.customer_email,
            subject: `Repair Update: ${newStatus} - ${booking.booking_number}`,
            html: getStatusUpdateHtml(booking, newStatus)
          })
        }

        // 2. Admin Emails
        const adminEmails = await getEmailsByRole(supabase, 'admin')
        console.log(`Found ${adminEmails.length} admin emails`)
        for (const email of adminEmails) {
          if (email) {
            emailsToSend.push({
              from: senderEmail,
              to: email,
              subject: `Repair Status Update: ${newStatus} - ${booking.booking_number}`,
              html: getStatusUpdateHtml(booking, newStatus)
            })
          }
        }

        if (emailsToSend.length > 0) {
          try {
            console.log("About to call Resend")
            console.log("Number of emails:", emailsToSend.length)
            console.log("Sender email:", senderEmail)
            console.log("Recipients:", emailsToSend.map(e => e.to))
            console.log("Subjects:", emailsToSend.map(e => e.subject))

            const response = await resend.batch.send(emailsToSend)

            console.log("========== RESEND RESPONSE ==========")
            console.log(JSON.stringify(response, null, 2))

            if (response.error) {
              console.error("RESEND ERROR:", response.error)
              throw new Error(
                typeof response.error === "string"
                  ? response.error
                  : JSON.stringify(response.error)
              )
            }

            console.log("RESEND SUCCESS")
            console.log("Finished calling Resend")

            await logNotification(supabase, bookingId, booking.customer_id, notificationType, 'SUCCESS')
            return new Response(JSON.stringify({ success: true }), { status: 200 })
          } catch (err: any) {
            console.error("SEND FAILED")
            console.error(err)
            console.error(JSON.stringify(err, null, 2))
            await logNotification(supabase, bookingId, booking.customer_id, notificationType, `FAILED: ${err.message}`)
            return new Response(JSON.stringify({ error: err.message }), { status: 500 })
          }
        } else {
          console.log("Early return: No recipients found")
          return new Response(JSON.stringify({ message: 'No recipients found' }), { status: 200 })
        }
      } else {
        console.log("Early return: No relevant status change")
        return new Response(JSON.stringify({ message: 'No relevant status change' }), { status: 200 })
      }
    } else if (table === 'assignments' && type === 'INSERT') {
      // TECHNICIAN ASSIGNMENT LOGIC (Keeping this intact as per "Keep all existing functionality unchanged")
      const notificationType = 'technician_assignment_email'

      // Idempotency check
      const { data: existingNotifs } = await supabase
        .from('notifications')
        .select('id, message')
        .eq('booking_id', bookingId)
        .eq('notification_type', notificationType)

      const hasSucceeded = existingNotifs?.some(n => n.message === 'SUCCESS')
      if (hasSucceeded) {
        console.log("Early return: Assignment email already sent")
        return new Response(JSON.stringify({ message: 'Assignment email already sent' }), { status: 200 })
      }

      // Fetch the newly assigned technician's email
      const { data: authUser } = await supabase.auth.admin.getUserById(record.technician_id)
      const newTechnicianEmail = authUser?.user?.email

      if (!newTechnicianEmail) {
        console.log("Early return: Technician email not found")
        return new Response(JSON.stringify({ error: 'Technician email not found' }), { status: 400 })
      }

      const emailsToSend = [{
        from: senderEmail,
        to: newTechnicianEmail,
        subject: `New Repair Assignment - ${booking.booking_number}`,
        html: getTechnicianAssignmentHtml(booking)
      }]

      try {
        console.log("About to call Resend")
        console.log("Number of emails:", emailsToSend.length)
        console.log("Sender email:", senderEmail)
        console.log("Recipients:", emailsToSend.map(e => e.to))
        console.log("Subjects:", emailsToSend.map(e => e.subject))

        const results = await Promise.allSettled(
          emailsToSend.map(emailPayload => resend.emails.send(emailPayload))
        )

        console.log("========== RESEND RESULTS ==========")
        results.forEach((res, i) => {
          if (res.status === 'rejected' || (res.status === 'fulfilled' && res.value.error)) {
            console.error(`Email ${i} to ${emailsToSend[i].to} FAILED:`, res.status === 'rejected' ? res.reason : res.value.error)
          } else {
            console.log(`Email ${i} to ${emailsToSend[i].to} SUCCEEDED`)
          }
        })

        console.log("Finished calling Resend")

        await logNotification(supabase, bookingId, booking.customer_id, notificationType, 'SUCCESS')
        return new Response(JSON.stringify({ success: true }), { status: 200 })
      } catch (err: any) {
        console.error("SEND FAILED")
        console.error(err)
        console.error(JSON.stringify(err, null, 2))
        await logNotification(supabase, bookingId, booking.customer_id, notificationType, `FAILED: ${err.message}`)
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
      }
    }

    console.log("Early return: Unhandled payload type")
    return new Response(JSON.stringify({ message: 'Unhandled payload type' }), { status: 200 })

  } catch (error: any) {
    console.error("SEND FAILED")
    console.error(error)
    console.error(JSON.stringify(error, null, 2))
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

// Helper to query profiles by role and fetch auth emails
async function getEmailsByRole(supabaseClient: any, role: string) {
  const { data: profiles, error } = await supabaseClient.from('profiles').select('id').eq('role', role)
  if (error || !profiles) return []

  const emails = []
  for (const profile of profiles) {
    const { data: authUser } = await supabaseClient.auth.admin.getUserById(profile.id)
    if (authUser?.user?.email) {
      emails.push(authUser.user.email)
    }
  }
  return emails
}

async function logNotification(supabaseClient: any, bookingId: string, customerId: string | null, type: string, message: string) {
  await supabaseClient.from('notifications').insert({
    booking_id: bookingId,
    customer_id: customerId,
    notification_type: type,
    message: message,
    sent_via: 'email'
  })
}

// ----------------------------------------------------
// HTML Templates
// ----------------------------------------------------

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background-color: #f4f4f5; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
  .content { background-color: #ffffff; padding: 20px; border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 8px 8px; }
  .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  .details-table th, .details-table td { padding: 12px; border-bottom: 1px solid #e4e4e7; text-align: left; }
  .details-table th { width: 40%; color: #52525b; font-weight: 500; }
  .footer { margin-top: 20px; font-size: 12px; color: #71717a; text-align: center; }
  .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 14px; background-color: #dcfce7; color: #166534; }
`

function getDetailsTable(booking: any) {
  return `
    <table class="details-table">
      <tr><th>Booking ID</th><td><strong>${booking.booking_number}</strong></td></tr>
      <tr><th>Customer Name</th><td>${booking.customer_name}</td></tr>
      <tr><th>Email</th><td>${booking.customer_email}</td></tr>
      <tr><th>Mobile</th><td>${booking.customer_mobile}</td></tr>
      <tr><th>Address & Pincode</th><td>${booking.customer_address || 'N/A'} - ${booking.pincode}</td></tr>
      <tr><th>Device Type</th><td>${booking.device_types?.name || 'N/A'}</td></tr>
      <tr><th>Brand</th><td>${booking.brands?.name || 'N/A'}</td></tr>
      <tr><th>Problem Category</th><td>${booking.problem_categories?.name || 'N/A'}</td></tr>
      <tr><th>Service Type</th><td><span style="text-transform: capitalize;">${booking.service_type.replace('_', ' ')}</span></td></tr>
      <tr><th>Preferred Date</th><td>${booking.scheduled_date}</td></tr>
      <tr><th>Time Slot</th><td>${booking.time_slots?.slot_time || 'N/A'}</td></tr>
    </table>
  `
}

function getCustomerConfirmationHtml(booking: any) {
  return `
    <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Repair Booking Confirmed! 🎉</h2>
          </div>
          <div class="content">
            <p>Hi ${booking.customer_name},</p>
            <p>Thank you for choosing us for your repair needs. Your booking has been successfully received and is currently being processed.</p>
            <h3>Booking Details</h3>
            ${getDetailsTable(booking)}
            <p>We will keep you updated on the status of your repair. If you have any questions, feel free to reply to this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LapFix. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `
}

function getAdminNotificationHtml(booking: any) {
  return `
    <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Booking Alert 🚨</h2>
          </div>
          <div class="content">
            <p>A new repair booking has been submitted.</p>
            ${getDetailsTable(booking)}
            <p><a href="${Deno.env.get('PUBLIC_SITE_URL') || '#'}/admin">Log in to Admin Panel</a> to manage this booking.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function getTechnicianNewBookingHtml(booking: any) {
  return `
    <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Repair Booking Available 📢</h2>
          </div>
          <div class="content">
            <p>A new repair booking has been registered in the system.</p>
            ${getDetailsTable(booking)}
            <p><a href="${Deno.env.get('PUBLIC_SITE_URL') || '#'}/technician">Log in to Technician Panel</a> to view details.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function getTechnicianAssignmentHtml(booking: any) {
  return `
    <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Repair Assignment 🔧</h2>
          </div>
          <div class="content">
            <p>You have been assigned a new repair job.</p>
            ${getDetailsTable(booking)}
            <p>Please review the details and prepare for the service.</p>
            <p><a href="${Deno.env.get('PUBLIC_SITE_URL') || '#'}/technician">Log in to Technician Panel</a></p>
          </div>
        </div>
      </body>
    </html>
  `
}

function getStatusUpdateHtml(booking: any, newStatus: string) {
  return `
    <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Repair Status Update</h2>
          </div>
          <div class="content">
            <p>Hi ${booking.customer_name},</p>
            <p>The status of your repair booking <strong>${booking.booking_number}</strong> has been updated to:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span class="badge">${newStatus}</span>
            </div>
            <p>Device Details:</p>
            <table class="details-table">
              <tr><th>Device Type</th><td>${booking.device_types?.name || 'N/A'}</td></tr>
              <tr><th>Brand</th><td>${booking.brands?.name || 'N/A'}</td></tr>
              <tr><th>Problem</th><td>${booking.problem_categories?.name || 'N/A'}</td></tr>
            </table>
            ${newStatus === 'Ready for Delivery' ? '<p>Your device is ready to be delivered back to you!</p>' : ''}
            ${newStatus === 'Delivered' ? '<p>Thank you for your business. We hope your device is working perfectly!</p>' : ''}
          </div>
        </div>
      </body>
    </html>
  `
}
