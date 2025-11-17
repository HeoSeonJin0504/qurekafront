import React from 'react'
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
} from '@mui/material'
import { Settings as SettingsIcon } from '@mui/icons-material'
import SchoolIcon from '@mui/icons-material/School'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import { questionLabels, aiQuestionPromptKeys_Korean, FIELD_OPTIONS, LEVEL_OPTIONS } from '../../constants/upload'
import SavedSummaryDialog from './SavedSummaryDialog'
import { SummaryItem } from '../../services/api'
import CloseIcon from '@mui/icons-material/Close'

interface ProblemSettingsProps {
  qTab: number
  setQTab: (value: number) => void
  qField: string
  setQField: (value: string) => void
  qLevel: string
  setQLevel: (value: string) => void
  qCount: number
  setQCount: (value: number) => void
  optCount: number
  setOptCount: (value: number) => void
  blankCount: number
  setBlankCount: (value: number) => void
  optionFormat: string
  setOptionFormat: (value: string) => void
  summaryText: string
  openSummaryDialog: boolean
  setOpenSummaryDialog: (value: boolean) => void
  openSavedSummariesDialog: () => void
  hasSummaryText: boolean
  showSavedSummaryButton?: boolean // 새로운 prop 추가
}

export default function ProblemSettings({
  qTab,
  setQTab,
  qField,
  setQField,
  qLevel,
  setQLevel,
  qCount,
  setQCount,
  optCount,
  setOptCount,
  blankCount,
  setBlankCount,
  optionFormat,
  setOptionFormat,
  summaryText,
  openSummaryDialog,
  setOpenSummaryDialog,
  openSavedSummariesDialog,
  hasSummaryText,
  showSavedSummaryButton = true, // 기본값은 true
}: ProblemSettingsProps) {
  return (
    <>
      {/* Problem Tabs */}
      <Box
        sx={{
          mb: 4,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={qTab}
          onChange={(_, v) => setQTab(v)}
          variant="fullWidth"
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 0.5, p: 1 } }}
        >
          {questionLabels.map((label, idx) => (
            <Tab
              key={idx}
              label={label}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                bgcolor: 'transparent',
                borderRadius: 2,
                minHeight: 48,
                fontSize: '0.9rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 600,
                  transform: 'translateY(-1px)',
                  boxShadow: 1,
                },
                '&:hover': {
                  bgcolor: theme =>
                    theme.palette.mode === 'light'
                      ? 'primary.light'
                      : 'primary.dark',
                  color: 'primary.contrastText',
                  transform: 'translateY(-1px)',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Problem Options */}
      <Box
        sx={{
          background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          variant="h6"
          sx={{ 
            mb: 2.5, 
            color: '#1e293b', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 1 
          }}
        >
          <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
            <SettingsIcon sx={{ color: '#6366f1' }} />
            문제 설정
          </Box>
          <Box display="flex" gap={1}>
            {hasSummaryText && (
              <>
                <Button 
                  variant="outlined"
                  startIcon={<LibraryBooksIcon />}
                  onClick={() => setOpenSummaryDialog(true)}
                  size="small"
                >
                  현재 요약본 보기
                </Button>
                {showSavedSummaryButton && (
                  <Button 
                    variant="outlined"
                    color="secondary"
                    startIcon={<LibraryBooksIcon />}
                    onClick={openSavedSummariesDialog}
                    size="small"
                  >
                    저장된 요약 선택하기
                  </Button>
                )}
              </>
            )}
          </Box>
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* 분야 */}
          <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
              분야
            </Typography>
            <FormControl fullWidth>
              <Select
                value={qField}
                onChange={e => setQField(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  border: '2px solid transparent',
                  '&:hover': { borderColor: '#6366f1', backgroundColor: '#fefefe' },
                  '&.Mui-focused': { borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {FIELD_OPTIONS.map(o => (
                  <MenuItem key={o} value={o}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon sx={{ fontSize: 18, color: '#6366f1' }} /> {o}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 난이도 */}
          <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
              난이도
            </Typography>
            <FormControl fullWidth>
              <Select
                value={qLevel}
                onChange={e => setQLevel(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  border: '2px solid transparent',
                  '&:hover': { borderColor: '#10b981', backgroundColor: '#fefefe' },
                  '&.Mui-focused': { borderColor: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.1)' },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {LEVEL_OPTIONS.map(({ value, icon }) => (
                  <MenuItem key={value} value={value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '16px' }}>{icon}</span> {value}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 문제 수 */}
          <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
              문제 수
            </Typography>
            <FormControl fullWidth>
              <Select
                value={qCount}
                onChange={e => setQCount(Number(e.target.value))}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  border: '2px solid transparent',
                  '&:hover': { borderColor: '#f59e0b', backgroundColor: '#fefefe' },
                  '&.Mui-focused': { borderColor: '#f59e0b', boxShadow: '0 0 0 3px rgba(245,158,11,0.1)' },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {[1,2,3,4,5].map(n => (
                  <MenuItem key={n} value={n}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        backgroundColor: '#f59e0b', 
                        color: 'white', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}>
                        {n}
                      </Box>
                      {n}개
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 보기 수 (n지선다) */}
          {qTab === 0 && (
            <>
              <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
                  보기 수
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={optCount}
                    onChange={e => setOptCount(Number(e.target.value))}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                      border: '2px solid transparent',
                      '&:hover': { borderColor: '#f59e0b', backgroundColor: '#fefefe' },
                      '&.Mui-focused': { borderColor: '#f59e0b', boxShadow: '0 0 0 3px rgba(245,158,11,0.1)' },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    {[4,5].map(n => (
                      <MenuItem key={n} value={n}>{n}개</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
                  보기 형식
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={optionFormat}
                    onChange={e => setOptionFormat(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                      border: '2px solid transparent',
                      '&:hover': { borderColor: '#8b5cf6', backgroundColor: '#fefefe' },
                      '&.Mui-focused': { borderColor: '#8b5cf6', boxShadow: '0 0 0 3px rgba(139,92,246,0.1)' },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    {['단답형', '문장형'].map(format => (
                      <MenuItem key={format} value={format}>{format}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </>
          )}

          {/* 선택지 수 (순서 배열형) */}
          {qTab === 1 && (
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
                선택지 수
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={optCount}
                  onChange={e => setOptCount(Number(e.target.value))}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    border: '2px solid transparent',
                    '&:hover': { borderColor: '#3b82f6', backgroundColor: '#fefefe' },
                    '&.Mui-focused': { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  {[3, 4, 5, 6].map(n => (
                    <MenuItem key={n} value={n}>{n}개</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* 빈칸 수 (빈칸 채우기형) */}
          {qTab === 2 && (
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
                빈칸 수
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={blankCount}
                  onChange={e => setBlankCount(Number(e.target.value))}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    border: '2px solid transparent',
                    '&:hover': { borderColor: '#f59e0b', backgroundColor: '#fefefe' },
                    '&.Mui-focused': { borderColor: '#f59e0b', boxShadow: '0 0 0 3px rgba(245,158,11,0.1)' },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  {[1, 2].map(n => (
                    <MenuItem key={n} value={n}>{n}개</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>

        {/* 설정 미리보기 */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: 'rgba(99,102,241,0.05)',
            borderRadius: 2,
            border: '1px dashed rgba(99,102,241,0.2)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 500, fontSize: '1rem' }}>
            설정 미리보기: {qField} 분야의 {qLevel} 수준으로 {qCount}문제
            {qTab === 0 && `, 보기 ${optCount}개, ${optionFormat}`}
            {qTab === 1 && `, 선택지 ${optCount}개`}
            {qTab === 2 && `, 빈칸 ${blankCount}개`}
          </Typography>
        </Box>
      </Box>

      {/* Summary Dialog */}
      <Dialog open={openSummaryDialog} onClose={() => setOpenSummaryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">현재 요약본</Typography>
            <IconButton onClick={() => setOpenSummaryDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography 
            component="pre" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            {summaryText || '요약본이 없습니다.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSummaryDialog(false)} variant="contained">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
