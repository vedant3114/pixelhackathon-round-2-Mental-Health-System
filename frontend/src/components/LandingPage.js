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
      <div className="logo">HackStarter</div>
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
                backgroundColor: '#2563eb',
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
                    border: '1px solid #ccc',
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
        Lessons and insights <span className="highlight">from 8 years</span>
      </h1>
      <p>Where to grow your projects better: site or social media?</p>
      <Link to="/register">
        <button className="cta-btn">Register</button>
      </Link>
    </div>
    <div className="hero-right">
      <img src="#" alt="Hero" />
    </div>
  </section>
);

// Features
const featuresData = [
  { title: 'Search engine optimization', color: '#636363ff' },
  { title: 'Pay-per-click advertising', color: '#636363ff' },
  { title: 'Social Media Marketing', color: '#636363ff' },
  { title: 'Email Marketing', color: '#636363ff' },
  { title: 'Content Creation', color: '#636363ff' },
  { title: 'Analytics and Tracking', color: '#636363ff' },
];

const Features = () => (
  <section id="features" className="features">
    <h2>What We Offer</h2>
    <div className="feature-grid">
      {featuresData.map((item, index) => (
        <div
          key={index}
          className="feature-card"
          style={{ backgroundColor: item.color }}
        >
          <h3>{item.title}</h3>
          <p>Learn more →</p>
        </div>
      ))}
    </div>
  </section>
);

// FAQs
const FAQS = () => {
  const faqs = [
    {
      q: 'What is this platform for?',
      a: 'To bootstrap hackathon-ready projects with clean UI.',
    },
    { q: 'Can I use it for production?', a: 'Yes, just customize and scale it up.' },
    { q: 'Is dark mode supported?', a: 'Absolutely, with smooth toggle.' },
    { q: 'Can I contribute?', a: 'Yes! We love open source.' },
  ];
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section id="faqs" className="faqs">
      <h2>Frequently Asked Questions</h2>
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
      <h2>About the Project</h2>
      <p>
        This is a frontend boilerplate designed to supercharge your hackathon
        workflow. Built with simplicity, performance, and dark/light theme
        support in mind.
      </p>
      <p>
        Project Guide: <strong>Prof. Rakesh Mehta</strong>
      </p>
    </div>
    <div className="about-right">
      <h3>Team Members</h3>
      <ul>
        <li>Spider — Frontend Developer</li>
        <li>John Doe — Backend Developer</li>
        <li>Jane Smith — UI/UX Designer</li>
      </ul>
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
