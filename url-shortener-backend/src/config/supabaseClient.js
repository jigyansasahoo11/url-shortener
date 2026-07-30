// src/config/supabaseClient.js

// Supabase library se ek function import kar rahe hain jo connection banata hai
const { createClient } = require('@supabase/supabase-js');

// .env file se hamari secret values nikal rahe hain
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Ek "supabase" object bana rahe hain — ye hamara connection hai
// Isi object ke through hum database ko read/write karenge
const supabase = createClient(supabaseUrl, supabaseKey);

// Is file se supabase object ko export kar rahe hain
// taaki dusri files (jaise routes) ise use kar sakein
module.exports = supabase;