import React, { useState } from 'react'
import {
  Box, Typography, Paper,
  IconButton, Menu, MenuItem, Pagination,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { jsPDF } from 'jspdf'
import { FileItem, QuestionItem } from '../../types/mypage'

const itemsPerPage = 5

interface FileListSectionProps {
  title: string
  titleVariant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  items: FileItem[] | QuestionItem[]
  currentPage: number
  onPageChange: (e: React.ChangeEvent<unknown>, p: number) => void
  onView: (item: FileItem | QuestionItem) => void
  onDelete?: (item: FileItem | QuestionItem) => void
}

export default function FileListSection({
  title, titleVariant = 'h6', items, currentPage, onPageChange, onView, onDelete
}: FileListSectionProps) {
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
