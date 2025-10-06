import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

interface FillInTheBlankQuestionProps {
  question: any;
  userAnswer: any;
  onAnswer: (answer: any) => void;
  showResult: boolean;
}

export default function FillInTheBlankQuestion({
  question,
  userAnswer,
  onAnswer,
  showResult
}: FillInTheBlankQuestionProps) {
  // 빈칸 위치 표시 문자열
  const BLANK_MARKER = '____';
  
  // 질문 텍스트 확인 - 추가 정의
  const questionText = question.question_text || question.question || '';
  
  // 처리된 문제 텍스트를 저장할 상태
  const [processedText, setProcessedText] = useState<JSX.Element[]>([]);
  
  // 현재 사용자 응답을 관리
  const [currentAnswers, setCurrentAnswers] = useState<{[key: string]: string}>({});
  
  // 빈칸 데이터 저장 상태
  const [blanks, setBlanks] = useState<any[]>([]);

  // 초기 로드 및 사용자 답변 변경 시 상태 업데이트
  useEffect(() => {
    if (userAnswer && typeof userAnswer === 'object') {
      setCurrentAnswers(userAnswer);
    } else if (userAnswer) {
      setCurrentAnswers({ '0': userAnswer });
    } else {
      const initialAnswers: {[key: string]: string} = {};
      let detectedBlanks: any[] = [];
      
      if (question.blanks && Array.isArray(question.blanks) && question.blanks.length > 0) {
        question.blanks.forEach((_: any, index: number) => {
          initialAnswers[String(index)] = '';
        });
        detectedBlanks = [...question.blanks];
      } else if (question.correct_answer) {
        initialAnswers['0'] = '';
        detectedBlanks = [{ id: '0', correct_answer: question.correct_answer }];
      } else {
        const blankCount = (questionText.match(new RegExp(BLANK_MARKER, 'g')) || []).length;
        
        if (blankCount > 0) {
          for (let i = 0; i < blankCount; i++) {
            initialAnswers[String(i)] = '';
            detectedBlanks.push({
              id: String(i),
              correct_answer: question.correct_answers?.[i] || ''
            });
          }
        }
      }
      
      if (detectedBlanks.length === 0) {
        initialAnswers['0'] = '';
        detectedBlanks = [{ id: '0', correct_answer: '' }];
      }
      
      setBlanks(detectedBlanks);
      setCurrentAnswers(initialAnswers);
    }
  }, [question, userAnswer, questionText]);

  // 문제 텍스트 처리
  useEffect(() => {
    if (questionText && questionText.includes(BLANK_MARKER)) {
      const parts = questionText.split(BLANK_MARKER);
      const result: JSX.Element[] = [];
      
      parts.forEach((part, index) => {
        result.push(<span key={`part-${index}`}>{part}</span>);
        
        if (index < parts.length - 1) {
          result.push(
            <TextField
              key={`blank-${index}`}
              size="small"
              variant="outlined"
              value={currentAnswers[String(index)] || ''}
              sx={{ 
                mx: 1, 
                width: '150px',
                input: { color: 'inherit' },
              }}
            />
          );
        }
      });
      
      setProcessedText(result);
    } else {
      setProcessedText([<Typography key="question-text" variant="h6">{questionText}</Typography>]);
    }
  }, [question, blanks, currentAnswers, showResult, questionText]);

  // 특정 빈칸의 답변 변경 처리
  const handleAnswerChange = (id: string, value: string) => {
    const newAnswers = { ...currentAnswers, [id]: value };
    setCurrentAnswers(newAnswers);
    
    if (Object.keys(newAnswers).length === 1) {
      onAnswer(value);
    } else {
      onAnswer(newAnswers);
    }
  };

  // 빈칸별 정답 확인
  const isBlankCorrect = (index: number): boolean => {
    if (!showResult) return false;
    
    const userInput = currentAnswers[String(index)] || '';
    const correctAnswer = blanks[index]?.correct_answer || 
                         question.correct_answers?.[index] || 
                         '';
                         
    return userInput.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
        {/* 인라인 빈칸이 있는 문제 */}
        <Typography variant="h6" gutterBottom sx={{ lineHeight: 1.8 }}>
          {processedText}
        </Typography>
        
        {/* 인라인 빈칸이 없거나 별도 빈칸 목록이 있는 경우 */}
        {(!questionText?.includes(BLANK_MARKER) || blanks.length > 0) && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              다음 빈칸을 채워주세요:
            </Typography>
            
            <Grid container spacing={2}>
              {blanks.map((blank, index) => {
                const isCorrect = isBlankCorrect(index);
                
                return (
                  <Grid item xs={12} key={`blank-field-${index}`}>
                    <Paper 
                      elevation={1}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        backgroundColor: showResult
                          ? isCorrect
                            ? 'success.light'
                            : 'error.light'
                          : 'background.default',
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mr: 2, 
                          mb: { xs: 1, sm: 0 },
                          color: showResult ? 'white' : 'inherit',
                          fontWeight: 'bold',
                          minWidth: '80px'
                        }}
                      >
                        빈칸 {index + 1}:
                      </Typography>
                      
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          placeholder={`빈칸 ${index + 1}에 들어갈 답을 입력하세요`}
                          value={currentAnswers[String(index)] || ''}
                          onChange={(e) => handleAnswerChange(String(index), e.target.value)}
                          disabled={showResult}
                          InputProps={{
                            sx: {
                              bgcolor: 'background.paper',
                              color: showResult ? 'white' : 'inherit',
                            },
                          }}
                        />
                      </Box>
                      
                      {showResult && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          {isCorrect ? (
                            <CheckCircleOutlineIcon sx={{ color: 'white' }} />
                          ) : (
                            <CancelOutlinedIcon sx={{ color: 'white' }} />
                          )}
                        </Box>
                      )}
                    </Paper>
                    
                    {showResult && !isCorrect && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        정답: {blanks[index]?.correct_answer || question.correct_answers?.[index] || ''}
                      </Alert>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
        
        {blanks.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            빈칸이 없는 문제입니다. 문제 데이터를 확인해주세요.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
