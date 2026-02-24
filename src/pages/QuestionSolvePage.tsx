// src/pages/QuestionSolvePage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
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
  Tooltip,
  Snackbar,
} from "@mui/material";
import styled from "styled-components";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import StarIcon from "@mui/icons-material/Star";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { CheckCircleOutline, Close } from "@mui/icons-material";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { questionAPI, favoriteAPI, FavoriteFolder } from "../services/api";
import { QuestionItem } from "../types/mypage";
import QuestionSolver from "../components/questions/QuestionSolver";
import PageNavigator from "../components/common/PageNavigator";

// ── 모바일용 카드 스타일 ─────────────────────────────────────
const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const QuestionCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
`

const CardRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`

const DateText = styled.span`
  font-size: 0.8em;
  color: #9ca3af;
`

const CardActions = styled.div`
  display: flex;
  gap: 4px;
`

const PageWrapper = styled.div`
  background: #fff;
  min-height: 100vh;
`

const Inner = styled.div`
  padding: 60px 32px 48px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 28px 16px 48px;
  }
`

const PageTitle = styled.h1`
  font-size: clamp(1.5em, 4vw, 2.2em);
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #bfdbfe;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 4px;
    background: #1d4ed8;
    border-radius: 2px;
  }
`

const SectionTitle = styled.h2`
  font-size: clamp(1.1em, 2.5vw, 1.4em);
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
`

// ════════════════════════════════════════════════════════════
// ✅ QuestionItem 타입에 맞게 date, time, text 필드 포함
const transformQuestionItem = (item: any): QuestionItem => {
  const dateStr = item.created_at
    ? new Date(item.created_at).toLocaleDateString("ko-KR")
    : "-";
  const timeStr = item.created_at
    ? new Date(item.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : "-";

  return {
    id: item.question_id ?? item.id,
    name: item.file_name ?? item.name ?? "untitled",
    displayName: item.file_name ?? item.name ?? "untitled",
    // ✅ 필수 필드 추가
    date: dateStr,
    time: timeStr,
    text: item.question_text ?? item.text ?? item.rawJson ?? "{}",
    createdAt: dateStr,
    displayType: item.question_type ?? item.displayType ?? "기타",
    rawJson: item.question_text ?? item.rawJson ?? "{}",
    favoritedAt: item.favorited_at
      ? new Date(item.favorited_at).toLocaleDateString("ko-KR")
      : undefined,
    favoriteId: item.favorite_id ?? item.favoriteId,
    folderId: item.folder_id ?? item.folderId,
    questionIndex: item.question_index ?? item.questionIndex,
  };
};

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

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");

  // ✅ moveQuestion이 없으므로 폴더이동 = 삭제 후 재추가 방식
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedQuestionForMove, setSelectedQuestionForMove] = useState<QuestionItem | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<number | null>(null);

  const [folderMenuAnchor, setFolderMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFolderForMenu, setSelectedFolderForMenu] = useState<FavoriteFolder | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<QuestionItem | null>(null);
  const [deleteFolderConfirmOpen, setDeleteFolderConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FavoriteFolder | null>(null);

  const loadAllData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [qRes, fRes, folderRes] = await Promise.all([
        questionAPI.getUserQuestions(user.id),
        favoriteAPI.getAllFavoriteQuestions(user.id),
        favoriteAPI.getFolders(user.id),
      ]);

      // ✅ sort에 타입 명시
      setQuestionItems(
        qRes.data.questions
          .map(transformQuestionItem)
          .sort((a: QuestionItem, b: QuestionItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      );
      setFavoriteItems(
        fRes.data.questions
          .map(transformQuestionItem)
          .sort((a: QuestionItem, b: QuestionItem) => {
            const dA = new Date(a.favoritedAt || a.createdAt).getTime();
            const dB = new Date(b.favoritedAt || b.createdAt).getTime();
            return dB - dA;
          })
      );
      setFolders(
        folderRes.data.folders.sort((a: FavoriteFolder, b: FavoriteFolder) => {
          if (a.folder_name === "기본 폴더") return -1;
          if (b.folder_name === "기본 폴더") return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
      );
    } catch (e: any) {
      setError(e.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllData(); }, [user?.id]);

  const handleQuestionSelect = (item: QuestionItem, fromFavorites = false) => {
    setSelectedQuestion({ ...item, isFavoriteContext: fromFavorites });
    setSolveMode(true);
  };

  const handleCloseSolver = async () => {
    setSolveMode(false);
    setSelectedQuestion(null);
    await loadAllData();
  };

  const handleCreateFolder = async () => {
    if (!user?.id || !newFolderName.trim()) return;
    try {
      await favoriteAPI.createFolder({ userId: user.id, folderName: newFolderName.trim(), description: newFolderDescription.trim() });
      await loadAllData();
      setFolderDialogOpen(false);
      setNewFolderName(""); setNewFolderDescription("");
      setSnackbar({ open: true, message: "폴더가 생성되었습니다.", severity: "success" });
    } catch (e: any) {
      setSnackbar({ open: true, message: e.response?.data?.message || "폴더 생성 중 오류가 발생했습니다.", severity: "error" });
    }
  };

  const handleDeleteFolder = async () => {
    if (!user?.id || !folderToDelete) return;
    try {
      await favoriteAPI.deleteFolder(folderToDelete.folder_id, user.id);
      await loadAllData();
      if (selectedFolder === folderToDelete.folder_id) setSelectedFolder(null);
      setSnackbar({ open: true, message: "폴더가 삭제되었습니다.", severity: "success" });
    } catch (e: any) {
      setSnackbar({ open: true, message: e.response?.data?.message || "폴더 삭제 중 오류가 발생했습니다.", severity: "error" });
    } finally {
      setDeleteFolderConfirmOpen(false);
      setFolderToDelete(null);
    }
  };

  // ✅ moveQuestion API 없음 → removeQuestion 후 addQuestion으로 이동 구현
  const handleMoveQuestion = async () => {
    if (!user?.id || !selectedQuestionForMove || !targetFolderId) return;
    try {
      // 기존 즐겨찾기 삭제
      if (selectedQuestionForMove.favoriteId) {
        await favoriteAPI.removeQuestion(selectedQuestionForMove.favoriteId, user.id);
      }
      // 새 폴더에 추가
      await favoriteAPI.addQuestion({
        userId: user.id,
        folderId: targetFolderId,
        questionId: selectedQuestionForMove.id,
        questionIndex: selectedQuestionForMove.questionIndex,
      });
      await loadAllData();
      setMoveDialogOpen(false);
      setSnackbar({ open: true, message: "폴더가 이동되었습니다.", severity: "success" });
    } catch (e: any) {
      setSnackbar({ open: true, message: e.response?.data?.message || "이동 중 오류가 발생했습니다.", severity: "error" });
    }
  };

  const handleDeleteFavorite = (item: QuestionItem) => { setItemToDelete(item); setDeleteConfirmOpen(true); };

  const handleConfirmDeleteFavorite = async () => {
    if (!user?.id || !itemToDelete) return;
    try {
      await favoriteAPI.removeQuestion(itemToDelete.favoriteId!, user.id);
      await loadAllData();
      setSnackbar({ open: true, message: "즐겨찾기에서 삭제되었습니다.", severity: "success" });
    } catch (e: any) {
      setSnackbar({ open: true, message: e.response?.data?.message || "즐겨찾기 삭제 중 오류가 발생했습니다.", severity: "error" });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredFavorites = selectedFolder
    ? favoriteItems.filter((item) => item.folderId === selectedFolder)
    : favoriteItems;

  if (loading) return <Box textAlign="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Box textAlign="center" mt={8}><Alert severity="error">{error}</Alert></Box>;

  return (
    <PageWrapper>
      <Header />
      <PageNavigator />
      <Inner>
        {!solveMode ? (
          <>
            <PageTitle>문제 풀기</PageTitle>

            <Paper elevation={2} sx={{ mb: 4, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main">
                내가 생성한 문제로 학습하기
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                문제를 풀면서 핵심 내용을 다시 한번 확인하세요. 아래 목록에서 문제를 선택하면 해당 문제를 풀어볼 수 있습니다.
              </Typography>
              <Typography variant="body2">
                문제를 풀고 나면 정답과 해설을 통해 자신의 이해도를 확인할 수 있습니다.
              </Typography>
            </Paper>

            {/* ── 내 문제 모음 ── */}
            <Box mb={5}>
              <SectionTitle>❓ 내 문제 모음</SectionTitle>
              <CardList>
                {questionItems.slice((questionPage - 1) * 5, questionPage * 5).map((item) => (
                  // ✅ key prop: item.id 사용 (고유값)
                  <QuestionCard key={item.id} onClick={() => handleQuestionSelect(item, false)}>
                    <CardRow>
                      <PictureAsPdfIcon color="error" sx={{ fontSize: 20, flexShrink: 0 }} />
                      <Typography fontWeight={600} sx={{ fontSize: '0.95em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.displayName}
                      </Typography>
                    </CardRow>
                    <CardMeta>
                      <DateText>{item.createdAt}</DateText>
                      <Chip label={item.displayType || "기타"} size="small" color="secondary" variant="outlined" />
                    </CardMeta>
                  </QuestionCard>
                ))}
                {questionItems.length === 0 && (
                  <Typography color="text.secondary" textAlign="center" py={3}>저장된 항목이 없습니다.</Typography>
                )}
              </CardList>
              {Math.ceil(questionItems.length / 5) > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination count={Math.ceil(questionItems.length / 5)} page={questionPage} onChange={(_, p) => setQuestionPage(p)} color="primary" size="small" />
                </Box>
              )}
            </Box>

            {/* ── 즐겨찾기 ── */}
            <Box mb={5}>
              <SectionHeader>
                <SectionTitle style={{ margin: 0 }}>⭐ 즐겨찾기 문제 모음</SectionTitle>
                <Button variant="contained" size="small" startIcon={<CreateNewFolderIcon />} onClick={() => setFolderDialogOpen(true)}>
                  폴더 추가
                </Button>
              </SectionHeader>

              {/* 폴더 탭 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Paper sx={{ flex: 1, overflow: 'hidden' }}>
                  <Tabs
                    value={selectedFolder}
                    onChange={(_, value) => { setSelectedFolder(value); setFavoritePage(1); }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ '& .MuiTab-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' }, minWidth: { xs: 80, sm: 120 } } }}
                  >
                    <Tab label={`전체 (${favoriteItems.length})`} value={null} icon={<StarIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                    {/* ✅ key prop 명시 */}
                    {folders.map((folder) => (
                      <Tab
                        key={folder.folder_id}
                        label={`${folder.folder_name} (${folder.question_count || 0})`}
                        value={folder.folder_id}
                        icon={<FolderIcon sx={{ fontSize: 16 }} />}
                        iconPosition="start"
                      />
                    ))}
                  </Tabs>
                </Paper>
                {selectedFolder !== null && (
                  <Tooltip title="폴더 관리">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        const folder = folders.find(f => f.folder_id === selectedFolder);
                        if (folder) { setFolderMenuAnchor(e.currentTarget); setSelectedFolderForMenu(folder); }
                      }}
                      sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider" }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* 즐겨찾기 카드 목록 */}
              <CardList>
                {filteredFavorites.slice((favoritePage - 1) * 5, favoritePage * 5).map((item) => (
                  // ✅ key prop 고유값: id + questionIndex 조합
                  <QuestionCard
                    key={`fav-${item.id}-${item.questionIndex ?? "x"}`}
                    style={{ cursor: 'default' }}
                  >
                    <CardRow onClick={() => handleQuestionSelect(item, true)} style={{ cursor: 'pointer' }}>
                      <StarIcon sx={{ fontSize: 18, color: "#FFD700", flexShrink: 0 }} />
                      <Typography fontWeight={600} sx={{ fontSize: '0.95em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.displayName}{item.questionIndex !== undefined && ` - 문제 ${item.questionIndex + 1}`}
                      </Typography>
                    </CardRow>
                    <CardMeta>
                      <DateText onClick={() => handleQuestionSelect(item, true)} style={{ cursor: 'pointer' }}>
                        {item.favoritedAt || item.createdAt}
                      </DateText>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={item.displayType || "기타"} size="small" color="secondary" variant="outlined" />
                        <CardActions>
                          <Tooltip title="폴더 이동">
                            <IconButton size="small" color="primary" onClick={() => { setSelectedQuestionForMove(item); setTargetFolderId(item.folderId ?? null); setMoveDialogOpen(true); }}>
                              <DriveFileMoveIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="즐겨찾기 삭제">
                            <IconButton size="small" color="error" onClick={() => handleDeleteFavorite(item)}>
                              <DeleteForeverIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      </Box>
                    </CardMeta>
                  </QuestionCard>
                ))}
                {filteredFavorites.length === 0 && (
                  <Typography color="text.secondary" textAlign="center" py={3}>
                    {selectedFolder ? "이 폴더에 즐겨찾기한 문제가 없습니다." : "즐겨찾기한 문제가 없습니다."}
                  </Typography>
                )}
              </CardList>

              {Math.ceil(filteredFavorites.length / 5) > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination count={Math.ceil(filteredFavorites.length / 5)} page={favoritePage} onChange={(_, p) => setFavoritePage(p)} color="primary" size="small" />
                </Box>
              )}
            </Box>
          </>
        ) : (
          selectedQuestion && (
            <QuestionSolver
              questionItem={selectedQuestion}
              favoritesList={selectedQuestion.isFavoriteContext ? filteredFavorites : undefined}
              onClose={handleCloseSolver}
            />
          )
        )}
      </Inner>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={10000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 8 }}
      >
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1,
          bgcolor: snackbar.severity === "success" ? "#E8F9EE" : "#FFEBEE",
          color: snackbar.severity === "success" ? "#1a5d3a" : "#c62828",
          borderRadius: 2, boxShadow: 3, px: 2.5, py: 1.5,
          minWidth: { xs: 0, sm: 320 },
          width: { xs: 'calc(100vw - 32px)', sm: 'auto' },
        }}>
          {snackbar.severity === "success" && <CheckCircleOutline sx={{ fontSize: 22, color: "#1a5d3a" }} />}
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 500, flexGrow: 1 }}>{snackbar.message}</Typography>
          <IconButton size="small" onClick={() => setSnackbar(p => ({ ...p, open: false }))} sx={{ color: snackbar.severity === "success" ? "#1a5d3a" : "#c62828" }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>

      {/* 폴더 생성 */}
      <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, m: { xs: 2, sm: 'auto' } } }}>
        <DialogTitle fontWeight={700}>새 폴더 만들기</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="폴더 이름" fullWidth variant="outlined" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} sx={{ mb: 2 }} />
          <TextField margin="dense" label="설명 (선택)" fullWidth variant="outlined" value={newFolderDescription} onChange={e => setNewFolderDescription(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFolderDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>생성</Button>
        </DialogActions>
      </Dialog>

      {/* 폴더 이동 */}
      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, m: { xs: 2, sm: 'auto' } } }}>
        <DialogTitle fontWeight={700}>폴더 이동</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>이동할 폴더를 선택하세요</Typography>
          {folders.map(folder => (
            <Paper
              key={folder.folder_id}
              onClick={() => setTargetFolderId(folder.folder_id)}
              sx={{ p: 1.5, mb: 1, borderRadius: 1.5, border: '1.5px solid', borderColor: targetFolderId === folder.folder_id ? 'primary.main' : 'divider', cursor: 'pointer', bgcolor: targetFolderId === folder.folder_id ? '#eff6ff' : 'transparent' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderIcon color={targetFolderId === folder.folder_id ? 'primary' : 'action'} />
                <Typography fontWeight={500}>{folder.folder_name}</Typography>
              </Box>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMoveDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleMoveQuestion} disabled={!targetFolderId}>이동</Button>
        </DialogActions>
      </Dialog>

      {/* 즐겨찾기 삭제 확인 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3, m: { xs: 2, sm: 'auto' } } }}>
        <DialogTitle fontWeight={700}>즐겨찾기 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 문제를 즐겨찾기에서 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDeleteFavorite}>삭제</Button>
        </DialogActions>
      </Dialog>

      {/* 폴더 삭제 확인 */}
      <Dialog open={deleteFolderConfirmOpen} onClose={() => setDeleteFolderConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3, m: { xs: 2, sm: 'auto' } } }}>
        <DialogTitle fontWeight={700}>폴더 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{folderToDelete?.folder_name}" 폴더를 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteFolderConfirmOpen(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={handleDeleteFolder}>삭제</Button>
        </DialogActions>
      </Dialog>

      {/* 폴더 메뉴 */}
      <Menu anchorEl={folderMenuAnchor} open={Boolean(folderMenuAnchor)} onClose={() => setFolderMenuAnchor(null)}>
        <MenuItem onClick={() => { setFolderToDelete(selectedFolderForMenu); setDeleteFolderConfirmOpen(true); setFolderMenuAnchor(null); }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> 폴더 삭제
        </MenuItem>
      </Menu>
    </PageWrapper>
  );
}