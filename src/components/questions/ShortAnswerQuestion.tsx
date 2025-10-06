import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper
} from '@mui/material';

interface ShortAnswerQuestionProps {
  question: any;
  userAnswer: string | null;
  onAnswer: (answer: string) => void;
  showResult: boolean;
}

export default function ShortAnswerQuestion({
  question,
  userAnswer,
  onAnswer,
  showResult
}: ShortAnswerQuestionProps) {
  const questionText = question.question_text || '';
  const correctAnswer = question.correct_answer || '';
  const alternativeAnswers = question.alternative_answers || [];
  const isCaseSensitive = question.case_sensitive || false;

  // 정답 확인 함수
  const checkAnswer = (answer: string): boolean => {
    if (!answer) return false;
    
    const allPossibleAnswers = [correctAnswer, ...alternativeAnswers];
    
    if (isCaseSensitive) {
      return allPossibleAnswers.includes(answer);
    } else {
      return allPossibleAnswers
        .map(ans => ans.toLowerCase())
        .includes(answer.toLowerCase());
    }
  };

  const isCorrect = userAnswer ? checkAnswer(userAnswer) : false;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswer(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {questionText}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
        <TextField
          fullWidth
          label="답변"
          variant="outlined"
          value={userAnswer || ''}
          onChange={handleChange}
          disabled={showResult}
          error={showResult && !isCorrect}
          helperText={
            showResult && !isCorrect
              ? `정답: ${correctAnswer}${
                  alternativeAnswers.length > 0
                    ? ` (또는 ${alternativeAnswers.join(', ')})`
                    : ''
                }`
              : ''
          }
          InputProps={{
            sx: {
              bgcolor: showResult
                ? isCorrect
                  ? 'success.light'
                  : 'error.light'
                : 'background.paper',
            },
          }}
        />
      </Paper>
    </Box>
  );
}
