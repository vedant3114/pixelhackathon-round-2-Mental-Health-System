import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Phq9Dialog from './Phq9Dialog';
// Chatbot is mounted globally in App.js

const AssistantOnboarding = () => {
  const [user, setUser] = useState(null);
  const [phqOpen, setPhqOpen] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [initialMessages, setInitialMessages] = useState([
    { from: 'bot', text: 'Welcome! Before we begin, I will ask you a few PHQ-9 questions to tailor the experience.' },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const hasPhq = snap.exists() && !!snap.data()?.lastPhq9;
        if (hasPhq) {
          setPhqOpen(false);
          navigate('/dashboard');
        } else {
          setPhqOpen(true);
        }
      }
    });
    return () => unsub();
  }, [navigate]);

  const handlePhqSubmit = async (responses) => {
    if (!user) return;
    const total = responses.reduce((a, b) => a + (b ?? 0), 0);
    const severity = total < 5 ? 'Minimal' : total < 10 ? 'Mild' : total < 15 ? 'Moderate' : total < 20 ? 'Moderately Severe' : 'Severe';

    await setDoc(
      doc(db, 'users', user.uid),
      { lastPhq9: { responses, total, severity, submittedAt: new Date() } },
      { merge: true }
    );
    setPhqOpen(false);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Phq9Dialog
        open={phqOpen && !!user}
        onClose={() => setPhqOpen(false)}
        onSubmit={handlePhqSubmit}
      />
    </div>
  );
};

export default AssistantOnboarding;


