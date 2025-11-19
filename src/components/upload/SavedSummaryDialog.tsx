import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { summaryAPI, SummaryItem } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface SavedSummaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectSummary: (summary: SummaryItem) => void;
}

const SavedSummaryDialog: React.FC<SavedSummaryDialogProps> = ({ open, onClose, onSelectSummary }) => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSummary, setSelectedSummary] = useState<SummaryItem | null>(null);

  // 요약 목록 불러오기
  useEffect(() => {
    if (!open || !user) return;
    
    setLoading(true);
    setError(null);
    
    summaryAPI.getUserSummaries(user.id)
      .then((res) => {
        setSummaries(res.data.summaries);
      })
      .catch((err) => {
        console.error('요약 목록 불러오기 실패:', err);
        setError('요약 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, user]);

  // 요약 선택 핸들러
  const handleSelectSummary = () => {
    if (selectedSummary) {
      onSelectSummary(selectedSummary);
      onClose();
    }
  };

  // 검색어에 따라 필터링된 요약 목록
  const filteredSummaries = summaries.filter((summary) => {
    return (
      summary.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.summary_name.toLowerCase().includes(searchQuery.toLowerCase()) ||  // 추가
      summary.summary_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.summary_text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">저장된 요약 목록</Typography>
          <TextField
            placeholder="검색..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: '40%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" py={4}>
            {error}
          </Typography>
        ) : filteredSummaries.length === 0 ? (
          <Typography align="center" color="text.secondary" py={4}>
            {searchQuery ? '검색 결과가 없습니다.' : '저장된 요약이 없습니다.'}
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>요약본 이름</TableCell>
                  <TableCell>파일 이름</TableCell>
                  <TableCell align="center">유형</TableCell>
                  <TableCell align="center">생성일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSummaries.map((summary) => (
                  <TableRow
                    key={summary.selection_id}
                    hover
                    onClick={() => setSelectedSummary(summary)}
                    selected={selectedSummary?.selection_id === summary.selection_id}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PictureAsPdfIcon color="error" sx={{ mr: 1 }} />
                        <Typography noWrap fontWeight="medium">
                          {summary.summary_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap variant="body2" color="text.secondary">
                        {summary.file_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={summary.summary_type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" noWrap>
                        {new Date(summary.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).replace(/\. /g, '-').replace('.', '')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedSummary && (
          <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              선택된 요약 미리보기:
            </Typography>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              📌 {selectedSummary.summary_name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                maxHeight: '150px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                backgroundColor: 'background.paper',
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {selectedSummary.summary_text}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          onClick={handleSelectSummary}
          color="primary"
          disabled={!selectedSummary}
          variant="contained"
        >
          선택
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavedSummaryDialog;
