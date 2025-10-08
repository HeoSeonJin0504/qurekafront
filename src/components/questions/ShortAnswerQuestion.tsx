import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Divider
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
  const [inputValue, setInputValue] = useState<string>(userAnswer || '');
  const questionText = question.question_text || '';
  const correctAnswer = question.correct_answer || '';
  const alternativeAnswers = question.alternative_answers || [];
  const isCaseSensitive = question.case_sensitive || false;

  // userAnswer 값이 변경되면 inputValue도 업데이트
  useEffect(() => {
    if (userAnswer !== null) {
      setInputValue(userAnswer);
    }
  }, [userAnswer]);

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
    const newValue = event.target.value;
    setInputValue(newValue);
    
    // 입력 값을 바로 부모 컴포넌트에 전달
    if (newValue.trim() !== '') {
      onAnswer(newValue);
    } else {
      // 입력이 비어있으면 null로 설정하여 '정답 확인' 버튼 비활성화
      onAnswer('');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {questionText}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mt: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          답변을 입력하세요:
        </Typography>
        
        <TextField
          fullWidth
          label="답변 입력"
          variant="outlined"
          value={inputValue}
          onChange={handleChange}
          disabled={showResult}
          margin="normal"
          autoFocus
          placeholder="여기에 답변을 입력한 후 '정답 확인' 버튼을 클릭하세요"
          InputProps={{
            sx: {
              bgcolor: showResult
                ? isCorrect
                  ? 'rgba(46, 125, 50, 0.1)'
                  : 'rgba(211, 47, 47, 0.1)'
                : 'background.paper',
            },
          }}
        />

        {showResult && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: isCorrect ? 'success.light' : 'error.light',
              borderRadius: 1,
              color: 'white'
            }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {isCorrect ? '정답입니다!' : '오답입니다!'}
              </Typography>
              
              {!isCorrect && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  정답: {correctAnswer}
                  {alternativeAnswers.length > 0 && (
                    <span> (또는 {alternativeAnswers.join(', ')})</span>
                  )}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}