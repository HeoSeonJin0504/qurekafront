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

      <Paper elevation={3} sx={{ p: 3, mt: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          다음 문장이 참인지 거짓인지 선택하세요
        </Typography>
        
        <Grid container spacing={3} justifyContent="center" alignItems="center">
          <Grid item xs={6} sm={5} md={4} sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => handleButtonClick(true)}
              disabled={showResult}
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: 2,
                minWidth: 0,
                '&:hover': {
                  boxShadow: 4,
                },
                ...getButtonStyle(true),
              }}
            >
              O
            </Button>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
              참 (True)
            </Typography>
          </Grid>
          
          <Grid item xs={6} sm={5} md={4} sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => handleButtonClick(false)}
              disabled={showResult}
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: 2,
                minWidth: 0,
                '&:hover': {
                  boxShadow: 4,
                },
                ...getButtonStyle(false),
              }}
            >
              X
            </Button>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
              거짓 (False)
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}