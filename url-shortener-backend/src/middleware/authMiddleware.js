// src/middleware/authMiddleware.js
const supabase = require('../config/supabaseClient');

// Ye function ek "security guard" hai jo har protected route se pehle chalega
const authMiddleware = async (req, res, next) => {
  // Step 1: Header se token nikalo
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  // Step 2: Header ka format hota hai "Bearer <token>", isliye split karke sirf token nikalo
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Invalid token format' });
  }

  // Step 3: Supabase se check karwao ye token valid hai kya
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  // Step 4: User ki info request object me attach kar do — aage routes isko use kar sakenge
  req.user = data.user;

  // Step 5: Sab sahi hai, aage badhne do
  next();
};

module.exports = authMiddleware;