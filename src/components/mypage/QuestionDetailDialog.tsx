import React, { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, CircularProgress, IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { FileItem, QuestionItem } from '../../types/mypage'
import QuestionRenderer from '../upload/QuestionRenderer'
import { Question } from '../../types/upload'

interface QuestionDetailDialogProps {
  open: boolean
  onClose: () => void
  item: FileItem | QuestionItem | null
  dialogTitle: string
  dialogText: string
  onDownload: (item: FileItem | QuestionItem, skipLoading?: boolean) => void | Promise<void>
}

export default function QuestionDetailDialog({
  open, onClose, item, dialogTitle, dialogText, onDownload
}: QuestionDetailDialogProps) {
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([])
  const [isJsonFormat, setIsJsonFormat] = useState(false)
  const [formattedText, setFormattedText] = useState<string>('')
  // PDF 다운로드 상태
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    // 다이얼로그가 열릴 때 JSON 파싱 시도
    if (open && item && 'rawJson' in item && item.rawJson) {
      parseQuestionJson(item.rawJson)
      
      // 텍스트 다운로드용 포맷된 텍스트 생성
      try {
        const data = JSON.parse(item.rawJson)
        let textContent = ''
        
        // 여러 문제인 경우
        if (data.questions && Array.isArray(data.questions)) {
          textContent = data.questions.map((q: Question, index: number) => {
            let questionText = `[문제 ${index + 1}] ${q.question_text}\n\n`
            
            // 선다형 문제 옵션 추가
            if (q.options && Array.isArray(q.options)) {
              questionText += q.options.map((opt) => `${opt.id}. ${opt.text}`).join('\n') + '\n\n'
            }
            
            // 순서형 문제 항목 추가
            if (q.items && Array.isArray(q.items)) {
              questionText += q.items.map((item) => `${item.id}. ${item.text}`).join('\n') + '\n\n'
            }
            
            // 정답 추가
            if (q.correct_answer !== undefined) {
              questionText += `정답: ${q.correct_answer}\n`
            }
            
            if (q.correct_sequence) {
              questionText += `정답 순서: ${q.correct_sequence.join(' -> ')}\n`
            }
            
            // 해설 추가
            if (q.explanation) {
              questionText += `\n해설: ${q.explanation}\n`
            }
            
            return questionText + '\n--------------------------------------------------\n'
          }).join('\n')
        } 
        // 단일 문제인 경우
        else {
          textContent = `[문제] ${data.question_text || data.question}\n\n`
          
          if (data.options && Array.isArray(data.options)) {
            textContent += data.options.map((opt: any) => `${opt.id}. ${opt.text}`).join('\n') + '\n\n'
          }
          
          if (data.correct_answer !== undefined) {
            textContent += `정답: ${data.correct_answer}\n`
          }
          
          if (data.explanation) {
            textContent += `\n해설: ${data.explanation}\n`
          }
        }
        
        setFormattedText(textContent)
      } catch (error) {
        // JSON 파싱 실패시 원본 텍스트 사용
        setFormattedText(item.rawJson)
      }
    } else {
      setIsJsonFormat(false)
      setParsedQuestions([])
      setFormattedText(dialogText)
    }
  }, [open, item, dialogText])

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

  const handleDownloadPDF = async () => {
    if (!item) return
    setDownloadingPdf(true)
    try {
      // skipLoading을 true로 전달하여 Mypage의 로딩 UI를 건너뜀
      await Promise.resolve(onDownload(item, true))
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      alert('PDF 다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleDownloadTxt = () => {
    if (!item) return
    const element = document.createElement('a')
    const file = new Blob([formattedText], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${item.displayName || item.name || 'download'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!item) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="dialog-title"
    >
      {/* PDF 다운로드 중 로딩 표시 */}
      {downloadingPdf && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 2000,
            borderRadius: 1,
          }}
        >
          <CircularProgress size={50} />
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
            PDF 생성 중...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            잠시만 기다려 주세요
          </Typography>
        </Box>
      )}
      
      <DialogTitle id="dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="div">
              {dialogTitle || '상세 보기'}
            </Typography>
            {item && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  원본 파일: {item.name}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  생성일: {item.createdAt}
                </Typography>
              </Box>
            )}
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {'rawJson' in item && parsedQuestions.length > 0 ? (
          <QuestionRenderer questions={parsedQuestions} />
        ) : (
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
            {dialogText}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button 
          onClick={handleDownloadTxt} 
          variant="contained"
          color="primary"
        >
          텍스트 다운로드
        </Button>
        <Button onClick={handleDownloadPDF} variant="contained" color="primary">
          PDF 다운로드
        </Button>
      </DialogActions>
    </Dialog>
  )
}