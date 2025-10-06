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

interface MultipleChoiceQuestionProps {
  question: any;
  userAnswer: string | null;
  onAnswer: (answer: string) => void;
  showResult: boolean;
}

export default function MultipleChoiceQuestion({
  question,
  userAnswer,
  onAnswer,
  showResult
}: MultipleChoiceQuestionProps) {
  // 질문 텍스트 확인
  const questionText = question.question_text || question.question || '';

  // 옵션 배열 확인
  let options = [];
  if (question.options) {
    // options가 { id: "A", text: "내용" } 형태인지 확인
    if (typeof question.options[0] === 'object' && question.options[0].id && question.options[0].text) {
      options = question.options;
    } else {
      // 단순 문자열 배열인 경우 변환
      options = question.options.map((opt: string, index: number) => ({
        id: String.fromCharCode(65 + index), // A, B, C...
        text: opt
      }));
    }
  } else {
    // 대체 옵션 필드 (교차 호환성)
    if (question.choices) {
      options = question.choices.map((choice: any, index: number) => {
        if (typeof choice === 'object' && choice.id && choice.text) {
          return choice;
        }
        return {
          id: String.fromCharCode(65 + index),
          text: choice
        };
      });
    }
  }

  // 정답 확인
  const correctAnswer = question.correct_answer || 
                       (question.correct_option_index !== undefined 
                        ? String.fromCharCode(65 + question.correct_option_index)
                        : null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswer(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {questionText}
      </Typography>

      <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
        <RadioGroup value={userAnswer || ''} onChange={handleChange}>
          {options.map((option: any) => {
            const isCorrect = showResult && option.id === correctAnswer;
            const isWrong = showResult && userAnswer === option.id && option.id !== correctAnswer;

            return (
              <Paper
                key={option.id}
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
                  value={option.id}
                  control={<Radio disabled={showResult} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ 
                        color: isCorrect || isWrong ? 'white' : 'inherit'
                      }}>
                        {option.id}. {option.text}
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
