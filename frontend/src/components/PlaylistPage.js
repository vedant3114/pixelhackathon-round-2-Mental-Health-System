/* src/components/PlaylistPage.jsx */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Button,
  SvgIcon,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  collection,
  addDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

/* --------------------------------------------------------------
   1️⃣  GENRE MENU
   -------------------------------------------------------------- */
const genreOptions = [
  'Ambient',
  'Classical',
  'Jazz',
  'Electronic',
  'Lo-fi',
  'Nature Sounds',
  'Instrumental',
  'Acoustic',
  'Piano',
  'Soundscapes',
  'Pop',
  'Rock',
  'Hip-Hop',
  'Country',
  'R&B',
  'Reggae',
  'Blues',
  'Folk',
  'Metal',
  'Soul',
  'Punk',
  'Disco',
  'Funk',
  'Gospel',
  'Latin',
  'K-Pop',
  'Indie',
  'Other',
];

/* --------------------------------------------------------------
   2️⃣  STYLED COMPONENTS
   -------------------------------------------------------------- */
const MotionBox = motion(Box);

const Root = styled('div')(({ theme }) => ({
  backgroundColor: '#f8fcfa',
  minHeight: '100vh',
  fontFamily: 'Manrope, "Noto Sans", sans-serif',
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

/* --------------------------------------------------------------
   3️⃣  MAIN COMPONENT
   -------------------------------------------------------------- */
const PlaylistPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  /* ---- state ---- */
  const [loading, setLoading] = useState(true);
  const [musicGenres, setMusicGenres] = useState([]);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [playlistsHistory, setPlaylistsHistory] = useState([]);
  const [showGenreDialog, setShowGenreDialog] = useState(false);
  const [newPlaylistDialogOpen, setNewPlaylistDialogOpen] = useState(false);
  const [customPlaylistName, setCustomPlaylistName] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [error, setError] = useState(null);

  const moodOptions = [
    { type: 'Sad', color: '#4c9a73', icon: '😢' },
    { type: 'Anxious', color: '#4a7c7e', icon: '😰' },
    { type: 'Stressed', color: '#7d6b7d', icon: '😤' },
    { type: 'Tired', color: '#7d6b7d', icon: '😴' },
    { type: 'Happy', color: '#42f099', icon: '😊' },
    { type: 'Calm', color: '#5eb3b6', icon: '😌' },
  ];

  /* ---- Auth state ---- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  /* ---- Load user data ---- */
  useEffect(() => {
    const loadMusicGenres = async () => {
      try {
        if (!user) return;
        const userDoc = await doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists() && userSnap.data().musicGenres) {
          setMusicGenres(userSnap.data().musicGenres);
        }
      } catch (e) {
        console.error('Error loading music genres:', e);
        setError('Failed to load your music preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadMusicGenres();
  }, [user]);

  /* ---- Load playlist history ---- */
  useEffect(() => {
    const loadPlaylistsHistory = async () => {
      if (!user) return;
      try {
        const ref = collection(db, 'users', user.uid, 'playlists');
        const q = query(ref, orderBy('timestamp', 'desc'), limit(10));
        const snap = await getDocs(q);
        const items = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() }));
        setPlaylistsHistory(items);
      } catch (e) {
        console.error('Error loading playlist history:', e);
      }
    };
    loadPlaylistsHistory();
  }, [user]);

  /* ---- Helpers ---- */
  const saveMusicGenres = async (selected) => {
    if (!user) return;
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, { musicGenres: selected });
      setMusicGenres(selected);
    } catch (e) {
      console.error('Error saving music genres:', e);
      setError('Failed to save your music preferences. Please try again.');
    }
  };

  const generatePlaylistUrl = (selected, mood) => {
    const base = 'https://open.spotify.com/search/';
    const terms = {
      Sad: 'sad instrumental relaxing',
      Anxious: 'peaceful calming meditation',
      Stressed: 'chill stress relief',
      Tired: 'gentle ambient sleep',
      Happy: 'uplifting relaxing positive',
      Calm: 'chill peaceful meditation',
    }[mood] || 'relaxing instrumental';
    let queryStr = terms + ' ' + selected.join(' ');
    return `${base}${encodeURIComponent(queryStr)}`;
  };

  const handleCustomPlaylist = async () => {
    if (!customPlaylistName || !musicGenres.length) return;
    setCreatingPlaylist(true);
    try {
      const url = generatePlaylistUrl(musicGenres, selectedMood);
      const newPlaylist = {
        type: 'custom_playlist',
        name: customPlaylistName,
        genres: musicGenres,
        mood: selectedMood,
        url,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'users', user.uid, 'playlists'), newPlaylist);
      setPlaylist(newPlaylist);
      setCustomPlaylistName('');
      setNewPlaylistDialogOpen(false);
      setShowMoodDialog(false);
      window.open(url, '_blank');
    } catch (e) {
      console.error('Create playlist error:', e);
      setError('Failed to create playlist. Please try again.');
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const handlePlaylistCreation = async (mood) => {
    setCreatingPlaylist(true);
    try {
      const url = generatePlaylistUrl(musicGenres, mood);
      const data = {
        type: 'mood_playlist',
        mood,
        genres: musicGenres,
        url,
        timestamp: new Date().toISOString(),
      };
      const ref = await addDoc(collection(db, 'users', user.uid, 'playlists'), data);
      setPlaylist({ ...data, id: ref.id });
      setShowMoodDialog(false);
      window.open(url, '_blank');
    } catch (e) {
      console.error('Save playlist error:', e);
      setError("Failed to save playlist. We'll still open Spotify for you.");
      window.open(generatePlaylistUrl(musicGenres, mood), '_blank');
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const handleOpenPlaylist = (url) => window.open(url, '_blank');

  /* ---- Render ---- */
  if (error) {
    return (
      <Root>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              onClick={() => setError(null)}
              sx={{ bgcolor: '#4c9a73', '&:hover': { bgcolor: '#3a9b7a' } }}
            >
              Try Again
            </Button>
          </Box>
        </Container>
      </Root>
    );
  }

  if (loading) {
    return (
      <Root>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        </Container>
      </Root>
    );
  }

  if (!musicGenres.length) {
    return (
      <Root>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StyledCard sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mb: 2, color: '#0d1b14' }}>
                Set Your Music Preferences
              </Typography>
              <Typography variant="body2" color="#4c9a73" sx={{ mb: 3 }}>
                Let us know what genres of music help you relax so we can create personalized calming playlists.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShowGenreDialog(true)}
                sx={{
                  bgcolor: '#4c9a73',
                  '&:hover': { bgcolor: '#3a9b7a' },
                  borderRadius: 8,
                }}
              >
                Select Music Genres
              </Button>
            </StyledCard>
          </MotionBox>
          {/* Ensure dialog is mounted in this branch */}
          <MusicGenreDialog
            open={showGenreDialog}
            onClose={() => setShowGenreDialog(false)}
            currentGenres={musicGenres}
            onSave={saveMusicGenres}
          />
        </Container>
      </Root>
    );
  }

  return (
    <Root>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom color="#0d1b14">
            Your Calming Playlists
          </Typography>
          <Typography variant="body2" color="#4c9a73">
            Based on your preferences:{' '}
            {musicGenres.map((g, i) => (
              <Chip key={g} label={g} size="small" sx={{ ml: i > 0 ? 1 : 0 }} />
            ))}
          </Typography>
        </Box>

        {/* Mood selection dialog */}
        <Dialog
          open={showMoodDialog}
          onClose={() => setShowMoodDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 16, p: 0 } }}
        >
          <DialogTitle sx={{ p: 3, borderBottom: '1px solid #e7f3ed', color: '#0d1b14', fontWeight: 'bold' }}>
            How are you feeling today?
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" color="#4c9a73" sx={{ mb: 2 }}>
              Select how you’re feeling to create a personalized playlist from your favorite genres.
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={3} mt={1} justifyContent="center">
              {moodOptions.map(m => (
                <Box
                  key={m.type}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: selectedMood === m.type ? '#e7f3ed' : 'transparent',
                    transition: 'all .2s',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                  onClick={() => setSelectedMood(m.type)}
                >
                  <Typography fontSize={32}>{m.icon}</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>{m.type}</Typography>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e7f3ed' }}>
            <Button
              onClick={() => setShowMoodDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 8 }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedMood && handlePlaylistCreation(selectedMood)}
              disabled={!selectedMood || creatingPlaylist}
              variant="contained"
              sx={{
                borderRadius: 8,
                bgcolor: '#4c9a73',
                '&:hover': { bgcolor: '#3a9b7a' },
                minWidth: 120,
              }}
            >
              {creatingPlaylist ? <CircularProgress size={20} /> : 'Create Playlist'}
            </Button>
            <Button
              onClick={() => setNewPlaylistDialogOpen(true)}
              variant="outlined"
              sx={{ borderRadius: 8, minWidth: 120 }}
              disabled={!selectedMood || creatingPlaylist}
            >
              Custom Name
            </Button>
          </DialogActions>
        </Dialog>

        {/* Custom name dialog */}
        <Dialog
          open={newPlaylistDialogOpen}
          onClose={() => setNewPlaylistDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 16, p: 0 } }}
        >
          <DialogTitle sx={{ p: 3, borderBottom: '1px solid #e7f3ed', color: '#0d1b14', fontWeight: 'bold' }}>
            Name Your Playlist
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" color="#4c9a73" sx={{ mb: 2 }}>
              Give your playlist a unique name based on how you’re feeling.
            </Typography>
            <TextField
              fullWidth
              label="Playlist Name"
              value={customPlaylistName}
              onChange={e => setCustomPlaylistName(e.target.value)}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
              placeholder="e.g., Morning Calm, Focus Time"
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e7f3ed' }}>
            <Button onClick={() => setNewPlaylistDialogOpen(false)} variant="outlined" sx={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button
              onClick={handleCustomPlaylist}
              disabled={!customPlaylistName || creatingPlaylist}
              variant="contained"
              sx={{
                borderRadius: 8,
                bgcolor: '#4c9a73',
                '&:hover': { bgcolor: '#3a9b7a' },
                minWidth: 120,
              }}
            >
              {creatingPlaylist ? <CircularProgress size={20} /> : 'Create Playlist'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Genre selector dialog */}
        <MusicGenreDialog
          open={showGenreDialog}
          onClose={() => setShowGenreDialog(false)}
          currentGenres={musicGenres}
          onSave={saveMusicGenres}
        />

        {/* Mood‑based “Create New” cards */}
        <Box mb={6}>
          <Typography variant="h5" component="h2" gutterBottom color="#0d1b14" sx={{ mt: 3 }}>
            Create New Playlist
          </Typography>
          <Typography variant="body2" color="#4c9a73" sx={{ mb: 3 }}>
            Select a mood to create a personalized playlist based on your music preferences.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {moodOptions.map(m => (
              <StyledCard
                key={m.type}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 200,
                  transition: 'all .2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,.08)' },
                }}
                onClick={() => {
                  setSelectedMood(m.type);
                  setShowMoodDialog(true);
                }}
              >
                <Typography fontSize={48} mb={2}>{m.icon}</Typography>
                <Typography variant="h6" sx={{ color: '#0d1b14', textAlign: 'center' }}>
                  {m.type} Mix
                </Typography>
                <Typography variant="body2" color="#4c9a73" sx={{ textAlign: 'center', mt: 1 }}>
                  For {m.type.toLowerCase()} moods
                </Typography>
              </StyledCard>
            ))}
          </Box>
        </Box>

        {/* Recommendations section */}
        <Box mb={6}>
          <Typography variant="h5" component="h2" gutterBottom color="#0d1b14">
            Recommended Playlists
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {moodOptions.map(m => {
              const preset = {
                Sad: ['Classical', 'Ambient', 'Acoustic'],
                Anxious: ['Instrumental', 'Nature Sounds', 'Ambient'],
                Stressed: ['Lo‑fi', 'Electronic', 'Soundscapes'],
                Tired: ['Ambient', 'Piano', 'Soundscapes'],
                Happy: ['Pop', 'Jazz', 'Electronic'],
                Calm: ['Classical', 'Jazz', 'Soundscapes'],
              }[m.type];
              const url = generatePlaylistUrl(preset, m.type);
              return (
                <StyledCard
                  key={`rec-${m.type}`}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                    transition: 'all .2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,.08)' },
                  }}
                  onClick={() => window.open(url, '_blank')}
                >
                  <Typography fontSize={48} mb={2}>{m.icon}</Typography>
                  <Typography variant="h6" sx={{ color: '#0d1b14', textAlign: 'center' }}>
                    Recommended {m.type} Mix
                  </Typography>
                  <Typography variant="body2" color="#4c9a73" sx={{ textAlign: 'center', mt: 1 }}>
                    Based on popular tracks for {m.type.toLowerCase()} moods
                  </Typography>
                </StyledCard>
              );
            })}
          </Box>
        </Box>

        {/* Recently created */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2" color="#0d1b14">
              Recently Created
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowGenreDialog(true)}
              startIcon={
                <SvgIcon fontSize="small">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.5 13.5a.5.5 0 0 1-1 0V9.71l-3.22 3.22a.5.5 0 1 1-.71-.71l4-4a.5.5 0 0 1 .71 0l4 4a.5.5 0 0 1-.71.71l-3.21-3.21V13.5z" />
                    <path d="M5 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 2zM5 3c0 .556.449 1 1.001 1H9.5A1 1 0 0 0 11 3V2.001A1 1 0 0 0 9.5 1h-3.5A1 1 0 0 0 5 2V3z" />
                  </svg>
                </SvgIcon>
              }
              sx={{ borderRadius: 8 }}
            >
              Update Preferences
            </Button>
          </Box>

          {playlistsHistory.length ? (
            <List>
              {playlistsHistory.map(pl => (
                <React.Fragment key={pl.id}>
                  <ListItem>
                    <ListItemIcon>
                      <SvgIcon sx={{ color: '#1DB954' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height={24} viewBox="0 0 24 24" width={24}>
                          <path d="M0 0h24v24H0z" fill="none" />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zM6.5 7c0-.58.45-1 1-1h4c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1V7zm13 4.67c-1.56 0-2.82 1.26-2.82 2.82h5.64c0-1.56-1.26-2.82-2.82-2.82z" />
                        </svg>
                      </SvgIcon>
                    </ListItemIcon>
                    <ListItemText
                      primary={pl.name || `${pl.mood} Mood`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="#4c9a73">
                            Created: {new Date(pl.timestamp).toLocaleDateString()}
                          </Typography>
                          {pl.genres?.length && (
                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                              {pl.genres.map((g, i) => (
                                <Chip
                                  key={i}
                                  label={g}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    backgroundColor: '#e7f3ed',
                                    color: '#4c9a73',
                                    height: 20,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleOpenPlaylist(pl.url)}
                      size="small"
                      sx={{
                        borderRadius: 20,
                        minWidth: 80,
                        bgcolor: '#1DB954',
                        '&:hover': { bgcolor: '#1CB851' },
                      }}
                    >
                      Play
                    </Button>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="#4c9a73">
                No playlists created yet. Create your first playlist above!
              </Typography>
            </Card>
          )}
        </Box>

        {/* Quick Actions */}
        <Box mt={6} mb={2}>
          <Typography variant="h5" component="h2" gutterBottom color="#0d1b14">
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <StyledCard
              sx={{
                p: 3,
                cursor: 'pointer',
                height: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,.08)' },
              }}
              onClick={() => navigate('/dashboard')}
            >
              <Typography variant="h6" sx={{ color: '#0d1b14' }}>
                Dashboard
              </Typography>
              <Typography variant="body2" color="#4c9a73" sx={{ mt: 1 }}>
                Back to your wellness dashboard
              </Typography>
            </StyledCard>

            <StyledCard
              sx={{
                p: 3,
                cursor: 'pointer',
                height: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,.08)' },
              }}
              onClick={() => navigate('/crisis-support')}
            >
              <Typography variant="h6" sx={{ color: '#0d1b14' }}>
                Crisis Support
              </Typography>
              <Typography variant="body2" color="#4c9a73" sx={{ mt: 1 }}>
                Access mental health resources
              </Typography>
            </StyledCard>
          </Box>
        </Box>
      </Container>

      {/* One instance of the genre picker dialog */}
      <MusicGenreDialog
        open={showGenreDialog}
        onClose={() => setShowGenreDialog(false)}
        currentGenres={musicGenres}
        onSave={saveMusicGenres}
      />
    </Root>
  );
};

/* --------------------------------------------------------------
   4️⃣  Reusable Genre Dialog
   -------------------------------------------------------------- */
const MusicGenreDialog = ({ open, onClose, currentGenres, onSave }) => {
  const [selected, setSelected] = useState(currentGenres || []);

  useEffect(() => setSelected(currentGenres || []), [currentGenres]);

  const toggle = genre => setSelected(s =>
    s.includes(genre) ? s.filter(g => g !== genre) : [...s, genre]
  );

  const submit = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 16, p: 0 } }}
    >
      <DialogTitle sx={{ p: 3, borderBottom: '1px solid #e7f3ed', color: '#0d1b14', fontWeight: 'bold' }}>
        Your Music Preferences
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body2" color="#4c9a73" sx={{ mb: 2 }}>
          Select music genres that help you relax and unwind. We’ll use this to create personalized calming playlists.
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
          {genreOptions.map(g => (
            <Chip
              key={g}
              label={g}
              variant={selected.includes(g) ? 'filled' : 'outlined'}
              color={selected.includes(g) ? 'success' : 'default'}
              onClick={() => toggle(g)}
              clickable
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e7f3ed' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 8 }}>
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" sx={{ borderRadius: 8, bgcolor: '#4c9a73', '&:hover': { bgcolor: '#3a9b7a' } }}>
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlaylistPage;