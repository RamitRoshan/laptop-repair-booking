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

### 1. Initialize Supabase Client
Create `src/lib/supabaseClient.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Fetching Dynamic Estimates
Retrieve estimated repair cost on selection of Device Type, Brand, and Problem:
```javascript
export async function getPriceEstimate(deviceTypeId, brandId, problemCategoryId) {
  const { data, error } = await supabase
    .from('pricing_rules')
    .select('estimated_price_min, estimated_price_max')
    .eq('device_type_id', deviceTypeId)
    .eq('brand_id', brandId)
    .eq('problem_category_id', problemCategoryId)
    .single();

  if (error) {
    console.error('No estimate rule matches this combination, returning default range.');
    return { min: 499, max: 1499 }; // Fallback base estimation
  }
  return { min: data.estimated_price_min, max: data.estimated_price_max };
}
```

### 3. Submitting a New Booking (with optional image uploads)
```javascript
export async function createBooking({ customerDetails, deviceDetails, serviceDetails, files }) {
  // 1. Generate unique booking number
  const uniqueId = `LAPFIX-${Date.now().toString().slice(-6)}`;
  
  // 2. Insert main booking
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .insert([{
      booking_number: uniqueId,
      customer_id: supabase.auth.user()?.id || null, // Null for guests
      customer_name: customerDetails.name,
      customer_mobile: customerDetails.mobile,
      customer_email: customerDetails.email,
      customer_address: customerDetails.address,
      pincode: customerDetails.pincode,
      device_type_id: deviceDetails.deviceTypeId,
      brand_id: deviceDetails.brandId,
      problem_category_id: deviceDetails.problemCategoryId,
      service_type: serviceDetails.type, // 'pickup' | 'walk_in'
      scheduled_date: serviceDetails.date,
      time_slot_id: serviceDetails.slotId,
      estimated_price_min: deviceDetails.minPrice,
      estimated_price_max: deviceDetails.maxPrice,
      payment_method: serviceDetails.paymentMethod // 'qr_payment' | 'cash_on_pickup' | 'razorpay'
    }])
    .select()
    .single();

  if (bookingErr) throw bookingErr;

  // 3. Handle device image uploads (if any)
  if (files && files.length > 0) {
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const filePath = `booking-${booking.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadErr } = await supabase.storage
        .from('device-images')
        .upload(filePath, file);

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage
          .from('device-images')
          .getPublicUrl(filePath);

        await supabase
          .from('device_images')
          .insert([{ booking_id: booking.id, image_url: publicUrlData.publicUrl }]);
      }
    }
  }

  return booking;
}
```

### 4. Real-time Repair Status Tracking (Customer Interface)
Subscribe to live changes on a customer's specific booking:
```javascript
import { useEffect, useState } from 'react';

export function useBookingTracking(bookingId) {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Initial fetch
    supabase
      .from('bookings')
      .select('*, brands(name), device_types(name), problem_categories(name)')
      .eq('id', bookingId)
      .single()
      .then(({ data }) => setBooking(data));

    // Live subscription
    const channel = supabase
      .channel(`booking-status-${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` },
        (payload) => {
          setBooking((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  return booking;
}
```

### 5. Fetching Dashboard KPIs (Admin Panel)
To display dashboard statistics dynamically, execute the following calls:
```javascript
export async function fetchAdminKPIs() {
  // Aggregate stats
  const { data: countData } = await supabase
    .from('bookings')
    .select('status, actual_price');

  const stats = {
    totalBookings: countData.length,
    pendingRepairs: countData.filter(b => b.status !== 'Delivered' && b.status !== 'Closed').length,
    completedRepairs: countData.filter(b => b.status === 'Delivered' || b.status === 'Closed').length,
    revenue: countData
      .filter(b => b.actual_price)
      .reduce((sum, b) => sum + parseFloat(b.actual_price), 0)
  };

  return stats;
}
```
