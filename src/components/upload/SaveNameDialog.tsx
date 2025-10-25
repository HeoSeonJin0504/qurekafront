import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface SaveNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (customName: string) => void;
  defaultName: string;
  title: string;
  type: 'summary' | 'question';
}

const SaveNameDialog: React.FC<SaveNameDialogProps> = ({
  open,
  onClose,
  onSave,
  defaultName,
  title,
  type,
}) => {
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // 모달이 열릴 때마다 초기화
      setCustomName('');
      setError('');
    }
  }, [open]);

  const handleSave = () => {
    const finalName = customName.trim() || defaultName;
    
    // 파일명 유효성 검사
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(finalName)) {
      setError('파일명에 사용할 수 없는 문자가 포함되어 있습니다. (< > : " / \\ | ? *)');
      return;
    }

    if (finalName.length > 100) {
      setError('파일명이 너무 깁니다. (최대 100자)');
      return;
    }

    onSave(finalName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SaveIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            저장할 {type === 'summary' ? '요약본' : '문제'}의 <strong>이름</strong>을 입력하세요.
            <br />
            입력하지 않으면 파일명으로 저장됩니다.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            label={type === 'summary' ? '요약본 이름' : '문제 이름'}
            placeholder={defaultName}
            value={customName}
            onChange={(e) => {
              setCustomName(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error || `파일 이름: ${defaultName}`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {!customName && (
            <Alert severity="info" sx={{ mt: 2 }}>
              이름을 입력하지 않으면 "<strong>{defaultName}</strong>"(으)로 저장됩니다.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          취소
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ borderRadius: 2 }}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveNameDialog;
