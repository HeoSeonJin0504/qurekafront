import React, { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Chip
} from '@mui/material'
import { FileItem, QuestionItem } from '../../types/mypage'
import QuestionRenderer from '../upload/QuestionRenderer'
import { Question } from '../../types/upload'

interface QuestionDetailDialogProps {
  open: boolean
  onClose: () => void
  item: FileItem | QuestionItem | null
  dialogTitle: string
  dialogText: string
}

export default function QuestionDetailDialog({
  open, onClose, item, dialogTitle, dialogText
}: QuestionDetailDialogProps) {
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([])
  const [isJsonFormat, setIsJsonFormat] = useState(false)

  useEffect(() => {
    // 다이얼로그가 열릴 때 JSON 파싱 시도
    if (open && item && 'rawJson' in item && item.rawJson) {
      parseQuestionJson(item.rawJson)
    } else {
      setIsJsonFormat(false)
      setParsedQuestions([])
    }
  }, [open, item])

  // JSON 문자열을 파싱하는 함수
  const parseQuestionJson = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText)
      
      // questions 배열이 있는 경우 (여러 문제)
      if (data.questions && Array.isArray(data.questions)) {
        setParsedQuestions(data.questions)
        setIsJsonFormat(true)
        return true
      } 
      // 단일 문제 형식 (questions 배열이 없는 경우)
      else {
        // 단일 문제를 배열로 변환하여 저장
        setParsedQuestions([data])
        setIsJsonFormat(true)
        return true
      }
    } catch (error) {
      console.error("JSON 파싱 오류:", error)
      setIsJsonFormat(false)
      setParsedQuestions([])
      return false
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{dialogTitle}</Typography>
          <Chip 
            label={
              'summaryType' in item 
                ? item.summaryType
                : (item as QuestionItem).displayType || '기타'
            }
            size="small"
            color={'summaryType' in item ? "primary" : "secondary"}
            variant="outlined"
          />
        </Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {item.createdAt}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {/* 요약인 경우 기존 텍스트 표시 방식 유지 */}
        {'summaryType' in item ? (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{dialogText}</Typography>
        ) : (
          // 문제인 경우 JSON 형식이면 QuestionRenderer로 표시, 아니면 텍스트로 표시
          isJsonFormat && parsedQuestions.length > 0 ? (
            <QuestionRenderer questions={parsedQuestions} />
          ) : (
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{dialogText}</Typography>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  )
}
