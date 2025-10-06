import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Button, 
  Divider, Alert, Card, CardContent,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { QuestionItem } from '../../types/mypage';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import FillInTheBlankQuestion from './FillInTheBlankQuestion';
import SequenceQuestion from './SequenceQuestion';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import DescriptiveQuestion from './DescriptiveQuestion';

interface QuestionSolverProps {
  questionItem: QuestionItem;
  onClose: () => void;
}

interface ParsedQuestion {
  type: string;
  questions: any[];
}

export default function QuestionSolver({ questionItem, onClose }: QuestionSolverProps) {
  const [parsedData, setParsedData] = useState<ParsedQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionItem.rawJson) {
      setParsingError('문제 데이터가 유효하지 않습니다.');
      return;
    }

    try {
      const rawData = JSON.parse(questionItem.rawJson);
      let parsedQuestion: ParsedQuestion = {
        type: rawData.type || 'multiple_choice',
        questions: []
      };

      // questions 배열이 있는 경우
      if (rawData.questions && Array.isArray(rawData.questions)) {
        parsedQuestion.questions = rawData.questions;
        
        // 첫 번째 질문의 타입이 있다면 전체 타입으로 사용
        if (rawData.questions.length > 0 && rawData.questions[0].type) {
          parsedQuestion.type = rawData.questions[0].type;
        }
        
        // 문제 타입 자동 감지
        if (rawData.questions.length > 0) {
          const firstQ = rawData.questions[0];
          
          // 순서배열형 문제 감지 (correct_sequence가 있으면)
          if (firstQ.correct_sequence) {
            parsedQuestion.type = 'sequence';
          }
          
          // 빈칸 채우기형 문제 감지 (blanks가 있거나 문제 텍스트에 ____가 있으면)
          else if (firstQ.blanks || 
                  (firstQ.question_text && firstQ.question_text.includes('____')) ||
                  firstQ.correct_answers) {
            parsedQuestion.type = 'fill_in_the_blank';
          }
        }
      } 
      // 단일 문제 형식인 경우
      else {
        // type 정보가 있는 경우
        if (rawData.type) {
          parsedQuestion.type = rawData.type;
        }
        
        // 문제 타입 자동 감지
        // 순서배열형 문제 감지 (correct_sequence가 있으면)
        if (rawData.correct_sequence) {
          parsedQuestion.type = 'sequence';
        }
        // 빈칸 채우기형 문제 감지
        else if (rawData.blanks || 
                (rawData.question_text && rawData.question_text.includes('____')) ||
                rawData.correct_answers) {
          parsedQuestion.type = 'fill_in_the_blank';
        }
        
        // 단일 문제를 배열에 추가
        parsedQuestion.questions = [rawData];
      }

      console.log("파싱된 문제 데이터:", parsedQuestion);
      
      // 유형에 따라 질문 구조 검증 및 필요한 필드 추가 처리
      processQuestionType(parsedQuestion);

      setParsedData(parsedQuestion);
      // 사용자 답변 배열 초기화 (빈 답변으로)
      setUserAnswers(Array(parsedQuestion.questions.length).fill(null));
    } catch (error) {
      console.error("문제 파싱 오류:", error);
      setParsingError('문제 데이터 형식이 올바르지 않습니다.');
    }
  }, [questionItem]);

  // 유형에 따라 질문 구조 검증 및 필요한 필드 추가
  const processQuestionType = (data: ParsedQuestion) => {
    if (!data.type) {
      // 유형이 없는 경우 기본값 설정
      data.type = 'multiple_choice';
    }
    
    // 각 문제에 대해 필요한 처리
    data.questions.forEach(question => {
      // 질문 텍스트 필드 통일
      if (!question.question_text && question.question) {
        question.question_text = question.question;
      }
      
      // 순서배열형 문제 전처리
      if (data.type === 'sequence' && question.correct_sequence) {
        // items 배열이 없으면 빈 배열로 초기화
        if (!question.items || !Array.isArray(question.items)) {
          question.items = [];
        }
        
        // 디버깅용 로그
        console.log('순서배열 문제 확인:', question);
      }
      
      // 빈칸 채우기형 문제 전처리
      if (data.type === 'fill_in_the_blank') {
        // 빈칸이 없으면 생성
        if (!question.blanks) {
          question.blanks = [];
          
          // 문제 텍스트에서 빈칸 위치 찾기
          const blankCount = (question.question_text?.match(/____/g) || []).length;
          
          if (blankCount > 0) {
            for (let i = 0; i < blankCount; i++) {
              question.blanks.push({
                id: String(i),
                correct_answer: question.correct_answers?.[i] || ''
              });
            }
          } 
          // 문제 텍스트에 빈칸 표시가 없지만 correct_answer가 있는 경우
          else if (question.correct_answer) {
            question.blanks.push({
              id: '0',
              correct_answer: question.correct_answer
            });
          }
        }
        
        console.log('빈칸 채우기 문제 확인:', question);
      }
    });
  };

  // 사용자 답변 업데이트 함수
  const handleAnswer = (answer: any) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  // 결과 확인 함수
  const handleCheckResult = () => {
    setShowResult(true);
  };

  // 다음 문제로 이동
  const handleNextQuestion = () => {
    if (currentQuestionIndex < parsedData!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResult(false);
    }
  };

  // 이전 문제로 이동
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowResult(false);
    }
  };

  // 정답 여부 확인 함수
  const isCorrect = (): boolean => {
    if (!parsedData || !userAnswers[currentQuestionIndex]) return false;
    
    const currentQuestion = parsedData.questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    
    switch (parsedData.type) {
      case 'multiple_choice':
        return userAnswer === currentQuestion.correct_answer;
      case 'true_false':
        return userAnswer === currentQuestion.correct_answer;
      case 'sequence':
        // 배열 비교
        if (!Array.isArray(userAnswer) || !Array.isArray(currentQuestion.correct_sequence)) {
          return false;
        }
        
        // 배열 길이가 다르면 오답
        if (userAnswer.length !== currentQuestion.correct_sequence.length) {
          return false;
        }
        
        // 모든 요소가 같은 위치에 있는지 확인
        return userAnswer.every((val, index) => val === currentQuestion.correct_sequence[index]);
      case 'fill_in_the_blank':
        // 단일 빈칸인 경우
        if (typeof userAnswer === 'string') {
          const correctAnswer = currentQuestion.correct_answer || 
                              currentQuestion.blanks?.[0]?.correct_answer || '';
          return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        }
        // 여러 빈칸인 경우
        if (!currentQuestion.blanks) return false;
        
        return Object.entries(userAnswer).every(([index, value]) => {
          const correctAnswer = currentQuestion.blanks[Number(index)]?.correct_answer || 
                             currentQuestion.correct_answers?.[Number(index)] || '';
          return String(value).trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        });
      case 'short_answer':
        const correctAnswers = [
          currentQuestion.correct_answer, 
          ...(currentQuestion.alternative_answers || [])
        ].map(a => currentQuestion.case_sensitive ? a : a.toLowerCase());
        
        const processedUserAnswer = currentQuestion.case_sensitive ? 
          userAnswer : userAnswer.toLowerCase();
          
        return correctAnswers.includes(processedUserAnswer);
      case 'descriptive':
        // 서술형은 자동 채점이 어렵지만, 키워드 포함 여부로 체크
        if (!currentQuestion.answer_keywords || !Array.isArray(currentQuestion.answer_keywords)) {
          return false;
        }
        
        const lowerUserAnswer = userAnswer.toLowerCase();
        const keywordMatches = currentQuestion.answer_keywords
          .filter(keyword => lowerUserAnswer.includes(keyword.toLowerCase())).length;
        
        // 키워드 절반 이상 포함되면 정답으로 간주
        return keywordMatches >= Math.ceil(currentQuestion.answer_keywords.length / 2);
      default:
        return false;
    }
  };

  if (parsingError) {
    return (
      <Box sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ mb: 2 }}>
          돌아가기
        </Button>
        <Alert severity="error">{parsingError}</Alert>
      </Box>
    );
  }

  if (!parsedData) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentQuestion = parsedData.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <Box sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ mb: 2 }}>
          돌아가기
        </Button>
        <Alert severity="error">문제 데이터가 유효하지 않습니다.</Alert>
      </Box>
    );
  }

  // 문제 유형에 따른 컴포넌트 렌더링
  const renderQuestionComponent = () => {
    const type = parsedData.type.toLowerCase();
    
    switch (type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            question={currentQuestion}
            userAnswer={userAnswers[currentQuestionIndex]}
            onAnswer={handleAnswer}
            showResult={showResult}
          />
        );
      case 'true_false':
        return (
          <TrueFalseQuestion
            question={currentQuestion}
            userAnswer={userAnswers[currentQuestionIndex]}
            onAnswer={handleAnswer}
            showResult={showResult}
          />
        );
      case 'sequence':
        return (
          <SequenceQuestion
            question={currentQuestion}
            userAnswer={userAnswers[currentQuestionIndex]}
            onAnswer={handleAnswer}
            showResult={showResult}
          />
        );
      case 'fill_in_the_blank':
        return (
          <FillInTheBlankQuestion
            question={currentQuestion}
            userAnswer={userAnswers[currentQuestionIndex]}
            onAnswer={handleAnswer}
            showResult={showResult}
          />
        );
      case 'short_answer':
        return (
          <ShortAnswerQuestion
            question={currentQuestion}
            userAnswer={userAnswers[currentQuestionIndex]}
            onAnswer={handleAnswer}
            showResult={showResult}
          />
        );
      case 'descriptive':
        return (
          <DescriptiveQuestion
            question={currentQuestion}
            userAnswer={userAnswers[currentQuestionIndex]}
            onAnswer={handleAnswer}
            showResult={showResult}
          />
        );
      default:
        return (
          <Alert severity="warning">
            지원되지 않는 문제 유형입니다: {type}
          </Alert>
        );
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onClose}>
          목록으로 돌아가기
        </Button>
        <Typography variant="h4" sx={{ ml: 2, flexGrow: 1 }}>
          문제 풀기
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {currentQuestionIndex + 1} / {parsedData.questions.length}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          파일명: {questionItem.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          문제 유형: {questionItem.displayType}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {renderQuestionComponent()}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            이전 문제
          </Button>
          
          {!showResult ? (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCheckResult}
              disabled={userAnswers[currentQuestionIndex] === null}
            >
              정답 확인
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === parsedData.questions.length - 1}
            >
              다음 문제
            </Button>
          )}
        </Box>
      </Paper>

      {showResult && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: isCorrect() ? 'success.main' : 'error.main' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            {isCorrect() ? '정답입니다!' : '오답입니다!'}
          </Typography>
          
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                해설
              </Typography>
              <Typography variant="body1">
                {currentQuestion.explanation || '이 문제에 대한 해설이 없습니다.'}
              </Typography>
            </CardContent>
          </Card>
        </Paper>
      )}
    </Box>
  );
}