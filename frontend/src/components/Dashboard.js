import React, { useState, useEffect } from 'react';
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
  Stack,
  Rating,
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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
  addDoc
} from 'firebase/firestore';

// Styled components
const Root = styled('div')(({ theme }) => ({
  backgroundColor: '#f8fcfa',
  minHeight: '100vh',
  fontFamily: 'Manrope, "Noto Sans", sans-serif',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderBottom: '1px solid #e7f3ed',
  background: '#f8fcfa',
  boxShadow: 'none',
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
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="0" dy="1" result="offsetblur"/>
              <feFlood floodColor="#000000" floodOpacity="0.1"/>
              <feComposite in2="offsetblur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
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
  const [currentMood, setCurrentMood] = useState(3);
  const navigate = useNavigate();

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

  // Calculate average mood based on filtered entries
  useEffect(() => {
    if (filteredMoodEntries.length > 0) {
      const totalMood = filteredMoodEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0);
      const avg = totalMood / filteredMoodEntries.length;
      setAverageMood(parseFloat(avg.toFixed(1)));
    } else {
      setAverageMood(0);
    }
  }, [filteredMoodEntries]);

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

  // Mock data
  const journalEntries = [
    {
      date: 'Today',
      title: 'Reflecting on a Productive Day',
      mood: 'Happy',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA84sRkepy5eZrwUsA0TbpHcsh0VeG7pODTb5w8S5nfJbIFHvrI-S3I6BJhOVoBxVo1ohE4WESODGicq0J3SRZcIbE-0wBC0AsWlXwNZ0v2hfMJdhnQfCnA85odOS82znfeE9iNvvrqY9fsScy8FzfMx4-srZQ8Na7knIOmk-6nP7-463yGrXa-BrGOUhom8cexOsYyF7DpnTMHH2NguRALFSf6uky1957-k-QAYvwLuRMD23PKkN_Gfaw2tm0x9YpGwRC_knpDJwzx',
    },
    {
      date: 'Yesterday',
      title: 'Learning to Let Go',
      mood: 'Calm',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxga-JSRpjhskQJwQoBNUX2jL4UxTq9LJNpLMyr2iB19AHmy9mORzL-k4F5wd__nlk8QT-d7qGfvW28thWI0mpNKglQi2ipWC6zHd6nMazTlajIPiXTkNGw2TsVlw-PYTtHQgIo3MohPaJxDr1eocaZrQm5nAsjY3-t_5ZrrnqirqLxLZRCsF_ljvyjjaR3GyOF-m52tuAqrCP1suaQYOGcwDJVE6LYGRMf_IwJAkfnQVWdnCvVovaST4xvTX5UqaxBLgbau0eOlrA',
    },
    {
      date: '2 days ago',
      title: 'Overcoming Challenges',
      mood: 'Resilient',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgxwlv6-ilH9JYd-AUwG9LBL78rIugLp_sOBJGsjh6j842H4u1kP5wM4AhKcdv4s-X_-hPkjavecy0kZcFq4w9rD0vDskvweuei6gAi0U0iq9DoEbS7AecziEmkXr4ADSXqAnSRAd_aqCTdkhj34HoW4uAK0DnZRo_TkDq6RxfLSYQrs3WuqeoNr2PrIjCEjkmoTrBKLXc-xaVJTVu4lUMVvyZBzkqzOVptVqN9SsX9tE7Dh-CSpWWHLICJTiYXdPN_pU9bol0ITYp',
    },
  ];

  const challenges = [
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

  const resources = [
    {
      title: 'Crisis Support',
      description: 'Immediate help for mental health emergencies',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgxwlv6-ilH9JYd-AUwG9LBL78rIugLp_sOBJGsjh6j842H4u1kP5wM4AhKcdv4s-X_-hPkjavecy0kZcFq4w9rD0vDskvweuei6gAi0U0iq9DoEbS7AecziEmkXr4ADSXqAnSRAd_aqCTdkhj34HoW4uAK0DnZRo_TkDq6RxfLSYQrs3WuqeoNr2PrIjCEjkmoTrBKLXc-xaVJTVu4lUMVvyZBzkqzOVptVqN9SsX9tE7Dh-CSpWWHLICJTiYXdPN_pU9bol0ITYp',
    },
    {
      title: 'Calming Exercises',
      description: 'Short activities to reduce stress and anxiety',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxdVPWXMJhcXSJ5q6QC7pB4MRXNCAEYXLTdB-XjkQdMBum8Krz-qtSp-VdYhSJNNjEMv_75BPKpcSzHO68ZTUzvRZv6K3EFIjSG81mF8oECDwNxrGECsrD0IqN4lV3PcRPx7Ob2mPlq2CekVeXUhwSRsvgGQ2kUtF0Wx-qwoReTxoDuZ6l5uycAFsD-vTDlep7AjCQCRY28hX1IbELgUMuT6xAc_id5_DQU0uwScrWlnxKhCxtxdoQli_ObmAGZcAzeD12YjgV62_9',
    },
  ];

  const moods = {
    Happy: { color: '#42f099', icon: '😊' },
    Calm: { color: '#4c9a73', icon: '😌' },
    Resilient: { color: '#3a9b7a', icon: '💪' },
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

            <Button color="inherit">Journal</Button>
            <Button color="inherit">Challenges</Button>
            <Button color="inherit">Resources</Button>
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
              <Button
                variant="outlined"
                startIcon={
                  <SvgIcon fontSize="small">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                    </svg>
                  </SvgIcon>
                }
                sx={{ borderRadius: 2 }}
              >

              </Button>
            </Tooltip>
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAv7_7qqBvfJLjDB9bg7LqHNoPjNdNtkp2KTveeOVuTOsi3CyqflEoLZBWtp9XqzXH2dZqAs6oDNndCDz53e5f0Ev-viYCd2zPirQe8wcfcRIzScLhlz-4kn86rN8VI8t2GQXTagYGYo2hd1ECa_eHFjJBGcak9KdvZcIsl0MP107l1l-VrMHI9RsKDbzyFu8aBgFFW3jaqn-Ve_QPnaMhmaGh05vdSHqx09YMEgnI4WvmI0sRfLRmrk0Rg-PJXekCOaripeaGr8HX"
                alt={user.displayName || 'User'}
                sx={{ width: 40, height: 40 }}
              />
            </IconButton>
          </Tooltip>

          {/* Mobile Profile */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{ display: { xs: 'flex', sm: 'none' }, ml: 1, mr: 1 }}
            >
              <Avatar
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAv7_7qqBvfJLjDB9bg7LqHNoPjNdNtkp2KTveeOVuTOsi3CyqflEoLZBWtp9XqzXH2dZqAs6oDNndCDz53e5f0Ev-viYCd2zPirQe8wcfcRIzScLhlz-4kn86rN8VI8t2GQXTagYGYo2hd1ECa_eHFjJBGcak9KdvZcIsl0MP107l1l-VrMHI9RsKDbzyFu8aBgFFW3jaqn-Ve_QPnaMhmaGh05vdSHqx09YMEgnI4WvmI0sRfLRmrk0Rg-PJXekCOaripeaGr8HX"
                alt={user.displayName || 'User'}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileAnchorEl}
            open={Boolean(mobileAnchorEl)}
            onClose={handleMobileMenuClose}
            sx={{ display: { xs: 'block', sm: 'none' } }}
          >
            <MenuItem onClick={() => { handleNavigate('/'); handleMobileMenuClose(); }}>Home</MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>Journal</MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>Challenges</MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>Resources</MenuItem>
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
            </StyledCard>
          </motion.div>
        </Box>

        {/* Recent Journal Entries */}
        <Box sx={{ mt: { xs: 4, sm: 6, md: 8 }, mb: { xs: 2, sm: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant={{ xs: 'h6', sm: 'h5', md: 'h5' }} component="h2" color="#0d1b14" fontWeight="bold" gutterBottom>
              Recent Journal Entries
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {journalEntries.map((entry, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <StyledCard sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box display="flex" flexDirection="column" height="100%">
                      <Typography color="#4c9a73" fontSize={{ xs: 11, sm: 12 }}>
                        {entry.date}
                      </Typography>
                      <Typography
                        fontWeight="bold"
                        color="#0d1b14"
                        mb={1}
                        mt={0.5}
                        variant={{ xs: 'body1', sm: 'h6', md: 'h6' }}
                      >
                        {entry.title}
                      </Typography>
                      <Chip
                        label={entry.mood}
                        size="small"
                        sx={{
                          mb: 1,
                          backgroundColor: moods[entry.mood]?.color || '#e7f3ed',
                          color: '#0d1b14',
                        }}
                      />
                      <Box
                        sx={{
                          flexGrow: 1,
                          mt: 1,
                          borderRadius: 1,
                          overflow: 'hidden',
                          aspectRatio: '16/9',
                          backgroundImage: `url(${entry.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    </Box>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* Active Challenges */}
        <Box sx={{ mt: { xs: 4, sm: 6, md: 8 }, mb: { xs: 2, sm: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Typography variant={{ xs: 'h6', sm: 'h5', md: 'h5' }} component="h2" color="#0d1b14" fontWeight="bold" gutterBottom>
              Active Challenges
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {challenges.map((challenge, index) => (
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
                    <Box mt={2} fontSize={11} color="#4c9a73" sx={{ textAlign: 'justify' }}>
                      "The mind is everything. What you think you become." - Buddha
                    </Box>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
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
                  <StyledCard sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                      variant={isMobile ? "h6" : "h6"}
                      fontWeight="bold"
                      color="#0d1b14"
                      gutterBottom
                    >
                      {resource.title}
                    </Typography>
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

        {/* Custom spacing for mobile devices */}
        <Box sx={{ height: { xs: 80, sm: 0 } }} />
      </Container>
    </Root>
  );
};

export default MoodDashboard;