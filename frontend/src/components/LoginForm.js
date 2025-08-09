import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // Existing email/password login logic (unchanged)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Ensure user doc exists / update last login
      const user = userCredential.user;
      const uid = user.uid;
      const userDocRef = doc(db, 'users', uid);
      await setDoc(
        userDocRef,
        {
          userid: uid,
          username: user.displayName || '',
          phonenumber: '',
          email: user.email || '',
          lastLoginAt: new Date(),
        },
        { merge: true }
      );

      const res = await axios.post('http://localhost:5000/api/auth/verify', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg(`✅ Login successful! Welcome ${res.data.user.email}`);
      // First time or returning users go to assistant onboarding
      navigate('/assistant');
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  // Google sign-in logic
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      // Create or update user in Firestore
      const user = result.user;
      const uid = user.uid;
      const userDocRef = doc(db, 'users', uid);
      const existingSnap = await getDoc(userDocRef);
      const baseData = {
        userid: uid,
        username: user.displayName || '',
        phonenumber: '',
        email: user.email || '',
      };
      if (!existingSnap.exists()) {
        await setDoc(userDocRef, { ...baseData, createdAt: new Date(), lastLoginAt: new Date() });
      } else {
        await setDoc(userDocRef, { ...baseData, lastLoginAt: new Date() }, { merge: true });
      }

      const res = await axios.post('http://localhost:5000/api/auth/verify', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg(`✅ Google Login successful! Welcome ${res.data.user.email}`);
      // Direct to assistant onboarding for PHQ flow
      navigate('/assistant');
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Log in</h2>
        <p style={styles.subtitle}>
          New user?{' '}
          <a href="/register" style={styles.link}>
            Register Now
          </a>
        </p>

        {/* Google Sign-In */}
        <button style={styles.googleBtn} onClick={handleGoogleLogin}>
          <img
            src={require('../assets/google.png')}
            alt="Google"
            style={styles.googleIcon}
          />
          Continue with Google
        </button>

        <div style={styles.divider}></div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin}>
          <label style={styles.label}>Username or Email</label>
          <input
            type="email"
            placeholder="Username or Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember Me
            </label>
            <a href="/forgot-password" style={styles.link}>
              Forgot password
            </a>
          </div>

          <button type="submit" style={styles.signInBtn}>
            Sign In
          </button>
        </form>

        {/* Message */}
        {msg && <p style={styles.message}>{msg}</p>}

        {/* Home Redirect Link */}
        <p style={styles.footerText}>
          <a href="/" style={styles.link}>Home</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    minHeight: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8f9fa',
    fontFamily: 'Segoe UI, sans-serif',
    padding: '20px',
  },
  modal: {
    background: '#fff',
    borderRadius: '8px',
    padding: '30px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'left',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    marginBottom: '20px',
    color: '#555',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
  googleBtn: {
    width: '100%',
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  googleIcon: {
    width: '18px',
    height: '18px',
  },
  divider: {
    textAlign: 'center',
    margin: '15px 0',
    borderBottom: '1px solid #ddd',
    lineHeight: '0.1em',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    display: 'block',
    margin: '10px 0 5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    marginBottom: '15px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  signInBtn: {
    width: '100%',
    padding: '12px',
    background: '#047857',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  footerText: {
    marginTop: '15px',
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
  },
  message: {
    marginTop: '10px',
    fontSize: '13px',
    color: '#444',
  },
};

export default LoginForm;
