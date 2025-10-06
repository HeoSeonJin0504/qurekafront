import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Paper
} from '@mui/material';

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
  
  // 처리된 문제 텍스트를 저장할 상태
  const [processedText, setProcessedText] = useState<JSX.Element[]>([]);
  
  // 현재 사용자 응답을 관리
  const [currentAnswers, setCurrentAnswers] = useState<{[key: string]: string}>({});

  // 초기 로드 및 사용자 답변 변경 시 상태 업데이트
  useEffect(() => {
    // 사용자 답변이 객체인 경우 (여러 빈칸)
    if (userAnswer && typeof userAnswer === 'object') {
      setCurrentAnswers(userAnswer);
    } 
    // 사용자 답변이 문자열인 경우 (단일 빈칸)
    else if (userAnswer) {
      setCurrentAnswers({ '1': userAnswer });
    } 
    // 답변이 없는 경우 초기화
    else {
      const initialAnswers: {[key: string]: string} = {};
      if (question.blanks && Array.isArray(question.blanks)) {
        question.blanks.forEach((blank: any) => {
          initialAnswers[blank.id] = '';
        });
      }
      setCurrentAnswers(initialAnswers);
    }
  }, [userAnswer, question]);

  // 문제 텍스트 처리
  useEffect(() => {
    const questionText = question.question_text || '';
    const blanks = question.blanks || [];
    
    // 단일 빈칸 문제인 경우 처리
    if (questionText.includes(BLANK_MARKER) && (!blanks || blanks.length === 0)) {
      const parts = questionText.split(BLANK_MARKER);
      const result: JSX.Element[] = [];
      
      parts.forEach((part, index) => {
        result.push(<span key={`part-${index}`}>{part}</span>);
        
        if (index < parts.length - 1) {
          const isCorrect = showResult && currentAnswers['1'] === (question.correct_answer || '');
          result.push(
            <TextField
              key={`blank-${index}`}
              size="small"
              variant="outlined"
              value={currentAnswers['1'] || ''}
              onChange={(e) => handleAnswerChange('1', e.target.value)}
              disabled={showResult}
              error={showResult && !isCorrect}
              helperText={showResult && !isCorrect 
                ? `정답: ${question.correct_answer || ''}` 
                : ''}
              sx={{ 
                mx: 1, 
                width: '150px',
                backgroundColor: showResult 
                  ? isCorrect 
                    ? 'success.light' 
                    : 'error.light'
                  : 'background.paper',
                input: {
                  color: showResult ? 'white' : 'inherit',
                }
              }}
              InputProps={{
                style: { color: showResult ? 'white' : 'inherit' },
              }}
            />
          );
        }
      });
      
      setProcessedText(result);
    } 
    // 여러 빈칸 문제인 경우 처리
    else if (Array.isArray(blanks) && blanks.length > 0) {
      let text = questionText;
      const result: JSX.Element[] = [];
      
      blanks.sort((a, b) => {
        const aPos = text.indexOf(a.position || BLANK_MARKER);
        const bPos = text.indexOf(b.position || BLANK_MARKER);
        return aPos - bPos;
      });
      
      blanks.forEach((blank, index) => {
        const marker = blank.position || BLANK_MARKER;
        const parts = text.split(marker, 2);
        
        if (parts[0]) {
          result.push(<span key={`part-${index}-start`}>{parts[0]}</span>);
        }
        
        // 빈칸 렌더링 (선택지가 있는 경우 드롭다운, 없는 경우 텍스트 필드)
        const isCorrect = showResult && currentAnswers[blank.id] === blank.correct_answer;
        
        if (blank.options && Array.isArray(blank.options)) {
          result.push(
            <FormControl 
              key={`blank-${index}`} 
              size="small"
              error={showResult && !isCorrect}
              sx={{
                mx: 1,
                minWidth: 120,
                backgroundColor: showResult 
                  ? isCorrect 
                    ? 'success.light' 
                    : 'error.light'
                  : 'background.paper',
                '.MuiSelect-select': {
                  color: showResult ? 'white' : 'inherit',
                },
                '.MuiInputBase-root': {
                  color: showResult ? 'white' : 'inherit',
                },
                '.MuiFormHelperText-root': {
                  color: showResult && !isCorrect ? 'white' : undefined,
                  backgroundColor: showResult && !isCorrect ? 'rgba(0, 0, 0, 0.2)' : undefined,
                  padding: showResult && !isCorrect ? '2px 5px' : undefined,
                  borderRadius: showResult && !isCorrect ? '4px' : undefined,
                  margin: 0,
                  marginTop: 1
                }
              }}
            >
              <Select
                value={currentAnswers[blank.id] || ''}
                onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                disabled={showResult}
              >
                <MenuItem value="" disabled>
                  <em>선택하세요</em>
                </MenuItem>
                {blank.options.map((opt: any) => (
                  <MenuItem key={opt.id || opt.text} value={opt.text || opt}>
                    {opt.text || opt}
                  </MenuItem>
                ))}
              </Select>
              {showResult && !isCorrect && (
                <FormHelperText>정답: {blank.correct_answer}</FormHelperText>
              )}
            </FormControl>
          );
        } else {
          result.push(
            <TextField
              key={`blank-${index}`}
              size="small"
              variant="outlined"
              value={currentAnswers[blank.id] || ''}
              onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
              disabled={showResult}
              error={showResult && !isCorrect}
              helperText={showResult && !isCorrect
                ? `정답: ${blank.correct_answer}` 
                : ''}
              sx={{ 
                mx: 1, 
                width: '150px',
                backgroundColor: showResult 
                  ? isCorrect 
                    ? 'success.light' 
                    : 'error.light'
                  : 'background.paper',
                input: {
                  color: showResult ? 'white' : 'inherit',
                },
                '.MuiFormHelperText-root': {
                  color: showResult && !isCorrect ? 'white' : undefined,
                  backgroundColor: showResult && !isCorrect ? 'rgba(0, 0, 0, 0.2)' : undefined,
                  padding: showResult && !isCorrect ? '2px 5px' : undefined,
                  borderRadius: showResult && !isCorrect ? '4px' : undefined,
                  margin: 0,
                  marginTop: 1
                }
              }}
              InputProps={{
                style: { color: showResult ? 'white' : 'inherit' },
              }}
            />
          );
        }
        
        // 다음 부분을 위해 남은 텍스트 업데이트
        text = parts[1] || '';
      });
      
      // 남은 텍스트가 있으면 추가
      if (text) {
        result.push(<span key="part-end">{text}</span>);
      }
      
      setProcessedText(result);
    } else {
      // 빈칸이 없는 경우 그냥 텍스트만 표시
      setProcessedText([<span key="text">{questionText}</span>]);
    }
  }, [question, currentAnswers, showResult]);

  // 특정 빈칸의 답변 변경 처리
  const handleAnswerChange = (id: string, value: string) => {
    const newAnswers = { ...currentAnswers, [id]: value };
    setCurrentAnswers(newAnswers);
    
    // 상위 컴포넌트에 변경사항 전달
    if (Object.keys(newAnswers).length > 1) {
      onAnswer(newAnswers);
    } else {
      onAnswer(value); // 단일 빈칸인 경우 문자열로 전달
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom sx={{ lineHeight: 1.8 }}>
          {processedText}
        </Typography>
      </Paper>
    </Box>
  );
}
