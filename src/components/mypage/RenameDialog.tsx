import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography
} from '@mui/material'

interface RenameDialogProps {
  open: boolean
  onClose: () => void
  currentName: string
  itemType: 'summary' | 'question'
  onConfirm: (newName: string) => Promise<void>
}

export default function RenameDialog({
  open,
  onClose,
  currentName,
  itemType,
  onConfirm
}: RenameDialogProps) {
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 파일명 유효성 검사 함수
  const isValidFileName = (name: string): boolean => {
    // 허용된 특수기호: . , - _ () [] %
    const validPattern = /^[a-zA-Z0-9가-힣\s.,\-_()[\]%]+$/
    return validPattern.test(name)
  }

  useEffect(() => {
    if (open) {
      setNewName(currentName)
      setError('')
    }
  }, [open, currentName])

  const handleConfirm = async () => {
    const trimmedName = newName.trim()
    
    if (!trimmedName) {
      setError('이름을 입력해주세요.')
      return
    }

    if (!isValidFileName(trimmedName)) {
      setError('파일명에는 . , - _ () [] % 특수기호만 사용할 수 있습니다.')
      return
    }

    if (trimmedName === currentName) {
      onClose()
      return
    }

    setLoading(true)
    setError('')

    try {
      await onConfirm(trimmedName)
      onClose()
    } catch (error: any) {
      setError(error.response?.data?.message || '이름 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewName(value)
    
    // 실시간 유효성 검사
    if (value.trim() && !isValidFileName(value)) {
      setError('파일명에는 . , - _ () [] % 특수기호만 사용할 수 있습니다.')
    } else {
      setError('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {itemType === 'summary' ? '요약' : '문제'} 이름 변경
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            새로운 이름을 입력하세요 (최대 30자)
            <br />
            허용된 특수기호: . , - _ ( ) [ ] %
          </Typography>
          
          <TextField
            autoFocus
            fullWidth
            value={newName}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            placeholder={`${itemType === 'summary' ? '요약' : '문제'} 이름`}
            error={!!error}
            helperText={error}
            disabled={loading}
            variant="outlined"
            inputProps={{ maxLength: 30 }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || !newName.trim()}
        >
          {loading ? '변경 중...' : '변경'}
        </Button>
        <Button onClick={onClose} disabled={loading} variant="contained">
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}