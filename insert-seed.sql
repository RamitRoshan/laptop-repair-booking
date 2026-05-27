-- Run this script in your Supabase SQL Editor to populate the dropdowns!

-- 1. Insert Pincodes
INSERT INTO public.pincodes (pincode, is_serviceable) VALUES 
('560001', true),
('560002', true),
('560003', true),
('560004', true),
('560005', true),
('560006', true),
('560007', true),
('560008', true),
('560009', true),
('560010', true),
('560011', true),
('560012', true),
('560013', true),
('560014', true),
('560015', true),
('560016', true),
('560017', true),
('560018', true),
('560019', true),
('560020', true),
('560021', true),
('560022', true),
('560023', true),
('560024', true),
('560025', true),
('560026', true),
('560027', true),
('560028', true),
('560029', true),
('560030', true),
('560032', true),
('560033', true),
('560034', true),
('560035', true),
('560036', true),
('560037', true),
('560038', true),
('560039', true),
('560040', true),
('560041', true),
('560042', true),
('560043', true),
('560045', true),
('560047', true),
('560048', true),
('560049', true),
('560050', true),
('560051', true),
('560054', true),
('560055', true),
('560056', true),
('560057', true),
('560058', true),
('560059', true),
('560060', true),
('560061', true),
('560062', true),
('560063', true),
('560064', true),
('560065', true),
('560066', true),
('560067', true),
('560068', true),
('560070', true),
('560071', true),
('560072', true),
('560073', true),
('560074', true),
('560075', true),
('560076', true),
('560077', true),
('560078', true),
('560079', true),
('560080', true),
('560083', true),
('560084', true),
('560085', true),
('560086', true),
('560087', true),
('560090', true),
('560091', true),
('560092', true),
('560093', true),
('560094', true),
('560095', true),
('560096', true),
('560097', true),
('560098', true),
('560099', true),
('560100', true),
('560102', true),
('560103', true),
('560104', true)
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
