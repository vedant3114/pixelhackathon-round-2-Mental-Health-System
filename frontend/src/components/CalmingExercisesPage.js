import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  SvgIcon,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Root = styled('div')(() => ({
  backgroundColor: '#f8fcfa',
  minHeight: '100vh',
  fontFamily: 'Manrope, "Noto Sans", sans-serif',
}));

const StyledCard = styled(Card)(() => ({
  border: '1px solid #cfe7db',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.2s ease',
}));

const exercises = [
  {
    title: 'Box Breathing (4-4-4-4)',
    description: 'A Navy SEAL technique to quickly calm the nervous system by breathing in a steady box pattern.',
    duration: '5 min',
    category: 'Breathwork',
    link: 'https://www.youtube.com/watch?v=tEmt1Znux58',
  },
  {
    title: '4-7-8 Breathing',
    description: 'Reduce stress and help your body relax with a controlled 4-7-8 breathing cycle.',
    duration: '4 min',
    category: 'Breathwork',
    link: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
  },
  {
    title: 'Progressive Muscle Relaxation',
    description: 'Release tension by tensing and relaxing muscle groups from head to toe.',
    duration: '10 min',
    category: 'Relaxation',
    link: 'https://www.youtube.com/watch?v=86HUcX8ZtAk',
  },
  {
    title: 'Body Scan Meditation',
    description: 'Gently scan your body with awareness to ground yourself in the present moment.',
    duration: '12 min',
    category: 'Mindfulness',
    link: 'https://www.youtube.com/watch?v=ihHCYdS7Zs4',
  },
  {
    title: '5-4-3-2-1 Grounding',
    description: 'A quick sensory grounding exercise to ease anxiety by noticing sights, sounds, and sensations.',
    duration: '3 min',
    category: 'Grounding',
    link: 'https://www.youtube.com/watch?v=30VMIEmA114',
  },
  {
    title: 'Guided Imagery: Calm Place',
    description: 'Use visualization to imagine a safe, serene space and settle your mind.',
    duration: '10 min',
    category: 'Mindfulness',
    link: 'https://www.youtube.com/watch?v=1vx8iUvfyCY',
  },
  {
    title: 'Gentle Stretch to De-Stress',
    description: 'Light, mindful movement to release tension and reset your mood.',
    duration: '10 min',
    category: 'Movement',
    link: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
  },
  {
    title: 'Mindful Walking (Indoor/Outdoor)',
    description: 'Slow down and connect with each step to cultivate calm and presence.',
    duration: '6 min',
    category: 'Mindfulness',
    link: 'https://www.youtube.com/watch?v=obNu3RdjJqw',
  },
];

const CategoryIcon = ({ category }) => (
  <SvgIcon fontSize="small" sx={{ mr: 1, color: '#4c9a73' }}>
    {category === 'Breathwork' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zm1 13h-2v-2H7v-2h4V8h2v4h4v2h-4v2z"/></svg>
    )}
    {category === 'Mindfulness' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
    )}
    {category === 'Relaxation' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 6a6 6 0 100 12 6 6 0 000-12zm0-4a1 1 0 011 1v1a9 9 0 11-2 0V3a1 1 0 011-1z"/></svg>
    )}
    {category === 'Grounding' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l4 7H8l4-7zm0 20l-4-7h8l-4 7zM2 12l7-4v8l-7-4zm20 0l-7 4V8l7 4z"/></svg>
    )}
    {category === 'Movement' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 5a2 2 0 11-4 0 2 2 0 014 0zM4 20l4-4 3 3 5-5 4 4v2H4z"/></svg>
    )}
  </SvgIcon>
);

const CalmingExercisesPage = () => {
  const navigate = useNavigate();

  return (
    <Root>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <SvgIcon fontSize="small" sx={{ color: '#4c9a73' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM7 12h10v2H7v-2zm0-4h10v2H7V8z"/></svg>
            </SvgIcon>
            <Typography variant="h4" component="h1" color="#0d1b14" fontWeight="bold">
              Calming Exercises
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ borderRadius: 2, color: '#4c9a73', borderColor: '#4c9a73', '&:hover': { borderColor: '#3a9b7a', color: '#3a9b7a' } }}>
            Back to Dashboard
          </Button>
        </Box>

        <Typography color="#4c9a73" mb={3}>
          Quick, science-backed practices to reduce stress and anxiety. Pick one that fits your moment.
        </Typography>

        <Grid container spacing={2}>
          {exercises.map((ex, idx) => (
            <Grid key={idx} item xs={12} sm={6} md={6}>
              <StyledCard sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <CategoryIcon category={ex.category} />
                  <Typography variant="h6" fontWeight="bold" color="#0d1b14">
                    {ex.title}
                  </Typography>
                </Box>
                <Typography color="#4c9a73" sx={{ mb: 2, textAlign: 'justify' }}>
                  {ex.description}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" gap={1}>
                    <Chip label={ex.category} size="small" sx={{ backgroundColor: '#e7f3ed', color: '#0d1b14' }} />
                    <Chip label={ex.duration} size="small" sx={{ backgroundColor: '#e7f3ed', color: '#0d1b14' }} />
                  </Box>
                  <Button
                    variant="contained"
                    sx={{ borderRadius: 2, bgcolor: '#4c9a73', '&:hover': { bgcolor: '#3a9b7a' } }}
                    onClick={() => window.open(ex.link, '_blank', 'noopener,noreferrer')}
                  >
                    Start
                  </Button>
                </Box>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        <Box mt={6} textAlign="center">
          <Typography variant="body2" color="#4c9a73">
            Tip: Even 2–3 minutes of slow, deep breathing can shift your body into a calmer state.
          </Typography>
        </Box>
      </Container>
    </Root>
  );
};

export default CalmingExercisesPage;


