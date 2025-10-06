import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Collapse,
  Button
} from '@mui/material';

interface DescriptiveQuestionProps {
  question: any;
  userAnswer: string | null;
  onAnswer: (answer: string) => void;
  showResult: boolean;
}

export default function DescriptiveQuestion({
  question,
  userAnswer,
  onAnswer,
  showResult
}: DescriptiveQuestionProps) {
  const questionText = question.question_text || '';
  const modelAnswer = question.model_answer || '';
  const answerKeywords = question.answer_keywords || [];
  
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  // 키워드 일치 정도 계산
  const calculateMatchRate = (answer: string): number => {
    if (!answer || answerKeywords.length === 0) return 0;
    
    const lowerAnswer = answer.toLowerCase();
    const matchedKeywords = answerKeywords.filter(keyword => 
      lowerAnswer.includes(keyword.toLowerCase())
    );
    
    return matchedKeywords.length / answerKeywords.length;
  };
  
  // 사용자 답변에서 키워드 강조 표시
  const highlightKeywords = (text: string): JSX.Element => {
    if (!text || answerKeywords.length === 0) return <>{text}</>;
    
    let result = text;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    
    // 각 키워드를 찾아 강조 처리
    answerKeywords.forEach(keyword => {
      const lowerText = result.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      const index = lowerText.indexOf(lowerKeyword);
      
      if (index >= 0) {
        // 키워드 앞의 텍스트
        if (index > lastIndex) {
          parts.push(<span key={`text-${lastIndex}`}>{result.substring(lastIndex, index)}</span>);
        }
        
        // 키워드 부분
        parts.push(
          <span 
            key={`keyword-${index}`}
            style={{ backgroundColor: '#FFFF00', fontWeight: 'bold' }}
          >
            {result.substring(index, index + keyword.length)}
          </span>
        );
        
        lastIndex = index + keyword.length;
      }
    });
    
    // 남은 텍스트
    if (lastIndex < result.length) {
      parts.push(<span key={`text-end`}>{result.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? <>{parts}</> : <>{text}</>;
  };

  const matchRate = userAnswer ? calculateMatchRate(userAnswer) : 0;
  const matchPercentage = Math.round(matchRate * 100);
  
  const getMatchRateText = (): string => {
    if (matchRate >= 0.8) return '매우 우수';
    if (matchRate >= 0.6) return '우수';
    if (matchRate >= 0.4) return '보통';
    if (matchRate >= 0.2) return '미흡';
    return '매우 미흡';
  };
  
  const getMatchColor = (): string => {
    if (matchRate >= 0.8) return 'success.main';
    if (matchRate >= 0.6) return 'success.light';
    if (matchRate >= 0.4) return 'warning.main';
    if (matchRate >= 0.2) return 'warning.light';
    return 'error.light';
  };

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
          multiline
          rows={6}
        />
      </Paper>

      {showResult && (
        <Box sx={{ mt: 3 }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              bgcolor: getMatchColor(),
              mb: 2
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              일치도 평가: {getMatchRateText()} ({matchPercentage}%)
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              포함된 핵심 키워드: {answerKeywords.filter(keyword => 
                userAnswer?.toLowerCase().includes(keyword.toLowerCase())
              ).join(', ')}
            </Typography>
          </Paper>

          <Button 
            variant="outlined" 
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {showModelAnswer ? '모범 답안 숨기기' : '모범 답안 보기'}
          </Button>

          <Collapse in={showModelAnswer}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                모범 답안
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {highlightKeywords(modelAnswer)}
              </Typography>
            </Paper>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}
