// AIChatbotWidget.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  InputBase,
  Divider,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Stack,
  Tooltip,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const typingDots = keyframes`
  0% { opacity: 0.2 }
  20% { opacity: 1 }
  100% { opacity: 0.2 }
`;

const AIChatbotWidget = ({ initialOpen = false, initialMessages, mode = 'llm' }) => {
  const [open, setOpen] = useState(initialOpen);
  const [messages, setMessages] = useState(
    initialMessages && initialMessages.length > 0
      ? initialMessages
      : [{ from: "bot", text: "Hi! How can I help you today?" }]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const defaultSuggestions = [
    { key: 'phq', label: 'PHQ-9', text: 'I want to take the PHQ-9 assessment.' },
    { key: 'calm', label: 'Breathing', text: 'Guide me through a 4-7-8 breathing exercise.' },
    { key: 'music', label: 'Music', text: 'Suggest a mood-based playlist.' },
    { key: 'crisis', label: 'Crisis support', text: 'I might need crisis support resources.' },
  ];

  // Function to parse messages and add clickable buttons
  const parseMessageForNavigation = (text) => {
    // Check if message contains navigation markers
    if (text.includes('[navigate]')) {
      const parts = text.split('[navigate]');
      return parts.map((part, index) => {
        if (part.startsWith('dashboard')) {
          return (
            <Box key={index}>
              {part.replace('dashboard', '')}
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ ml: 1 }}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </Box>
          );
        } else if (part.startsWith('assesment')) {
          return (
            <Box key={index}>
              {part.replace('assesment', '')}
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ ml: 1 }}
                onClick={() => navigate('/assesment')}
              >
                Take Assessment
              </Button>
            </Box>
          );
        } else if (part.startsWith('breathing')) {
          return (
            <Box key={index}>
              {part.replace('breathing', '')}
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ ml: 1 }}
                onClick={() => navigate('/breathing-exercise')}
              >
                Start Breathing Exercise
              </Button>
            </Box>
          );
        } else if (part.startsWith('playlist')) {
          return (
            <Box key={index}>
              {part.replace('playlist', '')}
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ ml: 1 }}
                onClick={() => navigate('/playlist')}
              >
                Create Playlist
              </Button>
            </Box>
          );
        } else if (part.startsWith('crisis')) {
          return (
            <Box key={index}>
              {part.replace('crisis', '')}
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ ml: 1 }}
                onClick={() => navigate('/crisis-support')}
              >
                Access Crisis Support
              </Button>
            </Box>
          );
        } else if (part.startsWith('profile')) {
          return (
            <Box key={index}>
              {part.replace('profile', '')}
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ ml: 1 }}
                onClick={() => navigate('/profile')}
              >
                View Profile
              </Button>
            </Box>
          );
        }
        return part;
      });
    }
    return text;
  };

  const generateLocalReply = (text) => {
    const msg = text.toLowerCase();
    const help = () =>
      "I can help with PHQ-9 questions, calming exercises, crisis support, and music playlists. Try: 'phq', 'breathing', 'crisis', or 'music'.";

    if (/\b(hi|hello|hey)\b/.test(msg)) return "Hello! How are you feeling today?";
    if (/\b(phq|quiz|assessment)\b/.test(msg)) return "You can take the PHQ-9 from the Assistant page. If you already did it, I can suggest activities based on your score.";
    if (/\b(breath|calm|anxious|anxiety|panic)\b/.test(msg)) return "[navigate]Let's try a 4-7-8 breathing exercise. breathing";
    if (/\b(crisis|help|sos|emergency|harm|suicide)\b/.test(msg)) return "[navigate]If you are in danger, we can provide immediate resources. crisis";
    if (/\b(music|playlist|song)\b/.test(msg)) return "[navigate]I can help curate a playlist to match your mood. playlist";
    if (/\b(depress|sad|down|low)\b/.test(msg)) return "I'm here with you. It can help to note your mood, try a brief walk, or a grounding exercise.";
    if (/\b(sleep|insomnia|tired)\b/.test(msg)) return "Try a wind-down routine: dim lights, no screens 30 minutes before bed, and a short body scan.";
    return help();
  };

  const handleReset = () => {
    setMessages([{ from: 'bot', text: 'Hi! How can I help you today?' }]);
    setTypingMessage('');
    setInput('');
  };

  const handleSuggestion = (text) => {
    setInput(text);
    setTimeout(() => sendMessage(text), 0);
  };

  const sendMessage = async (forcedText) => {
    const outgoing = typeof forcedText === 'string' ? forcedText : input;
    if (!outgoing.trim()) return;
    const newMessages = [...messages, { from: "user", text: outgoing }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setTypingMessage("");

    try {
      if (mode === 'local') {
        const fullReply = generateLocalReply(newMessages[newMessages.length - 1].text);
        simulateTyping(fullReply, newMessages);
        return;
      }

      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen/qwen3-235b-a22b-2507:free",
          messages: newMessages.map(msg => ({
            role: msg.from === "user" ? "user" : "assistant",
            content: msg.text
          })),
        }),
      });
      const data = await response.json();
      const fullReply = data.choices?.[0]?.message?.content;
      if (!fullReply) {
        // fallback to local if no reply
        const fallback = generateLocalReply(newMessages[newMessages.length - 1].text);
        simulateTyping(fallback, newMessages);
      } else {
        simulateTyping(fullReply, newMessages);
      }
    } catch (error) {
      console.error("LLM request failed, using local fallback:", error);
      const fallback = generateLocalReply(newMessages[newMessages.length - 1].text);
      simulateTyping(fallback, newMessages);
    }
  };

  const simulateTyping = (text, messageHistory) => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setTypingMessage((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
        setMessages([...messageHistory, { from: "bot", text }]);
        setTypingMessage("");
        setLoading(false);
      }
    }, 20);
  };

  return (
    <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
      {!open ? (
        <IconButton
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: "white",
            animation: `${float} 2.5s ease-in-out infinite`,
            boxShadow: "0 4px 20px rgba(0, 191, 255, 0.4)",
            background: "linear-gradient(to bottom right, #00bcd4, #2196f3)",
            color: "white",
            '&:hover': { bgcolor: "#0288d1" },
          }}
        >
          <ChatIcon />
        </IconButton>
      ) : (
        <Paper elevation={6} sx={{ width: 340, height: 520, display: "flex", flexDirection: "column", borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ddd",
              background: 'linear-gradient(135deg, #00bcd4 0%, #2196f3 100%)',
              color: 'white',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)' }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">Assistant</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Reset chat">
                <IconButton size="small" onClick={handleReset} sx={{ color: 'white' }}>
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Box
            sx={{ flex: 1, p: 1.5, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.25, background: 'linear-gradient(180deg, #f9fcff 0%, #f3f7fb 100%)' }}
          >
            {messages.map((msg, idx) => (
              <Stack key={idx} direction={msg.from === 'user' ? 'row-reverse' : 'row'} spacing={1} alignItems="flex-end">
                <Avatar sx={{ bgcolor: msg.from === 'user' ? '#1976d2' : '#00bcd4', width: 28, height: 28 }}>
                  {msg.from === 'user' ? <PersonIcon sx={{ fontSize: 18 }} /> : <SmartToyIcon sx={{ fontSize: 18 }} />}
                </Avatar>
                <Box
                  sx={{
                    bgcolor: msg.from === 'user' ? '#1976d2' : '#ffffff',
                    color: msg.from === 'user' ? 'white' : 'black',
                    px: 1.75,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '78%',
                    boxShadow: msg.from === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.08)'
                  }}
                >
                  {msg.from === 'bot' ? parseMessageForNavigation(msg.text) : msg.text}
                </Box>
              </Stack>
            ))}
            {typingMessage && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: '#00bcd4', width: 28, height: 28 }}>
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box sx={{
                  bgcolor: '#ffffff', color: 'black', px: 1.75, py: 1, borderRadius: 2,
                  maxWidth: '78%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  {typingMessage || (
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#9e9e9e', animation: `${typingDots} 1.4s infinite` }} />
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#9e9e9e', animation: `${typingDots} 1.4s infinite`, animationDelay: '0.2s' }} />
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#9e9e9e', animation: `${typingDots} 1.4s infinite`, animationDelay: '0.4s' }} />
                    </Box>
                  )}
                </Box>
              </Stack>
            )}
          </Box>

          <Divider />

          {/* Suggestions */}
          <Box sx={{ p: 1, pt: 1, px: 1.5, borderTop: '1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {defaultSuggestions.map((s) => (
              <Chip
                key={s.key}
                size="small"
                clickable
                onClick={() => handleSuggestion(s.text)}
                icon={
                  s.key === 'phq' ? <PsychologyIcon sx={{ fontSize: 16 }} /> :
                  s.key === 'calm' ? <SelfImprovementIcon sx={{ fontSize: 16 }} /> :
                  s.key === 'music' ? <MusicNoteIcon sx={{ fontSize: 16 }} /> :
                  <PhoneInTalkIcon sx={{ fontSize: 16 }} />
                }
                label={s.label}
                sx={{ bgcolor: '#f5faff' }}
              />
            ))}
          </Box>

          <Box sx={{ p: 1.5, display: "flex", gap: 1 }}>
            <InputBase
              fullWidth
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              sx={{ border: "1px solid #ccc", borderRadius: 1, px: 1, py: 0.5 }}
            />
            <Button variant="contained" onClick={() => sendMessage()} disabled={loading}>
              {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Send'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AIChatbotWidget;