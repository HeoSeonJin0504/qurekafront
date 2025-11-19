import React from 'react';
import {
  Paper,
  Stack,
  Typography,
  Button,
  Box,
  Alert,
  Fade,
} from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

interface ErrorDisplayProps {
  errorMessage?: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errorMessage = '문제를 생성하는 중 오류가 발생했습니다.',
  onRetry,
}) => {
  return (
    <Fade in timeout={500}>
      <Paper
        elevation={6}
        sx={{
          p: 6,
          borderRadius: 4,
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <Stack spacing={4} alignItems="center">
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
            }}
          >
            <ErrorIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>

          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="error">
              오류가 발생했습니다
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {errorMessage}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ maxWidth: 600, textAlign: 'left' }}>
            <Typography variant="body2" component="div">
              • 생성된 문제가 올바른 형식이 아닐 수 있습니다.<br />
              • 다시 시도하거나 설정을 변경해주세요.<br />
              • 문제가 계속되면 다른 파일로 시도해보세요.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            size="large"
            startIcon={<Refresh />}
            onClick={onRetry}
            sx={{
              borderRadius: 3,
              px: 5,
              py: 1.5,
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              },
            }}
          >
            다시 생성하기
          </Button>
        </Stack>
      </Paper>
    </Fade>
  );
};

export default ErrorDisplay;
