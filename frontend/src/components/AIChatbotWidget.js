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
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { keyframes } from "@emotion/react";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const AIChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setTypingMessage("");

     try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
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
      const fullReply = data.choices[0]?.message?.content || "(No responses received)";
      simulateTyping(fullReply, newMessages);
    } catch (error) {
      console.error("Error fetching from OpenRouter:", error);
      setMessages([...newMessages, { from: "bot", text: "Sorry, something went wrong." }]);
      setLoading(false);
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
        <Paper elevation={4} sx={{ width: 320, height: 450, display: "flex", flexDirection: "column", borderRadius: 2 }}>
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">Chat Assistant</Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{ flex: 1, p: 1.5, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                  bgcolor: msg.from === "user" ? "#1976d2" : "#f1f1f1",
                  color: msg.from === "user" ? "white" : "black",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "80%",
                }}
              >
                {msg.text}
              </Box>
            ))}
            {typingMessage && (
              <Box
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "#f1f1f1",
                  color: "black",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "80%",
                  fontStyle: "italic",
                }}
              >
                {typingMessage}
              </Box>
            )}
          </Box>

          <Divider />

          <Box sx={{ p: 1.5, display: "flex", gap: 1 }}>
            <InputBase
              fullWidth
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              sx={{ border: "1px solid #ccc", borderRadius: 1, px: 1, py: 0.5 }}
            />
            <Button variant="contained" onClick={sendMessage} disabled={loading}>Send</Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AIChatbotWidget;
