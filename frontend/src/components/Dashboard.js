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
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Firebase imports
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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

const MoodChart = () => {
  // Mock data for mood chart
  const data = [
    { day: 'Mon', mood: 3 },
    { day: 'Tue', mood: 4 },
    { day: 'Wed', mood: 2 },
    { day: 'Thu', mood: 5 },
    { day: 'Fri', mood: 3 },
    { day: 'Sat', mood: 4 },
    { day: 'Sun', mood: 4 },
  ];

  const maxMood = 5;

  return (
    <ChartContainer>
      <svg viewBox="0 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background gradient */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e7f3ed" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#e7f3ed" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        {/* Chart area */}
        <path d={`M0 ${150 - (data[0].mood / maxMood) * 140} 
                  C18 150-18 150 36 ${150 - (data[1].mood / maxMood) * 140}
                  C54 90-54 90 72 ${150 - (data[2].mood / maxMood) * 140}
                  C90 ${220-90} -90 180 108 ${150 - (data[3].mood / maxMood) * 140}
                  C126 ${30-30} -126 72 144 ${150 - (data[4].mood / maxMood) * 140}
                  C162 ${90} -162 180 180 ${150 - (data[5].mood / maxMood) * 140}
                  C198 ${90} -198 36 216 ${150 - (data[6].mood / maxMood) * 140}
                  L478 ${150 - (data[6].mood / maxMood) * 140} L478 150 L0 150 Z`} 
          fill="url(#gradient)" />
        
        {/* Line chart */}
        <path d={`M0 ${150 - (data[0].mood / maxMood) * 140} 
                  C18 150-18 150 36 ${150 - (data[1].mood / maxMood) * 140}
                  C54 90-54 90 72 ${150 - (data[2].mood / maxMood) * 140}
                  C90 ${220-90} -90 180 108 ${150 - (data[3].mood / maxMood) * 140}
                  C126 ${30-30} -126 72 144 ${150 - (data[4].mood / maxMood) * 140}
                  C162 ${90} -162 180 180 ${150 - (data[5].mood / maxMood) * 140}
                  C198 ${90} -198 36 216 ${150 - (data[6].mood / maxMood) * 140}`} 
          stroke="#4c9a73"
          strokeWidth="3"
          fill="none" />
          
        {/* Data points */}
        {data.map((point, index) => (
          <circle cx={index * 68} cy={150 - (point.mood / maxMood) * 140} r="4" fill="#42f099" key={index} />
        ))}
        
        {/* Day labels - adjusted for mobile */}
        <g fill="#4c9a73" fontSize={{ xs: 10, sm: 12 }} fontWeight="bold" textAnchor="middle">
          {data.map((point, index) => (
            <text x={index * 68 + 25} y="145" key={index}>{point.day}</text>
          ))}
        </g>
      </svg>
    </ChartContainer>
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
  const navigate = useNavigate();

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          
          {/* Desktop Navigation - Hidden on mobile */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 4 }}>
            <Button color="inherit">Home</Button>
            <Button color="inherit">Journal</Button>
            <Button color="inherit">Challenges</Button>
            <Button color="inherit">Resources</Button>
          </Box>
          
          {/* Mobile menu button - Hidden on desktop */}
          <IconButton 
            size="large" 
            edge="end" 
            color="inherit" 
            aria-label="menu"
            onClick={handleMobileMenuOpen}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
          </IconButton>
          
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
              sx={{ borderRadius: 2, display: { xs: 'none', sm: 'flex' } }}
            >
              
            </Button>
          </Tooltip>
          
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
              sx={{ display: { xs: 'flex', sm: 'none' }, ml: 1 }}
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
            <MenuItem onClick={handleMobileMenuClose}>Home</MenuItem>
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

      <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant={{ xs: 'h4', sm: 'h3', md: 'h4' }} component="h1" color="#0d1b14" gutterBottom>
            Welcome back, {user?.displayName || 'Emily'}
          </Typography>
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
                    Average Mood: 3.5
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography color="#4c9a73" fontSize={{ xs: 12, sm: 14 }}>
                      Last 7 Days
                    </Typography>
                    <Chip label="+10%" size="small" color="success" />
                  </Box>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '40%', md: '45%' }, mt: { xs: 2, sm: 0 } }}>
                  <MoodChart />
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