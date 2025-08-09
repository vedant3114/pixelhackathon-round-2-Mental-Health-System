import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  SvgIcon,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

import CrisisSupportPage from './CrisisSupportPage';

import { auth, db } from '../firebase/config';
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  arrayUnion,
  increment,
} from 'firebase/firestore';

// Styled components
const Root = styled('div')(({ theme }) => ({
  backgroundColor: '#f8fcfa',
  minHeight: '100vh',
  fontFamily: 'Manrope, "Noto Sans", sans-serif',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderBottom: '1px solid #e7f3ed',
  background: '#ffffff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  border: '1px solid #cfe7db',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: 16,
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: { xs: 140, sm: 160, md: 180 },
  position: 'relative',
  '& svg': {
    height: '100%',
    width: '100%',
  },
}));

const MoodEntryButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: '600',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
}));

const MoodCheckButton = styled(Button)(({ theme }) => ({
  borderRadius: '50%',
  minWidth: 56,
  minHeight: 56,
  width: 56,
  height: 56,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
  },
}));

const MoodChart = ({ moodEntries }) => {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    // Transform mood entries to chart format
    if (moodEntries && moodEntries.length > 0) {
      // Get the last 7 entries and format them for the chart
      const last7Entries = moodEntries.slice(0, 7).reverse();

      const chartData = last7Entries.map((entry, index) => {
        // Get day name from timestamp
        const date = entry.timestamp ? new Date(entry.timestamp) : new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[date.getDay()];

        // If this is the current/most recent entry, use "Today" instead of actual day
        if (index === 0) {
          return {
            day: 'Today',
            mood: Math.max(0, Math.min(5, entry.mood || 0)) // Clamp mood value between 0-5
          };
        }

        return {
          day: dayName,
          mood: Math.max(0, Math.min(5, entry.mood || 0)) // Clamp mood value between 0-5
        };
      });

      setData(chartData);
    } else {
      // Handle case when there's no data or loading
      setData([
        { day: 'Today', mood: 0 },
        { day: '-', mood: 0 },
        { day: '-', mood: 0 },
        { day: '-', mood: 0 },
        { day: '-', mood: 0 },
        { day: '-', mood: 0 },
        { day: '-', mood: 0 },
      ]);
    }
  }, [moodEntries]);

  if (!data || data.length === 0) {
    return <LinearProgress />;
  }

  const maxMood = 5;

  // Calculate smoothed curve path
  const calculatePath = () => {
    if (!data || data.length === 0) return '';

    let path = `M0 ${150 - (data[0]?.mood || 0) / maxMood * 120}`;

    for (let i = 1; i < data.length; i++) {
      const prevX = (i - 1) * 68;
      const currX = i * 68;
      const prevY = 150 - (data[i - 1]?.mood || 0) / maxMood * 120;
      const currY = 150 - (data[i]?.mood || 0) / maxMood * 120;

      // Create a smooth curve between points
      const cp1x = prevX + (currX - prevX) * 0.5;
      const cp1y = prevY;
      const cp2x = currX - (currX - prevX) * 0.5;
      const cp2y = currY;

      path += ` C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${currY}`;
    }

    return path;
  };

  // Calculate area under curve for gradient fill
  const calculateAreaPath = () => {
    if (!data || data.length === 0) return '';

    let path = `M0 ${150} L0 ${150 - (data[0]?.mood || 0) / maxMood * 120}`;

    // Reuse the calculatePath function to create the curve
    const curvePath = calculatePath();
    path += curvePath.slice(1); // Remove 'M' and add the rest of the path

    // Add closing shape
    const lastX = (data.length - 1) * 68;
    path += ` L${lastX} ${150} Z`;

    return path;
  };

  return (
    <ChartContainer>
      <Box position="relative" sx={{ width: '100%', height: '100%' }}>
        <svg
          viewBox="0 0 478 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: '100%', width: '100%' }}
        >
          {/* Definitions for gradients and filters */}
          <defs>
            {/* Gradient for line chart */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#42f099" />
              <stop offset="100%" stopColor="#3a9b7a" />
            </linearGradient>

            {/* Gradient for area fill */}
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4c9a73" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#4c9a73" stopOpacity={0.05} />
            </linearGradient>

            {/* Shadow effect for data points */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="1" result="offsetblur" />
              <feFlood floodColor="#000000" floodOpacity={0.1} />
              <feComposite in2="offsetblur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background chart area */}
          <rect width="478" height="150" fill="#f8fcfa" rx="8" />

          {/* Grid lines for better readability */}
          <g stroke="#e7f3ed" strokeWidth="1">
            {/* Horizontal grid lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="50"
                y1={30 + i * 20}
                x2="428"
                y2={30 + i * 20}
              />
            ))}

            {/* Vertical grid lines */}
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={45 + i * 68}
                y1="30"
                x2={45 + i * 68}
                y2="130"
              />
            ))}
          </g>

          {/* Chart axis labels */}
          <g fill="#4c9a73" fontSize="10" fontWeight="500">
            {/* Left axis - mood labels */}
            <text x="30" y="35" textAnchor="end">5</text>
            <text x="30" y="55" textAnchor="end">4</text>
            <text x="30" y="75" textAnchor="end">3</text>
            <text x="30" y="95" textAnchor="end">2</text>
            <text x="30" y="115" textAnchor="end">1</text>
            <text x="30" y="135" textAnchor="end">0</text>

            {/* Bottom axis - day labels (slightly smaller) */}
            {data.map((point, index) => (
              <text
                key={`label-${index}`}
                x={45 + index * 68}
                y="145"
                textAnchor="middle"
                fontSize="9"
                fill={index === 0 ? "#42f099" : "#4c9a73"}
              >
                {point.day}
              </text>
            ))}
          </g>

          {/* Area under the curve with gradient fill */}
          {data.length > 1 && (
            <path
              d={calculateAreaPath()}
              fill="url(#areaGradient)"
              opacity="0.7"
            />
          )}

          {/* Line chart with smooth curve */}
          {data.length > 1 && (
            <path
              d={calculatePath()}
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points with hover effect */}
          {data.map((point, index) => (
            <g
              key={`point-${index}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              cursor="pointer"
            >
              <circle
                cx={45 + index * 68}
                cy={150 - (point.mood / maxMood) * 120}
                r="5"
                fill="white"
                stroke={index === 0 ? "#42f099" : "#4c9a73"}
                strokeWidth="2"
                filter="url(#shadow)"
              />
              {/* Inner circle that grows on hover */}
              {activeIndex === index && (
                <circle
                  cx={45 + index * 68}
                  cy={150 - (point.mood / maxMood) * 120}
                  r="8"
                  fill={index === 0 ? "#42f099" : "#4c9a73"}
                  opacity="0.2"
                />
              )}
            </g>
          ))}

          {/* Mood value tooltip on hover */}
          {activeIndex !== null && (
            <g>
              <rect
                x={35 + activeIndex * 68 - 20}
                y={15 - (data[activeIndex]?.mood / maxMood) * 120 - 25}
                width="40"
                height="20"
                rx="4"
                fill="#4c9a73"
              />
              <text
                x={45 + activeIndex * 68}
                y={15 - (data[activeIndex]?.mood / maxMood) * 120 - 12}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {data[activeIndex]?.mood}
              </text>
            </g>
          )}
        </svg>
      </Box>
    </ChartContainer>
  );
};


const MoodEntryDialog = ({ open, onClose, onSubmit }) => {
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState('');
  const [journalEntry, setJournalEntry] = useState('');

  const handleSubmit = () => {
    // In a real app, this would contain user's ID from Firebase auth
    const moodEntry = {
      mood,
      notes,
      journalEntry,
      timestamp: new Date().toISOString(),
    };

    onSubmit(moodEntry);
    onClose();
    // Reset form
    setMood(3);
    setNotes('');
    setJournalEntry('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', p: 0 } }}
    >
      <DialogTitle sx={{ p: 3, borderBottom: '1px solid #e7f3ed', color: '#0d1b14', fontWeight: 'bold' }}>
        Log Your Mood
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#4c9a73' }}>
              How are you feeling today?
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Rating
                name="mood-rating"
                value={mood}
                onChange={(_, value) => setMood(value)}
                max={5}
                size="large"
                sx={{ alignItems: 'center' }}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt={1}>
              <Chip
                label={`${mood} out of 5`}
                color="success"
                size="small"
                sx={{ backgroundColor: '#e7f3ed', color: '#0d1b14' }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#4c9a73' }}>
              Optional Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind?"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#4c9a73' }}>
              Journal Entry
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Write about your day..."
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e7f3ed' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: '8px',
            bgcolor: '#4c9a73',
            '&:hover': { bgcolor: '#3a9b7a' }
          }}
        >
          Save Entry
        </Button>
      </DialogActions>
    </Dialog>
  );
};


const Phq9Dialog = ({ open, onClose, onSubmit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState(Array(9).fill(0));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
    'Trouble concentrating on things, such as reading the newspaper or watching television',
    'Moving or speaking so slowly that other people could have noticed or the opposite being so fidgety or restless that you have been moving around a lot more than usual',
    'Thoughts that you would be better off dead or of hurting yourself in some way'
  ];

  const handleResponseChange = (value) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = parseInt(value);
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(responses);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', p: 0 } }}
    >
      <DialogTitle sx={{ p: 3, borderBottom: '1px solid #e7f3ed', color: '#0d1b14', fontWeight: 'bold' }}>
        PHQ-9 Questionnaire
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="#4c9a73">
            {currentQuestion + 1} of {questions.length}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, mb: 2, color: '#0d1b14' }}>
            {questions[currentQuestion]}
          </Typography>
        </Box>

        <FormControl component="fieldset">
          <RadioGroup
            value={responses[currentQuestion]}
            onChange={(e) => handleResponseChange(e.target.value)}
          >
            <FormControlLabel value="0" control={<Radio />} label="Not at all" />
            <FormControlLabel value="1" control={<Radio />} label="Several days" />
            <FormControlLabel value="2" control={<Radio />} label="More than half the days" />
            <FormControlLabel value="3" control={<Radio />} label="Nearly every day" />
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e7f3ed' }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="outlined"
          sx={{ borderRadius: '8px' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePrev}
          disabled={currentQuestion === 0 || isSubmitting}
          sx={{ borderRadius: '8px' }}
        >
          Back
        </Button>
        <Button
          onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNext}
          variant="contained"
          disabled={currentQuestion < questions.length - 1 && responses[currentQuestion] === 0}
          sx={{
            borderRadius: '8px',
            bgcolor: '#4c9a73',
            '&:hover': { bgcolor: '#3a9b7a' }
          }}
        >
          {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Notification Modal Component
const NotificationModal = ({ open, onClose, notifications, onMarkAsSeen }) => {
  const handleNotificationClick = (notificationId) => {
    onMarkAsSeen(notificationId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '70vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SvgIcon sx={{ color: '#4c9a73' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
          </SvgIcon>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications ({notifications.length})
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
          </svg>
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <SvgIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
              </svg>
            </SvgIcon>
            <Typography variant="body1" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <ListItem
                key={notification.id || index}
                onClick={() => handleNotificationClick(notification.id || index)}
                sx={{
                  borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                  py: 2,
                  px: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: notification.type === 'mood' ? '#4c9a73' : 
                               notification.type === 'challenge' ? '#ff9800' : 
                               notification.type === 'points' ? '#4caf50' : '#2196f3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <SvgIcon sx={{ color: 'white', fontSize: 16 }}>
                      {notification.type === 'mood' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M128,24A104,104,0,1,0,232,128,104.15,104.15,0,0,0,128,24ZM80,108a24,24,0,1,1,24,24A24,24,0,0,1,80,108Zm80,0a24,24,0,1,1-24,24A24,24,0,0,1,160,108Z"></path>
                        </svg>
                      ) : notification.type === 'challenge' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                        </svg>
                      ) : notification.type === 'points' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M128,24A104,104,0,1,0,232,128,104.15,104.15,0,0,0,128,24ZM80,108a24,24,0,1,1,24,24A24,24,0,0,1,80,108Zm80,0a24,24,0,1,1-24,24A24,24,0,0,1,160,108Z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                        </svg>
                      )}
                    </SvgIcon>
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {notification.title || 'Notification'}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {notification.message || notification.description || 'You have a new notification'}
                      </Typography>
                      {notification.timestamp && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MoodDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [timeframe, setTimeframe] = useState('week');
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moodEntries, setMoodEntries] = useState([]);
  const [filteredMoodEntries, setFilteredMoodEntries] = useState([]);
  const [averageMood, setAverageMood] = useState(0);
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);
  const [phq9DialogOpen, setPhq9DialogOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState(3);
  const [lowMoodDays, setLowMoodDays] = useState(0);
  const [phq9Data, setPhq9Data] = useState(null);
  const [personalizedChallenges, setPersonalizedChallenges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [seenNotifications, setSeenNotifications] = useState(new Set());
  const [points, setPoints] = useState(0);
  const navigate = useNavigate();
  const [activeTimers, setActiveTimers] = useState({});
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const completedChallengesRef = useRef(completedChallenges);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [challengeRefreshMessage, setChallengeRefreshMessage] = useState('');
  const [allChallengesCompleted, setAllChallengesCompleted] = useState(false);

  const startTimer = (challengeId, duration) => {
    setActiveTimers(prev => {
      const updatedTimers = { ...prev };
      delete updatedTimers[challengeId];
      return updatedTimers;
    });
    setCompletedChallenges(prev => prev.filter(id => id !== challengeId));
    const timeRemaining = duration * 60;
    const newTimer = {
      startTime: Date.now(),
      endTime: Date.now() + timeRemaining * 1000,
      timeRemaining,
    };
    setActiveTimers(prev => ({
      ...prev,
      [challengeId]: newTimer,
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Firebase auth state observer
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  // Fetch mood entries from Firestore
  useEffect(() => {
    if (!user) return;

    const moodEntriesRef = collection(db, 'users', user.uid, 'mood_entries');
    const q = query(moodEntriesRef, orderBy('timestamp', 'desc'), limit(30));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({ id: doc.id, ...data });
      });

      // Filter based on selected timeframe
      const now = new Date();
      let cutoffDate;

      if (timeframe === 'week') {
        cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        cutoffDate = new Date();
        cutoffDate.setMonth(now.getMonth() - 1);
      } else {
        cutoffDate = new Date(0); // Earliest possible date
      }

      // Filter entries based on timeframe
      const filteredEntries = entries.filter(entry =>
        entry.timestamp && new Date(entry.timestamp) >= cutoffDate
      );

      setFilteredMoodEntries(filteredEntries);
      setMoodEntries(entries); // Keep all entries for potential other uses
    });

    return () => unsubscribe();
  }, [user, timeframe]);

  // Calculate average mood and track mood patterns
  useEffect(() => {
    if (!filteredMoodEntries || filteredMoodEntries.length < 7) return;

    if (filteredMoodEntries.length > 0) {
      const totalMood = filteredMoodEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0);
      const avg = totalMood / filteredMoodEntries.length;
      setAverageMood(parseFloat(avg.toFixed(1)));
    } else {
      setAverageMood(0);
    }

    let consecutiveLowDays = 0;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const moodEntry = filteredMoodEntries.find(entry => {
        const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
        return entryDate === dateStr;
      });

      if (moodEntry && (moodEntry.mood || 0) < 2.5) {
        consecutiveLowDays++;
      } else {
        break;
      }
    }

    setLowMoodDays(consecutiveLowDays);

    if (consecutiveLowDays >= 3 && !phq9Data) {
      setPhq9DialogOpen(true);
    }
  }, [filteredMoodEntries, phq9Data]);

  // Update ref when completedChallenges changes
  useEffect(() => {
    completedChallengesRef.current = completedChallenges;
  }, [completedChallenges]);

  // Timer tick effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now = Date.now();
      let activeTimersUpdated = false;
      const newCompletedChallenges = [];

      const updatedActiveTimers = { ...activeTimers };

      Object.keys(updatedActiveTimers).forEach(challengeId => {
        const timer = updatedActiveTimers[challengeId];

        if (timer && now >= timer.endTime) {
          newCompletedChallenges.push(challengeId);
          delete updatedActiveTimers[challengeId];
          activeTimersUpdated = true;
        } else if (timer && now < timer.endTime) {
          const timeRemaining = Math.floor((timer.endTime - now) / 1000);
          if (timer.timeRemaining !== timeRemaining) {
            updatedActiveTimers[challengeId] = {
              ...timer,
              timeRemaining,
            };
            activeTimersUpdated = true;
          }
        }
      });

      if (activeTimersUpdated) {
        setActiveTimers(updatedActiveTimers);
      }

      if (newCompletedChallenges.length > 0) {
        setCompletedChallenges(prev => {
          const uniqueCompleted = [...prev];
          newCompletedChallenges.forEach(id => {
            if (!uniqueCompleted.includes(id)) uniqueCompleted.push(id);
          });
          return uniqueCompleted;
        });

        // Persist completion state and award points
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const pointsToAdd = newCompletedChallenges.length * 10;
          updateDoc(userDocRef, {
            completedChallengeIds: arrayUnion(...newCompletedChallenges),
            points: increment(pointsToAdd),
          }).catch(() => {});

          // Refresh points locally after update
          getDoc(userDocRef).then(snap => {
            if (snap.exists() && typeof snap.data().points === 'number') {
              setPoints(snap.data().points);
            }
          }).catch(() => {});

          // Replenish challenges if we're running low
          const currentChallenges = personalizedChallenges.filter(challenge => 
            !completedChallenges.includes(challenge.title) && 
            !newCompletedChallenges.includes(challenge.title)
          );
          
          if (currentChallenges.length < 2) {
            const newChallenges = replenishChallenges();
            setPersonalizedChallenges(newChallenges);
            
            // Save new challenges to Firestore
            updateDoc(userDocRef, {
              personalizedChallenges: newChallenges
            }).catch(() => {});
          }

          // Show completion notification
          setChallengeRefreshMessage(`🎉 Challenge completed! +${pointsToAdd} points earned. New challenges loaded!`);
          setTimeout(() => setChallengeRefreshMessage(''), 4000);

          // Add notification for challenge completion
          addNotification({
            type: 'points',
            title: 'Challenge Completed! 🎉',
            message: `Congratulations! You've completed a challenge and earned ${pointsToAdd} points. Keep up the great work!`,
            description: `Challenge completed successfully. +${pointsToAdd} points added to your account.`
          });
        }
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [activeTimers]);



  useEffect(() => {
    // Keep averageMood synced without verbose logging
    if (filteredMoodEntries.length > 0) {
      const totalMood = filteredMoodEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0);
      const avg = totalMood / filteredMoodEntries.length;
      setAverageMood(parseFloat(avg.toFixed(1)));
    } else {
      setAverageMood(0);
    }
  }, [filteredMoodEntries, phq9Data]);

  // Effect to load notifications
  useEffect(() => {
    if (!user) return;

    const getNotifications = async () => {
      try {
        const userDocRef = await doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Load notifications
          if (userData.notifications) {
            setNotifications(userData.notifications);
          }
          
          // Load seen notifications
          if (userData.seenNotifications) {
            setSeenNotifications(new Set(userData.seenNotifications));
          }
          
          // Load points
          if (typeof userData.points === 'number') {
            setPoints(userData.points);
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    getNotifications();
  }, [user]);

  // Effect to generate personalized challenges based on PHQ-9 score
  useEffect(() => {
    if (!phq9Data) return;

    // Get random challenges from the pool based on PHQ-9 score
    let personalized = [];
    
    if (phq9Data.score >= 15) {
      // High severity - prioritize high and medium severity challenges
      const highSeverityChallenges = challengePool.filter(c => c.severity === 'high');
      const mediumSeverityChallenges = challengePool.filter(c => c.severity === 'medium');
      
      // Get 2 high severity challenges if available, otherwise mix with medium
      if (highSeverityChallenges.length >= 2) {
        personalized = getRandomChallenges(2).filter(c => c.severity === 'high');
      } else {
        personalized = [...highSeverityChallenges, ...getRandomChallenges(2 - highSeverityChallenges.length).filter(c => c.severity === 'medium')];
      }
    } else if (phq9Data.score >= 10) {
      // Medium severity - mix of medium and low severity challenges
      const mediumSeverityChallenges = challengePool.filter(c => c.severity === 'medium');
      const lowSeverityChallenges = challengePool.filter(c => c.severity === 'low');
      
      personalized = [...getRandomChallenges(1).filter(c => c.severity === 'medium'), 
                     ...getRandomChallenges(1).filter(c => c.severity === 'low')];
    } else if (phq9Data.score >= 5) {
      // Low severity - primarily low severity challenges
      personalized = getRandomChallenges(2).filter(c => c.severity === 'low');
    }

    // Ensure we always have at least 2 challenges
    if (personalized.length < 2) {
      const remaining = getRandomChallenges(2 - personalized.length);
      personalized = [...personalized, ...remaining];
    }

    setPersonalizedChallenges(personalized);

    // Save to user's document in Firestore
    if (personalized.length > 0) {
      const updateUserDoc = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          personalizedChallenges: personalized
        });
      };

      updateUserDoc();
    }
  }, [phq9Data, user]);

  // Effect to load personalized challenges from Firestore
  useEffect(() => {
    if (!user) return;

    const loadPersonalizedChallenges = async () => {
      try {
        const userDocRef = await doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.personalizedChallenges && data.personalizedChallenges.length > 0) {
            setPersonalizedChallenges(data.personalizedChallenges);
          } else {
            // Get random challenges from the pool for first-time users
            const randomChallenges = getRandomChallenges(3);
            setPersonalizedChallenges(randomChallenges);
            
            // Save to Firestore
            await updateDoc(userDocRef, {
              personalizedChallenges: randomChallenges
            });
          }
          if (Array.isArray(data.completedChallengeIds)) {
            setCompletedChallenges(data.completedChallengeIds);
          }
        }
      } catch (error) {
        console.error('Error loading personalized challenges:', error);
        // Fallback to random challenges if there's an error
        const randomChallenges = getRandomChallenges(3);
        setPersonalizedChallenges(randomChallenges);
      }
    };

    loadPersonalizedChallenges();
  }, [user]);

  // Effect to monitor challenge completion status
  useEffect(() => {
    const remainingChallenges = challengePool.filter(c => !completedChallenges.includes(c.title));
    setAllChallengesCompleted(remainingChallenges.length === 0);
  }, [completedChallenges]);

  // Mobile menu handlers
  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  // User menu handlers
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  // Notification modal handlers
  const handleNotificationModalOpen = () => {
    setNotificationModalOpen(true);
  };

  const handleNotificationModalClose = () => {
    setNotificationModalOpen(false);
  };

  // Navigation handler
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleUserMenuClose();
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Mood entry handler
  const handleMoodEntrySubmit = async (moodEntry) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'mood_entries'), moodEntry);
      // The onSnapshot listener will automatically update the moodEntries and averageMood
    } catch (error) {
      console.error('Error adding mood entry:', error);
      // Optionally show an error message to the user
    }
  };

  // PHQ-9 submission handler
  const handlePhq9Submit = async (responses) => {
    if (!user) return;

    const totalScore = responses.reduce((sum, score) => sum + score, 0);

    try {
      // Save PHQ-9 responses to Firestore
      const phq9ResponseRef = await addDoc(collection(db, 'users', user.uid, 'phq9_responses'), {
        responses,
        score: totalScore,
        timestamp: new Date().toISOString(),
        moodHistory: filteredMoodEntries
      });

      // Save personalized challenges to Firestore
      let personalized = [];

      if (totalScore >= 15) {
        personalized = [
          {
            title: "Professional Support",
            description: "Connect with a mental health professional for guidance",
            type: "professional",
            severity: "high"
          },
          {
            title: "Daily Check-ins",
            description: "Set reminders to check in with yourself 3 times a day",
            type: "behavior",
            severity: "high"
          }
        ];
      } else if (totalScore >= 10) {
        personalized = [
          {
            title: "Mindfulness Practice",
            description: "10-minute guided meditation every morning",
            type: "mindfulness",
            severity: "medium"
          },
          {
            title: "Social Connection",
            description: "Reach out to a friend or family member daily",
            type: "social",
            severity: "medium"
          }
        ];
      } else if (totalScore >= 5) {
        personalized = [
          {
            title: "Gratitude Journal",
            description: "Write down 3 things you're grateful for each day",
            type: "gratitude",
            severity: "low"
          },
          {
            title: "Physical Activity",
            description: "20-minute walk or exercise every day",
            type: "physical",
            severity: "low"
          }
        ];
      }

      if (personalized.length > 0) {
        await updateDoc(doc(db, 'users', user.uid, 'phq9_responses', phq9ResponseRef.id), {
          personalizedChallenges: personalized
        });
      }

      // Update user's profile with PHQ-9 status
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        lastPhq9Date: new Date().toISOString(),
        phq9History: [...(user?.phq9History || []), {
          score: totalScore,
          timestamp: new Date().toISOString()
        }]
      });

      // Store PHQ-9 data locally
      setPhq9Data({
        score: totalScore,
        responses,
        timestamp: new Date().toISOString()
      });

      // Add mood alert for low scores
      if (totalScore >= 15) {
        await updateDoc(userDocRef, {
          moodAlerts: [...(user?.moodAlerts || []), {
            date: new Date().toISOString(),
            days: lowMoodDays,
            message: `Your PHQ-9 score indicates moderate to severe depression. Consider professional support immediately.`
          }]
        });
      }

    } catch (error) {
      console.error('Error saving PHQ-9 response:', error);
    }
  };

  // Define function click handler for resource cards
  const handleResourceClick = (resource) => {
    // Check if this is a crisis support resource
    if (resource.isCrisisSupport) {
      navigate('/crisis-support');
      return;
    }

    // Check if the resource has a specific path defined
    if (resource.path) {
      navigate(resource.path);
      return;
    }

    // Check if this is a Spotify resource
    if (resource.spotifyUrl) {
      window.open(resource.spotifyUrl, '_blank');
      return;
    }

    // Default fallback for resources without specific paths
    alert(`Opening ${resource.title}...`);
  };

  // Define resources array with crisis support flag
  const resources = [
    {
      title: 'Crisis Support',
      description: 'Immediate help for mental health emergencies',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgxwlv6-ilH9JYd-AUwG9LBL78rIugLp_sOBJGsjh6j842H4u1kP5wM4AhKcdv4s-X_-hPkjavecy0kZcFq4w9rD0vDskvweuei6gAi0U0iq9DoEbS7AecziEmkXr4ADSXqAnSRAd_aqCTdkhj34HoW4uAK0DnZRo_TkDq6RxfLSYQrs3WuqeoNr2PrIjCEjkmoTrBKLXc-xaVJTVu4lUMVvyZBzkqzOVptVqN9SsX9tE7Dh-CSpWWHLICJTiYXdPN_pU9bol0ITYp',
      isCrisisSupport: true
    },
    {
      title: 'Calming Exercises',
      description: 'Short activities to reduce stress and anxiety',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxdVPWXMJhcXSJ5q6QC7pB4MRXNCAEYXLTdB-XjkQdMBum8Krz-qtSp-VdYhSJNNjEMv_75BPKpcSzHO68ZTUzvRZv6K3EFIjSG81mF8oECDwNxrGECsrD0IqN4lV3PcRPx7Ob2mPlq2CekVeXUhwSRsvgGQ2kUtF0Wx-qwoReTxoDuZ6l5uycAFsD-vTDlep7AjCQCRY28hX1IbELgUMuT6xAc_id5_DQU0uwScrWlnxKhCxtxdoQli_ObmAGZcAzeD12YjgV62_9',
      path: '/calming-exercises'
    },
    {
      title: 'My Playlists',
      description: 'Create personalized calming playlists based on your mood',
      image: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
      path: '/playlists'
    }
  ];

  const defaultChallenges = [
    {
      title: '30-Day Mindfulness Challenge',
      progress: 50,
      daysCompleted: 15,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxga-JSRpjhskQJwQoBNUX2jL4UxTq9LJNpLMyr2iB19AHmy9mORzL-k4F5wd__nlk8QT-d7qGfvW28thWI0mpNKglQi2ipWC6zHd6nMazTlajIPiXTkNGw2TsVlw-PYTtHQgIo3MohPaJxDr1eocaZrQm5nAsjY3-t_5ZrrnqirqLxLZRCsF_ljvyjjaR3GyOF-m52tuAqrCP1suaQYOGcwDJVE6LYGRMf_IwJAkfnQVWdnCvVovaST4xvTX5UqaxBLgbau0eOlrA',
    },
    {
      title: 'Water Intake Challenge',
      progress: 30,
      daysCompleted: 9,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxdVPWXMJhcXSJ5q6QC7pB4MRXNCAEYXLTdB-XjkQdMBum8Krz-qtSp-VdYhSJNNjEMv_75BPKpcSzHO68ZTUzvRZv6K3EFIjSG81mF8oECDwNxrGECsrD0IqN4lV3PcRPx7Ob2mPlq2CekVeXUhwSRsvgGQ2kUtF0Wx-qwoReTxoDuZ6l5uycAFsD-vTDlep7AjCQCRY28hX1IbELgUMuT6xAc_id5_DQU0uwScrWlnxKhCxtxdoQli_ObmAGZcAzeD12YjgV62_9',
    },
  ];

  const moods = {
    Happy: { color: '#42f099', icon: '😊' },
    Calm: { color: '#4c9a73', icon: '😌' },
    Resilient: { color: '#3a9b7a', icon: '💪' },
  };

  // Pool of 10 challenges that will be randomly selected
  const challengePool = [
    {
      title: "Mindful Breathing",
      description: "5 minutes of deep breathing exercises",
      type: "breathing",
      severity: "low",
      duration: 1
    },
    {
      title: "Short Walk",
      description: "Take a 10-minute walk outside",
      type: "physical",
      severity: "low",
      duration: 1
    },
    {
      title: "Gratitude Practice",
      description: "Write down 3 things you're grateful for",
      type: "gratitude",
      severity: "low",
      duration: 1
    },
    {
      title: "Progressive Relaxation",
      description: "10-minute muscle relaxation exercise",
      type: "relaxation",
      severity: "low",
      duration: 1
    },
    {
      title: "Mindfulness Meditation",
      description: "15-minute guided meditation session",
      type: "meditation",
      severity: "medium",
      duration: 2
    },
    {
      title: "Social Connection",
      description: "Reach out to a friend or family member",
      type: "social",
      severity: "medium",
      duration: 1
    },
    {
      title: "Creative Expression",
      description: "Draw, paint, or write for 20 minutes",
      type: "creative",
      severity: "medium",
      duration: 2
    },
    {
      title: "Physical Exercise",
      description: "30-minute workout or yoga session",
      type: "physical",
      severity: "medium",
      duration: 3
    },
    {
      title: "Professional Support",
      description: "Schedule a mental health consultation",
      type: "professional",
      severity: "high",
      duration: 1
    },
    {
      title: "Crisis Safety Plan",
      description: "Create a safety plan for difficult moments",
      type: "safety",
      severity: "high",
      duration: 1
    }
  ];

  // Function to get random challenges from the pool
  const getRandomChallenges = (count = 3) => {
    const shuffled = [...challengePool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Function to replenish challenges when needed
  const replenishChallenges = () => {
    const availableChallenges = challengePool.filter(challenge => 
      !completedChallenges.includes(challenge.title)
    );
    
    if (availableChallenges.length < 3) {
      // Reset completed challenges if we're running low
      setCompletedChallenges([]);
      setChallengeRefreshMessage('Challenges refreshed! New challenges are available.');
      setTimeout(() => setChallengeRefreshMessage(''), 3000);
      return getRandomChallenges(3);
    }
    
    setChallengeRefreshMessage('New challenges loaded!');
    setTimeout(() => setChallengeRefreshMessage(''), 3000);
    return getRandomChallenges(3);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Root>
        <Container maxWidth="xl" sx={{ mt: 6 }}>
          <Typography>Loading...</Typography>
        </Container>
      </Root>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Save to Firestore
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      updateDoc(userDocRef, {
        notifications: arrayUnion(newNotification)
      }).catch(error => {
        console.error('Error saving notification:', error);
      });
    }
  };

  const markNotificationAsSeen = (notificationId) => {
    setSeenNotifications(prev => new Set([...prev, notificationId]));
    
    // Remove from notifications
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Update Firestore
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      updateDoc(userDocRef, {
        seenNotifications: arrayUnion(notificationId)
      }).catch(error => {
        console.error('Error updating seen notifications:', error);
      });
    }
  };

  return (
    <Root>
      <StyledAppBar position="static" elevation={0}>
        <Toolbar>
          <Box display="flex" alignItems="center" gap={2}>
            <SvgIcon fontSize="small">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                  fill="currentColor"
                ></path>
              </svg>
            </SvgIcon>
            <Typography variant="h6" fontWeight="bold">
              MoodApp
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Points Badge */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 2 }}>
            <Chip
              icon={
                <SvgIcon fontSize="small">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 7l-10 5 10 5 10-5-10-5zm-10 8l10 5 10-5v2l-10 5-10-5v-2z"/>
                  </svg>
                </SvgIcon>
              }
              label={`${points} pts`}
              sx={{ bgcolor: '#e7f3ed', color: '#0d1b14', fontWeight: 'bold' }}
            />
          </Box>

          {/* Desktop Navigation - Visible on desktop */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => handleNavigate('/')}
              startIcon={
                <SvgIcon fontSize="small">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M168.49,71.51a12,12,0,0,0,-17,0L104,119,56.49,71.51a12,12,0,0,0,-17,0,12,12,0,0,0,0,17l65,65a12,12,0,0,0,17,0l65,-65a12,12,0,0,0,0,-17"></path>
                  </svg>
                </SvgIcon>
              }
            >
              Home
            </Button>

            <Button color="inherit" onClick={() => handleNavigate('/journal')}>Journal</Button>
            <Button color="inherit" onClick={() => handleNavigate('/challenges')}>Challenges</Button>
            <Button color="inherit" onClick={() => handleNavigate('/resources')}>Resources</Button>
          </Box>

          {/* Mood Entry Button */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
            <MoodEntryButton
              startIcon={
                <SvgIcon fontSize="small">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"></path>
                    <path d="M2 17L12 22L22 17"></path>
                    <path d="M2 12L12 17L22 12"></path>
                  </svg>
                </SvgIcon>
              }
              variant="contained"
              sx={{
                bgcolor: '#4c9a73',
                '&:hover': { bgcolor: '#3a9b7a' },
                mr: 1
              }}
              onClick={() => setMoodDialogOpen(true)}
            >
              Mood Check
            </MoodEntryButton>

            <Tooltip title="Notifications">
              <Box sx={{ position: 'relative' }}>
                <Button
                  variant="outlined"
                  onClick={handleNotificationModalOpen}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                      </svg>
                    </SvgIcon>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  Notifications
                </Button>
                {notifications.length > 0 && (
                  <Chip
                    label={notifications.length}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      minWidth: 20,
                      height: 20,
                      fontSize: '0.75rem',
                      bgcolor: '#f44336',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          </Box>

          {/* Mobile Points Display */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', mr: 2 }}>
            <Chip
              icon={
                <SvgIcon fontSize="small">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 7l-10 5 10 5 10-5-10-5zm-10 8l10 5 10-5v2l-10 5-10-5v-2z"/>
                  </svg>
                </SvgIcon>
              }
              label={`${points} pts`}
              size="small"
              sx={{ bgcolor: '#e7f3ed', color: '#0d1b14', fontWeight: 'bold' }}
            />
          </Box>

          {/* Mobile menu button - Hidden on desktop */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, flexDirection: 'row', alignItems: 'center' }}>
            <MoodCheckButton
              onClick={() => setMoodDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              <SvgIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </SvgIcon>
            </MoodCheckButton>

            <Button
              color="inherit"
              onClick={() => handleNavigate('/')}
              startIcon={
                <SvgIcon fontSize="small">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M168.49,71.51a12,12,0,0,0,-17,0L104,119,56.49,71.51a12,12,0,0,0,-17,0,12,12,0,0,0,0,17l65,65a12,12,0,0,0,17,0l65,-65a12,12,0,0,0,0,-17"></path>
                  </svg>
                </SvgIcon>
              }
              size="small"
            >
              Home
            </Button>

            {/* Mobile Notification Button */}
            <Box sx={{ position: 'relative' }}>
              <IconButton
                color="inherit"
                onClick={handleNotificationModalOpen}
                size="small"
                sx={{ mr: 1 }}
              >
                <SvgIcon fontSize="small">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                  </svg>
                </SvgIcon>
              </IconButton>
              {notifications.length > 0 && (
                <Chip
                  label={notifications.length}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    fontSize: '0.7rem',
                    bgcolor: '#f44336',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              )}
            </Box>

            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
              </svg>
            </IconButton>
          </Box>

          {/* User profile */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{ display: { xs: 'none', sm: 'flex' }, ml: 1 }}
            >
              <Avatar
                src={user?.photoURL || undefined}
                alt={user?.displayName || user?.email || 'User'}
                sx={{ width: 40, height: 40 }}
              >
                {!user?.photoURL && (user?.displayName?.[0] || user?.email?.[0] || 'U')}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Mobile Profile */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{ display: { xs: 'flex', sm: 'none' }, ml: 1, mr: 1 }}
            >
              <Avatar
                src={user?.photoURL || undefined}
                alt={user?.displayName || user?.email || 'User'}
                sx={{ width: 32, height: 32 }}
              >
                {!user?.photoURL && (user?.displayName?.[0] || user?.email?.[0] || 'U')}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileAnchorEl}
            open={Boolean(mobileAnchorEl)}
            onClose={handleMobileMenuClose}
            sx={{ display: { xs: 'block', sm: 'none' } }}
          >
            {/* Mobile Points Display */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Points
                </Typography>
                <Chip
                  icon={
                    <SvgIcon fontSize="small">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zm0 7l-10 5 10 5 10-5-10-5zm-10 8l10 5 10-5v2l-10 5-10-5v-2z"/>
                      </svg>
                    </SvgIcon>
                  }
                  label={`${points} pts`}
                  size="small"
                  sx={{ bgcolor: '#e7f3ed', color: '#0d1b14', fontWeight: 'bold' }}
                />
              </Box>
            </Box>
            
            <MenuItem onClick={() => { handleNavigate('/'); handleMobileMenuClose(); }}>Home</MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>Journal</MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>Challenges</MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>Resources</MenuItem>
            <MenuItem onClick={() => { handleNotificationModalOpen(); handleMobileMenuClose(); }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <Chip
                    label={notifications.length}
                    size="small"
                    sx={{
                      bgcolor: '#f44336',
                      color: 'white',
                      fontWeight: 'bold',
                      minWidth: 20,
                      height: 20,
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </Box>
            </MenuItem>
          </Menu>

          {/* User Menu */}
          <Menu
            anchorEl={userMenuAnchorEl}
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Typography sx={{ p: 1, fontWeight: 'bold' }}>
              {user?.email || user?.displayName || 'User'}
            </Typography>
            {/* Add this MenuItem for My Playlists */}
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/playlists'); }}>
              <SvgIcon fontSize="small" sx={{ mr: 1 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 11a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1zm6-4a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V7zM7 9a1 1 0 011-1h2a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1z" />
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-1 2h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41z" />
                </svg>
              </SvgIcon>
              My Playlists
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>
              <SvgIcon fontSize="small" sx={{ mr: 1 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M216,120H174.34a8,8,0,0,1,0-16H216a8,8,0,0,1,0,16Zm-42.34,40H216a8,8,0,0,0,0-16H173.66a8,8,0,1,0,0,16ZM100,40A51,51,0,0,1,150.79,90.15,8.67,8.67,0,0,0,152,92.84a8.58,8.58,0,0,0,3.79.93A8,8,0,0,0,160,76a66.74,66.74,0,0,0-20.36-10.19V56a8,8,0,0,0-16,0v9.81a68.77,68.77,0,1,0,47.53,66.86A8,8,0,1,0,189.25,122,52.78,52.78,0,1,1,100,140a38,38,0,1,0-38,38h24a8,8,0,0,0,16,0V144a8,8,0,0,0-16,0v20H62a54,54,0,1,1,38-92Z"></path>
                </svg>
              </SvgIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>

      {/* Mood Entry Dialog */}
      <MoodEntryDialog
        open={moodDialogOpen}
        onClose={() => setMoodDialogOpen(false)}
        onSubmit={handleMoodEntrySubmit}
      />

      {/* PHQ-9 Dialog */}
      <Phq9Dialog
        open={phq9DialogOpen}
        onClose={() => setPhq9DialogOpen(false)}
        onSubmit={handlePhq9Submit}
      />

      {/* Notification Modal */}
      <NotificationModal
        open={notificationModalOpen}
        onClose={handleNotificationModalClose}
        notifications={notifications}
        onMarkAsSeen={markNotificationAsSeen}
      />

      <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant={{ xs: 'h4', sm: 'h3', md: 'h4' }} component="h1" color="#0d1b14" gutterBottom>
              Welcome back, {user?.displayName || 'Emily'}
            </Typography>

            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center">
                <Typography sx={{ mr: 1 }}>How are you feeling today?</Typography>
                <Rating
                  name="pulsating-mood"
                  size="large"
                  value={currentMood}
                  onChange={(_, value) => setCurrentMood(value)}
                  precision={0.5}
                />
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Mood Trends Section */}
        <Box sx={{ mt: { xs: 4, sm: 6, md: 8 }, mb: { xs: 2, sm: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant={{ xs: 'h6', sm: 'h5', md: 'h5' }} component="h2" color="#0d1b14" fontWeight="bold">
                Mood Trends
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant={timeframe === 'week' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setTimeframe('week')}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 0.5, sm: 1 }
                  }}
                >
                  Week
                </Button>
                <Button
                  variant={timeframe === 'month' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setTimeframe('month')}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 0.5, sm: 1 }
                  }}
                >
                  Month
                </Button>
              </Box>
            </Box>

            <StyledCard sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
              <Box display="flex" flexWrap="wrap" justifyContent={{ xs: 'start', sm: 'space-between' }} alignItems="center" mb={2}>
                <Box>
                  <Typography variant={isMobile ? "h5" : "h4"} component="p" color="#0d1b14" fontWeight="bold" gutterBottom>
                    Average Mood: {averageMood > 0 ? averageMood.toFixed(1) : 'N/A'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography color="#4c9a73" fontSize={{ xs: 12, sm: 14 }}>
                      Last {timeframe === 'week' ? '7 Days' : '30 Days'}
                    </Typography>
                    {averageMood > 0 && filteredMoodEntries.length > 0 && (
                      <Chip
                        label={averageMood > 3 ? "Positive" : "Needs Attention"}
                        size="small"
                        color={averageMood > 3 ? "success" : "warning"}
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '40%', md: '45%' }, mt: { xs: 2, sm: 0 } }}>
                  <MoodChart moodEntries={filteredMoodEntries} />
                </Box>
              </Box>

              {/* PHQ-9 Status Card */}
              <Box sx={{ mt: 3, px: 2, py: 3, bgcolor: '#e7f3ed', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="#4c9a73">
                      {phq9Data ? (
                        <>
                          Last PHQ-9 Score: <Typography variant="body1" fontWeight="bold" color="#0d1b14"> {phq9Data.score}/27</Typography>
                        </>
                      ) : (
                        lowMoodDays > 0 ? (
                          <>
                            Feeling low for {lowMoodDays} day{lowMoodDays > 1 ? 's' : ''} in a row.
                            <Typography variant="body1" fontWeight="bold" color="#4c9a73" component="span"> Complete PHQ-9 questionnaire</Typography>
                          </>
                        ) : 'No recent low mood patterns'
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    {phq9Data ? (
                      <Chip
                        label={`Severity: ${phq9Data.score < 5 ? 'Minimal' : phq9Data.score < 10 ? 'Mild' : phq9Data.score < 15 ? 'Moderate' : phq9Data.score < 20 ? 'Moderately Severe' : 'Severe'}`}
                        size="small"
                        color={phq9Data.score < 10 ? "success" : phq9Data.score < 15 ? "warning" : "error"}
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPhq9DialogOpen(true)}
                        sx={{
                          borderRadius: '8px',
                          borderColor: '#4c9a73',
                          color: '#4c9a73',
                          '&:hover': {
                            borderColor: '#3a9b7a',
                            color: '#3a9b7a',
                          }
                        }}
                      >
                        Take Assessment
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </StyledCard>
          </motion.div>
        </Box>
        {/* Active Challenges */}
        <Box sx={{ mt: { xs: 4, sm: 6, md: 8 }, mb: { xs: 2, sm: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            key={completedChallenges.length}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant={{ xs: 'h6', sm: 'h5', md: 'h5' }} component="h2" color="#0d1b14" fontWeight="bold">
                Active Challenges
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const newChallenges = replenishChallenges();
                  setPersonalizedChallenges(newChallenges);
                  // Save to Firestore
                  if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    updateDoc(userDocRef, {
                      personalizedChallenges: newChallenges
                    }).catch(() => {});
                  }
                  
                  // Add notification for new challenges
                  addNotification({
                    type: 'challenge',
                    title: 'New Challenges Available! 🎯',
                    message: 'Fresh challenges have been loaded for you. Ready to take on something new?',
                    description: 'New personalized challenges are now available based on your current needs.'
                  });
                }}
                startIcon={
                  <SvgIcon fontSize="small">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                  </SvgIcon>
                }
                sx={{
                  borderRadius: '8px',
                  borderColor: '#4c9a73',
                  color: '#4c9a73',
                  '&:hover': {
                    borderColor: '#3a9b7a',
                    bgcolor: '#f0f8f5'
                  }
                }}
              >
                Refresh Challenges
              </Button>
            </Box>
            {challengeRefreshMessage && (
              <Box sx={{ 
                mb: 2, 
                p: 1.5, 
                bgcolor: '#e7f3ed', 
                borderRadius: 1, 
                border: '1px solid #4c9a73',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <SvgIcon fontSize="small" sx={{ color: '#4c9a73' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098L9.05.435zM8 .989c.127 0 .253.049.35.145l2.35 2.35a.5.5 0 0 1-.7.7L8.5 2.207 6.15 4.557a.5.5 0 0 1-.7-.7l2.35-2.35A.5.5 0 0 1 8 .989z"/>
                  </svg>
                </SvgIcon>
                <Typography variant="body2" color="#0d1b14" sx={{ fontWeight: 500 }}>
                  {challengeRefreshMessage}
                </Typography>
              </Box>
            )}

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {personalizedChallenges.length > 0 ? (
                personalizedChallenges
                  .map((challenge, index) => {
                    const challengeId = challenge.id ?? `${challenge.title}-${index}`;
                    if (completedChallenges.includes(challengeId)) return null;
                    const timer = activeTimers[challengeId];
                    const isTimerActive = timer && timer.timeRemaining > 0;

                    return (
                      <Grid item xs={12} sm={6} md={6} key={`${challengeId}-${index}`}>
                        <StyledCard sx={{
                          p: { xs: 2, sm: 3 },
                          borderLeft: `4px solid ${challenge.severity === 'high' ? '#f44336' : challenge.severity === 'medium' ? '#ff9800' : '#4caf50'}`,
                          transition: 'all 0.3s ease'
                        }}>
                          <Typography
                            variant={isMobile ? "h6" : "h6"}
                            fontWeight="bold"
                            color="#0d1b14"
                            gutterBottom
                          >
                            {challenge.title}
                          </Typography>
                          <Typography color="#4c9a73" mb={2} fontSize={{ xs: 12, sm: 14 }}>
                            {challenge.description}
                          </Typography>

                          {isTimerActive && (
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 2,
                              p: 1,
                              bgcolor: '#f0f8f5',
                              borderRadius: 1
                            }}>
                              <Box display="flex" alignItems="center">
                                <SvgIcon fontSize="small" sx={{ mr: 0.5, color: '#4c9a73' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                  </svg>
                                </SvgIcon>
                                <Typography color="#4c9a73" fontWeight="bold">
                                  Time remaining: {formatTime(timer.timeRemaining)}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                onClick={() => setActiveTimers(prev => ({ ...prev, [challengeId]: null }))}
                                sx={{
                                  color: '#f44336',
                                  fontWeight: 'bold',
                                  textTransform: 'none',
                                  p: 0.5,
                                  minWidth: 'unset'
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          )}

                          {isTimerActive ? (
                            <Typography variant="body2" color="#4c9a73" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                              Challenge in progress...
                            </Typography>
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip
                                label={challenge.type}
                                size="small"
                                sx={{ backgroundColor: '#e7f3ed', color: '#0d1b14' }}
                              />
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => startTimer(challengeId, challenge.duration || 1)}
                                sx={{
                                  borderRadius: '8px',
                                  bgcolor: '#4c9a73',
                                  '&:hover': { bgcolor: '#3a9b7a' }
                                }}
                              >
                                Start
                              </Button>
                            </Box>
                          )}
                        </StyledCard>
                      </Grid>
                    );
                  })
                  .filter(Boolean)
              ) : (
                defaultChallenges.map((challenge, index) => (
                  <Grid item xs={12} sm={6} md={6} key={index}>
                    <StyledCard sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography
                        variant={isMobile ? "h6" : "h6"}
                        fontWeight="bold"
                        color="#0d1b14"
                        gutterBottom
                      >
                        {challenge.title}
                        </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography fontSize={{ xs: 11, sm: 14 }} color="#4c9a73">
                          Progress: {challenge.daysCompleted}/30 days
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={challenge.progress}
                            sx={{
                              height: { xs: 6, sm: 8 },
                              borderRadius: 3,
                            }}
                          />
                        </Box>
                        <Typography fontWeight="bold" color="#0d1b14" fontSize={{ xs: 14, sm: 16 }}>
                          {challenge.progress}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => startTimer(`default-${index}`, 1)}
                          sx={{ borderRadius: '8px', bgcolor: '#4c9a73', '&:hover': { bgcolor: '#3a9b7a' } }}
                        >
                          Start
                        </Button>
                      </Box>
                    </StyledCard>
                  </Grid>
                ))
              )}
            </Grid>
            
            {/* Challenge Pool Info */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                💡 <strong>{challengePool.length}</strong> challenges available • 
                <strong> {challengePool.filter(c => !completedChallenges.includes(c.title)).length}</strong> challenges remaining
              </Typography>
            </Box>
            
            {/* All Challenges Completed Message */}
            {challengePool.filter(c => !completedChallenges.includes(c.title)).length === 0 && (
              <Box sx={{ mt: 3, p: 3, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7', textAlign: 'center' }}>
                <Typography variant="h6" color="#856404" sx={{ mb: 1 }}>
                  🎉 Congratulations!
                </Typography>
                <Typography variant="body1" color="#856404" sx={{ mb: 2 }}>
                  You've completed all available challenges! Click "Refresh Challenges" to get new ones.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setCompletedChallenges([]);
                    const newChallenges = getRandomChallenges(3);
                    setPersonalizedChallenges(newChallenges);
                    if (user) {
                      const userDocRef = doc(db, 'users', user.uid);
                      updateDoc(userDocRef, {
                        personalizedChallenges: newChallenges,
                        completedChallengeIds: []
                      }).catch(() => {});
                    }
                    
                    // Add notification for challenge reset
                    addNotification({
                      type: 'challenge',
                      title: 'Challenges Reset! 🔄',
                      message: 'All challenges have been reset and new ones are now available. Start fresh!',
                      description: 'Challenge progress has been reset and new personalized challenges are ready.'
                    });
                  }}
                  sx={{
                    bgcolor: '#ffc107',
                    color: '#856404',
                    '&:hover': { bgcolor: '#e0a800' }
                  }}
                >
                  Reset & Get New Challenges
                </Button>
              </Box>
            )}
          </motion.div>
        </Box>

        {/* Quick Resources */}
        <Box sx={{ mt: { xs: 4, sm: 6, md: 8 }, mb: { xs: 2, sm: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Typography variant={{ xs: 'h6', sm: 'h5', md: 'h5' }} component="h2" color="#0d1b14" fontWeight="bold" gutterBottom>
              Quick Resources
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {resources.map((resource, index) => (
                <Grid item xs={12} sm={6} md={6} key={index}>
                  <StyledCard
                    sx={{
                      p: { xs: 2, sm: 3 },
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={() => handleResourceClick(resource)}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      {resource.isCrisisSupport ? (
                        <SvgIcon fontSize="small" sx={{ mr: 1, color: '#f44336' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                          </svg>
                        </SvgIcon>
                      ) : resource.spotifyUrl ? (
                        <SvgIcon fontSize="small" sx={{ mr: 1, color: '#1DB954' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                          </svg>
                        </SvgIcon>
                      ) : (
                        <SvgIcon fontSize="small" sx={{ mr: 1, color: '#4c9a73' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                          </svg>
                        </SvgIcon>
                      )}
                      <Typography
                        variant={isMobile ? "h6" : "h6"}
                        fontWeight="bold"
                        color="#0d1b14"
                      >
                        {resource.title}
                      </Typography>
                    </Box>
                    <Typography color="#4c9a73" mb={2} fontSize={{ xs: 12, sm: 14 }}>
                      {resource.description}
                    </Typography>
                    <Box
                      sx={{
                        height: { xs: 120, sm: 150 },
                        borderRadius: 1,
                        overflow: 'hidden',
                        backgroundImage: `url(${resource.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* Notifications Section */}
       
        {/* Custom spacing for mobile devices */}
        <Box sx={{ height: { xs: 80, sm: 0 } }} />
      </Container>
    </Root>
  );
};

export default MoodDashboard;