import React from 'react';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Box,
  Fade,
} from '@mui/material';
import QuestionRenderer from './QuestionRenderer';
import { Question } from '../../types/upload';

interface ResultDisplayProps {
  type: 'summary' | 'question';
  text: string;
  isJsonFormat?: boolean;
  parsedQuestions?: Question[];
  fileName: string;
  contentType: string;
  onTextChange?: (text: string) => void;
  onSave: () => void;
  onDownload: () => void;
  onRegenerate: () => void;
  disabled?: boolean;
  showSaveButton?: boolean;
  onPractice?: () => void;
  practiceButtonLabel?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  type,
  text,
  isJsonFormat,
  parsedQuestions,
  fileName,
  contentType,
  onTextChange,
  onSave,
  onDownload,
  onRegenerate,
  disabled = false,
  showSaveButton = true,
  onPractice,
  practiceButtonLabel = '실습하러 가기',
}) => {
  return (
    <Fade in timeout={500}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          background: '#ffffff',
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            ✅ {type === 'summary' ? '요약' : '문제 생성'} 완료!
          </Typography>

          {type === 'summary' ? (
            <TextField
              fullWidth
              multiline
              minRows={10}
              value={text}
              onChange={(e) => onTextChange?.(e.target.value)}
              placeholder="요약 내용이 여기에 표시됩니다"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'white',
                },
              }}
            />
          ) : (
            isJsonFormat && parsedQuestions && (
              <Box sx={{ bgcolor: 'white', p: { xs: 1.5, sm: 3 }, borderRadius: 3 }}>
                <QuestionRenderer questions={parsedQuestions} />
              </Box>
            )
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {showSaveButton && (
              <Button
                variant="outlined"
                size="large"
                onClick={onSave}
                disabled={disabled}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  width: { xs: '100%', sm: 'auto' },
                  borderWidth: 2,
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#2563eb',
                    bgcolor: 'rgba(59, 130, 246, 0.04)',
                  },
                }}
              >
                저장하기
              </Button>
            )}
            <Button
              variant="contained"
              size="large"
              onClick={onDownload}
              disabled={disabled}
              sx={{
                borderRadius: 3,
                px: 4,
                width: { xs: '100%', sm: 'auto' },
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                },
              }}
            >
              PDF 다운로드
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={onRegenerate}
              disabled={disabled}
              sx={{
                borderRadius: 3,
                px: 4,
                width: { xs: '100%', sm: 'auto' },
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              다시 생성하기
            </Button>
            {onPractice && (
              <Button
                variant="outlined"
                color="success"
                size="large"
                onClick={onPractice}
                disabled={disabled}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  width: { xs: '100%', sm: 'auto' },
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                {practiceButtonLabel}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Fade>
  );
};

export default ResultDisplay;
