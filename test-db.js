import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const payload = {
    booking_number: 'WS-TEST-1234',
    customer_id: null,
    customer_name: 'Test User',
    customer_mobile: '9999999999',
    customer_email: 'test@example.com',
    customer_address: 'Walk-in Service Center',
    pincode: null,
    device_type_id: 'dt1',
    brand_id: 'b1',
    problem_category_id: 'pc1',
    service_type: 'walk_in',
    scheduled_date: '2026-05-30',
    time_slot_id: 'ts1',
    estimated_price_min: 1000,
    estimated_price_max: 2000,
    payment_method: 'cash_on_pickup',
    payment_status: 'pending'
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Insert successful:', data);
    // Cleanup
    await supabase.from('bookings').delete().eq('id', data.id);
  }
}

testInsert();
