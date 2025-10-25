import React from 'react'
import {
  Box,
  Typography,
  Card,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Question } from '../../types/upload'

interface QuestionRendererProps {
  questions: Question[]
}

export default function QuestionRenderer({ questions }: QuestionRendererProps) {
  const renderMultipleChoice = (question: Question, index: number) => (
    <Card key={index} sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        문제 {index + 1}: {question.question_text}
      </Typography>
      
      {question.options && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>보기:</Typography>
          {question.options.map((option: any, optIndex: number) => (
            <Typography key={optIndex} variant="body1" sx={{ ml: 2, mb: 0.5 }}>
              {option.id}. {option.text}
            </Typography>
          ))}
        </Box>
      )}

      <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.contrastText' }}>
          답: {question.correct_answer}
        </Typography>
      </Box>

      {question.explanation && (
        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.contrastText', mb: 1 }}>
            해설:
          </Typography>
          <Typography variant="body2" sx={{ color: 'info.contrastText' }}>
            {question.explanation}
          </Typography>
        </Box>
      )}
    </Card>
  )

  const renderSequence = (question: Question, index: number) => (
    <Card key={index} sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        문제 {index + 1}: {question.question_text}
      </Typography>
      
      {question.items && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>선택지:</Typography>
          {question.items.map((item: any, itemIndex: number) => (
            <Typography key={itemIndex} variant="body1" sx={{ ml: 2, mb: 0.5 }}>
              {item.id}. {item.text}
            </Typography>
          ))}
        </Box>
      )}

      <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.contrastText' }}>
          정답 순서: {question.correct_sequence?.join(' → ')}
        </Typography>
      </Box>

      {question.explanation && (
        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.contrastText', mb: 1 }}>
            해설:
          </Typography>
          <Typography variant="body2" sx={{ color: 'info.contrastText' }}>
            {question.explanation}
          </Typography>
        </Box>
      )}
    </Card>
  )

  const renderTrueFalse = (question: Question, index: number) => (
    <Card key={index} sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        문제 {index + 1}: {question.question_text}
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
        보기: 참 / 거짓
      </Typography>

      <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.contrastText' }}>
          답: {question.correct_answer ? '참' : '거짓'}
        </Typography>
      </Box>

      {question.explanation && (
        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.contrastText', mb: 1 }}>
            해설:
          </Typography>
          <Typography variant="body2" sx={{ color: 'info.contrastText' }}>
            {question.explanation}
          </Typography>
        </Box>
      )}
    </Card>
  )

  const renderFillInTheBlank = (question: Question, index: number) => (
    <Card key={index} sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        문제 {index + 1}: {question.question_text}
      </Typography>
      
      {question.blanks && question.blanks[0]?.options && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>보기:</Typography>
          {question.blanks[0].options.map((option: any, optIndex: number) => (
            <Typography key={optIndex} variant="body1" sx={{ ml: 2, mb: 0.5 }}>
              {option.id}. {option.text}
            </Typography>
          ))}
        </Box>
      )}

      <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.contrastText' }}>
          답: {question.blanks?.[0]?.correct_answer}
        </Typography>
      </Box>

      {question.explanation && (
        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.contrastText', mb: 1 }}>
            해설:
          </Typography>
          <Typography variant="body2" sx={{ color: 'info.contrastText' }}>
            {question.explanation}
          </Typography>
        </Box>
      )}
    </Card>
  )

  const renderShortAnswer = (question: Question, index: number) => (
    <Card key={index} sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        문제 {index + 1}: {question.question_text}
      </Typography>
      
      <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.contrastText', mb: 1 }}>
          답: {question.correct_answer}
        </Typography>
        {question.alternative_answers && question.alternative_answers.length > 0 && (
          <Typography variant="body2" sx={{ color: 'success.contrastText' }}>
            대체답안: {question.alternative_answers.join(', ')}
          </Typography>
        )}
      </Box>

      {question.explanation && (
        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.contrastText', mb: 1 }}>
            해설:
          </Typography>
          <Typography variant="body2" sx={{ color: 'info.contrastText' }}>
            {question.explanation}
          </Typography>
        </Box>
      )}
    </Card>
  )

  const renderDescriptive = (question: Question, index: number) => (
    <Card key={index} sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        문제 {index + 1}: {question.question_text}
      </Typography>
      
      {question.answer_keywords && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>채점 키워드:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {question.answer_keywords.map((keyword: string, kIndex: number) => (
              <Chip key={kIndex} label={keyword} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            모범답안 보기
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'success.contrastText' }}>
              {question.model_answer}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {question.explanation && (
        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.contrastText', mb: 1 }}>
            해설:
          </Typography>
          <Typography variant="body2" sx={{ color: 'info.contrastText' }}>
            {question.explanation}
          </Typography>
        </Box>
      )}
    </Card>
  )

  const renderQuestion = (question: Question, index: number) => {
    try {
      // 기본 검증: question_text가 없으면 오류
      if (!question.question_text) {
        throw new Error('문제 내용을 찾을 수 없습니다.');
      }

      // n지 선다형
      if (question.options && question.correct_answer && typeof question.correct_answer === 'string') {
        if (!Array.isArray(question.options) || question.options.length === 0) {
          throw new Error('문제 생성 중 오류가 발생했습니다.');
        }
        return renderMultipleChoice(question, index)
      }
      // 순서 배열형
      if (question.items && question.correct_sequence) {
        if (!Array.isArray(question.items) || !Array.isArray(question.correct_sequence)) {
          throw new Error('문제 생성 중 오류가 발생했습니다.');
        }
        return renderSequence(question, index)
      }
      // 참거짓형
      if (typeof question.correct_answer === 'boolean') {
        return renderTrueFalse(question, index)
      }
      // 빈칸 채우기형
      if (question.blanks) {
        if (!Array.isArray(question.blanks) || question.blanks.length === 0) {
          throw new Error('문제 생성 중 오류가 발생했습니다.');
        }
        return renderFillInTheBlank(question, index)
      }
      // 서술형
      if (question.answer_keywords || question.model_answer) {
        return renderDescriptive(question, index)
      }
      // 단답형 (기본)
      if (question.correct_answer) {
        return renderShortAnswer(question, index)
      }

      // 어떤 형식에도 해당하지 않는 경우
      throw new Error('문제 생성 중 오류가 발생했습니다.');
    } catch (error) {
      console.error(`문제 ${index + 1} 렌더링 오류:`, error);
      return (
        <Card key={index} sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2, bgcolor: '#fff5f5' }}>
          <Alert severity="error" sx={{ borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              ⚠️ 문제 {index + 1}번을 불러올 수 없습니다
            </Typography>
            <Typography variant="body2">
              문제 생성 중 오류가 발생했습니다.<br />
              '문제 생성' 버튼을 다시 눌러주세요.
            </Typography>
          </Alert>
        </Card>
      );
    }
  }

  return (
    <Box>
      {questions.length === 0 ? (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body1">
            생성된 문제가 없습니다.<br />
            '문제 생성' 버튼을 눌러 문제를 만들어주세요.
          </Typography>
        </Alert>
      ) : (
        questions.map((question, index) => renderQuestion(question, index))
      )}
    </Box>
  )
}
