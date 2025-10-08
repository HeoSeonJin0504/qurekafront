import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Collapse,
  Button,
  Divider,
  LinearProgress,
  Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
  const [inputValue, setInputValue] = useState<string>(userAnswer || '');
  const questionText = question.question_text || '';
  const modelAnswer = question.model_answer || '';
  const answerKeywords = question.answer_keywords || [];
  
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  // userAnswer 값이 변경되면 inputValue도 업데이트
  useEffect(() => {
    if (userAnswer !== null) {
      setInputValue(userAnswer);
    }
  }, [userAnswer]);

  // 키워드 일치 정도 계산 및 점수 산출
  const calculateScore = (answer: string): {
    score: number;
    matchedKeywords: string[];
    unmatchedKeywords: string[];
  } => {
    if (!answer || answerKeywords.length === 0) {
      return { score: 0, matchedKeywords: [], unmatchedKeywords: [...answerKeywords] };
    }
    
    const lowerAnswer = answer.toLowerCase();
    const matchedKeywords: string[] = [];
    const unmatchedKeywords: string[] = [];
    
    answerKeywords.forEach(keyword => {
      if (lowerAnswer.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      } else {
        unmatchedKeywords.push(keyword);
      }
    });
    
    // 10점 만점으로 점수 계산
    const score = Math.round((matchedKeywords.length / answerKeywords.length) * 10);
    
    return { score, matchedKeywords, unmatchedKeywords };
  };
  
  // 사용자 답변에서 키워드 강조 표시
  const highlightKeywords = (text: string, keywords: string[]): JSX.Element => {
    if (!text || keywords.length === 0) return <>{text}</>;
    
    // 키워드를 길이순으로 정렬 (긴 것부터)
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    // 텍스트를 조각으로 분할하여 키워드 강조
    let parts: { text: string; isKeyword: boolean }[] = [{ text, isKeyword: false }];
    
    sortedKeywords.forEach(keyword => {
      const newParts: { text: string; isKeyword: boolean }[] = [];
      
      parts.forEach(part => {
        if (part.isKeyword) {
          newParts.push(part);
          return;
        }
        
        const lowerText = part.text.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();
        const splitText = lowerText.split(lowerKeyword);
        
        if (splitText.length === 1) {
          // 키워드가 없는 경우
          newParts.push(part);
          return;
        }
        
        // 키워드가 있는 경우 분할하여 처리
        let lastIndex = 0;
        
        splitText.forEach((_, index) => {
          if (index > 0) {
            // 키워드 앞부분
            const beforeKeyword = part.text.substring(lastIndex, lowerText.indexOf(lowerKeyword, lastIndex));
            
            if (beforeKeyword) {
              newParts.push({ text: beforeKeyword, isKeyword: false });
            }
            
            // 키워드 부분
            const keywordPart = part.text.substr(
              lowerText.indexOf(lowerKeyword, lastIndex),
              keyword.length
            );
            newParts.push({ text: keywordPart, isKeyword: true });
            
            lastIndex = lowerText.indexOf(lowerKeyword, lastIndex) + keyword.length;
          }
        });
        
        // 마지막 키워드 이후 텍스트
        if (lastIndex < part.text.length) {
          newParts.push({
            text: part.text.substring(lastIndex),
            isKeyword: false
          });
        }
      });
      
      parts = newParts;
    });
    
    // JSX 요소로 변환
    return (
      <>
        {parts.map((part, index) => (
          part.isKeyword ? (
            <span 
              key={index}
              style={{ backgroundColor: '#FFF59D', fontWeight: 'bold', padding: '0 2px', borderRadius: '2px' }}
            >
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        ))}
      </>
    );
  };

  const scoreResult = userAnswer ? calculateScore(userAnswer) : { score: 0, matchedKeywords: [], unmatchedKeywords: [...answerKeywords] };
  
  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'success.main';
    if (score >= 6) return 'success.light';
    if (score >= 4) return 'warning.main';
    if (score >= 2) return 'warning.light';
    return 'error.light';
  };
  
  const getScoreText = (score: number): string => {
    if (score >= 8) return '매우 우수';
    if (score >= 6) return '우수';
    if (score >= 4) return '보통';
    if (score >= 2) return '미흡';
    return '매우 미흡';
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    // 입력 값을 바로 부모 컴포넌트에 전달
    if (newValue.trim() !== '') {
      onAnswer(newValue);
    } else {
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
          label="답안을 입력하세요"
          variant="outlined"
          value={inputValue}
          onChange={handleChange}
          disabled={showResult}
          multiline
          rows={6}
          placeholder="여기에 서술형 답변을 입력한 후 '정답 확인' 버튼을 클릭하세요"
          margin="normal"
        />
      </Paper>

      {showResult && (
        <Box sx={{ mt: 3 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color={getScoreColor(scoreResult.score)}>
              채점 결과: {scoreResult.score}점 / 10점 ({getScoreText(scoreResult.score)})
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={scoreResult.score * 10} 
              sx={{ 
                height: 10, 
                borderRadius: 5, 
                mb: 2,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getScoreColor(scoreResult.score)
                }
              }} 
            />
            
            <Typography variant="subtitle1" gutterBottom>
              키워드 분석 결과
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={1} 
                  sx={{ p: 2, bgcolor: 'success.light', color: 'white', height: '100%' }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1 }} /> 포함된 키워드 ({scoreResult.matchedKeywords.length}개)
                  </Typography>
                  <Typography variant="body2">
                    {scoreResult.matchedKeywords.length > 0 
                      ? scoreResult.matchedKeywords.join(', ') 
                      : '포함된 키워드가 없습니다.'}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={1} 
                  sx={{ p: 2, bgcolor: 'error.light', color: 'white', height: '100%' }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CancelIcon sx={{ mr: 1 }} /> 누락된 키워드 ({scoreResult.unmatchedKeywords.length}개)
                  </Typography>
                  <Typography variant="body2">
                    {scoreResult.unmatchedKeywords.length > 0 
                      ? scoreResult.unmatchedKeywords.join(', ') 
                      : '누락된 키워드가 없습니다.'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            
            <Button 
              variant="outlined" 
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              fullWidth
            >
              {showModelAnswer ? '모범 답안 숨기기' : '모범 답안 보기'}
            </Button>

            <Collapse in={showModelAnswer} sx={{ mt: 2 }}>
              <Paper elevation={1} sx={{ p: 3, bgcolor: 'info.light', color: 'white' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  모범 답안
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {highlightKeywords(modelAnswer, answerKeywords)}
                </Typography>
              </Paper>
            </Collapse>
          </Paper>
          
          {userAnswer && userAnswer.trim() !== '' && (
            <Paper elevation={2} sx={{ p: 3, mt: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                내 답변 분석
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {highlightKeywords(userAnswer, answerKeywords)}
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}
