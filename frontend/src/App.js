import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard'; 
import AIChatbotWidget from './components/AIChatbotWidget';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={< AIChatbotWidget/>} />
      </Routes>
    </Router>
  );
}

export default App;
