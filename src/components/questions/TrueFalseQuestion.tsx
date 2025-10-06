import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

interface TrueFalseQuestionProps {
  question: any;
  userAnswer: boolean | null;
  onAnswer: (answer: boolean) => void;
  showResult: boolean;
}

export default function TrueFalseQuestion({
  question,
  userAnswer,
  onAnswer,
  showResult
}: TrueFalseQuestionProps) {
  const questionText = question.question_text || '';
  const correctAnswer = question.correct_answer;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswer(event.target.value === 'true');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {questionText}
      </Typography>

      <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
        <RadioGroup 
          value={userAnswer === null ? '' : String(userAnswer)} 
          onChange={handleChange}
        >
          {[
            { value: 'true', label: '참(True)' },
            { value: 'false', label: '거짓(False)' }
          ].map((option) => {
            const optionValue = option.value === 'true';
            const isCorrect = showResult && optionValue === correctAnswer;
            const isWrong = showResult && userAnswer === optionValue && optionValue !== correctAnswer;

            return (
              <Paper
                key={option.value}
                elevation={1}
                sx={{
                  mb: 1,
                  p: 1,
                  bgcolor: isCorrect 
                    ? 'success.light' 
                    : isWrong 
                      ? 'error.light' 
                      : 'background.paper',
                  border: isCorrect || isWrong ? 1 : 0,
                  borderColor: isCorrect ? 'success.main' : isWrong ? 'error.main' : 'transparent',
                }}
              >
                <FormControlLabel
                  value={option.value}
                  control={<Radio disabled={showResult} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ 
                        color: isCorrect || isWrong ? 'white' : 'inherit'
                      }}>
                        {option.label}
                      </Typography>
                      {showResult && isCorrect && (
                        <CheckCircleOutlineIcon sx={{ ml: 1, color: 'white' }} />
                      )}
                      {showResult && isWrong && (
                        <CancelOutlinedIcon sx={{ ml: 1, color: 'white' }} />
                      )}
                    </Box>
                  }
                  disabled={showResult}
                  sx={{ width: '100%', color: isCorrect || isWrong ? 'white' : 'inherit' }}
                />
              </Paper>
            );
          })}
        </RadioGroup>
      </FormControl>
    </Box>
  );
}
