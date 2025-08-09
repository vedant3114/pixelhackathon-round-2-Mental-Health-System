import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
} from '@mui/material';

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
  
  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  const severityLevel = totalScore < 5 ? 'Minimal' : 
                         totalScore < 10 ? 'Mild' : 
                         totalScore < 15 ? 'Moderate' : 
                         totalScore < 20 ? 'Moderately Severe' : 'Severe';
  
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
        
        {currentQuestion === questions.length - 1 && (
          <Box sx={{ mt: 4, p: 2, bgcolor: '#e7f3ed', borderRadius: 2 }}>
            <Typography variant="body1" fontWeight="bold" color="#0d1b14">
              Your PHQ-9 Score: {totalScore}/27
            </Typography>
            <Typography variant="body2" color="#4c9a73">
              Severity Level: {severityLevel}
            </Typography>
          </Box>
        )}
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

export default Phq9Dialog;