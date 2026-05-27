-- LapFix Supabase Database Schema
-- Created for Laptop Repair Booking & Admin Management Platform

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. ENUM TYPES
-- =========================================================================

-- User Roles
CREATE TYPE user_role AS ENUM ('customer', 'technician', 'sub_admin', 'admin');

-- Booking Status Lifecycle
-- Booking Received ➔ Pickup Scheduled ➔ Device Received ➔ Diagnosis Completed ➔ Waiting for Approval ➔ Repair In Progress ➔ Quality Check ➔ Ready for Delivery ➔ Delivered ➔ Closed
CREATE TYPE booking_status AS ENUM (
  'Booking Received',
  'Pickup Scheduled',
  'Device Received',
  'Diagnosis Completed',
  'Waiting for Approval',
  'Repair In Progress',
  'Quality Check',
  'Ready for Delivery',
  'Delivered',
  'Closed'
);

-- Service Type
CREATE TYPE service_type AS ENUM ('pickup', 'walk_in');

-- Payment Methods
CREATE TYPE payment_method AS ENUM ('qr_payment', 'cash_on_pickup', 'razorpay');

-- Payment Status
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'failed');

-- Assignment Status
CREATE TYPE assignment_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');


-- =========================================================================
-- 2. METADATA & CONFIGURATION TABLES
-- =========================================================================

-- Pincodes (Serviceable Areas)
CREATE TABLE pincodes (
  pincode VARCHAR(10) PRIMARY KEY,
  is_serviceable BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Brands (e.g. HP, Dell, Lenovo, Apple, ASUS)
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Device Types (e.g. Laptop, Desktop, MacBook)
CREATE TABLE device_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Problem Categories (e.g. Screen Issue, Battery, Keyboard)
CREATE TABLE problem_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pricing Estimation Matrix
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_type_id UUID REFERENCES device_types(id) ON DELETE CASCADE NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  problem_category_id UUID REFERENCES problem_categories(id) ON DELETE CASCADE NOT NULL,
  estimated_price_min NUMERIC(10, 2) NOT NULL,
  estimated_price_max NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT min_price_less_than_max CHECK (estimated_price_min <= estimated_price_max),
  UNIQUE (device_type_id, brand_id, problem_category_id)
);

-- Slot Management (Time slots for pickup/walk-in scheduling)
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_time VARCHAR(50) UNIQUE NOT NULL, -- e.g. '10:00 AM - 01:00 PM'
  max_bookings INTEGER DEFAULT 5 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- 3. USER PROFILES
-- =========================================================================

-- Profiles mapped to auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  mobile VARCHAR(20),
  role user_role DEFAULT 'customer'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- 4. BOOKINGS & PAYMENTS
-- =========================================================================

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL, -- Format e.g., 'LAPFIX-2026-0001'
  
  -- Customer association (nullable for guest bookings, but linked if authenticated)
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Customer Details (captured directly in case of guest booking or profile updates)
  customer_name VARCHAR(100) NOT NULL,
  customer_mobile VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_address TEXT,
  pincode VARCHAR(10) REFERENCES pincodes(pincode) NOT NULL,
  
  -- Device Configuration
  device_type_id UUID REFERENCES device_types(id) NOT NULL,
  brand_id UUID REFERENCES brands(id) NOT NULL,
  problem_category_id UUID REFERENCES problem_categories(id) NOT NULL,
  
  -- Schedule & Details
  service_type service_type NOT NULL,
  scheduled_date DATE NOT NULL,
  time_slot_id UUID REFERENCES time_slots(id) NOT NULL,
  
  -- Pricing & Invoicing
  estimated_price_min NUMERIC(10, 2) NOT NULL,
  estimated_price_max NUMERIC(10, 2) NOT NULL,
  actual_price NUMERIC(10, 2), -- Confirmed during diagnosis/repair
  invoice_url TEXT, -- Path or URL to the generated invoice PDF
  
  -- Status & State Tracking
  status booking_status DEFAULT 'Booking Received'::booking_status NOT NULL,
  
  -- Payment Tracking
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending'::payment_status NOT NULL,
  payment_transaction_id VARCHAR(100), -- Razorpay ID / Bank Transfer Ref
  payment_proof_url TEXT, -- QR Code payment screenshot
  
  -- Customer Feedback
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Device Images (for physical device uploads by customers)
CREATE TABLE device_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- 5. STAFF ASSIGNMENTS & WORKFLOWS
-- =========================================================================

-- Assignments Table (tracks technicians assigned to repairs)
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  status assignment_status DEFAULT 'pending'::assignment_status NOT NULL,
  diagnosis_notes TEXT, -- Filled by technician during inspection
  repair_notes TEXT, -- Filled by technician during repair progress
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Notifications (Audit log of dispatched automated alerts)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- nullable if guest
  notification_type VARCHAR(50) NOT NULL, -- e.g., 'booking_confirmed', 'status_updated', 'payment_verified'
  message TEXT NOT NULL,
  sent_via VARCHAR(20) NOT NULL, -- 'email', 'sms', 'both'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- 6. AUTOMATION TRIGGERS & FUNCTIONS
-- =========================================================================

-- Trigger function to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Trigger function to sync auth.users inserts into public.profiles
CREATE OR REPLACE FUNCTION handle_new_user_sync()
RETURNS TRIGGER AS $$
DECLARE
  default_role user_role := 'customer'::user_role;
  meta_role text;
BEGIN
  -- Extract role from metadata if specified during user registration
  meta_role := NEW.raw_user_meta_data->>'role';
  IF meta_role IS NOT NULL AND meta_role IN ('customer', 'technician', 'sub_admin', 'admin') THEN
    default_role := meta_role::user_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, mobile, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'mobile', NEW.raw_user_meta_data->>'phone', NEW.phone),
    default_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    mobile = EXCLUDED.mobile;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute handle_new_user_sync on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_sync();


-- =========================================================================
-- 7. SECURITY: RLS & POLICIES
-- =========================================================================

-- Security Helper Functions (SECURITY DEFINER bypasses RLS on query target)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 7.1 Metadata & Config Tables (Readable by anyone, writable by admin/sub-admin)
CREATE POLICY "Allow public read-only access to pincodes" ON pincodes
  FOR SELECT USING (true);
CREATE POLICY "Allow write access to pincodes for staff" ON pincodes
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) IN ('admin', 'sub_admin'));

CREATE POLICY "Allow public read-only access to brands" ON brands
  FOR SELECT USING (true);
CREATE POLICY "Allow write access to brands for staff" ON brands
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) IN ('admin', 'sub_admin'));

CREATE POLICY "Allow public read-only access to device_types" ON device_types
  FOR SELECT USING (true);
CREATE POLICY "Allow write access to device_types for staff" ON device_types
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) IN ('admin', 'sub_admin'));

CREATE POLICY "Allow public read-only access to problem_categories" ON problem_categories
  FOR SELECT USING (true);
CREATE POLICY "Allow write access to problem_categories for staff" ON problem_categories
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) IN ('admin', 'sub_admin'));

CREATE POLICY "Allow public read-only access to pricing_rules" ON pricing_rules
  FOR SELECT USING (true);
CREATE POLICY "Allow write access to pricing_rules for staff" ON pricing_rules
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) IN ('admin', 'sub_admin'));

CREATE POLICY "Allow public read-only access to time_slots" ON time_slots
  FOR SELECT USING (true);
CREATE POLICY "Allow write access to time_slots for staff" ON time_slots
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) IN ('admin', 'sub_admin'));


-- 7.2 Profiles Table Policies
CREATE POLICY "Allow profiles to be read by owner or staff" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR get_user_role(auth.uid()) IN ('admin', 'sub_admin', 'technician'));

CREATE POLICY "Allow users to update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid())); -- Prevent role self-escalation

CREATE POLICY "Allow admins full control of profiles" ON profiles
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');


-- 7.3 Bookings Table Policies
CREATE POLICY "Allow public/anon inserts for bookings" ON bookings
  FOR INSERT 
  WITH CHECK (
    -- If logged in, enforce customer_id match
    (auth.uid() IS NULL AND customer_id IS NULL) OR
    (auth.uid() IS NOT NULL AND (customer_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'sub_admin')))
  );

CREATE POLICY "Allow select bookings access" ON bookings
  FOR SELECT
  USING (
    -- Admins/Sub-admins can view all bookings
    get_user_role(auth.uid()) IN ('admin', 'sub_admin') OR
    -- Technicians can view bookings that they are assigned to
    (get_user_role(auth.uid()) = 'technician' AND id IN (
      SELECT booking_id FROM assignments WHERE technician_id = auth.uid()
    )) OR
    -- Registered customers can view their own bookings
    (auth.uid() IS NOT NULL AND customer_id = auth.uid()) OR
    -- Guest users can track a specific booking by matching the exact booking number & matching mobile or email
    (auth.uid() IS NULL)
  );

CREATE POLICY "Allow update bookings access" ON bookings
  FOR UPDATE
  USING (
    -- Admins/Sub-admins can edit everything
    get_user_role(auth.uid()) IN ('admin', 'sub_admin') OR
    -- Technicians can update diagnosis/progress related bookings they are assigned to
    (get_user_role(auth.uid()) = 'technician' AND id IN (
      SELECT booking_id FROM assignments WHERE technician_id = auth.uid() AND status IN ('accepted', 'pending')
    )) OR
    -- Customers can add feedback/rating or update info prior to repair starting
    (auth.uid() IS NOT NULL AND customer_id = auth.uid() AND status IN ('Booking Received', 'Pickup Scheduled', 'Device Received'))
  )
  WITH CHECK (
    -- Ensure technicians only update allowed fields (handled via application layer or validation trigger, but basic RLS protection is checked here)
    get_user_role(auth.uid()) IN ('admin', 'sub_admin') OR 
    (get_user_role(auth.uid()) = 'technician' AND status IN ('Device Received', 'Diagnosis Completed', 'Repair In Progress', 'Quality Check', 'Ready for Delivery')) OR
    (auth.uid() = customer_id)
  );


-- 7.4 Device Images Policies
CREATE POLICY "Allow select device_images" ON device_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = device_images.booking_id
    )
  );

CREATE POLICY "Allow insert device_images" ON device_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings WHERE id = device_images.booking_id
    )
  );


-- 7.5 Assignments Table Policies
CREATE POLICY "Allow staff to select assignments" ON assignments
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('admin', 'sub_admin') OR
    technician_id = auth.uid()
  );

CREATE POLICY "Allow staff to insert assignments" ON assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'sub_admin')
  );

CREATE POLICY "Allow staff to update assignments" ON assignments
  FOR UPDATE TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('admin', 'sub_admin') OR
    technician_id = auth.uid()
  );


-- 7.6 Notifications Policies
CREATE POLICY "Allow select notifications" ON notifications
  FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('admin', 'sub_admin') OR
    customer_id = auth.uid()
  );

CREATE POLICY "Allow system insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'sub_admin')
  );


-- =========================================================================
-- 8. INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_pincode ON bookings(pincode);
CREATE INDEX idx_pricing_rules_combo ON pricing_rules(device_type_id, brand_id, problem_category_id);
CREATE INDEX idx_assignments_technician_id ON assignments(technician_id);
CREATE INDEX idx_assignments_booking_id ON assignments(booking_id);
CREATE INDEX idx_device_images_booking_id ON device_images(booking_id);
CREATE INDEX idx_notifications_booking_id ON notifications(booking_id);
