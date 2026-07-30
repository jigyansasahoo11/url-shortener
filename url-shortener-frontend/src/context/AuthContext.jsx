// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// Step 1: Context banao — yeh ek "empty box" hai jisme hum data daalenge
const AuthContext = createContext();

// Step 2: Provider — yeh component poori app ko is data se "wrap" karega
export function AuthProvider({ children }) {
  // Jab app pehli baar load ho, localStorage se saved token/user nikal lo
  // (taaki page refresh karne pe user logged-out na ho jaaye)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Login hone par yeh function call hoga
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    // localStorage mein bhi save karo — browser band/refresh hone par bhi data rahega
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Logout hone par yeh function call hoga
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3: Custom hook — har component isse easily context use kar payega
export function useAuth() {
  return useContext(AuthContext);
}