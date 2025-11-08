import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Alert
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

  // 백엔드 데이터 구조에서 필드 추출
  const questionText = question.question_text || '';
  const options = question.options || question.blanks?.[0]?.options || []; // 백엔드 구조와 기존 구조 모두 지원
  const correctAnswers = question.correct_answers || 
                        (question.blanks?.map((b: any) => b.correct_answer) || []); // 정답 배열
  const explanation = question.explanation || ''; // 해설

  // 처리된 문제 텍스트를 저장할 상태
  const [processedText, setProcessedText] = useState<JSX.Element[]>([]);

  // 현재 사용자 응답을 관리
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: string }>({});

  // 빈칸 데이터 저장 상태
  const [blanks, setBlanks] = useState<any[]>([]);

  // 초기 로드 및 사용자 답변 변경 시 상태 업데이트
  useEffect(() => {
    if (userAnswer && typeof userAnswer === 'object') {
      setCurrentAnswers(userAnswer);
    } else if (userAnswer) {
      setCurrentAnswers({ '0': userAnswer });
    } else {
      const initialAnswers: { [key: string]: string } = {};
      let detectedBlanks: any[] = [];

      // 백엔드 구조: question_text에서 빈칸 개수 계산, correct_answers 사용
      const blankCount = (questionText.match(new RegExp(BLANK_MARKER, 'g')) || []).length;

      if (blankCount > 0) {
        for (let i = 0; i < blankCount; i++) {
          initialAnswers[String(i)] = '';
          detectedBlanks.push({
            id: String(i),
            correct_answer: correctAnswers[i] || '' // correct_answers 배열에서 가져옴
          });
        }
      }

      if (detectedBlanks.length === 0) {
        initialAnswers['0'] = '';
        detectedBlanks = [{ id: '0', correct_answer: '' }];
      }

      setBlanks(detectedBlanks);
      setCurrentAnswers(initialAnswers);
    }
  }, [question, userAnswer, questionText, correctAnswers]);

  // 문제 텍스트 처리
  useEffect(() => {
    if (questionText && questionText.includes(BLANK_MARKER)) {
      const parts = questionText.split(BLANK_MARKER);
      const result: JSX.Element[] = [];

      parts.forEach((part: string, index: number) => {
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
    // 백엔드 구조: correct_answers 배열 사용
    const correctAnswer = correctAnswers[index] || '';

    return userInput.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
        {/* 문제 텍스트 */}
        <Typography variant="h6" gutterBottom sx={{ lineHeight: 1.8 }}>
          {processedText}
        </Typography>

        {/* 선택지(options) 표시 - 백엔드 구조와 기존 구조 모두 지원 */}
        {options.length > 0 && (
          <Box mt={2} mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              선택지:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {options.map((option: any) => (
                <Paper
                  key={option.id}
                  elevation={1}
                  sx={{
                    p: 1.5,
                    backgroundColor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body1">
                    <strong>{option.id}.</strong> {option.text}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* 빈칸 입력 필드 */}
        {(!questionText?.includes(BLANK_MARKER) || blanks.length > 0) && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              다음 빈칸을 채워주세요:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {blanks.map((blank, index) => {
                return (
                  <Paper
                    key={`blank-field-${index}`}
                    elevation={1}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      backgroundColor: showResult 
                        ? (isBlankCorrect(index) ? 'success.light' : 'error.light')
                        : 'background.default',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        mr: 2,
                        mb: { xs: 1, sm: 0 },
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
                          },
                        }}
                      />
                      {showResult && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mt: 0.5, 
                            display: 'block',
                            color: isBlankCorrect(index) ? 'success.dark' : 'error.dark'
                          }}
                        >
                          정답: {correctAnswers[index] || ''}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}

        {/* 해설 부분 제거 - QuestionSolver에서만 표시됨 */}

        {blanks.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            빈칸이 없는 문제입니다. 문제 데이터를 확인해주세요.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
