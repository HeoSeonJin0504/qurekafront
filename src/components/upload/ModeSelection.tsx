import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Avatar,
  Fade,
} from '@mui/material';
import { Description, Quiz, CloudUpload, LibraryBooks } from '@mui/icons-material';

type Mode = 'summary' | 'question' | null;
type QuestionSource = 'upload' | 'saved' | null;

interface ModeSelectionProps {
  onSelectMode: (mode: Mode) => void;
}

interface QuestionSourceSelectionProps {
  onSelectSource: (source: QuestionSource) => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  return (
    <Fade in timeout={500}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight={700} sx={{ mb: 6 }}>
          무엇을 생성하시겠습니까?
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
          <Card
            sx={{
              width: { xs: '100%', md: 400 },
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.3)',
              },
            }}
            onClick={() => onSelectMode('summary')}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                }}
              >
                <Description sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                요약본 및 문제 생성
              </Typography>
              <Typography variant="body1" color="text.secondary">
                파일을 업로드하여 요약본 및 문제를 생성합니다
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              width: { xs: '100%', md: 400 },
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3)',
              },
            }}
            onClick={() => onSelectMode('question')}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                }}
              >
                <Quiz sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                문제 생성
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                파일 또는 저장된 요약본으로 문제를 바로 생성합니다
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Fade>
  );
};

export const QuestionSourceSelection: React.FC<QuestionSourceSelectionProps> = ({ onSelectSource }) => {
  return (
    <Fade in timeout={500}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight={700} sx={{ mb: 6 }}>
          어떤 방법으로 문제를 생성하시겠습니까?
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
          <Card
            sx={{
              width: { xs: '100%', md: 400 },
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.3)',
              },
            }}
            onClick={() => onSelectSource('upload')}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                }}
              >
                <CloudUpload sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                파일 업로드
              </Typography>
              <Typography variant="body1" color="text.secondary">
                파일을 업로드하여 문제 생성
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              width: { xs: '100%', md: 400 },
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.3)',
              },
            }}
            onClick={() => onSelectSource('saved')}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                <LibraryBooks sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                저장된 요약본
              </Typography>
              <Typography variant="body1" color="text.secondary">
                저장된 요약본으로 바로 문제 생성
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Fade>
  );
};
