import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';
import Footer from './Footer';
import AIChatbotWidget from './AIChatbotWidget';

// ✅ NEW IMPORTS FOR AUTH (ADDED)
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// Navbar
const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();

  // ✅ NEW STATES FOR USER AUTH DATA (ADDED)
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  // ✅ CHECK AUTH STATE ON LOAD (ADDED)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ✅ HANDLE LOGOUT (ADDED)
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setShowLogout(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-icon">🧠</span>
        <span className="logo-text">MoodApp</span>
      </div>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#faqs">FAQs</a>
      </div>
      <div className="search">
        <input type="text" placeholder="Search resources..." />
      </div>
      <div className="actions">
        <button className="toggle-btn" onClick={toggleTheme}>
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* ✅ CHANGED PART: IF USER LOGGED IN, SHOW DASHBOARD + PROFILE */}
        {user ? (
          <>
            {/* Dashboard Button */}
            <Link to="/dashboard">
              <button className="btn">Dashboard</button>
            </Link>

            {/* Profile Pic or Symbol */}
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                cursor: 'pointer',
              }}
            >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
              onClick={() => setShowLogout((prev) => !prev)}
            />
          ) : (
            <div
              onClick={() => setShowLogout((prev) => !prev)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#4c9a73',
                color: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              {user.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : user.email?.charAt(0).toUpperCase()}
            </div>
          )}

              {/* Logout Button Dropdown */}
              {showLogout && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #cfe7db',
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      background: '#f44336',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '14px',
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Old Sign In button (unchanged)
          <Link to="/login">
            <button className="btn">Sign In</button>
          </Link>
        )}
      </div>
    </nav>
  );
};

// Hero
const Hero = () => (
  <section className="hero">
    <div className="hero-left">
      <div className="hero-badge">
        <span className="badge-icon">🌟</span>
        <span>Your Mental Health Companion</span>
      </div>
      <h1>
        Take control of your <span className="highlight">mental wellness</span> journey
      </h1>
      <p>Track your mood, practice mindfulness, and build healthy habits with personalized challenges and AI-powered support.</p>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-number">10K+</span>
          <span className="stat-label">Users Supported</span>
        </div>
        <div className="stat">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Crisis Support</span>
        </div>
        <div className="stat">
          <span className="stat-number">95%</span>
          <span className="stat-label">Satisfaction</span>
        </div>
      </div>
      <div className="hero-buttons">
        <Link to="/register">
          <button className="cta-btn primary">Start Your Journey</button>
        </Link>
        <Link to="/calming-exercises">
          <button className="cta-btn secondary">Try Exercises</button>
        </Link>
      </div>
    </div>
    <div className="hero-right">
      <div className="hero-visual">
        <div className="floating-card card-1">
          <span className="card-icon">😌</span>
          <span className="card-text">Mindful</span>
        </div>
        <div className="floating-card card-2">
          <span className="card-icon">💪</span>
          <span className="card-text">Strong</span>
        </div>
        <div className="floating-card card-3">
          <span className="card-icon">🌈</span>
          <span className="card-text">Hopeful</span>
        </div>
        <div className="main-hero-image">
          <div className="mood-chart-placeholder">
            <div className="chart-line"></div>
            <div className="chart-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Features
const featuresData = [
  { 
    title: 'Mood Tracking', 
    description: 'Monitor your emotional patterns with intuitive charts and insights',
    icon: '📊',
    color: '#4c9a73'
  },
  { 
    title: 'Personalized Challenges', 
    description: 'AI-powered wellness challenges tailored to your needs',
    icon: '🎯',
    color: '#42f099'
  },
  { 
    title: 'Crisis Support', 
    description: 'Immediate access to emergency resources and professional help',
    icon: '🆘',
    color: '#f44336'
  },
  { 
    title: 'Calming Exercises', 
    description: 'Guided breathing, meditation, and relaxation techniques',
    icon: '🧘',
    color: '#9c27b0'
  },
  { 
    title: 'AI Chatbot', 
    description: '24/7 mental health support and guidance',
    icon: '🤖',
    color: '#2196f3'
  },
  { 
    title: 'Community Resources', 
    description: 'Connect with support groups and mental health professionals',
    icon: '🤝',
    color: '#ff9800'
  },
];

const Features = () => (
  <section id="features" className="features">
    <div className="section-header">
      <h2>Comprehensive Mental Health Support</h2>
      <p>Everything you need to nurture your mental wellness in one place</p>
    </div>
    <div className="feature-grid">
      {featuresData.map((item, index) => (
        <div
          key={index}
          className="feature-card"
          style={{ borderLeft: `4px solid ${item.color}` }}
        >
          <div className="feature-icon">{item.icon}</div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="feature-arrow">→</div>
        </div>
      ))}
    </div>
  </section>
);

// FAQs
const FAQS = () => {
  const faqs = [
    {
      q: 'How does mood tracking help with mental health?',
      a: 'Mood tracking helps identify patterns, triggers, and improvements in your emotional well-being, providing valuable insights for better mental health management.',
    },
    { 
      q: 'Is my personal data secure?', 
      a: 'Yes, we use enterprise-grade security with end-to-end encryption and comply with HIPAA standards to protect your privacy.' 
    },
    { 
      q: 'What if I need immediate crisis support?', 
      a: 'Our crisis support page provides instant access to emergency numbers, crisis centers, and professional help 24/7.' 
    },
    { 
      q: 'Can I use this app alongside therapy?', 
      a: 'Absolutely! Many users find it complements their therapy sessions by providing daily support and progress tracking.' 
    },
  ];
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section id="faqs" className="faqs">
      <div className="section-header">
        <h2>Frequently Asked Questions</h2>
        <p>Everything you need to know about your mental health journey</p>
      </div>
      <div className="faq-container">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`faq ${openIndex === i ? 'open' : ''}`}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="faq-header">
              <div className="faq-q">{faq.q}</div>
              <div className="faq-toggle">{openIndex === i ? '−' : '+'}</div>
            </div>
            <div className="faq-a">{faq.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// About
const About = () => (
  <section id="about" className="about">
    <div className="about-content">
      <div className="about-left">
        <h2>About MoodApp</h2>
        <p>
          We believe everyone deserves access to comprehensive mental health support. 
          Our platform combines cutting-edge technology with evidence-based practices 
          to help you build resilience and maintain emotional well-being.
        </p>
        <p>
          Whether you're looking to track your mood, practice mindfulness, or need 
          immediate crisis support, we're here to guide you every step of the way.
        </p>
        <div className="about-highlights">
          <div className="highlight-item">
            <span className="highlight-icon">🔬</span>
            <span>Evidence-based approaches</span>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">🤖</span>
            <span>AI-powered personalization</span>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">🔒</span>
            <span>Privacy-first design</span>
          </div>
        </div>
      </div>
      <div className="about-right">
        <div className="team-section">
          <h3>Our Mission</h3>
          <p>To democratize mental health support and make wellness accessible to everyone, everywhere.</p>
        </div>
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Mental Health Experts</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">Wellness Exercises</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support Available</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Final Component
const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <Navbar />
      <Hero />
      <Features />
      <FAQS />
      <About />
      <Footer />
      <AIChatbotWidget />
    </ThemeContext.Provider>
  );
};

export default LandingPage;
