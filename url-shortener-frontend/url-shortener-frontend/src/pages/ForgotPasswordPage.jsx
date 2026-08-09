import React, { useState } from 'react';
import PasswordResetForm from '../components/PasswordResetForm';
import './forgot-password.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.success) {
      setMessage(data.message);
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>Forgot Password</h1>
      <p>Please enter your email address to receive a password reset link.</p>
      <PasswordResetForm 
        email={email} 
        setEmail={setEmail} 
        handleSubmit={handleSubmit} 
      />
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ForgotPasswordPage;