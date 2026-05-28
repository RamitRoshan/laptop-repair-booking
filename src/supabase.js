import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if we can use the live Supabase backend
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =========================================================================
// LOCALSTORAGE MOCK DATABASE ENGINE
// =========================================================================

const SEED_DATA = {
  pincodes: [
    { pincode: '110001', is_serviceable: true },
    { pincode: '400001', is_serviceable: true },
    { pincode: '560001', is_serviceable: true },
    { pincode: '600001', is_serviceable: true },
    { pincode: '700001', is_serviceable: true },
    { pincode: '201301', is_serviceable: true },
  ],
  brands: [
    { id: 'b1', name: 'Apple' },
    { id: 'b2', name: 'Dell' },
    { id: 'b3', name: 'HP' },
    { id: 'b4', name: 'Lenovo' },
    { id: 'b5', name: 'ASUS' }
  ],
  deviceTypes: [
    { id: 'dt1', name: 'Laptop' },
    { id: 'dt2', name: 'Desktop' },
    { id: 'dt3', name: 'MacBook' }
  ],
  problemCategories: [
    { id: 'pc1', name: 'Screen Issue' },
    { id: 'pc2', name: 'Battery Replacement' },
    { id: 'pc3', name: 'Keyboard Defect' },
    { id: 'pc4', name: 'Motherboard Repair' },
    { id: 'pc5', name: 'Software / OS Reinstall' },
    { id: 'pc6', name: 'Water Damage Restoration' }
  ],
  timeSlots: [
    { id: 'ts1', slot_time: '09:00 AM - 12:00 PM', max_bookings: 5 },
    { id: 'ts2', slot_time: '12:00 PM - 03:00 PM', max_bookings: 5 },
    { id: 'ts3', slot_time: '03:00 PM - 06:00 PM', max_bookings: 5 }
  ],
  profiles: [
    { id: 'admin-user', full_name: 'Lead Admin Officer', mobile: '9999900001', role: 'admin' },
    { id: 'tech-user-1', full_name: 'Alex Smith (Sr. Hardware)', mobile: '9999900002', role: 'technician' },
    { id: 'tech-user-2', full_name: 'Sarah Jenkins (OS Specialist)', mobile: '9999900003', role: 'technician' },
    { id: 'customer-user-1', full_name: 'Rahul Sharma', mobile: '9810012345', role: 'customer' }
  ],
  bookings: [
    {
      id: 'mock-b-1',
      booking_number: 'WS-2026-0001',
      customer_id: 'customer-user-1',
      customer_name: 'Rahul Sharma',
      customer_mobile: '9810012345',
      customer_email: 'rahul@gmail.com',
      customer_address: 'Flat 402, Green Glen Layout, Bangalore',
      pincode: '560001',
      device_type_id: 'dt3',
      brand_id: 'b1',
      problem_category_id: 'pc1',
      service_type: 'pickup',
      scheduled_date: '2026-05-28',
      time_slot_id: 'ts1',
      estimated_price_min: 8000,
      estimated_price_max: 12000,
      actual_price: null,
      status: 'Booking Received',
      payment_method: 'qr_payment',
      payment_status: 'pending',
      payment_proof_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      rating: null,
      feedback: null,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'mock-b-2',
      booking_number: 'WS-2026-0002',
      customer_id: null,
      customer_name: 'Jane Doe',
      customer_mobile: '9876543210',
      customer_email: 'jane@outlook.com',
      customer_address: '12th Cross Road, Connaught Place, New Delhi',
      pincode: '110001',
      device_type_id: 'dt1',
      brand_id: 'b2',
      problem_category_id: 'pc2',
      service_type: 'pickup',
      scheduled_date: '2026-05-27',
      time_slot_id: 'ts2',
      estimated_price_min: 1500,
      estimated_price_max: 2500,
      actual_price: 2200,
      status: 'Diagnosis Completed',
      payment_method: 'cash_on_pickup',
      payment_status: 'pending',
      rating: null,
      feedback: null,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'mock-b-3',
      booking_number: 'WS-2026-0003',
      customer_id: null,
      customer_name: 'Amit Patel',
      customer_mobile: '9123456789',
      customer_email: 'amit.patel@yahoo.com',
      customer_address: 'Sector 5, Salt Lake, Kolkata',
      pincode: '700001',
      device_type_id: 'dt1',
      brand_id: 'b3',
      problem_category_id: 'pc4',
      service_type: 'walk_in',
      scheduled_date: '2026-05-26',
      time_slot_id: 'ts3',
      estimated_price_min: 3500,
      estimated_price_max: 6000,
      actual_price: 4800,
      status: 'Delivered',
      payment_method: 'razorpay',
      payment_status: 'verified',
      payment_transaction_id: 'pay_ABC123XYZ',
      rating: 5,
      feedback: 'Excellent motherboard repair service. Very prompt!',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 10).toISOString()
    }
  ],
  assignments: [
    {
      id: 'mock-a-1',
      booking_id: 'mock-b-2',
      technician_id: 'tech-user-1',
      assigned_by: 'admin-user',
      status: 'accepted',
      diagnosis_notes: 'Battery swelling detected. Replacing internal battery cell.',
      repair_notes: 'Battery extracted successfully. Benchmarking voltage capacity.',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  notifications: [
    {
      id: 'mock-n-1',
      booking_id: 'mock-b-1',
      notification_type: 'booking_confirmed',
      message: 'Your booking has been received. Booking Reference: LAPFIX-2026-0001.',
      sent_via: 'both',
      sent_at: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ]
};

// Seeder helper
const initStorage = () => {
  if (!localStorage.getItem('lapfix_initialized')) {
    localStorage.setItem('lapfix_pincodes', JSON.stringify(SEED_DATA.pincodes));
    localStorage.setItem('lapfix_brands', JSON.stringify(SEED_DATA.brands));
    localStorage.setItem('lapfix_deviceTypes', JSON.stringify(SEED_DATA.deviceTypes));
    localStorage.setItem('lapfix_problemCategories', JSON.stringify(SEED_DATA.problemCategories));
    localStorage.setItem('lapfix_timeSlots', JSON.stringify(SEED_DATA.timeSlots));
    localStorage.setItem('lapfix_profiles', JSON.stringify(SEED_DATA.profiles));
    localStorage.setItem('lapfix_bookings', JSON.stringify(SEED_DATA.bookings));
    localStorage.setItem('lapfix_assignments', JSON.stringify(SEED_DATA.assignments));
    localStorage.setItem('lapfix_notifications', JSON.stringify(SEED_DATA.notifications));
    localStorage.setItem('lapfix_initialized', 'true');
  }
};

initStorage();

// Storage getters/setters
const getStore = (key) => JSON.parse(localStorage.getItem(`lapfix_${key}`));
const setStore = (key, data) => localStorage.setItem(`lapfix_${key}`, JSON.stringify(data));

// =========================================================================
// UNIFIED DATA CONTROLLER: API ROUTER
// =========================================================================

export const api = {
  auth: {
    login: async ({ email, password }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Email not confirmed. Please check your inbox for the verification link, or disable "Confirm Email" in your Supabase Authentication settings.');
          }
          throw error;
        }
        // Fetch profile to get role
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
        // Use role from profile, or fallback to user_metadata which was set during signup
        const resolvedRole = profile?.role || data.user?.user_metadata?.role;
        
        return { user: { ...data.user, ...profile, role: resolvedRole }, session: data.session };
      }
      // Mock login
      const profiles = getStore('profiles') || [];
      // Use full_name or email for mock matching. Since mock doesn't have password, we just match email (which mock doesn't store for all profiles, so we'll match id or something. Wait, customer mock has email, tech mock doesn't).
      // For mock, we'll just allow any password and match profile by full_name or id matching email prefix.
      const match = profiles.find(p =>
        (p.email && p.email === email) ||
        p.full_name.toLowerCase().includes(email.split('@')[0].toLowerCase()) ||
        p.id === email // backdoor for easy testing
      );
      if (!match) throw new Error('Invalid login credentials');

      const session = { access_token: 'mock-token', user: match };
      localStorage.setItem('lapfix_session', JSON.stringify(session));
      return { user: match, session };
    },
    signup: async ({ email, password, full_name, mobile, role }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name,
              name: full_name, // fallback for triggers expecting 'name'
              mobile,
              phone: mobile, // fallback for triggers expecting 'phone'
              role
            }
          }
        });

        if (error) {
          if (error.message.includes('Database error saving new user')) {
            throw new Error('Supabase Error: Your database has a failing Postgres Trigger on auth.users, or is in read-only mode. Please check your Supabase Dashboard logs.');
          }
          throw error;
        }

        if (data.user) {
          const profileData = { id: data.user.id, full_name, mobile, role, email };
          
          // Try to upsert profile to ensure role and mobile are saved, even if a Postgres trigger created the row first.
          const { error: profileError } = await supabase.from('profiles').upsert([profileData]);
          if (profileError) {
             console.error("Profile upsert error:", profileError);
          }
          
          return { user: { ...data.user, ...profileData }, session: data.session };
        }
      }
      // Mock signup
      const profiles = getStore('profiles') || [];
      const newUser = { id: `mock-u-${Date.now()}`, email, full_name, mobile, role };
      profiles.push(newUser);
      setStore('profiles', profiles);
      const session = { access_token: 'mock-token', user: newUser };
      localStorage.setItem('lapfix_session', JSON.stringify(session));
      return { user: newUser, session };
    },
    logout: async () => {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
        return;
      }
      localStorage.removeItem('lapfix_session');
    },
    getSession: async () => {
      if (isSupabaseConfigured) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return null;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        return { user: { ...session.user, ...profile }, session };
      }
      // Mock session
      const sessStr = localStorage.getItem('lapfix_session');
      return sessStr ? JSON.parse(sessStr) : null;
    }
  },
  brands: {
    list: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('brands').select('*').order('name');
        if (!error) return data;
      }
      return getStore('brands');
    }
  },
  deviceTypes: {
    list: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('device_types').select('*').order('name');
        if (!error) return data;
      }
      return getStore('deviceTypes');
    }
  },
  problemCategories: {
    list: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('problem_categories').select('*').order('name');
        if (!error) return data;
      }
      return getStore('problemCategories');
    }
  },
  timeSlots: {
    list: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('time_slots').select('*').eq('is_active', true);
        if (!error) return data;
      }
      return getStore('timeSlots');
    }
  },
  pincodes: {
    validate: async (pincode) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('pincodes').select('is_serviceable').eq('pincode', pincode).single();
        if (!error && data) return data.is_serviceable;
        return false;
      }
      const list = getStore('pincodes');
      const found = list.find(p => p.pincode === pincode);
      return found ? found.is_serviceable : false;
    }
  },
  pricingRules: {
    getEstimate: async (deviceTypeId, brandId, problemCategoryId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('pricing_rules')
          .select('estimated_price_min, estimated_price_max')
          .eq('device_type_id', deviceTypeId)
          .eq('brand_id', brandId)
          .eq('problem_category_id', problemCategoryId)
          .single();
        if (!error && data) {
          return { min: data.estimated_price_min, max: data.estimated_price_max };
        }
      }
      // Mock pricing computation logic based on inputs if pricing rules don't exist
      const pId = problemCategoryId || 'pc1';
      let multiplier = 1;
      if (deviceTypeId === 'dt3') multiplier = 2.5; // MacBooks are expensive
      if (deviceTypeId === 'dt2') multiplier = 0.8; // Desktops are cheaper

      const rates = {
        pc1: [3000, 6000], // Screen
        pc2: [1500, 2500], // Battery
        pc3: [1200, 2200], // Keyboard
        pc4: [4000, 8000], // Motherboard
        pc5: [600, 1200],   // Software
        pc6: [2500, 5000]  // Water
      };

      const base = rates[pId] || [1000, 2000];
      return {
        min: Math.round(base[0] * multiplier),
        max: Math.round(base[1] * multiplier)
      };
    }
  },
  bookings: {
    create: async (payload) => {
      const uniqueNum = `WS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('bookings')
          .insert([{ ...payload, booking_number: uniqueNum }])
          .select()
          .single();
        if (!error) {
          // Log automated notification
          await supabase.from('notifications').insert([{
            booking_id: data.id,
            customer_id: payload.customer_id,
            notification_type: 'booking_confirmed',
            message: `Booking received! Reference number: ${uniqueNum}`,
            sent_via: 'both'
          }]);
          return data;
        }
        throw error;
      }

      const list = getStore('bookings');
      const newBooking = {
        ...payload,
        id: `mock-b-${Date.now()}`,
        booking_number: uniqueNum,
        actual_price: null,
        status: 'Booking Received',
        payment_status: 'pending',
        rating: null,
        feedback: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      list.unshift(newBooking);
      setStore('bookings', list);

      // Create log notification
      const notifs = getStore('notifications');
      notifs.unshift({
        id: `mock-n-${Date.now()}`,
        booking_id: newBooking.id,
        notification_type: 'booking_confirmed',
        message: `Booking received! Reference number: ${uniqueNum}`,
        sent_via: 'both',
        sent_at: new Date().toISOString()
      });
      setStore('notifications', notifs);

      return newBooking;
    },
    list: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, brands(name), device_types(name), problem_categories(name)')
          .order('created_at', { ascending: false });
        if (!error) return data;
      }

      // Inject text attributes for frontend presentation in mock mode
      const bookings = getStore('bookings');
      const brands = getStore('brands');
      const types = getStore('deviceTypes');
      const categories = getStore('problemCategories');

      return bookings.map(b => ({
        ...b,
        brands: brands.find(br => br.id === b.brand_id) || { name: 'Unknown' },
        device_types: types.find(t => t.id === b.device_type_id) || { name: 'Unknown' },
        problem_categories: categories.find(c => c.id === b.problem_category_id) || { name: 'Unknown' }
      }));
    },
    get: async (bookingNumber, phoneOrEmail) => {
      if (isSupabaseConfigured) {
        // Query to match booking number and email or phone
        const { data, error } = await supabase
          .from('bookings')
          .select('*, brands(name), device_types(name), problem_categories(name)')
          .eq('booking_number', bookingNumber.trim())
          .or(`customer_mobile.eq.${phoneOrEmail.trim()},customer_email.eq.${phoneOrEmail.trim()}`)
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      const all = await api.bookings.list();
      const match = all.find(b =>
        b.booking_number.toLowerCase() === bookingNumber.trim().toLowerCase() &&
        (b.customer_mobile === phoneOrEmail.trim() || b.customer_email.toLowerCase() === phoneOrEmail.trim().toLowerCase())
      );
      return match || null;
    },
    update: async (bookingId, updates) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', bookingId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const list = getStore('bookings');
      const idx = list.findIndex(b => b.id === bookingId);
      if (idx === -1) throw new Error('Booking not found');

      const updated = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      list[idx] = updated;
      setStore('bookings', list);

      // Auto trigger notification if status changed
      if (updates.status) {
        const notifs = getStore('notifications');
        notifs.unshift({
          id: `mock-n-${Date.now()}`,
          booking_id: bookingId,
          notification_type: 'status_updated',
          message: `Your booking status has been updated to: ${updates.status}.`,
          sent_via: 'both',
          sent_at: new Date().toISOString()
        });
        setStore('notifications', notifs);
      }

      return updated;
    },
    uploadImage: async (bookingId, file, type) => {
      // Handles proof-of-payment or device condition image uploads
      // In local mode, we return a mock object URL
      if (isSupabaseConfigured) {
        const bucket = type === 'payment' ? 'payment-proofs' : 'device-images';
        const fileExt = file.name.split('.').pop();
        const filePath = `${bookingId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

        // Link to booking/database
        if (type === 'payment') {
          await api.bookings.update(bookingId, { payment_proof_url: data.publicUrl });
        } else {
          await supabase.from('device_images').insert([{ booking_id: bookingId, image_url: data.publicUrl }]);
        }

        return data.publicUrl;
      }

      const fakeUrl = URL.createObjectURL(file);
      if (type === 'payment') {
        await api.bookings.update(bookingId, { payment_proof_url: fakeUrl });
      } else {
        const deviceImgs = getStore('device_images') || [];
        deviceImgs.push({ id: `di-${Date.now()}`, booking_id: bookingId, image_url: fakeUrl });
        localStorage.setItem('lapfix_device_images', JSON.stringify(deviceImgs));
      }
      return fakeUrl;
    },
    subscribeStatus: (bookingId, callback) => {
      if (isSupabaseConfigured) {
        const channel = supabase
          .channel(`booking-channel-${bookingId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` },
            (payload) => {
              callback(payload.new);
            }
          )
          .subscribe();
        return () => {
          supabase.removeChannel(channel);
        };
      }

      // Mock tracking polling simulation
      const interval = setInterval(async () => {
        const list = getStore('bookings');
        const match = list.find(b => b.id === bookingId);
        if (match) callback(match);
      }, 3000);

      return () => clearInterval(interval);
    }
  },
  assignments: {
    list: async (technicianId) => {
      if (isSupabaseConfigured) {
        const query = supabase
          .from('assignments')
          .select('*, bookings(*, brands(name), device_types(name), problem_categories(name))');
        if (technicianId) query.eq('technician_id', technicianId);
        const { data, error } = await query;
        if (!error) return data;
      }

      const assignments = getStore('assignments');
      const bookings = await api.bookings.list();

      const filtered = technicianId ? assignments.filter(a => a.technician_id === technicianId) : assignments;
      return filtered.map(a => ({
        ...a,
        bookings: bookings.find(b => b.id === a.booking_id)
      })).filter(a => a.bookings !== undefined);
    },
    assign: async (bookingId, technicianId, assignedBy) => {
      if (isSupabaseConfigured) {
        // Upsert assignment record
        const { data: existing } = await supabase.from('assignments').select('id').eq('booking_id', bookingId).maybeSingle();
        let res;
        if (existing) {
          res = await supabase
            .from('assignments')
            .update({ technician_id: technicianId, status: 'pending' })
            .eq('id', existing.id)
            .select()
            .single();
        } else {
          res = await supabase
            .from('assignments')
            .insert([{ booking_id: bookingId, technician_id: technicianId, assigned_by: assignedBy, status: 'pending' }])
            .select()
            .single();
        }
        if (res.error) throw res.error;

        // Push status updates
        await api.bookings.update(bookingId, { status: 'Pickup Scheduled' });
        return res.data;
      }

      const assignments = getStore('assignments');
      const existingIdx = assignments.findIndex(a => a.booking_id === bookingId);

      const newAssign = {
        id: existingIdx !== -1 ? assignments[existingIdx].id : `mock-a-${Date.now()}`,
        booking_id: bookingId,
        technician_id: technicianId,
        assigned_by: assignedBy || 'admin-user',
        status: 'pending',
        diagnosis_notes: existingIdx !== -1 ? assignments[existingIdx].diagnosis_notes : '',
        repair_notes: existingIdx !== -1 ? assignments[existingIdx].repair_notes : '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        assignments[existingIdx] = newAssign;
      } else {
        assignments.unshift(newAssign);
      }
      setStore('assignments', assignments);

      // Update booking status
      await api.bookings.update(bookingId, { status: 'Pickup Scheduled' });
      return newAssign;
    },
    update: async (assignmentId, updates) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('assignments')
          .update(updates)
          .eq('id', assignmentId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const list = getStore('assignments');
      const idx = list.findIndex(a => a.id === assignmentId);
      if (idx === -1) throw new Error('Assignment not found');

      const updated = {
        ...list[idx],
        ...updates,
        updated_at: new Date().toISOString(),
        completed_at: updates.status === 'completed' ? new Date().toISOString() : list[idx].completed_at
      };
      list[idx] = updated;
      setStore('assignments', list);
      return updated;
    }
  },
  profiles: {
    list: async (role) => {
      if (isSupabaseConfigured) {
        const query = supabase.from('profiles').select('*');
        if (role) query.eq('role', role);
        const { data, error } = await query;
        if (!error) return data;
      }
      const list = getStore('profiles');
      return role ? list.filter(p => p.role === role) : list;
    }
  },
  dashboard: {
    getKPIs: async () => {
      // Backend-level Role Enforcement
      const session = await api.auth.getSession();
      if (!session || session.user.role !== 'admin') {
        throw new Error('Backend Access Denied: Administrator privileges required.');
      }
      
      const bookings = await api.bookings.list();
      const totalBookings = bookings.length;
      const pendingRepairs = bookings.filter(b => b.status !== 'Delivered' && b.status !== 'Closed').length;
      const completedRepairs = bookings.filter(b => b.status === 'Delivered' || b.status === 'Closed').length;

      const revenue = bookings
        .filter(b => b.payment_status === 'verified' && b.actual_price)
        .reduce((sum, b) => sum + Number(b.actual_price), 0);

      const ratings = bookings.filter(b => b.rating);
      const avgRating = ratings.length
        ? (ratings.reduce((sum, b) => sum + b.rating, 0) / ratings.length).toFixed(1)
        : 'N/A';

      return {
        totalBookings,
        pendingRepairs,
        completedRepairs,
        revenue,
        avgRating
      };
    }
  },
  notifications: {
    list: async (bookingId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('notifications').select('*').eq('booking_id', bookingId).order('sent_at', { ascending: false });
        if (!error) return data;
      }
      const all = getStore('notifications');
      return all.filter(n => n.booking_id === bookingId);
    }
  }
};
