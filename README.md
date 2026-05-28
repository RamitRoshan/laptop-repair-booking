# LapFix: Laptop Repair Booking & Admin Management Platform (Supabase Backend)

This directory contains the production-ready Supabase backend SQL scripts designed for **LapFix**. The schema, security policies, and storage configs are built directly from the application's user flows (Customer, Admin, and Technician).

---

## 📁 Repository Structure
- [`schema.sql`](file:///d:/laptop-repair-booking/schema.sql) - Database schema, enums, triggers, and Row Level Security (RLS) policies.
- [`storage.sql`](file:///d:/laptop-repair-booking/storage.sql) - Supabase Storage buckets initialization and storage-specific RLS policies.

---

## 🗄️ Database Relationships Explanation

```
[profiles] ──(optional 1:N)── [bookings] ──(1:N)── [device_images]
                                │
                                ├──(N:1)── [brands]
                                ├──(N:1)── [device_types]
                                ├──(N:1)── [problem_categories]
                                ├──(N:1)── [time_slots]
                                └──(N:1)── [pincodes]
```

- **`bookings`** is the core transaction table. It acts as the central hub linking metadata (`brands`, `device_types`, `problem_categories`, `time_slots`, `pincodes`) to transaction states.
- **`profiles`** maintains user profiles synced from `auth.users`. It is linked to `bookings` via `customer_id` (which can be `NULL` for guest bookings, ensuring frictionless checkout).
- **`device_images`** links physical device condition screenshots (from the customer) to a booking request.
- **`assignments`** links a booking to a technician `profile` who manages the inspection and repair lifecycle.
- **`pricing_rules`** acts as a static lookup matrix to compute pricing dynamically based on the customer's selection of (Device Type, Brand, Problem Category).

---

## 🛢️ Supabase Storage Configuration

The system uses two dedicated buckets configured in [`storage.sql`](file:///d:/laptop-repair-booking/storage.sql):

1. **`device-images`**:
   - **Type:** Public bucket.
   - **Uploads:** Anonymous or logged-in users during repair request configuration.
   - **Access:** Anyone can view images using public URLs. Only staff can delete them.
2. **`payment-proofs`**:
   - **Type:** Private bucket.
   - **Uploads:** Users uploading screenshots of bank QR code transactions.
   - **Access:** Restricted to the uploader (folders named by `auth.uid()`) and admins/sub-admins.

---

## ⚛️ Frontend Integration Recommendations (React)

Install the Supabase client:
```bash
npm install @supabase/supabase-js
```

 