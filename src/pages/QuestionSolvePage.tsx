import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import StarIcon from '@mui/icons-material/Star';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { questionAPI, favoriteAPI, FavoriteFolder } from '../services/api';
import { QuestionItem } from '../types/mypage';
import QuestionSolver from '../components/questions/QuestionSolver';
import PageNavigator from '../components/common/PageNavigator';

export default function QuestionSolvePage() {
  const { user } = useAuth();
  const [questionItems, setQuestionItems] = useState<QuestionItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<QuestionItem[]>([]);
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionPage, setQuestionPage] = useState(1);
  const [favoritePage, setFavoritePage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [solveMode, setSolveMode] = useState(false);
  
  // 폴더 생성 다이얼로그
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  
  // 폴더 이동 다이얼로그
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedQuestionForMove, setSelectedQuestionForMove] = useState<QuestionItem | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<number | null>(null);
  
  // 폴더 메뉴
  const [folderMenuAnchor, setFolderMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFolderForMenu, setSelectedFolderForMenu] = useState<FavoriteFolder | null>(null);

  // 문제 변환 함수 (useEffect 외부로 이동)
  const transformQuestionItem = (q: any): QuestionItem => {
    const date = new Date(q.created_at);
    const questionText = q.question_text;

    try {
      const data = JSON.parse(questionText);
      return {
        id: q.selection_id,
        name: q.file_name,
        displayName: q.question_name || q.file_name,
        date: date.toLocaleDateString("ko-KR"),
        time: date.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: date.toLocaleString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        text:
          data.question ||
          data.questions?.[0]?.question_text ||
          "문제 내용 없음",
        type: data.type,
        displayType: q.question_type || "기타",
        options: data.options,
        answer: data.answer,
        correct_option_index: data.correct_option_index,
        explanation: data.explanation,
        rawJson: questionText,
        folderId: q.folder_id,
        favoriteId: q.favorite_id,
        questionIndex: q.question_index
      };
    } catch {
      return {
        id: q.selection_id,
        name: q.file_name,
        displayName: q.question_name || q.file_name,
        date: date.toLocaleDateString("ko-KR"),
        time: date.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: date.toLocaleString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: questionText,
        type: "unknown",
        displayType: q.question_type || "기타",
        rawJson: questionText,
        folderId: q.folder_id,
        favoriteId: q.favorite_id,
        questionIndex: q.question_index
      };
    }
  };

  // 데이터 불러오기 함수
  const loadAllData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [qRes, fRes, folderRes] = await Promise.all([
        questionAPI.getUserQuestions(user.id),
        favoriteAPI.getAllFavoriteQuestions(user.id),
        favoriteAPI.getFolders(user.id)
      ]);

      setQuestionItems(qRes.data.questions.map(transformQuestionItem));
      
      // 🔄 즐겨찾기 목록을 최신순으로 정렬 (먼저 추가한 것이 앞에)
      const sortedFavorites = fRes.data.questions
        .map(transformQuestionItem)
        .sort((a, b) => {
          // favoriteId가 작을수록 먼저 추가된 것
          const aId = a.favoriteId || 0;
          const bId = b.favoriteId || 0;
          return aId - bId;
        });
      
      setFavoriteItems(sortedFavorites);
      
      // 기본 폴더가 없으면 생성 요청
      let allFolders = folderRes.data.folders;
      const hasDefaultFolder = allFolders.some(f => f.folder_name === '기본 폴더');
      
      if (!hasDefaultFolder) {
        try {
          await favoriteAPI.createFolder({
            userId: user.id,
            folderName: '기본 폴더',
            description: '기본 즐겨찾기 폴더'
          });
          
          // 폴더 다시 조회
          const updatedFolderRes = await favoriteAPI.getFolders(user.id);
          allFolders = updatedFolderRes.data.folders;
        } catch (error) {
          console.error('기본 폴더 생성 오류:', error);
        }
      }
      
      // 폴더 정렬: 기본 폴더를 맨 앞으로
      const sortedFolders = allFolders.sort((a, b) => {
        if (a.folder_name === '기본 폴더') return -1;
        if (b.folder_name === '기본 폴더') return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setFolders(sortedFolders);
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 데이터 불러오기
  useEffect(() => {
    if (!user?.id) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 폴더 생성
  const handleCreateFolder = async () => {
    if (!user?.id || !newFolderName.trim()) {
      alert('폴더 이름을 입력해주세요.');
      return;
    }

    try {
      await favoriteAPI.createFolder({
        userId: user.id,
        folderName: newFolderName.trim(),
        description: newFolderDescription.trim() || undefined
      });
      
      setFolderDialogOpen(false);
      setNewFolderName('');
      setNewFolderDescription('');
      await loadAllData();
      alert('폴더가 생성되었습니다.');
    } catch (error: any) {
      console.error('폴더 생성 오류:', error);
      alert(error.response?.data?.message || '폴더 생성 중 오류가 발생했습니다.');
    }
  };

  // 폴더 삭제
  const handleDeleteFolder = async (folder: FavoriteFolder) => {
    if (folder.folder_name === '기본 폴더') {
      alert('기본 폴더는 삭제할 수 없습니다.');
      return;
    }

    if (!window.confirm(`"${folder.folder_name}" 폴더를 삭제하시겠습니까?\n폴더 내의 모든 즐겨찾기도 삭제됩니다.`)) {
      return;
    }

    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await favoriteAPI.deleteFolder(folder.folder_id, user.id);  // 🔄 userId 전달
      setFolderMenuAnchor(null);
      setSelectedFolderForMenu(null);
      if (selectedFolder === folder.folder_id) {
        setSelectedFolder(null);
      }
      await loadAllData();
      alert('폴더가 삭제되었습니다.');
    } catch (error: any) {
      console.error('폴더 삭제 오류:', error);
      alert(error.response?.data?.message || '폴더 삭제 중 오류가 발생했습니다.');
    }
  };

  // 문제 이동
  const handleMoveQuestion = async () => {
    if (!user?.id || !selectedQuestionForMove || !targetFolderId) {
      alert('이동할 폴더를 선택해주세요.');
      return;
    }

    try {
      // 기존 즐겨찾기 제거
      if (selectedQuestionForMove.favoriteId) {
        await favoriteAPI.removeQuestion(selectedQuestionForMove.favoriteId, user.id);
      }

      // 새 폴더에 추가
      await favoriteAPI.addQuestion({
        userId: user.id,
        folderId: targetFolderId,
        questionId: selectedQuestionForMove.id,
        questionIndex: selectedQuestionForMove.questionIndex
      });

      setMoveDialogOpen(false);
      setSelectedQuestionForMove(null);
      setTargetFolderId(null);
      await loadAllData();
      alert('문제가 이동되었습니다.');
    } catch (error: any) {
      console.error('문제 이동 오류:', error);
      alert(error.response?.data?.message || '문제 이동 중 오류가 발생했습니다.');
    }
  };

  // 🆕 즐겨찾기 삭제 핸들러 추가
  const handleDeleteFavorite = async (item: QuestionItem) => {
    if (!user?.id || !item.favoriteId) {
      alert('즐겨찾기 정보를 찾을 수 없습니다.');
      return;
    }

    const questionName = item.questionIndex !== undefined 
      ? `${item.displayName} - 문제 ${item.questionIndex + 1}`
      : item.displayName;

    if (!window.confirm(`"${questionName}"을(를) 즐겨찾기에서 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await favoriteAPI.removeQuestion(item.favoriteId, user.id);
      await loadAllData();
      alert('즐겨찾기에서 삭제되었습니다.');
    } catch (error: any) {
      console.error('즐겨찾기 삭제 오류:', error);
      alert(error.response?.data?.message || '즐겨찾기 삭제 중 오류가 발생했습니다.');
    }
  };

  // 문제 선택 처리 - 즐겨찾기 컨텍스트 추가
  const handleQuestionSelect = (item: QuestionItem, fromFavorites: boolean = false) => {
    setSelectedQuestion({
      ...item,
      isFavoriteContext: fromFavorites  // 🆕 즐겨찾기에서 왔는지 표시
    });
    setSolveMode(true);
  };

  // 문제 풀기 종료 처리
  const handleCloseSolver = () => {
    setSolveMode(false);
    setSelectedQuestion(null);
    loadAllData(); // 즐겨찾기 상태가 변경될 수 있으므로 새로고침
  };

  // 필터링된 즐겨찾기 목록
  const filteredFavorites = selectedFolder
    ? favoriteItems.filter(item => item.folderId === selectedFolder)
    : favoriteItems;

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={8}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Header />
      <PageNavigator />
      <Box sx={{ pt: "60px", px: 4, pb: 6, maxWidth: 1200, mx: "auto" }}>
        {!solveMode ? (
          <>
            <Typography
              variant="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                mb: 4,
                color: "text.primary",
                borderBottom: "2px solid",
                borderColor: "primary.light",
                paddingBottom: 2,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -2,
                  left: 0,
                  width: "80px",
                  height: "4px",
                  backgroundColor: "primary.dark",
                },
              }}
            >
              문제 풀기
            </Typography>

            <Paper elevation={3} sx={{ mb: 5, p: 3, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                내가 생성한 문제로 학습하기
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                문제를 풀면서 핵심 내용을 다시 한번 확인하세요. 아래 목록에서 문제를 선택하면 해당 문제를 풀어볼 수 있습니다.
              </Typography>
              <Typography variant="body1" paragraph>
                문제를 풀고 나면 정답과 해설을 통해 자신의 이해도를 확인할 수 있습니다.
              </Typography>
            </Paper>

            {/* 내 문제 모음 */}
            <Box mb={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>❓ 내 문제 모음</Typography>
              <TableContainer component={Paper}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>이름</TableCell>
                      <TableCell align="center">생성 날짜</TableCell>
                      <TableCell align="center">유형</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questionItems.slice((questionPage - 1) * 5, questionPage * 5).map(item => (
                      <TableRow key={item.id} hover onClick={() => handleQuestionSelect(item, false)} sx={{ cursor: 'pointer' }}>
                        <TableCell>
                          <Box sx={{ display:'flex', alignItems:'center' }}>
                            <PictureAsPdfIcon color="error" sx={{ mr:1 }} />
                            <Typography noWrap>{item.displayName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{item.createdAt}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={item.displayType || '기타'} 
                            size="small" 
                            color="secondary" 
                            variant="outlined" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {questionItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">저장된 항목이 없습니다.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {Math.ceil(questionItems.length / 5) > 0 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination 
                    count={Math.ceil(questionItems.length / 5)} 
                    page={questionPage}
                    onChange={(_, p) => setQuestionPage(p)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>

            {/* 즐겨찾기 문제 섹션 */}
            <Box mb={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  ⭐ 즐겨찾기 문제 모음
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<CreateNewFolderIcon />}
                  onClick={() => setFolderDialogOpen(true)}
                >
                  폴더 추가
                </Button>
              </Box>

              {/* 폴더 탭 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Paper sx={{ flex: 1 }}>
                  <Tabs
                    value={selectedFolder}
                    onChange={(_, value) => {
                      setSelectedFolder(value);
                      setFavoritePage(1);
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab
                      label={`전체 (${favoriteItems.length})`}
                      value={null}
                      icon={<StarIcon />}
                      iconPosition="start"
                    />
                    {folders.map(folder => (
                      <Tab
                        key={folder.folder_id}
                        label={`${folder.folder_name} (${folder.question_count || 0})`}
                        value={folder.folder_id}
                        icon={<FolderIcon />}
                        iconPosition="start"
                      />
                    ))}
                  </Tabs>
                </Paper>
                
                {/* 선택된 폴더의 메뉴 버튼 */}
                {selectedFolder !== null && (
                  <Tooltip title="폴더 관리">
                    <IconButton
                      onClick={(e) => {
                        const folder = folders.find(f => f.folder_id === selectedFolder);
                        if (folder) {
                          setFolderMenuAnchor(e.currentTarget);
                          setSelectedFolderForMenu(folder);
                        }
                      }}
                      sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* 즐겨찾기 테이블 */}
              <TableContainer component={Paper}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>이름</TableCell>
                      <TableCell align="center">생성 날짜</TableCell>
                      <TableCell align="center">유형</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFavorites.slice((favoritePage - 1) * 5, favoritePage * 5).map(item => (
                      <TableRow key={`${item.id}-${item.questionIndex ?? 'default'}`} hover>
                        <TableCell onClick={() => handleQuestionSelect(item, true)} sx={{ cursor: 'pointer' }}>
                          <Box sx={{ display:'flex', alignItems:'center' }}>
                            <StarIcon sx={{ color: '#FFD700', mr: 1 }} />
                            <Typography noWrap>
                              {item.displayName}
                              {item.questionIndex !== undefined && ` - 문제 ${item.questionIndex + 1}`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" onClick={() => handleQuestionSelect(item, true)} sx={{ cursor: 'pointer' }}>
                          {item.createdAt}
                        </TableCell>
                        <TableCell align="center" onClick={() => handleQuestionSelect(item, true)} sx={{ cursor: 'pointer' }}>
                          <Chip 
                            label={item.displayType || '기타'} 
                            size="small" 
                            color="secondary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="폴더 이동">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedQuestionForMove(item);
                                  setTargetFolderId(item.folderId || null);
                                  setMoveDialogOpen(true);
                                }}
                              >
                                <DriveFileMoveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="즐겨찾기 삭제">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteFavorite(item)}
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredFavorites.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            {selectedFolder ? '이 폴더에 즐겨찾기한 문제가 없습니다.' : '즐겨찾기한 문제가 없습니다.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {Math.ceil(filteredFavorites.length / 5) > 0 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination 
                    count={Math.ceil(filteredFavorites.length / 5)} 
                    page={favoritePage}
                    onChange={(_, p) => setFavoritePage(p)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          </>
        ) : (
          selectedQuestion && (
            <QuestionSolver 
              questionItem={selectedQuestion}
              favoritesList={selectedQuestion.isFavoriteContext ? filteredFavorites : undefined}  // 🆕 즐겨찾기 목록 전달
              onClose={handleCloseSolver}
            />
          )
        )}
      </Box>

      {/* 폴더 생성 다이얼로그 */}
      <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 폴더 만들기</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="폴더 이름"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="예: 중요한 문제"
          />
          <TextField
            margin="dense"
            label="설명 (선택사항)"
            fullWidth
            multiline
            rows={2}
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
            placeholder="폴더에 대한 설명을 입력하세요"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFolderDialogOpen(false);
            setNewFolderName('');
            setNewFolderDescription('');
          }}>
            취소
          </Button>
          <Button onClick={handleCreateFolder} variant="contained">
            생성
          </Button>
        </DialogActions>
      </Dialog>

      {/* 문제 이동 다이얼로그 */}
      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>폴더 이동</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            "{selectedQuestionForMove?.displayName}"을(를) 이동할 폴더를 선택하세요.
          </Typography>
          <Box sx={{ mt: 2 }}>
            {folders.map(folder => (
              <Paper
                key={folder.folder_id}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: 'pointer',
                  border: 2,
                  borderColor: targetFolderId === folder.folder_id ? 'primary.main' : 'transparent',
                  '&:hover': {
                    borderColor: 'primary.light'
                  }
                }}
                onClick={() => setTargetFolderId(folder.folder_id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FolderIcon color={targetFolderId === folder.folder_id ? 'primary' : 'action'} />
                  <Box>
                    <Typography variant="subtitle1">{folder.folder_name}</Typography>
                    {folder.description && (
                      <Typography variant="caption" color="text.secondary">
                        {folder.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setMoveDialogOpen(false);
            setSelectedQuestionForMove(null);
            setTargetFolderId(null);
          }}>
            취소
          </Button>
          <Button onClick={handleMoveQuestion} variant="contained" disabled={!targetFolderId}>
            이동
          </Button>
        </DialogActions>
      </Dialog>

      {/* 폴더 메뉴 */}
      <Menu
        anchorEl={folderMenuAnchor}
        open={Boolean(folderMenuAnchor)}
        onClose={() => {
          setFolderMenuAnchor(null);
          setSelectedFolderForMenu(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedFolderForMenu) {
              handleDeleteFolder(selectedFolderForMenu);
            }
          }}
          disabled={selectedFolderForMenu?.folder_name === '기본 폴더'}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          폴더 삭제
        </MenuItem>
      </Menu>
    </Box>
  );
}