import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PlaylistPage from './components/PlaylistPage';
import Dashboard from './components/Dashboard'; 

import AIChatbotWidget from './components/AIChatbotWidget';
import CrisisSupportPage from './components/CrisisSupportPage';
import CalmingExercisesPage from './components/CalmingExercisesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crisis-support" element={<CrisisSupportPage />} />
        <Route path="/calming-exercises" element={<CalmingExercisesPage />} />
        <Route path="/playlists" element={<PlaylistPage />} />
        <Route path="/" element={< AIChatbotWidget/>} />
      </Routes>
    </Router>
  );
}

export default App;
