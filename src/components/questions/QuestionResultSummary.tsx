import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface QuestionResult {
  questionIndex: number;
  isCorrect: boolean;
  userAnswer: any;
}

interface QuestionResultSummaryProps {
  results: QuestionResult[];
  totalQuestions: number;
  onRestart: () => void;
  onRetryWrong: () => void;
  onClose: () => void;
  onViewQuestion: (index: number) => void;
}

export default function QuestionResultSummary({
  results,
  totalQuestions,
  onRestart,
  onRetryWrong,
  onClose,
  onViewQuestion
}: QuestionResultSummaryProps) {
  const correctCount = results.filter(r => r.isCorrect).length;
  const wrongCount = results.length - correctCount;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return 'success.main';
    if (percentage >= 70) return 'info.main';
    if (percentage >= 50) return 'warning.main';
    return 'error.main';
  };

  const getScoreMessage = (percentage: number): string => {
    if (percentage === 100) return '완벽합니다! 🎉';
    if (percentage >= 90) return '훌륭합니다! 👏';
    if (percentage >= 70) return '잘했습니다! 😊';
    if (percentage >= 50) return '조금 더 노력해보세요! 💪';
    return '다시 한번 도전해보세요! 📚';
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          📊 학습 결과
        </Typography>
        
        <Divider sx={{ my: 3 }} />

        {/* 점수 표시 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" fontWeight="bold" color={getScoreColor(scorePercentage)} gutterBottom>
            {correctCount} / {totalQuestions}
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            정답률: {scorePercentage}%
          </Typography>
          <Typography variant="h6" color={getScoreColor(scorePercentage)} sx={{ mt: 2 }}>
            {getScoreMessage(scorePercentage)}
          </Typography>
        </Box>

        {/* 진행률 바 */}
        <Box sx={{ mb: 4 }}>
          <LinearProgress
            variant="determinate"
            value={scorePercentage}
            sx={{
              height: 20,
              borderRadius: 10,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: getScoreColor(scorePercentage),
                borderRadius: 10
              }
            }}
          />
        </Box>

        {/* 통계 카드 */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {correctCount}
                    </Typography>
                    <Typography variant="body2">맞힌 문제</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CancelIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {wrongCount}
                    </Typography>
                    <Typography variant="body2">틀린 문제</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 틀린 문제 목록 */}
        {wrongCount > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              틀린 문제 목록
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflowY: 'auto' }}>
              {results
                .map((result, index) => ({ ...result, originalIndex: index }))
                .filter(r => !r.isCorrect)
                .map((result) => (
                  <Chip
                    key={result.originalIndex}
                    label={`문제 ${result.originalIndex + 1}`}
                    onClick={() => onViewQuestion(result.originalIndex)}
                    sx={{ m: 0.5 }}
                    color="error"
                    variant="outlined"
                    clickable
                  />
                ))}
            </Paper>
          </Box>
        )}

        {/* 액션 버튼들 */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {wrongCount > 0 && (
            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<RestartAltIcon />}
              onClick={onRetryWrong}
              fullWidth
            >
              틀린 문제만 다시 풀기 ({wrongCount}개)
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RestartAltIcon />}
            onClick={onRestart}
            fullWidth
          >
            처음부터 다시 풀기
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<NavigateNextIcon />}
            onClick={onClose}
            fullWidth
          >
            목록으로 돌아가기
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
