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
        <div className="logo-icon">💗</div>
        MoodApp
      </div>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#faqs">FAQs</a>
      </div>
      <div className="search">
        <input type="text" placeholder="Search..." />
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
                    borderRadius: '6px',
                    padding: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
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
      <h1>
        Take control of your <span className="highlight">mental wellness</span> journey
      </h1>
      <p>Track your mood, practice mindfulness and build healthy habits with personalized challenges and AI-powered support</p>
      
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-number">101K+</div>
          <div className="stat-label">User Supported</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Crisis Support</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">95%</div>
          <div className="stat-label">Satisfaction</div>
        </div>
      </div>

      <div className="hero-buttons">
        <Link to="/register">
          <button className="cta-btn">Start Your Journey</button>
        </Link>
        <Link to="/calming-exercises">
          <button className="secondary-btn">Learn More</button>
        </Link>
      </div>
    </div>
    <div className="hero-right">
      <div className="mood-cards">
        <div className="mood-card small yellow">
          <span className="mood-emoji">😌</span>
          <span className="mood-text">Mindful</span>
        </div>
        <div className="mood-card small yellow">
          <span className="mood-emoji">💪</span>
          <span className="mood-text">Strong</span>
        </div>
        <div className="mood-card small blue">
          <span className="mood-emoji">✨</span>
          <span className="mood-text">Hopeful</span>
        </div>
        <div className="mood-card large green">
          <div className="mood-graph">
            <div className="graph-line">
              <div className="graph-dot"></div>
              <div className="graph-dot"></div>
              <div className="graph-dot"></div>
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
    title: 'Mood Tracking & Analytics', 
    description: 'Monitor your emotional patterns with intelligent insights',
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
    description: 'Immediate access to emergency mental health resources',
    icon: '🆘',
    color: '#f44336' 
  },
  { 
    title: 'Calming Exercises', 
    description: 'Guided meditation, breathing, and relaxation techniques',
    icon: '🧘‍♂️',
    color: '#9c27b0' 
  },
  { 
    title: 'AI Wellness Assistant', 
    description: '24/7 support and guidance for your mental health journey',
    icon: '🤖',
    color: '#2196f3' 
  },
  { 
    title: 'Community & Resources', 
    description: 'Connect with others and access professional mental health tools',
    icon: '🤝',
    color: '#ff9800' 
  },
];

const Features = () => (
  <section id="features" className="features">
    <h2>Comprehensive Mental Wellness Tools</h2>
    <p className="features-subtitle">Everything you need to nurture your mental health in one place</p>
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
      q: 'How does MoodApp help with mental health?',
      a: 'MoodApp provides comprehensive tools including mood tracking, personalized challenges, crisis support, and AI-powered guidance to support your mental wellness journey.',
    },
    { 
      q: 'Is my mental health data secure?', 
      a: 'Absolutely. We use enterprise-grade security and your data is completely private and encrypted. We never share your personal information.' 
    },
    { 
      q: 'What if I need immediate crisis support?', 
      a: 'Our crisis support page provides immediate access to emergency resources, crisis hotlines, and professional help when you need it most.' 
    },
    { 
      q: 'Can I use MoodApp alongside therapy?', 
      a: 'Yes! MoodApp is designed to complement professional therapy and can be used as a supportive tool in your overall mental health care plan.' 
    },
  ];
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section id="faqs" className="faqs">
      <h2>Frequently Asked Questions</h2>
      <p className="faqs-subtitle">Everything you need to know about MoodApp</p>
      {faqs.map((faq, i) => (
        <div
          key={i}
          className={`faq ${openIndex === i ? 'open' : ''}`}
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        >
          <div className="faq-q">{faq.q}</div>
          <div className="faq-a">{faq.a}</div>
        </div>
      ))}
    </section>
  );
};

// About
const About = () => (
  <section id="about" className="about">
    <div className="about-left">
      <h2>About MoodApp</h2>
      <p>
        MoodApp is a comprehensive mental health platform designed to support your wellness journey. 
        We combine cutting-edge technology with evidence-based mental health practices to provide 
        personalized support when you need it most.
      </p>
      <p>
        Our mission is to make mental health support accessible, effective, and stigma-free for everyone.
      </p>
      <div className="about-features">
        <div className="about-feature">
          <span className="about-icon">🔒</span>
          <span>Privacy First</span>
        </div>
        <div className="about-feature">
          <span className="about-icon">🧠</span>
          <span>Science-Based</span>
        </div>
        <div className="about-feature">
          <span className="about-icon">💚</span>
          <span>Always Supportive</span>
        </div>
      </div>
    </div>
    <div className="about-right">
      <h3>Why Choose MoodApp?</h3>
      <ul>
        <li>🎯 Personalized wellness challenges</li>
        <li>📱 Mobile-first design</li>
        <li>🤖 AI-powered insights</li>
        <li>🆘 Crisis support resources</li>
        <li>🧘‍♀️ Guided mindfulness exercises</li>
        <li>📊 Progress tracking & analytics</li>
      </ul>
    </div>
  </section>
);

// CTA Section
const CTASection = () => (
  <section className="cta-section">
    <div className="cta-content">
      <h2>Ready to Start Your Wellness Journey?</h2>
      <p>Join thousands of users who are already improving their mental health with MoodApp</p>
      <div className="cta-buttons">
        <Link to="/register">
          <button className="cta-btn-large">Get Started Free</button>
        </Link>
        <Link to="/login">
          <button className="secondary-btn-large">Sign In</button>
        </Link>
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
      <CTASection />
      <Footer />
      {/* Chatbot is mounted globally in App.js */}
    </ThemeContext.Provider>
  );
};

export default LandingPage;
