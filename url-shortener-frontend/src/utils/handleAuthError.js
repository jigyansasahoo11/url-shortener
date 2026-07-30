// src/utils/handleAuthError.js
import toast from 'react-hot-toast';

// Agar response 401 (unauthorized) hai, matlab token expire ho chuka hai ya invalid hai.
// User ko confusing error text dikhane ki jagah — seedha logout karke login page pe bhej do.
// Returns true agar session expire ho chuki thi (caller ko aage process rok dena chahiye).
export function handleAuthError(response, logout) {
  if (response.status === 401) {
    logout();
    toast.error('Your session has expired. Please login again.');
    window.location.href = '/login';
    return true;
  }
  return false;
}