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
      // 기존 ID를 숫자로 변환
      options = question.options.map((opt: any, index: number) => ({
        id: String(index + 1), // 1, 2, 3...
        text: opt.text
      }));
    } else {
      // 단순 문자열 배열인 경우 변환
      options = question.options.map((opt: string, index: number) => ({
        id: String(index + 1), // 1, 2, 3...
        text: opt
      }));
    }
  } else {
    // 대체 옵션 필드 (교차 호환성)
    if (question.choices) {
      options = question.choices.map((choice: any, index: number) => {
        if (typeof choice === 'object' && choice.text) {
          return {
            id: String(index + 1),
            text: choice.text
          };
        }
        return {
          id: String(index + 1),
          text: choice
        };
      });
    }
  }

  // 정답 확인 - 알파벳을 숫자로 변환
  let correctAnswer = question.correct_answer;
  if (correctAnswer && /^[A-Z]$/.test(correctAnswer)) {
    // A, B, C... 형식이면 1, 2, 3...으로 변환
    correctAnswer = String(correctAnswer.charCodeAt(0) - 64);
  } else if (question.correct_option_index !== undefined) {
    correctAnswer = String(question.correct_option_index + 1);
  }

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
            return (
              <Paper
                key={option.id}
                elevation={1}
                sx={{
                  mb: 1,
                  p: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <FormControlLabel
                  value={option.id}
                  control={<Radio disabled={showResult} />}
                  label={
                    <Typography>
                      {option.id}. {option.text}
                    </Typography>
                  }
                  disabled={showResult}
                  sx={{ width: '100%' }}
                />
              </Paper>
            );
          })}
        </RadioGroup>
      </FormControl>
    </Box>
  );
}
