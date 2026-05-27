-- LapFix Supabase Seed Data
-- Run this script in your Supabase SQL Editor to populate the dropdowns!

-- 1. Insert Pincodes
INSERT INTO public.pincodes (pincode, is_serviceable) VALUES 
('110001', true),
('400001', true),
('560001', true),
('600001', true),
('700001', true),
('201301', true)
ON CONFLICT (pincode) DO NOTHING;

-- 2. Insert Brands
INSERT INTO public.brands (name) VALUES 
('Apple'), 
('Dell'), 
('HP'), 
('Lenovo'), 
('ASUS')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Device Types
INSERT INTO public.device_types (name) VALUES 
('Laptop'), 
('Desktop'), 
('MacBook')
ON CONFLICT (name) DO NOTHING;

-- 4. Insert Problem Categories
INSERT INTO public.problem_categories (name) VALUES 
('Screen Issue'), 
('Battery Replacement'), 
('Keyboard Defect'), 
('Motherboard Repair'), 
('Software / OS Reinstall'), 
('Water Damage Restoration')
ON CONFLICT (name) DO NOTHING;

-- 5. Insert Time Slots
INSERT INTO public.time_slots (slot_time, max_bookings) VALUES 
('09:00 AM - 12:00 PM', 5), 
('12:00 PM - 03:00 PM', 5), 
('03:00 PM - 06:00 PM', 5)
ON CONFLICT (slot_time) DO NOTHING;
