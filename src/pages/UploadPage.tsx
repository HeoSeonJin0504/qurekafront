// src/pages/UploadPage.tsx
import React from "react";
import {
  Container,
  Button,
  Paper,
  Snackbar,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Slide,
  Fade,
  keyframes,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Create,
  LibraryBooks,
  CheckCircleOutline,
  Close,
  Check,
} from "@mui/icons-material";
import styled from "styled-components";
import Header from "../components/Header";
import PageNavigator from "../components/common/PageNavigator";
import SummarySettings from "../components/upload/SummarySettings";
import ProblemSettings from "../components/upload/ProblemSettings";
import { downloadAsPDF } from "../utils/pdfUtils";
import { aiQuestionPromptKeys_Korean } from "../constants/upload";
import SaveNameDialog from "../components/upload/SaveNameDialog";
import SavedSummaryDialog from "../components/upload/SavedSummaryDialog";
import { SummaryItem } from "../services/api";
import FileUploadArea from "../components/upload/FileUploadArea";
import ResultDisplay from "../components/upload/ResultDisplay";
import { ModeSelection, QuestionSourceSelection } from "../components/upload/ModeSelection";
import ErrorDisplay from "../components/upload/ErrorDisplay";
import { useUploadState } from "../hooks/useUploadState";
import { useUploadHandlers } from "../hooks/useUploadHandlers";
import { DbSummaryPromptKey_Korean } from "../types/upload";
import { useNavigate } from "react-router-dom";
import NavigationBlocker from "../components/upload/NavigationBlocker";

// ── MUI keyframes ────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
`;
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// ── Styled: 이전/다음 버튼 래퍼 ─────────────────────────────
// ✅ 문제 2·3 핵심 수정: 버튼 영역 모바일에서 정렬
const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  gap: 12px;

  @media (max-width: 600px) {
    padding: 0 4px;
    gap: 8px;
  }
`

const NavBtn = styled(Button)`
  && {
    border-radius: 12px;
    padding: 10px 28px;
    font-size: 1rem;
    font-weight: 600;
    white-space: nowrap;

    @media (max-width: 600px) {
      padding: 10px 16px;
      font-size: 0.9rem;
      min-width: 0;
    }
  }
`

// ── Styled: 스낵바 최소 너비 모바일 대응 ────────────────────
const SnackbarContent = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 400px;
  background: #E8F9EE;
  color: #1a5d3a;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.12);
  padding: 12px 20px;

  @media (max-width: 600px) {
    min-width: 0;
    width: calc(100vw - 32px);
    flex-wrap: wrap;
  }
`

// ── Particle loading ─────────────────────────────────────────
const ParticleLoading = ({ message }: { message: string }) => (
  <Box
    sx={{
      position: "relative",
      width: "100%",
      minHeight: 400,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
      borderRadius: 4,
      overflow: "hidden",
    }}
  >
    {[...Array(20)].map((_, i) => (
      <Box
        key={i}
        sx={{
          position: "absolute",
          width: Math.random() * 10 + 5,
          height: Math.random() * 10 + 5,
          backgroundColor: "rgba(255,255,255,0.6)",
          borderRadius: "50%",
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `${float} ${Math.random() * 3 + 2}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ))}
    <Avatar
      sx={{
        width: 100, height: 100,
        bgcolor: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
        border: "2px solid rgba(255,255,255,0.3)",
        animation: `${pulse} 2s ease-in-out infinite`,
        mb: 3,
      }}
    >
      <Create sx={{ fontSize: 50, color: "white" }} />
    </Avatar>
    <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 1, textAlign: "center", px: 2 }}>
      {message}
    </Typography>
    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", textAlign: "center" }}>
      잠시만 기다려 주세요.
    </Typography>
    <Box sx={{ width: 260, height: 6, bgcolor: "rgba(255,255,255,0.2)", borderRadius: 3, mt: 4, overflow: "hidden" }}>
      <Box sx={{ width: "100%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)", animation: `${shimmer} 2s infinite` }} />
    </Box>
  </Box>
);

// ════════════════════════════════════════════════════════════
export default function UploadPage() {
  const state = useUploadState();
  const handlers = useUploadHandlers(state);
  const navigate = useNavigate();

  const isGenerating = state.loadingSum || state.loadingQ;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!handlers.validateFile(f)) { e.target.value = ''; return; }
    state.setFile(f);
    state.setFileName(f.name);
    handlers.markStepCompleted(0);
    state.setActiveStep(1);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) state.setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) state.setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    state.setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    if (!handlers.validateFile(droppedFile)) return;
    state.setFile(droppedFile);
    state.setFileName(droppedFile.name);
    handlers.markStepCompleted(0);
    state.setActiveStep(1);
  };

  const handleStepClick = (step: number) => {
    if (isGenerating) return;
    if (state.completedSteps.has(step)) {
      const newCompletedSteps = new Set(state.completedSteps);
      for (let i = step; i < steps.length; i++) newCompletedSteps.delete(i);
      state.setCompletedSteps(newCompletedSteps);
      if (state.mode === 'summary') {
        if (step <= 2) state.setSummaryText('');
        if (step <= 4) { state.setQuestionText(''); state.setParsedQuestions([]); state.setIsJsonFormat(false); state.setQuestionError(false); }
      } else if (state.mode === 'question') {
        if (step <= 2) { state.setQuestionText(''); state.setParsedQuestions([]); state.setIsJsonFormat(false); state.setQuestionError(false); }
      }
      state.setActiveStep(step);
    }
  };

  const handleNext = () => {
    if (state.mode === 'summary') {
      if (state.activeStep === 1 && !state.summaryText) { handlers.markStepCompleted(1); state.setActiveStep(2); handlers.handleGenerateSummary(); }
      else if (state.activeStep === 3 && !state.questionText) { handlers.markStepCompleted(3); state.setActiveStep(4); handlers.handleGenerateQuestion(); }
      else state.setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else if (state.mode === 'question' && state.questionSource === 'upload') {
      if (state.activeStep === 1 && !state.questionText) { handlers.markStepCompleted(1); state.setActiveStep(2); handlers.handleGenerateQuestionFromFile(); }
      else state.setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else if (state.mode === 'question' && state.questionSource === 'saved') {
      if (state.activeStep === 1 && !state.questionText) { handlers.markStepCompleted(1); state.setActiveStep(2); handlers.handleGenerateQuestion(); }
      else state.setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    if (state.activeStep === 0) {
      state.setMode(null); state.setQuestionSource(null); state.setFile(null); state.setFileName(null);
      state.setSummaryText(''); state.setQuestionText(''); state.setIsSummarySelected(false); state.setCompletedSteps(new Set());
    } else {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.delete(state.activeStep);
      state.setCompletedSteps(newCompletedSteps);
      if (state.mode === 'summary' && state.activeStep === 2) { state.setSummaryText(''); newCompletedSteps.delete(1); state.setCompletedSteps(newCompletedSteps); }
      if (state.mode === 'summary' && state.activeStep === 4) { state.setQuestionText(''); state.setParsedQuestions([]); state.setIsJsonFormat(false); newCompletedSteps.delete(3); state.setCompletedSteps(newCompletedSteps); }
      if (state.mode === 'question' && state.questionSource === 'upload' && state.activeStep === 2) { state.setQuestionText(''); state.setParsedQuestions([]); state.setIsJsonFormat(false); newCompletedSteps.delete(1); state.setCompletedSteps(newCompletedSteps); }
      if (state.mode === 'question' && state.questionSource === 'saved' && state.activeStep === 2) { state.setQuestionText(''); state.setParsedQuestions([]); state.setIsJsonFormat(false); newCompletedSteps.delete(1); state.setCompletedSteps(newCompletedSteps); }
      state.setActiveStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleRegenerate = (type: 'summary' | 'question') => {
    if (type === 'summary') { state.setSummaryText(''); state.setSummaryError(false); state.setActiveStep(2); handlers.handleGenerateSummary(); }
    else {
      state.setQuestionText(''); state.setParsedQuestions([]); state.setIsJsonFormat(false); state.setQuestionError(false);
      if (state.mode === 'summary') { state.setActiveStep(4); handlers.handleGenerateQuestion(); }
      else if (state.mode === 'question' && state.questionSource === 'upload') { state.setActiveStep(2); handlers.handleGenerateQuestionFromFile(); }
      else if (state.mode === 'question' && state.questionSource === 'saved') { state.setActiveStep(2); handlers.handleGenerateQuestion(); }
    }
  };

  const handleRetrySummary = () => {
    state.setSummaryError(false); state.setSummaryText('');
    state.setActiveStep(state.summaryErrorType === 'short_text' ? 0 : 1);
    if (state.summaryErrorType === 'short_text') { state.setFile(null); state.setFileName(null); }
  };

  const handleRetryQuestion = () => {
    state.setQuestionError(false); state.setQuestionText(''); state.setParsedQuestions([]); state.setIsJsonFormat(false);
    if (state.questionErrorType === 'short_text') { state.setActiveStep(0); state.setFile(null); state.setFileName(null); }
    else state.setActiveStep(state.mode === 'summary' ? 3 : 1);
  };

  const handleModeSelect = (selectedMode: 'summary' | 'question' | null) => {
    state.setMode(selectedMode);
    if (selectedMode === 'summary') { state.setActiveStep(0); state.setCompletedSteps(new Set()); }
  };

  const handleQuestionSourceSelect = (source: 'upload' | 'saved' | null) => {
    state.setQuestionSource(source);
    if (source === 'upload') { state.setActiveStep(0); state.setCompletedSteps(new Set()); }
    else if (source === 'saved') { state.setIsSummarySelected(false); state.setActiveStep(0); state.setCompletedSteps(new Set()); }
  };

  const handleSelectSavedSummary = (summary: SummaryItem) => {
    state.setSummaryText(summary.summary_text); state.setFileName(summary.file_name);
    state.setDbSummaryTypeKorean(summary.summary_type as DbSummaryPromptKey_Korean);
    state.setIsSummarySelected(true); handlers.markStepCompleted(0);
    state.setActiveStep(0); state.setOpenSavedSummariesDialog(false);
  };

  const handleSave = (type: 'summary' | 'question') => { state.setSaveDialogType(type); state.setOpenSaveNameDialog(true); };

  const getSteps = () => {
    if (state.mode === 'summary') return ["파일 업로드", "요약 설정", "요약 생성", "문제 설정", "문제 생성"];
    else if (state.mode === 'question') {
      if (state.questionSource === 'upload') return ["파일 업로드", "문제 설정", "문제 생성"];
      else if (state.questionSource === 'saved') return ["요약본 선택", "문제 설정", "문제 생성"];
    }
    return ["방법 선택"];
  };
  const steps = getSteps();

  const renderStep = (step: number) => {
    if (state.mode === 'summary') {
      if (step === 0) return <FileUploadArea file={state.file} fileName={state.fileName} isDragging={state.isDragging} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onFileChange={handleFileUpload} />;
      if (step === 1) return (<Slide direction="left" in timeout={500}><Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)" }}><Typography variant="h5" gutterBottom fontWeight={700} mb={3}>⚙️ 요약 설정</Typography><SummarySettings sumTab={state.sumTab} setSumTab={state.setSumTab} sumField={state.sumField} setSumField={state.setSumField} sumLevel={state.sumLevel} setSumLevel={state.setSumLevel} sumSentCount={state.sumSentCount} setSumSentCount={state.setSumSentCount} sumTopicCount={state.sumTopicCount} setSumTopicCount={state.setSumTopicCount} sumKeywordCount={state.sumKeywordCount} setSumKeywordCount={state.setSumKeywordCount} keywords={state.keywords} setKeywords={state.setKeywords} setAiSummaryType={state.setAiSummaryType} setDbSummaryTypeKorean={state.setDbSummaryTypeKorean} /></Paper></Slide>);
      if (step === 2) return state.loadingSum ? <ParticleLoading message="문서를 요약하고 있습니다" /> : state.summaryError ? <ErrorDisplay errorMessage={state.summaryErrorMessage} errorType={state.summaryErrorType} onRetry={handleRetrySummary} /> : (state.summaryText != null) ? <ResultDisplay type="summary" text={state.summaryText} fileName={state.fileName || "summary"} contentType={state.dbSummaryTypeKorean} onTextChange={state.setSummaryText} onSave={() => handleSave('summary')} onDownload={() => downloadAsPDF(state.summaryText, state.fileName || "summary", state.dbSummaryTypeKorean)} onRegenerate={() => handleRegenerate('summary')} disabled={isGenerating} /> : null;
      if (step === 3) return (<Slide direction="left" in timeout={500}><Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)" }}><Typography variant="h5" gutterBottom fontWeight={700} mb={3}>⚙️ 문제 설정</Typography><ProblemSettings qTab={state.qTab} setQTab={state.setQTab} qField={state.qField} setQField={state.setQField} qLevel={state.qLevel} setQLevel={state.setQLevel} qCount={state.qCount} setQCount={state.setQCount} optCount={state.optCount} setOptCount={state.setOptCount} blankCount={state.blankCount} setBlankCount={state.setBlankCount} optionFormat={state.optionFormat} setOptionFormat={state.setOptionFormat} summaryText={state.summaryText} openSummaryDialog={state.openSummaryDialog} setOpenSummaryDialog={state.setOpenSummaryDialog} openSavedSummariesDialog={() => {}} hasSummaryText={!!state.summaryText} showSavedSummaryButton={false} /></Paper></Slide>);
      if (step === 4) return state.loadingQ ? <ParticleLoading message="문제를 생성하고 있습니다" /> : state.questionError ? <ErrorDisplay errorMessage={state.questionErrorMessage} errorType={state.questionErrorType} onRetry={handleRetryQuestion} /> : state.questionText && state.isJsonFormat ? <ResultDisplay type="question" text={state.questionText} isJsonFormat={state.isJsonFormat} parsedQuestions={state.parsedQuestions} fileName={state.fileName || "questions"} contentType={aiQuestionPromptKeys_Korean[state.qTab]} onSave={() => handleSave('question')} onDownload={() => downloadAsPDF(state.questionText, state.fileName || "questions", aiQuestionPromptKeys_Korean[state.qTab])} onRegenerate={() => handleRegenerate('question')} disabled={isGenerating} /> : null;
    }
    if (state.mode === 'question' && state.questionSource === 'upload') {
      if (step === 0) return <FileUploadArea file={state.file} fileName={state.fileName} isDragging={state.isDragging} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onFileChange={handleFileUpload} />;
      if (step === 1) return (<Slide direction="left" in timeout={500}><Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)" }}><Typography variant="h5" gutterBottom fontWeight={700} mb={3}>⚙️ 문제 설정</Typography><ProblemSettings qTab={state.qTab} setQTab={state.setQTab} qField={state.qField} setQField={state.setQField} qLevel={state.qLevel} setQLevel={state.setQLevel} qCount={state.qCount} setQCount={state.setQCount} optCount={state.optCount} setOptCount={state.setOptCount} blankCount={state.blankCount} setBlankCount={state.setBlankCount} optionFormat={state.optionFormat} setOptionFormat={state.setOptionFormat} summaryText="" openSummaryDialog={false} setOpenSummaryDialog={() => {}} openSavedSummariesDialog={() => {}} hasSummaryText={false} /></Paper></Slide>);
      if (step === 2) return state.loadingQ ? <ParticleLoading message="문제를 생성하고 있습니다" /> : state.questionError ? <ErrorDisplay errorMessage={state.questionErrorMessage} errorType={state.questionErrorType} onRetry={handleRetryQuestion} /> : state.questionText && state.isJsonFormat ? <ResultDisplay type="question" text={state.questionText} isJsonFormat={state.isJsonFormat} parsedQuestions={state.parsedQuestions} fileName={state.fileName || "questions"} contentType={aiQuestionPromptKeys_Korean[state.qTab]} onSave={() => handleSave('question')} onDownload={() => downloadAsPDF(state.questionText, state.fileName || "questions", aiQuestionPromptKeys_Korean[state.qTab])} onRegenerate={() => handleRegenerate('question')} disabled={isGenerating} /> : null;
    }
    if (state.mode === 'question' && state.questionSource === 'saved') {
      if (step === 0) return (
        <Fade in timeout={500}>
          <Paper elevation={6} sx={{ p: { xs: 3, sm: 6 }, borderRadius: 4, background: "#ffffff", textAlign: "center" }}>
            <Avatar sx={{ width: { xs: 80, sm: 120 }, height: { xs: 80, sm: 120 }, margin: "0 auto 20px", background: state.isSummarySelected ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
              {state.isSummarySelected ? <CheckCircle sx={{ fontSize: { xs: 40, sm: 60 } }} /> : <LibraryBooks sx={{ fontSize: { xs: 40, sm: 60 } }} />}
            </Avatar>
            <Typography variant="h5" gutterBottom fontWeight={700}>{state.isSummarySelected ? "요약본 선택 완료!" : "요약본을 선택해주세요"}</Typography>
            {state.isSummarySelected ? (
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>선택한 요약본: {state.fileName || "untitled"}</Typography>
                <Paper sx={{ p: 2, maxHeight: 240, overflow: "auto", bgcolor: "#f8fafc", borderRadius: 2, mb: 3, border: '1px solid', borderColor: 'divider', textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{state.summaryText}</Typography>
                </Paper>
                <Button variant="outlined" startIcon={<LibraryBooks />} onClick={() => state.setOpenSavedSummariesDialog(true)} sx={{ borderRadius: 2, px: 3, borderWidth: 2, borderColor: "#10b981", color: "#10b981", "&:hover": { borderWidth: 2, borderColor: "#059669", bgcolor: "rgba(16,185,129,0.04)" } }}>요약본 다시 선택하기</Button>
              </>
            ) : (
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>아래 버튼을 클릭하여 저장된 요약본을 선택하세요</Typography>
                <Button variant="contained" size="large" startIcon={<LibraryBooks />} onClick={() => state.setOpenSavedSummariesDialog(true)} sx={{ borderRadius: 3, px: 4, py: 1.5, background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", "&:hover": { background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" } }}>요약본 선택하기</Button>
              </>
            )}
          </Paper>
        </Fade>
      );
      if (step === 1) return (<Slide direction="left" in timeout={500}><Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)" }}><Typography variant="h5" gutterBottom fontWeight={700} mb={3}>⚙️ 문제 설정</Typography><ProblemSettings qTab={state.qTab} setQTab={state.setQTab} qField={state.qField} setQField={state.setQField} qLevel={state.qLevel} setQLevel={state.setQLevel} qCount={state.qCount} setQCount={state.setQCount} optCount={state.optCount} setOptCount={state.setOptCount} blankCount={state.blankCount} setBlankCount={state.setBlankCount} optionFormat={state.optionFormat} setOptionFormat={state.setOptionFormat} summaryText={state.summaryText} openSummaryDialog={state.openSummaryDialog} setOpenSummaryDialog={state.setOpenSummaryDialog} openSavedSummariesDialog={() => state.setOpenSavedSummariesDialog(true)} hasSummaryText={!!state.summaryText} /></Paper></Slide>);
      if (step === 2) return state.loadingQ ? <ParticleLoading message="문제를 생성하고 있습니다" /> : state.questionError ? <ErrorDisplay errorMessage={state.questionErrorMessage} errorType={state.questionErrorType} onRetry={handleRetryQuestion} /> : state.questionText && state.isJsonFormat ? <ResultDisplay type="question" text={state.questionText} isJsonFormat={state.isJsonFormat} parsedQuestions={state.parsedQuestions} fileName={state.fileName || "questions"} contentType={aiQuestionPromptKeys_Korean[state.qTab]} onSave={() => handleSave('question')} onDownload={() => downloadAsPDF(state.questionText, state.fileName || "questions", aiQuestionPromptKeys_Korean[state.qTab])} onRegenerate={() => handleRegenerate('question')} disabled={isGenerating} /> : null;
    }
    return null;
  };

  const handleForceNavigation = () => { state.setLoadingSum(false); state.setLoadingQ(false); };

  // ── 다음 버튼 비활성 조건 ──────────────────────────────────
  const isNextDisabled =
    (state.mode === 'summary' && state.activeStep === 0 && !state.file) ||
    (state.mode === 'summary' && state.activeStep === 2 && !state.summaryText) ||
    (state.mode === 'summary' && state.activeStep === 4 && !state.questionText) ||
    (state.mode === 'question' && state.questionSource === 'upload' && state.activeStep === 0 && !state.file) ||
    (state.mode === 'question' && state.questionSource === 'upload' && state.activeStep === 2 && !state.questionText) ||
    (state.mode === 'question' && state.questionSource === 'saved' && state.activeStep === 0 && !state.isSummarySelected) ||
    (state.mode === 'question' && state.questionSource === 'saved' && state.activeStep === 2 && !state.questionText) ||
    (state.mode === 'summary' && state.activeStep === steps.length - 1) ||
    (state.mode === 'question' && state.activeStep === steps.length - 1) ||
    isGenerating;

  const nextLabel =
    (state.mode === 'summary' && state.activeStep === 1) ? "요약 생성" :
    (state.mode === 'summary' && state.activeStep === 3) ? "문제 생성" :
    (state.mode === 'question' && state.activeStep === steps.length - 2) ? "문제 생성" : "다음";

  // ── 스낵바 공통 렌더 ─────────────────────────────────────
  const renderSnackbar = (
    open: boolean,
    onClose: () => void,
    message: string,
  ) => (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={10000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <SnackbarContent>
        <CheckCircleOutline sx={{ fontSize: 22, color: '#1a5d3a', flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 500, flexGrow: 1, color: '#1a5d3a' }}>
          {message}
        </Typography>
        <Button
          variant="contained" size="small"
          onClick={() => { onClose(); navigate('/mypage'); }}
          sx={{ bgcolor: '#34C759', color: 'white', fontWeight: 600, textTransform: 'none', borderRadius: 1.5, px: 1.5, py: 0.5, flexShrink: 0, '&:hover': { bgcolor: '#28a745' } }}
        >
          마이페이지
        </Button>
        <IconButton size="small" onClick={onClose} sx={{ color: '#1a5d3a', '&:hover': { bgcolor: 'rgba(26,93,58,0.1)' } }}>
          <Close fontSize="small" />
        </IconButton>
      </SnackbarContent>
    </Snackbar>
  );

  return (
    <>
      <Header />
      <PageNavigator />
      <NavigationBlocker
        when={isGenerating}
        message={state.loadingSum ? "요약본 생성 중입니다. 페이지를 나가시겠습니까?" : "문제 생성 중입니다. 페이지를 나가시겠습니까?"}
        onNavigationAttempt={handleForceNavigation}
      />

      <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 4 }, pt: { xs: 3, sm: 12 }, background: "#ffffff" }}>
        <Container maxWidth="lg">
          {!state.mode ? (
            <ModeSelection onSelectMode={handleModeSelect} />
          ) : state.mode === 'question' && !state.questionSource ? (
            <QuestionSourceSelection onSelectSource={handleQuestionSourceSelect} />
          ) : (
            <>
              {/* ✅ 문제 2·3 수정: 스테퍼 모바일 대응 */}
              <Paper
                elevation={4}
                sx={{
                  p: { xs: 2, sm: 4 },
                  borderRadius: 4,
                  mb: 3,
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(59,130,246,0.1)",
                  overflowX: 'auto', // 스텝이 많을 때 가로 스크롤
                }}
              >
                <Stepper
                  activeStep={state.activeStep}
                  alternativeLabel
                  sx={{
                    // 모바일에서 스텝 라벨 폰트 줄이기
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.7rem', sm: '1rem' },
                      fontWeight: 600,
                    },
                    '& .MuiStepIcon-root': { color: "#93c5fd" },
                    '& .MuiStepIcon-root.Mui-active': { color: "#3b82f6" },
                    '& .MuiStepIcon-root.Mui-completed': { color: "#10b981" },
                    minWidth: steps.length >= 5 ? { xs: 400, sm: 'auto' } : 'auto',
                  }}
                >
                  {steps.map((label, index) => {
                    const isCompleted = state.completedSteps.has(index);
                    const isClickable = !isGenerating && isCompleted;
                    return (
                      <Step
                        key={label}
                        completed={isCompleted}
                        sx={{ cursor: isClickable ? 'pointer' : 'default' }}
                        onClick={() => handleStepClick(index)}
                      >
                        <StepLabel
                          StepIconComponent={isCompleted ? () => (
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#10b981', color: 'white' }}>
                              <Check sx={{ fontSize: 16 }} />
                            </Box>
                          ) : undefined}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Paper>

              <Box sx={{ minHeight: 400, mb: 3 }}>
                {renderStep(state.activeStep)}
              </Box>

              {/* ✅ 문제 2·3 수정: 이전/다음 버튼 모바일 정렬 */}
              <NavRow>
                <NavBtn
                  disabled={!state.mode || isGenerating}
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  size="large"
                  sx={{
                    color: "#3b82f6",
                    "&:hover": { bgcolor: "rgba(59,130,246,0.08)" },
                    "&.Mui-disabled": { color: "rgba(0,0,0,0.26)" },
                  }}
                >
                  이전
                </NavBtn>
                <NavBtn
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  disabled={isNextDisabled}
                  size="large"
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)",
                    boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
                    "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #0e7490 100%)" },
                  }}
                >
                  {nextLabel}
                </NavBtn>
              </NavRow>
            </>
          )}
        </Container>

        <SavedSummaryDialog open={state.openSavedSummariesDialog} onClose={() => state.setOpenSavedSummariesDialog(false)} onSelectSummary={handleSelectSavedSummary} />
        <SaveNameDialog open={state.openSaveNameDialog} onClose={() => state.setOpenSaveNameDialog(false)} onSave={handlers.handleConfirmSave} defaultName={state.fileName || 'untitled'} title={state.saveDialogType === 'summary' ? '요약 저장' : '문제 저장'} type={state.saveDialogType} />

        {renderSnackbar(state.openSumDoneSnackbar, () => state.setOpenSumDoneSnackbar(false), "요약 저장이 완료되었습니다!")}
        {renderSnackbar(state.openQDoneSnackbar, () => state.setOpenQDoneSnackbar(false), "문제 저장이 완료되었습니다!")}
      </Box>
    </>
  );
}