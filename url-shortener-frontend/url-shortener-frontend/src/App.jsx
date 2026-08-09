import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Add other routes here as needed */}
      </Routes>
    </Router>
  );
};

export default App;