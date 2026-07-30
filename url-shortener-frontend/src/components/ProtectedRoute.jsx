// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// children = jo bhi component isse wrap karke bheja jayega (yahan Dashboard)
function ProtectedRoute({ children }) {
  const { token } = useAuth();

  // Agar token nahi hai, matlab user logged in nahi hai — Login page pe bhej do
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token hai, toh jo component bheja gaya use render kar do
  return children;
}

export default ProtectedRoute;