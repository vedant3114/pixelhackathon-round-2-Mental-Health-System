import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Home as HomeIcon,
  BarChart as AnalyticsIcon,
  Folder as ProjectsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const HackathonHubDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mode, setMode] = useState('dark');

  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthError(false);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
        setAuthError(true);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Theme persistence
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setMode(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseProfileMenu = () => setAnchorEl(null);

  const statsData = [
    { title: 'Total Projects', value: '24', change: '+10%', positive: true },
    { title: 'Active Users', value: '150', change: '+5%', positive: true },
    { title: 'Tasks Completed', value: '320', change: '+15%', positive: true },
    { title: 'Average Rating', value: '4.7', change: '-2%', positive: false }
  ];

  const projects = [
    { name: 'Project Phoenix', category: 'Web', status: 'Active', progress: 60 },
    { name: 'Project Nova', category: 'Mobile', status: 'Completed', progress: 100 },
    { name: 'Project Aurora', category: 'AI', status: 'In Progress', progress: 45 },
    { name: 'Project Zenith', category: 'Other', status: 'Active', progress: 75 },
    { name: 'Project Horizon', category: 'Web', status: 'Planned', progress: 10 }
  ];

  const activities = [
    { title: "Project 'Phoenix' updated", time: '2 hours ago', icon: <ProjectsIcon /> },
    { title: "New user 'Alex Carter' joined", time: '5 hours ago', icon: <HelpIcon /> },
    { title: "Task 'Implement API' completed", time: '1 day ago', icon: <HelpIcon /> }
  ];

  // Colors by mode
  const bgRoot = mode === 'dark' ? '#131118' : '#ffffff';
  const bgPaper = mode === 'dark' ? '#1f1b27' : '#fafafa';
  const textPrimary = mode === 'dark' ? 'white' : '#111';
  const textSecondary = mode === 'dark' ? '#a59cba' : '#666';
  const borderColor = mode === 'dark' ? '#423b54' : '#e0e0e0';
  const chipBg = mode === 'dark' ? '#2d2839' : '#eaeaea';
  const inputBg = mode === 'dark' ? '#2d2839' : '#f0f0f0';
  const appBarBg = mode === 'dark' ? '#131118' : '#f5f5f5';
  const appBarBorder = mode === 'dark' ? '#2d2839' : '#e0e0e0';
  const drawerBg = mode === 'dark' ? '#131118' : '#ffffff';
  const listActiveBg = mode === 'dark' ? '#2d2839' : '#eaeaea';

  const drawer = (
    <Box sx={{ width: 250, bgcolor: drawerBg, height: '100%', color: textPrimary, p: 2 }}>
      <Typography variant="h6" sx={{ color: textPrimary, mb: 4, fontWeight: 'medium' }}>
        Hackathon Hub
      </Typography>
      <List>
        {[
          { text: 'Dashboard', icon: <HomeIcon /> },
          { text: 'Analytics', icon: <AnalyticsIcon /> },
          { text: 'Projects', icon: <ProjectsIcon /> },
          { text: 'Settings', icon: <SettingsIcon /> },
          { text: 'Help', icon: <HelpIcon /> }
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{
                borderRadius: 2,
                bgcolor: item.text === 'Dashboard' ? listActiveBg : 'transparent'
              }}
            >
              <ListItemIcon sx={{ color: textPrimary }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: textPrimary }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', mb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 2 }} onClick={handleLogout}>
            <ListItemIcon sx={{ color: textPrimary }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: textPrimary }} />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: bgRoot
        }}
      >
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  if (authError || !user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: bgRoot,
          p: 3
        }}
      >
        <Card sx={{ bgcolor: chipBg, border: `1px solid ${borderColor}`, padding: 3, maxWidth: 400, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h5" sx={{ color: textPrimary, mb: 2 }}>
              Authentication Required
            </Typography>
            <Typography variant="body1" sx={{ color: textSecondary, mb: 3 }}>
              Please log in to access the dashboard.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ bgcolor: textSecondary, color: 'white', textTransform: 'none' }}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: bgRoot, minHeight: '100vh', color: textPrimary }}>
      {/* Drawer region */}
      <Box component="nav" sx={{ width: { md: 250 }, flexShrink: { md: 0 } }}>
        {/* Temporary drawer on mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, bgcolor: drawerBg }
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent drawer on desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, bgcolor: drawerBg }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 2 : 3, maxWidth: { md: 'calc(100% - 250px)' } }}>
        {/* AppBar */}
        <AppBar
          position="static"
          sx={{
            bgcolor: appBarBg,
            boxShadow: 'none',
            borderBottom: `1px solid ${appBarBorder}`
          }}
        >
          <Toolbar>
            {/* Hamburger on mobile */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1, color: textPrimary }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, color: textPrimary }}>
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </Box>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: textPrimary }}>
                Hackathon Hub
              </Typography>
            </Box>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }} />

            {/* Right actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {/* Mobile search input */}
              {isMobile && (
                <TextField
                  placeholder="Search"
                  size="small"
                  sx={{
                    width: { xs: '100%', md: 160 },
                    maxWidth: { xs: '100%', md: 256 },
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiOutlinedInput-root': {
                      color: textPrimary,
                      bgcolor: inputBg,
                      '& fieldset': { border: 'none' },
                      borderRadius: 1
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: textSecondary }} />
                      </InputAdornment>
                    )
                  }}
                />
              )}

              {/* Notifications */}
              <IconButton
                sx={{
                  color: textPrimary,
                  bgcolor: chipBg,
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                <NotificationsIcon />
              </IconButton>

              {/* Theme toggle */}
              <IconButton
                onClick={toggleColorMode}
                aria-label="toggle theme"
                sx={{
                  color: textPrimary,
                  bgcolor: chipBg
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              {/* Avatar menu */}
              <Box sx={{ position: 'relative' }}>
                <IconButton onClick={handleProfileClick}>
                  <Avatar
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseProfileMenu}>
                  <MenuItem>
                    <AccountIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Dashboard content */}
        <Box sx={{ mt: isMobile ? 1 : 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              mb: 4
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: isMobile ? 1 : 0, color: textPrimary }}>
                Dashboard
              </Typography>
              {isMobile && (
                <Typography variant="body1" sx={{ color: textSecondary }}>
                  Welcome back, {user.email}
                </Typography>
              )}
            </Box>

            {/* Desktop search */}
            <TextField
              placeholder="Search"
              size="small"
              sx={{
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: '100%', md: 400, lg: 500 },
                display: { xs: isMobile ? 'none' : 'block', sm: 'block' },
                '& .MuiOutlinedInput-root': {
                  color: textPrimary,
                  bgcolor: inputBg,
                  '& fieldset': { border: 'none' },
                  borderRadius: 1
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: textSecondary }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Stats */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: textPrimary }}>
            Overview
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 4 }
            }}
          >
            {statsData.map((stat, index) => (
              <Card key={index} sx={{ bgcolor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body1" sx={{ color: textPrimary, mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: textPrimary }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ color: stat.positive ? '#0bda6f' : '#fa6c38' }}>
                    {stat.change}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Analytics */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: textPrimary }}>
            Analytics
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 4 }
            }}
          >
            {/* Project Completion */}
            <Card sx={{ bgcolor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ color: textPrimary, mb: 1 }}>
                  Project Completion Rate
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: textPrimary }}>
                  85%
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Typography variant="body1" sx={{ color: textSecondary }}>
                    Last 30 Days
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#0bda6f' }}>
                    +5%
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, height: { xs: 100, sm: 180 } }}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                    <Box key={month} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: { xs: '40%', sm: `${[70, 50, 50, 70, 60, 80][i]}%` },
                          bgcolor: inputBg,
                          borderTop: `2px solid ${textSecondary}`,
                          flexGrow: 1
                        }}
                      />
                      <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 'bold' }}>
                        {month}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card sx={{ bgcolor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ color: textPrimary, mb: 1 }}>
                  User Engagement Over Time
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: textPrimary }}>
                  72%
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Typography variant="body1" sx={{ color: textSecondary }}>
                    Last 90 Days
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#0bda6f' }}>
                    +3%
                  </Typography>
                </Box>
                <Box sx={{ height: { xs: 100, sm: 180 } }}>
                  <svg
                    width="100%"
                    height={isMobile ? '70' : '148'}
                    viewBox={isMobile ? '-3 0 478 70' : '-3 0 478 150'}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 50C18.1538 50 18.1538 10 36.3077 10C54.4615 10 54.4615 30 72.6154 30C90.7692 30 90.7692 70 108.923 70C127.077 70 127.077 25 145.231 25C163.385 25 163.385 75 181.538 75C199.692 75 199.692 45 217.846 45C236 45 236 35 254.154 35C272.308 35 272.308 90 290.462 90C308.615 90 308.615 110 326.769 110C344.923 110 344.923 10 363.077 10C381.231 10 381.231 60 399.385 60C417.538 60 417.538 95 435.692 95C453.846 95 453.846 20 472 20V110H326.769H0V50Z"
                      fill={`url(#paint0_linear_${mode})`}
                    ></path>
                    <path
                      d="M0 50C18.1538 50 18.1538 10 36.3077 10C54.4615 10 54.4615 30 72.6154 30C90.7692 30 90.7692 70 108.923 70C127.077 70 127.077 25 145.231 25C163.385 25 163.385 75 181.538 75C199.692 75 199.692 45 217.846 45C236 45 236 35 254.154 35C272.308 35 272.308 90 290.462 90C308.615 90 308.615 110 326.769 110C344.923 110 344.923 10 363.077 10C381.231 10 381.231 60 399.385 60C417.538 60 417.538 95 435.692 95C453.846 95 453.846 20 472 20"
                      stroke={textSecondary}
                      strokeWidth={isMobile ? '2' : '3'}
                      strokeLinecap="round"
                    ></path>
                    <defs>
                      <linearGradient id={`paint0_linear_${mode}`} x1="236" y1="10" x2="236" y2="110" gradientUnits="userSpaceOnUse">
                        <stop stopColor={inputBg}></stop>
                        <stop offset="1" stopColor={inputBg} stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'space-around', mt: 2 }}>
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                      <Typography key={quarter} variant="caption" sx={{ color: textSecondary, fontWeight: 'bold' }}>
                        {quarter}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Distribution */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: textPrimary }}>
            Distribution
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 4 }
            }}
          >
            <Card sx={{ bgcolor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ color: textPrimary, mb: 1 }}>
                  Project Categories
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: textPrimary }}>
                  40%
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Typography variant="body1" sx={{ color: textSecondary }}>
                    Current
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#0bda6f' }}>
                    +5%
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 2 }}>
                  {['Web', 'Mobile', 'AI', 'Other'].map((category, i) => (
                    <React.Fragment key={category}>
                      <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 'bold' }}>
                        {category}
                      </Typography>
                      <Box sx={{ height: 20, width: '100%' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: { xs: '50%', sm: `${[40, 30, 10, 50][i]}%` },
                            borderRight: `2px solid ${textSecondary}`,
                            bgcolor: inputBg
                          }}
                        />
                      </Box>
                    </React.Fragment>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {[30, 20, 10].map((value, index) => (
              <Card key={index} sx={{ bgcolor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: textPrimary }}>
                    {value}%
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: index === 1 ? '#0bda6f' : '#fa6c38', textAlign: 'center' }}
                  >
                    {index === 1 ? '+3%' : '-2%'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Recent Activity */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: textPrimary }}>
            Recent Activity
          </Typography>
          <Card sx={{ bgcolor: 'transparent', mb: { xs: 3, sm: 4 } }}>
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ bgcolor: bgRoot, p: 1 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <IconButton sx={{ bgcolor: chipBg, color: textPrimary, p: 1 }}>
                        {activity.icon}
                      </IconButton>
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body1" sx={{ color: textPrimary }}>
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: textSecondary }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < activities.length - 1 && <Divider sx={{ borderColor: borderColor }} />}
                </React.Fragment>
              ))}
            </List>
          </Card>

          {/* Projects Table */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: textPrimary }}>
            Projects
          </Typography>
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', border: `1px solid ${borderColor}`, mb: { xs: 3, sm: 4 } }}>
            <Table sx={{ minWidth: 650 }} aria-label="projects table">
              <TableHead sx={{ bgcolor: bgPaper }}>
                <TableRow>
                  <TableCell sx={{ color: textPrimary, fontWeight: 'medium', px: isMobile ? 1 : 2 }}>
                    Project Name
                  </TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 'medium', px: isMobile ? 1 : 2 }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 'medium', px: isMobile ? 1 : 2 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 'medium', px: isMobile ? 1 : 2 }}>
                    Progress
                  </TableCell>
                  <TableCell sx={{ color: textSecondary, fontWeight: 'medium', px: isMobile ? 1 : 2 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project, index) => (
                  <TableRow key={index} sx={{ borderTop: `1px solid ${borderColor}` }}>
                    <TableCell sx={{ color: textPrimary, px: isMobile ? 1 : 2 }}>{project.name}</TableCell>
                    <TableCell sx={{ color: textSecondary, px: isMobile ? 1 : 2 }}>{project.category}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: chipBg,
                          color: textPrimary,
                          textTransform: 'none',
                          minWidth: 84,
                          px: isMobile ? 1 : 2,
                          py: isMobile ? 0.5 : 1,
                          '&:hover': { bgcolor: chipBg }
                        }}
                      >
                        {project.status}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: isMobile ? 60 : 88, bgcolor: borderColor, borderRadius: '4px', overflow: 'hidden' }}>
                          <LinearProgress variant="determinate" value={project.progress} sx={{ height: 8, bgcolor: 'transparent' }} />
                        </Box>
                        <Typography variant="body1" sx={{ color: textPrimary }}>
                          {project.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ color: textSecondary, fontWeight: 'bold' }}>
                        View
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default HackathonHubDashboard;