// src/pages/Mypage.tsx
import React, { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import {
  Box, Typography, CircularProgress, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Snackbar
} from '@mui/material'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { summaryAPI, questionAPI } from '../services/api'
import { FileItem, QuestionItem } from '../types/mypage'
import FileListSection from '../components/mypage/FileListSection'
import QuestionDetailDialog from '../components/mypage/QuestionDetailDialog'

export default function Mypage() {
  const { user } = useAuth()
  const [summaryItems, setSummaryItems] = useState<FileItem[]>([])
  const [questionItems, setQuestionItems] = useState<QuestionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summaryPage, setSummaryPage] = useState(1)
  const [questionPage, setQuestionPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogText, setDialogText] = useState('')
  const [activeViewItem, setActiveViewItem] = useState<FileItem | QuestionItem | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: 'summary' | 'question'} | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  })

  // 폰트 로드
  useEffect(() => {
    fetch('/fonts/NotoSansKR-Regular.ttf')
      .then(res => res.arrayBuffer())
      .then(buf => {
        const b64 = btoa(
          new Uint8Array(buf).reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
        // @ts-ignore
        jsPDF.API.addFileToVFS('NotoSansKR-Regular.ttf', b64)
        // @ts-ignore
        jsPDF.API.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal')
      })
      .catch(console.error)
  }, [])

  // 데이터 불러오기
  useEffect(() => {
    if (!user?.id) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }
    
    Promise.all([
      summaryAPI.getUserSummaries(user.id),
      questionAPI.getUserQuestions(user.id),
    ])
      .then(([sRes, qRes]) => {
        setSummaryItems(sRes.data.summaries.map(s => {
          const date = new Date(s.created_at);
 
          return {
            id: s.selection_id,
            name: s.file_name,
            date: date.toLocaleDateString('ko-KR'),
            time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            createdAt: date.toLocaleString('ko-KR', { 
              year: 'numeric', month: 'long', day: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            }),
            text: s.summary_text,
            summaryType: s.summary_type || '기본 요약'
          };
        }));
        
        setQuestionItems(qRes.data.questions.map(q => {
          const date = new Date(q.created_at);
          
          // 문제 텍스트 저장
          const questionText = q.question_text;
          
          try {
            const data = JSON.parse(q.question_text);
            return {
              id: q.selection_id,
              name: q.file_name,
              date: date.toLocaleDateString('ko-KR'),
              time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              createdAt: date.toLocaleString('ko-KR', { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              }),
              text: data.question || (data.questions?.[0]?.question_text || '문제 내용 없음'),
              type: data.type,
              displayType: q.question_type || '기타',
              options: data.options,
              answer: data.answer,
              correct_option_index: data.correct_option_index,
              explanation: data.explanation,
              rawJson: questionText // 원본 JSON 저장
            };
          } catch {
            return {
              id: q.selection_id,
              name: q.file_name,
              date: date.toLocaleDateString('ko-KR'),
              time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              createdAt: date.toLocaleString('ko-KR', { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              }),
              text: q.question_text,
              type: 'unknown',
              displayType: q.question_type || '기타',
              rawJson: questionText // 원본 JSON 저장
            };
          }
        }));
      })
      .catch(() => setError('내역을 불러오는 중 오류가 발생했습니다.'))
      .finally(() => setLoading(false))
  }, [user])

  // 다이얼로그 열기 함수
  const handleOpenDialog = (item: FileItem | QuestionItem) => {
    setDialogTitle(item.name);
    setDialogText(item.text);
    setActiveViewItem(item);
    setDialogOpen(true);
  };

  // 삭제 확인 다이얼로그 표시 함수
  const handleDeleteConfirm = (id: number, type: 'summary' | 'question') => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };
  
  // 실제 삭제 수행 함수
  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'summary') {
        await summaryAPI.deleteSummary(itemToDelete.id);
        setSummaryItems(prev => prev.filter(item => item.id !== itemToDelete.id));
        setSnackbar({ open: true, message: '요약이 삭제되었습니다.', severity: 'success' });
      } else {
        await questionAPI.deleteQuestion(itemToDelete.id);
        setQuestionItems(prev => prev.filter(item => item.id !== itemToDelete.id));
        setSnackbar({ open: true, message: '문제가 삭제되었습니다.', severity: 'success' });
      }
    } catch {
      setSnackbar({ 
        open: true, 
        message: `${itemToDelete.type === 'summary' ? '요약' : '문제'} 삭제에 실패했습니다.`, 
        severity: 'error' 
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  if (loading) return <Box textAlign="center" mt={8}><CircularProgress/></Box>
  if (error) return <Box textAlign="center" mt={8}><Alert severity="error">{error}</Alert></Box>

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ pt: '60px', px: 4, pb: 6, maxWidth: 1200, mx: 'auto' }}>
        <Typography 
          variant="h2" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            mb: 4,
            color: 'text.primary',
            borderBottom: '2px solid',
            borderColor: 'primary.light',
            paddingBottom: 2,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -2,
              left: 0,
              width: '80px',
              height: '4px',
              backgroundColor: 'primary.dark'
            }
          }}
        >
          마이페이지
        </Typography>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <FileListSection
          title="📄 저장된 요약"
          titleVariant="h4"
          items={summaryItems}
          currentPage={summaryPage}
          onPageChange={(_, p) => setSummaryPage(p)}
          onView={handleOpenDialog}
          onDelete={item => handleDeleteConfirm(item.id, 'summary')}
        />

        <FileListSection
          title="❓ 생성된 문제"
          titleVariant="h4"
          items={questionItems}
          currentPage={questionPage}
          onPageChange={(_, p) => setQuestionPage(p)}
          onView={handleOpenDialog}
          onDelete={item => handleDeleteConfirm(item.id, 'question')}
        />
      </Box>

      {/* 상세 보기 다이얼로그 */}
      <QuestionDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        item={activeViewItem}
        dialogTitle={dialogTitle}
        dialogText={dialogText}
      />
      
      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          삭제 확인
        </DialogTitle>
        <DialogContent>
          <Typography>
            정말 이 {itemToDelete?.type === 'summary' ? '요약' : '문제'}을(를) 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            삭제한 항목은 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirmed} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}