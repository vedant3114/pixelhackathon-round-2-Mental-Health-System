import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'; // ✅ imported updateProfile directly
import { auth, googleProvider, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    // 📌 Email/Password Registration
    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("❌ Password and Confirm Password do not match");
            return;
        }
        try {
            // 1️⃣ Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2️⃣ Update displayName
            await updateProfile(user, { displayName: username }); // ✅ Direct import now

            // 3️⃣ Get token & UID
            const token = await user.getIdToken();
            const uid = user.uid;

            // 4️⃣ Store user in Firestore
            await setDoc(doc(db, "users", uid), { // ✅ email added here
                userid: uid,
                username: username,
                phonenumber: phone,
                email: email,
                createdAt: new Date() // ✅ track account creation time
            });

            // 5️⃣ Send token to backend (optional)
            await axios.post('http://localhost:5000/api/auth/verify', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            navigate('/login');
        } catch (err) {
            setMsg(err.message);
        }
    };

    // 📌 Google Signup
    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();
            const uid = result.user.uid;

            // ✅ Store Google user in Firestore with email
            await setDoc(doc(db, "users", uid), {
                userid: uid,
                username: result.user.displayName || "",
                phonenumber: "",
                email: result.user.email || "", // ✅ added email
                createdAt: new Date()
            });

            await axios.post('http://localhost:5000/api/auth/verify', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            navigate('/');
        } catch (err) {
            setMsg(err.message);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.subtitle}>
                    Already have an account?{' '}
                    <a href="/login" style={styles.link}>Log in</a>
                </p>

                <form onSubmit={handleRegister}>
                    <input type="text" placeholder="Username" style={styles.input}
                        value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="tel" placeholder="Phone Number" style={styles.input}
                        value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    <input type="email" placeholder="Email" style={styles.input}
                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" style={styles.input}
                        value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <input type="password" placeholder="Confirm Password" style={styles.input}
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

                    <button type="submit" style={styles.signUpBtn}>Sign Up</button>
                </form>

                <div style={styles.divider}></div>

                <button style={styles.googleBtn} onClick={handleGoogleSignup}>
                    <img src={require('../assets/google.png')} alt="Google" style={styles.googleIcon} />
                    Continue with Google
                </button>

                {msg && <p style={styles.message}>{msg}</p>}

                <p style={styles.footerText}><a href="/" style={styles.link}>Home</a></p>
            </div>
        </div>
    );
};

// ✅ Styles unchanged from your version
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
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        marginBottom: '10px',
        boxSizing: 'border-box',
    },
    signUpBtn: {
        width: '100%',
        padding: '12px',
        background: '#047857',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '500',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '5px',
    },
    divider: {
        textAlign: 'center',
        margin: '15px 0',
        borderBottom: '1px solid #ddd',
        lineHeight: '0.1em',
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
    },
    googleIcon: {
        width: '18px',
        height: '18px',
    },
    message: {
        marginTop: '10px',
        fontSize: '13px',
        color: '#444',
    },
    footerText: {
        textAlign: 'center',
        marginTop: '15px',
        fontSize: '16px',
        color: '#666',
    },
};

export default RegisterForm;
