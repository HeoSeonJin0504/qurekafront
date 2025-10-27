import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
} from '@mui/material';

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

  // 컴포넌트 마운트 시 콘솔에 상태 출력 (디버깅용)
  useEffect(() => {
    console.log("TrueFalseQuestion 렌더링:", { question, userAnswer, showResult });
    console.log("correctAnswer 타입:", typeof correctAnswer);
  }, [question, userAnswer, showResult]);

  const handleButtonClick = (value: boolean) => {
    console.log("버튼 클릭:", value);
    if (!showResult) {
      onAnswer(value);
    }
  };

  const getButtonStyle = (value: boolean) => {
    // 결과 표시 중일 때
    if (showResult) {
      // 선택된 버튼만 배경색 유지
      if (userAnswer === value) {
        return {
          bgcolor: value ? 'primary.main' : 'error.main',
          color: 'white',
        };
      }
      // 선택되지 않은 버튼은 투명하게
      return {
        bgcolor: 'transparent',
        color: value ? 'primary.main' : 'error.main',
        border: 0,
      };
    }
    
    // 결과 표시 전 (문제 풀이 중)
    // 선택되지 않았을 때
    if (userAnswer !== value) {
      return {
        bgcolor: 'transparent',
        color: value ? 'primary.main' : 'error.main',
        border: 2,
        borderColor: value ? 'primary.main' : 'error.main',
      };
    }
    // 선택되었을 때
    return {
      bgcolor: value ? 'primary.main' : 'error.main',
      color: 'white',
    };
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {questionText}
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          다음 문장이 참인지 거짓인지 선택하세요:
        </Typography>
        
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item xs={6} sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => handleButtonClick(true)}
              disabled={showResult}
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                borderRadius: '50%',
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 'bold',
                boxShadow: 3,
                ...getButtonStyle(true),
              }}
            >
              O
            </Button>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>참(True)</Typography>
          </Grid>
          
          <Grid item xs={6} sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => handleButtonClick(false)}
              disabled={showResult}
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                borderRadius: '50%',
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 'bold',
                boxShadow: 3,
                ...getButtonStyle(false),
              }}
            >
              X
            </Button>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>거짓(False)</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}