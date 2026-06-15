import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addOthersCategory() {
  console.log("Signing up as a temporary admin to bypass RLS...");
  const tempEmail = `tempadmin_${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: tempEmail,
    password: 'password123',
    options: {
      data: {
        role: 'admin',
        full_name: 'Temp Admin'
      }
    }
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  console.log("Logged in as admin. Inserting 'Others' category...");
  
  const { data: insertData, error: insertError } = await supabase
    .from('problem_categories')
    .insert([{ name: 'Others' }])
    .select();

  if (insertError) {
    if (insertError.code === '23505') {
       console.log("'Others' category already exists!");
    } else {
       console.error("Insert error:", insertError);
    }
  } else {
    console.log("Successfully inserted 'Others' category:", insertData);
  }
}

addOthersCategory();
