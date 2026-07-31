// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null); // 👈 desktop dropdown ke DOM element ko "track" karne ke liye
  const mobileRef = useRef(null); // 👈 mobile panel ke DOM element ko "track" karne ke liye

  // Dropdown ke bahar click hote hi band ho jaaye
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup: component hatte hi listener bhi hata do (memory leak se bachne ke liye)
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Route badalte hi mobile menu band kar do
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  // Email ka pehla letter nikala, avatar mein dikhane ke liye
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <nav
      ref={mobileRef}
      className="bg-black/70 backdrop-blur-md border-b border-purple-900/50 sticky top-0 z-20 p-1 rounded-sm"
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <img src={logo} alt="Shortr Logo" className="w-26 h-16 object-cover" />
          <h1 className="text-2xl font-bold text-white tracking-tight">SHORTR</h1>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7 text-lg font-medium text-gray-300">
          <Link to="/" className="hover:text-purple-400 transition">Home</Link>
          <Link to="/features" className="hover:text-purple-400 transition">Features</Link>
          <Link to="/faq" className="hover:text-purple-400 transition">FAQ</Link>
        </div>

        {/* Desktop auth section */}
        <div className="hidden md:block">
          {token ? (
            <div className="relative" ref={menuRef}>
              {/* Avatar button — click se dropdown open/close hota hai */}
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center justify-center text-lg transition"
              >
                {initial}
              </button>

              {/* Dropdown — sirf menuOpen true hone par render hota hai */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-purple-900/50 rounded-2xl shadow-xl shadow-black/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-purple-900/40">
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <p className="text-white font-medium truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-gray-200 hover:bg-purple-950/40 transition text-sm font-medium"
                  >
                    My Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-950/40 transition text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 hover:text-white transition font-medium text-sm h-10 flex items-center"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition font-medium text-sm h-10 flex items-center justify-center"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger button — sirf chhoti screen pe dikhega */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-200 hover:text-purple-400 transition"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown panel — sirf mobileOpen true hone par render hota hai */}
      {mobileOpen && (
        <div className="md:hidden border-t border-purple-900/40 bg-black/90 backdrop-blur-md">
          <div className="px-4 py-3 flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-3 text-gray-200 hover:text-purple-400 hover:bg-purple-950/30 rounded-lg transition font-medium"
            >
              Home
            </Link>
            <Link
              to="/features"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-3 text-gray-200 hover:text-purple-400 hover:bg-purple-950/30 rounded-lg transition font-medium"
            >
              Features
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-3 text-gray-200 hover:text-purple-400 hover:bg-purple-950/30 rounded-lg transition font-medium"
            >
              FAQ
            </Link>

            <div className="border-t border-purple-900/40 my-2" />

            {token ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-white text-sm font-medium truncate">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 text-gray-200 hover:text-purple-400 hover:bg-purple-950/30 rounded-lg transition font-medium"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-3 text-red-400 hover:bg-red-950/30 rounded-lg transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-3 pb-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-3 bg-purple-950/60 hover:bg-purple-900 text-white rounded-lg font-medium transition border border-purple-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;