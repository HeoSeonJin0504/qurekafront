// src/pages/Mypage.tsx
import React, { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import {
  Box, Typography, Paper,
  IconButton, Menu, MenuItem, Pagination,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar,
  Chip
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { summaryAPI, questionAPI } from '../services/api'

interface FileItem {
  id: number
  name: string
  date: string
  time: string
  createdAt: string
  text: string
  summaryType?: string
}

interface QuestionItem {
  id: number
  name: string
  date: string
  time: string
  createdAt: string
  text: string
  type: string
  displayType?: string
  options?: string[]
  answer?: string
  correct_option_index?: number
  explanation?: string
}

const itemsPerPage = 5

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: 'summary' | 'question'} | null>(null);
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
              text: data.question,
              type: data.type,
              displayType: q.question_type || '기타',
              options: data.options,
              answer: data.answer,
              correct_option_index: data.correct_option_index,
              explanation: data.explanation,
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
              displayType: q.question_type || '기타'
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{dialogTitle}</Typography>
            {activeViewItem && (
              <Chip 
                label={
                  activeViewItem.hasOwnProperty('summaryType') 
                    ? (activeViewItem as FileItem).summaryType 
                    : (activeViewItem as QuestionItem).displayType || '기타'
                }
                size="small"
                color={activeViewItem.hasOwnProperty('summaryType') ? "primary" : "secondary"}
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {activeViewItem?.createdAt}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ whiteSpace:'pre-wrap' }}>{dialogText}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
      
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

function FileListSection({
  title, titleVariant = 'h6', items, currentPage, onPageChange, onView, onDelete
}: {
  title: string
  titleVariant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  items: FileItem[] | QuestionItem[]
  currentPage: number
  onPageChange: (e: React.ChangeEvent<unknown>, p: number) => void
  onView: (item: FileItem | QuestionItem) => void
  onDelete?: (item: FileItem | QuestionItem) => void
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [activeItem, setActiveItem] = useState<FileItem | QuestionItem | null>(null)
  const openMenu = Boolean(anchorEl)

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, item: FileItem | QuestionItem) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setActiveItem(item)
  }
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveItem(null);
  };

  const handleDownload = async () => {
    if (!activeItem) return;
    
    try {
      // 임시 HTML 요소 생성
      const tempDiv = document.createElement('div');
      tempDiv.style.padding = '40px';
      tempDiv.style.width = '595px'; // A4 너비
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.backgroundColor = 'white';
      
      // 내용 준비
      let content = '';
      let fileName = activeItem.name;
      
      if (title === "❓ 생성된 문제" && 'type' in activeItem) {
        try {
          const questionItem = activeItem as QuestionItem;
          content += `<h2 style="margin-bottom: 20px;">문제: ${questionItem.text}</h2>`;
          
          if (questionItem.options && questionItem.options.length > 0) {
            content += '<ol style="margin-left: 20px;">';
            questionItem.options.forEach((opt) => {
              content += `<li style="margin-bottom: 8px;">${opt}</li>`;
            });
            content += '</ol>';
          }
          
          const answer = questionItem.answer ?? 
            (questionItem.options && 
             questionItem.correct_option_index !== undefined ? 
               questionItem.options[questionItem.correct_option_index] : 
               '없음');
               
          content += `<p style="margin-top: 20px;"><strong>정답:</strong> ${answer}</p>`;
          
          if (questionItem.explanation) {
            content += `<p style="margin-top: 10px;"><strong>해설:</strong> ${questionItem.explanation}</p>`;
          }
        } catch (error) {
          console.error('문제 데이터 처리 중 오류:', error);
          content = `<p>${activeItem.text}</p>`;
        }
      } else {
        // 일반 텍스트 (요약 등)를 위한 처리
        content = activeItem.text
          .split('\n')
          .map(line => `<p style="margin-bottom: 8px;">${line}</p>`)
          .join('');
      }
      
      tempDiv.innerHTML = content;
      document.body.appendChild(tempDiv);
      
      // html2canvas로 HTML을 이미지로 변환 (동적 import)
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // 해상도 향상
        useCORS: true,
        logging: false,
        backgroundColor: 'white'
      });
      
      // 이미지를 PDF로 변환
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ratio = pdfWidth / canvas.width;
      const imgHeight = canvas.height * ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      
      // 임시 요소 제거
      document.body.removeChild(tempDiv);
      
      // PDF 저장
      const filename = `${fileName.replace(/\.(txt|pdf)?$/i, '')}.pdf`;
      pdf.save(filename);
      
      handleMenuClose();
    } catch (error) {
      console.error('다운로드 중 오류:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  const start = (currentPage - 1) * itemsPerPage
  const pageItems = items.slice(start, start + itemsPerPage)
  const total = Math.ceil(items.length / itemsPerPage)

  return (
    <Box mb={6}>
      <Typography variant={titleVariant} fontWeight="bold" gutterBottom>{title}</Typography>
      <TableContainer component={Paper}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell align="center">생성 날짜</TableCell>
              <TableCell align="center">유형</TableCell>
              <TableCell align="right" sx={{ width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map(item => (
              <TableRow key={item.id} hover onClick={() => onView(item)} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Box sx={{ display:'flex', alignItems:'center' }}>
                    <PictureAsPdfIcon color="error" sx={{ mr:1 }} />
                    <Typography noWrap>{item.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{item.createdAt}</TableCell>
                <TableCell align="center">
                  {title.includes('요약') ? (
                    <Chip 
                      label={(item as FileItem).summaryType || '기본 요약'} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  ) : (
                    <Chip 
                      label={(item as QuestionItem).displayType || '기타'} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, item);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">저장된 항목이 없습니다.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {total > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination 
            count={total} 
            page={currentPage}
            onChange={onPageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={(event, reason) => {
          handleMenuClose();
        }}
        disableAutoFocusItem
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          if (activeItem) {
            onView(activeItem);
          }
          handleMenuClose();
        }}>
          보기
        </MenuItem>
        
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}>
          다운로드
        </MenuItem>
        
        {onDelete && activeItem && (
          <MenuItem onClick={(e) => {
            e.stopPropagation();
            onDelete(activeItem);
            handleMenuClose();
          }}>
            삭제
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}