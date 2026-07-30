// src/server.js
const dotenv = require('dotenv');
dotenv.config();   // 👈 SABSE PEHLE call karo, kisi bhi require se pehle

const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const supabase = require('./config/supabaseClient');   // ab ye .env ke baad load hoga
const authMiddleware = require('./middleware/authMiddleware');   // ye bhi .env ke baad

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ URL Shortener Backend is running!');
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working perfectly!',
    time: new Date().toISOString()
  });
});

app.get('/api/db-test', async (req, res) => {
  const { data, error } = await supabase
    .from('urls')
    .select('*');

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: 'Database connected!', data });
});

// 👇 Naya route — naya user account banayega
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.status(201).json({
    success: true,
    message: 'Signup successful!',
    user: data.user,
  });
});

// 👇 Naya route — user ko login karayega aur JWT token dega
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ success: false, error: error.message });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful!',
    user: data.user,
    token: data.session.access_token,
  });
});

// 👇 URL ko shorten karega — custom alias aur expiry date dono support karta hai
app.post('/api/shorten', authMiddleware, async (req, res) => {
  const { original_url, custom_alias, expires_at } = req.body;
  const user_id = req.user.id;

  if (!original_url) {
    return res.status(400).json({ success: false, error: 'Please provide a URL' });
  }

  try {
    new URL(original_url);
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Please enter a valid URL (e.g., https://example.com)' });
  }

  // 👇 Expiry date optional hai. Agar user ne di hai, toh use validate karo.
  let expiryValue = null; // default: URL kabhi expire nahi hoga

  if (expires_at) {
    const parsedDate = new Date(expires_at);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid expiry date' });
    }

    if (parsedDate <= new Date()) {
      return res.status(400).json({ success: false, error: 'Expiry date must be in the future' });
    }

    expiryValue = parsedDate.toISOString();
  }

  let short_code;

  if (custom_alias) {
    const aliasPattern = /^[a-zA-Z0-9-]+$/;
    if (!aliasPattern.test(custom_alias)) {
      return res.status(400).json({
        success: false,
        error: 'Custom alias can only contain letters, numbers, and hyphens',
      });
    }

    const { data: aliasExists, error: aliasError } = await supabase
      .from('urls')
      .select('id')
      .eq('short_code', custom_alias)
      .maybeSingle();

    if (aliasError) {
      return res.status(500).json({ success: false, error: aliasError.message });
    }

    if (aliasExists) {
      return res.status(409).json({
        success: false,
        error: 'This alias is already taken. Please choose another.',
      });
    }

    short_code = custom_alias;
  } else {
    const { data: existing, error: findError } = await supabase
      .from('urls')
      .select('*')
      .eq('original_url', original_url)
      .eq('user_id', user_id)
      .maybeSingle();

    if (findError) {
      return res.status(500).json({ success: false, error: findError.message });
    }

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        short_url: `http://localhost:${PORT}/${existing.short_code}`,
        message: 'This URL was already shortened before'
      });
    }

    short_code = nanoid(6);
  }

  const { data, error } = await supabase
    .from('urls')
    .insert([{ original_url, short_code, user_id, expires_at: expiryValue }])
    .select();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.status(201).json({
    success: true,
    data: data[0],
    short_url: `http://localhost:${PORT}/${short_code}`
  });
});

// 👇 Naya route — sirf LOGGED-IN USER ke apne URLs dikhayega (search + pagination ke saath)
app.get('/api/urls', authMiddleware, async (req, res) => {
  const user_id = req.user.id;

  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('urls')
    .select('*', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`original_url.ilike.%${search}%,short_code.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({
    success: true,
    data,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  });
});

// 👇 Naya route — ek specific URL ke clicks ko date-wise group karke bhejega
app.get('/api/urls/:id/analytics', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const { data: urlData, error: urlError } = await supabase
    .from('urls')
    .select('id')
    .eq('id', id)
    .eq('user_id', user_id)
    .maybeSingle();

  if (urlError || !urlData) {
    return res.status(404).json({ success: false, error: 'URL not found' });
  }

  const { data: clicks, error: clicksError } = await supabase
    .from('url_clicks')
    .select('clicked_at')
    .eq('url_id', id);

  if (clicksError) {
    return res.status(500).json({ success: false, error: clicksError.message });
  }

  const grouped = {};
  clicks.forEach((click) => {
    const date = click.clicked_at.split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  const result = Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({ success: true, data: result });
});

// 👇 Naya route — kisi URL ka original_url update karega
app.put('/api/urls/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { original_url, short_code, expires_at } = req.body;
  const user_id = req.user.id;

  if (!original_url) {
    return res.status(400).json({ success: false, error: 'Please provide a URL' });
  }

  try {
    new URL(original_url);
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Please enter a valid URL' });
  }

  // 👇 Expiry date optional hai. Khali bhej ke bhi expiry hata sakte hain.
  let expiryValue = null;

  if (expires_at) {
    const parsedDate = new Date(expires_at);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid expiry date' });
    }

    if (parsedDate <= new Date()) {
      return res.status(400).json({ success: false, error: 'Expiry date must be in the future' });
    }

    expiryValue = parsedDate.toISOString();
  }

  const updatePayload = { original_url, expires_at: expiryValue };

  // 👇 Short code (alias) bhi update karne diya, agar user ne change kiya ho
  if (short_code) {
    const aliasPattern = /^[a-zA-Z0-9-]+$/;
    if (!aliasPattern.test(short_code)) {
      return res.status(400).json({
        success: false,
        error: 'Short code can only contain letters, numbers, and hyphens',
      });
    }

    const { data: aliasExists, error: aliasError } = await supabase
      .from('urls')
      .select('id')
      .eq('short_code', short_code)
      .neq('id', id)
      .maybeSingle();

    if (aliasError) {
      return res.status(500).json({ success: false, error: aliasError.message });
    }

    if (aliasExists) {
      return res.status(409).json({
        success: false,
        error: 'This short code is already taken. Please choose another.',
      });
    }

    updatePayload.short_code = short_code;
  }

  const { data, error } = await supabase
    .from('urls')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user_id)
    .select();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ success: false, error: 'URL not found' });
  }

  res.json({ success: true, data: data[0] });
});

// 👇 Naya route — kisi URL ko delete karega
app.delete('/api/urls/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('urls')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)
    .select();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ success: false, error: 'URL not found' });
  }

  res.json({ success: true, message: 'URL deleted successfully' });
});

// 👇 Ek helper — expired ya not-found link ke liye sundar HTML page banata hai
function renderLinkErrorPage({ title, heading, message, icon = '🔗' }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: radial-gradient(circle at top, #1e1030 0%, #000000 70%);
      color: #fff;
      padding: 24px;
    }
    .card {
      max-width: 420px;
      text-align: center;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(147, 51, 234, 0.35);
      border-radius: 24px;
      padding: 48px 32px;
      box-shadow: 0 0 60px rgba(147, 51, 234, 0.15);
    }
    .icon {
      font-size: 56px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
    }
    p {
      color: #a1a1aa;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    a.btn {
      display: inline-block;
      background: #9333ea;
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 12px;
      transition: background 0.2s;
    }
    a.btn:hover { background: #7e22ce; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${heading}</h1>
    <p>${message}</p>
    <a class="btn" href="${FRONTEND_URL}">Go to Shortr</a>
  </div>
</body>
</html>`;
}

// 👇 Redirect route — short code se original URL pe le jaayega, aur click record karega
app.get('/:short_code', async (req, res) => {
  const { short_code } = req.params;

  const { data, error } = await supabase
    .from('urls')
    .select('*')
    .eq('short_code', short_code)
    .single();

  if (error || !data) {
    return res.status(404).send(
      renderLinkErrorPage({
        title: 'Link Not Found — Shortr',
        heading: 'This link doesn’t exist',
        message: 'The short link you followed may have been mistyped, or it may have been deleted by its owner.',
        icon: '🔍',
      })
    );
  }

  // 👇 Naya check — agar expiry date set hai aur wo beet chuki hai, toh redirect mat karo
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    const formattedDate = new Date(data.expires_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return res.status(410).send(
      renderLinkErrorPage({
        title: 'Link Expired — Shortr',
        heading: 'This link has expired',
        message: `This short link stopped working on ${formattedDate}. Please ask the sender for a new link.`,
        icon: '⏰',
      })
    );
  }

  await supabase
    .from('urls')
    .update({ clicks: data.clicks + 1 })
    .eq('short_code', short_code);

  await supabase
    .from('url_clicks')
    .insert([{ url_id: data.id }]);

  res.redirect(data.original_url);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});