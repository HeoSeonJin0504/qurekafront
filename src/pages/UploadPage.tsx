import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Paper,
  TextField,
  Snackbar,
  Alert,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Avatar,
  IconButton,
  Fade,
  Slide,
  keyframes,
  Card,
  CardContent,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  AutoAwesome,
  Rocket,
  Create,
  Description,
  Quiz,
  LibraryBooks,
} from "@mui/icons-material";
import Header from "../components/Header";
import PageNavigator from "../components/common/PageNavigator";
import SummarySettings from "../components/upload/SummarySettings";
import ProblemSettings from "../components/upload/ProblemSettings";
import QuestionRenderer from "../components/upload/QuestionRenderer";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  aiSummaryAPI,
  aiQuestionAPI,
  summaryAPI,
  questionAPI,
} from "../services/api";
import { downloadAsPDF } from "../utils/pdfUtils";
import {
  AiSummaryPromptKey,
  DbSummaryPromptKey_Korean,
  Question,
} from "../types/upload";
import {
  aiSummaryPromptKeys,
  dbSummaryPromptKeys_Korean,
  aiQuestionPromptKeys_Korean,
} from "../constants/upload";
import SaveNameDialog from "../components/upload/SaveNameDialog";
import SavedSummaryDialog from "../components/upload/SavedSummaryDialog";
import { SummaryItem } from "../services/api";

// 모드 타입 정의
type Mode = 'summary' | 'question' | null;
type QuestionSource = 'upload' | 'saved' | null;

// 단계 애니메이션
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

// 파티클 로딩 컴포넌트 - 블루 테마
const ParticleLoading = ({ message }: { message: string }) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // 보라색 → 파란색 그라데이션으로 변경
        background: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* 배경 파티클 */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `${float} ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* 중앙 로딩 아이콘 - 메모 아이콘으로 변경 */}
      <Avatar
        sx={{
          width: 120,
          height: 120,
          bgcolor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          animation: `${pulse} 2s ease-in-out infinite`,
          mb: 3,
        }}
      >
        <Create sx={{ fontSize: 60, color: "white" }} />
      </Avatar>

      <Typography
        variant="h4"
        sx={{
          color: "white",
          fontWeight: 700,
          mb: 2,
          textAlign: "center",
          textShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        {message}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "rgba(255, 255, 255, 0.9)",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        잠시만 기다려 주세요.
      </Typography>

      {/* 프로그레스 바 */}
      <Box
        sx={{
          width: 300,
          height: 6,
          bgcolor: "rgba(255, 255, 255, 0.2)",
          borderRadius: 3,
          mt: 4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
            animation: `${shimmer} 2s infinite`,
          }}
        />
      </Box>
    </Box>
  );
};

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 모드 상태
  const [mode, setMode] = useState<Mode>(null);
  const [questionSource, setQuestionSource] = useState<QuestionSource>(null);
  const [openSavedSummariesDialog, setOpenSavedSummariesDialog] = useState(false);
  const [isSummarySelected, setIsSummarySelected] = useState(false); // 요약본 선택 여부 추가

  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // 요약 상태
  const [sumTab, setSumTab] = useState(0);
  const [aiSummaryType, setAiSummaryType] = useState<AiSummaryPromptKey>(
    aiSummaryPromptKeys[0]
  );
  const [dbSummaryTypeKorean, setDbSummaryTypeKorean] =
    useState<DbSummaryPromptKey_Korean>(dbSummaryPromptKeys_Korean[0]);
  const [sumField, setSumField] = useState("언어");
  const [sumLevel, setSumLevel] = useState("비전공자");
  const [sumSentCount, setSumSentCount] = useState(3);
  const [summaryText, setSummaryText] = useState("");
  const [loadingSum, setLoadingSum] = useState(false);
  const [sumTopicCount, setSumTopicCount] = useState(1);
  const [sumKeywordCount, setSumKeywordCount] = useState(3);
  const [keywords, setKeywords] = useState<string[]>([]);

  // 문제 상태
  const [qTab, setQTab] = useState(0);
  const [qField, setQField] = useState("언어");
  const [qLevel, setQLevel] = useState("비전공자");
  const [qCount, setQCount] = useState(3);
  const [optCount, setOptCount] = useState(4);
  const [blankCount, setBlankCount] = useState(1);
  const [questionText, setQuestionText] = useState("");
  const [loadingQ, setLoadingQ] = useState(false);
  const [optionFormat, setOptionFormat] = useState("단답형");
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [isJsonFormat, setIsJsonFormat] = useState(false);

  // 기타 상태
  const [openSumDoneSnackbar, setOpenSumDoneSnackbar] = useState(false);
  const [openQDoneSnackbar, setOpenQDoneSnackbar] = useState(false);
  const [openSaveNameDialog, setOpenSaveNameDialog] = useState(false);
  const [saveDialogType, setSaveDialogType] = useState<'summary' | 'question'>('summary');
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false); // 현재 요약본 보기 다이얼로그 상태 추가

  // 드래그 상태 추가
  const [isDragging, setIsDragging] = useState(false);

  // 파일 유효성 검사 함수 (공통)
  const validateFile = (f: File): boolean => {
    // 파일 확장자 검사 (PDF, PPT, PPTX만 허용)
    const allowedExtensions = ['pdf', 'ppt', 'pptx'];
    const fileExtension = f.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert('PDF, PPT, PPTX 파일만 업로드 가능합니다.');
      return false;
    }
    
    // 파일명 유효성 검사 (확장자 제외)
    const fileNameWithoutExt = f.name.substring(0, f.name.lastIndexOf('.'));
    const validFileNamePattern = /^[가-힣a-zA-Z0-9.\-_()[\]% ]+$/;
    
    if (!validFileNamePattern.test(fileNameWithoutExt)) {
      alert('파일명에는 한글, 영문, 숫자, 공백, 그리고 . - _ ( ) [ ] % 기호만 사용할 수 있습니다.');
      return false;
    }
    
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    
    if (!f) return;
    
    if (!validateFile(f)) {
      e.target.value = ''; // input 초기화
      return;
    }
    
    setFile(f);
    setFileName(f.name);
    if (f) setActiveStep(1);
  };

  // 드래그 앤 드롭 핸들러 수정
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Paper의 경계를 벗어날 때만 isDragging을 false로 설정
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!validateFile(droppedFile)) return;

    setFile(droppedFile);
    setFileName(droppedFile.name);
    setActiveStep(1);
  };

  const handleNext = () => {
    // 요약 생성 모드 - 요약 생성 후 문제 생성 단계로 진행
    if (mode === 'summary') {
      if (activeStep === 1 && !summaryText) {
        // 요약 설정 단계에서 요약 생성
        setActiveStep(2);
        handleGenerateSummary();
      } else if (activeStep === 3 && !questionText) {
        // 문제 설정 단계에서 문제 생성
        setActiveStep(4);
        handleGenerateQuestion();
      } else {
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    }
    // 문제 생성 모드 - 파일 업로드 (요약 단계 제거)
    else if (mode === 'question' && questionSource === 'upload') {
      if (activeStep === 1 && !questionText) {
        setActiveStep(2);
        handleGenerateQuestionFromFile(); // 직접 파일에서 문제 생성
      } else {
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    }
    // 문제 생성 모드 - 저장된 요약본
    else if (mode === 'question' && questionSource === 'saved') {
      if (activeStep === 1 && !questionText) {
        setActiveStep(2);
        handleGenerateQuestion();
      } else {
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      // 첫 단계에서 뒤로가기 시 모드 초기화
      setMode(null);
      setQuestionSource(null);
      setFile(null);
      setFileName(null);
      setSummaryText("");
      setQuestionText("");
      setIsSummarySelected(false); // 초기화 추가
    } else {
      setActiveStep((prev) => Math.max(prev - 1, 0));
    }
  };

  // 그만하기 핸들러 추가
  const handleStop = () => {
    // 모든 상태 초기화
    setMode(null);
    setQuestionSource(null);
    setActiveStep(0);
    setFile(null);
    setFileName(null);
    setSummaryText("");
    setQuestionText("");
    setIsSummarySelected(false);
    setParsedQuestions([]);
    setIsJsonFormat(false);
  };

  // 모드 선택 핸들러
  const handleModeSelect = (selectedMode: Mode) => {
    setMode(selectedMode);
    if (selectedMode === 'summary') {
      setActiveStep(0);
    }
  };

  // 문제 생성 소스 선택 핸들러
  const handleQuestionSourceSelect = (source: QuestionSource) => {
    setQuestionSource(source);
    if (source === 'upload') {
      setActiveStep(0);
    } else if (source === 'saved') {
      setIsSummarySelected(false); // 초기화
      setActiveStep(0); // 요약본 선택 확인 단계로 먼저 이동
      // 모달은 버튼 클릭 시 열리도록 변경
    }
  };

  // 저장된 요약본 선택 핸들러
  const handleSelectSavedSummary = (summary: SummaryItem) => {
    setSummaryText(summary.summary_text);
    setFileName(summary.file_name);
    setDbSummaryTypeKorean(summary.summary_type as DbSummaryPromptKey_Korean);
    setIsSummarySelected(true); // 선택 완료 표시
    setActiveStep(0); // 요약본 선택 확인 단계로
    setOpenSavedSummariesDialog(false);
  };

  const handleGenerateSummary = async () => {
    if (!file || !user) return alert("파일 선택 및 로그인 필요");
    setLoadingSum(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("summary_type", aiSummaryType);
      fd.append("field", sumField);
      fd.append("level", sumLevel);
      fd.append("sentence_count", String(sumSentCount));
      if (sumTab === 2) fd.append("topic_count", String(sumTopicCount));
      if (sumTab === 4) {
        fd.append("keyword_count", String(sumKeywordCount));
        if (sumKeywordCount > 0) {
          const validKeywords = keywords.filter((k) => k && k.trim().length > 0);
          if (validKeywords.length > 0) {
            fd.append("user_keywords", validKeywords.join(","));
          }
        }
      }

      const res = await aiSummaryAPI.generateSummary(fd);
      setSummaryText(res.data.summary);
      setActiveStep(2);
    } catch (e: any) {
      alert(e.response?.data?.detail || "요약 생성 오류");
    } finally {
      setLoadingSum(false);
    }
  };

  // 파일에서 직접 문제 생성 (새로운 함수)
  const handleGenerateQuestionFromFile = async () => {
    if (!file || !user) return alert("파일 선택 및 로그인 필요");
    setLoadingQ(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("generation_type", `문제 생성_${aiQuestionPromptKeys_Korean[qTab]}`);
      fd.append("field", qField);
      fd.append("level", qLevel);
      fd.append("question_count", String(qCount));
      
      if (qTab === 0) {
        fd.append("choice_count", String(optCount));
        fd.append("choice_format", optionFormat);
      }
      if (qTab === 1) fd.append("array_choice_count", String(optCount));
      if (qTab === 2) fd.append("blank_count", String(blankCount));

      const res = await aiQuestionAPI.generateQuestionsFromFile(fd);
      setQuestionText(res.data.result);
      parseQuestionJson(res.data.result);
      setActiveStep(2);
    } catch (e: any) {
      alert(e.response?.data?.detail || "문제 생성 오류");
    } finally {
      setLoadingQ(false);
    }
  };

  const parseQuestionJson = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      if (data.questions && Array.isArray(data.questions)) {
        if (data.questions.length === 0) {
          alert("문제가 생성되지 않았습니다.\n다시 한 번 시도해주세요.");
          setIsJsonFormat(false);
          setParsedQuestions([]);
          return false;
        }
        setParsedQuestions(data.questions);
        setIsJsonFormat(true);
        return true;
      }
      return false;
    } catch (error) {
      setIsJsonFormat(false);
      return false;
    }
  };

  const handleGenerateQuestion = async () => {
    if (!summaryText || !user) return alert("요약 후 문제 생성을 눌러주세요");
    setLoadingQ(true);
    try {
      const payload: any = {
        generation_type: `문제 생성_${aiQuestionPromptKeys_Korean[qTab]}`,
        summary_text: summaryText,
        field: qField,
        level: qLevel,
        question_count: qCount,
      };
      if (qTab === 0) {
        payload.choice_count = optCount;
        payload.choice_format = optionFormat;
      }
      if (qTab === 1) payload.array_choice_count = optCount;
      if (qTab === 2) payload.blank_count = blankCount;

      const res = await aiQuestionAPI.generateQuestions(payload);
      setQuestionText(res.data.result);
      parseQuestionJson(res.data.result);
      
      // 모드에 따라 다른 step으로 이동
      if (mode === 'summary') {
        setActiveStep(4); // 요약본 및 문제 생성 모드
      } else if (mode === 'question' && questionSource === 'saved') {
        setActiveStep(2); // 저장된 요약본 모드
      }
    } catch (e: any) {
      alert(e.response?.data?.detail || "문제 생성 오류");
    } finally {
      setLoadingQ(false);
    }
  };

  const handleSave = (type: 'summary' | 'question') => {
    setSaveDialogType(type);
    setOpenSaveNameDialog(true);
  };

  const handleConfirmSave = async (customName: string) => {
    if (!user || !fileName) return;
    try {
      if (saveDialogType === 'summary') {
        await summaryAPI.saveSummary({
          userId: user.id,
          fileName: fileName,
          summaryName: customName,
          summaryType: dbSummaryTypeKorean,
          summaryText,
        });
        setOpenSumDoneSnackbar(true);
      } else {
        await questionAPI.saveQuestion({
          userId: user.id,
          fileName: fileName,
          questionName: customName,
          questionType: aiQuestionPromptKeys_Korean[qTab],
          questionText,
        });
        setOpenQDoneSnackbar(true);
      }
      setOpenSaveNameDialog(false);
    } catch (e) {
      alert("저장 중 오류");
    }
  };

  // 동적 단계 생성
  const getSteps = () => {
    if (mode === 'summary') {
      return ["파일 업로드", "요약 설정", "요약 생성", "문제 설정", "문제 생성"];
    } else if (mode === 'question') {
      if (questionSource === 'upload') {
        return ["파일 업로드", "문제 설정", "문제 생성"];
      } else if (questionSource === 'saved') {
        return ["요약본 선택", "문제 설정", "문제 생성"];
      }
    }
    return ["방법 선택"];
  };

  const steps = getSteps();

  const renderStepContent = () => {
    // 모드 선택 화면
    if (!mode) {
      return (
        <Fade in timeout={500}>
          <Box sx={{ py: 4 }}>
            <Typography variant="h3" align="center" gutterBottom fontWeight={700} sx={{ mb: 6 }}>
              무엇을 생성하시겠습니까?
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
              {/* 요약본 생성 카드 */}
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
                onClick={() => handleModeSelect('summary')}
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
                    파일을 업로드하여 요약본을 생성합니다
                  </Typography>
                </CardContent>
              </Card>

              {/* 문제 생성 카드 */}
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
                onClick={() => handleModeSelect('question')}
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
                    바로 문제 생성
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    파일 또는 요약본을 기반으로 문제를 생성합니다
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Fade>
      );
    }

    // 문제 생성 소스 선택 화면
    if (mode === 'question' && !questionSource) {
      return (
        <Fade in timeout={500}>
          <Box sx={{ py: 4 }}>
            <Typography variant="h3" align="center" gutterBottom fontWeight={700} sx={{ mb: 6 }}>
              어떤 방법으로 문제를 생성하시겠습니까?
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
              {/* 파일 업로드 카드 */}
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
                onClick={() => handleQuestionSourceSelect('upload')}
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

              {/* 저장된 요약본 카드 */}
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
                onClick={() => handleQuestionSourceSelect('saved')}
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
    }

    // 요약 생성 모드 (문제 생성 단계 추가)
    if (mode === 'summary') {
      switch (activeStep) {
        case 0:
          return (
            <Fade in timeout={500}>
              <Paper
                elevation={6}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                  p: 6,
                  borderRadius: 4,
                  background: "#ffffff",
                  textAlign: "center",
                  position: "relative",
                  border: isDragging ? "3px dashed #3b82f6" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <Box
                  component="label"
                  sx={{
                    display: "block",
                    p: 8,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: isDragging ? "#3b82f6" : (file ? "#10b981" : "#e2e8f0"),
                    background: isDragging
                      ? "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)"
                      : file
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(8, 145, 178, 0.02) 100%)",
                    "&:hover": {
                      borderColor: isDragging ? "#3b82f6" : (file ? "#059669" : "#3b82f6"),
                      transform: isDragging ? "none" : "translateY(-4px)",
                      boxShadow: isDragging
                        ? "0 12px 24px rgba(59, 130, 246, 0.2)"
                        : file 
                        ? "0 12px 24px rgba(16, 185, 129, 0.15)" 
                        : "0 12px 24px rgba(59, 130, 246, 0.15)",
                    },
                  }}
                >
                  <Stack spacing={3} alignItems="center">
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        background: isDragging
                          ? "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)"
                          : file
                          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                          : "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)",
                        transition: "all 0.3s ease",
                        transform: isDragging ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {file && !isDragging ? (
                        <CheckCircle sx={{ fontSize: 60 }} />
                      ) : (
                        <CloudUpload sx={{ fontSize: 60 }} />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" gutterBottom fontWeight={700} sx={{ 
                        color: isDragging ? "#3b82f6" : (file ? "#059669" : "#3b82f6"),
                        transition: "all 0.3s ease"
                      }}>
                        {isDragging ? "파일을 놓으세요" : (file ? "파일 준비 완료!" : "파일을 선택하세요")}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {isDragging ? "여기에 파일을 놓으세요" : "PDF, PPT 파일을 드래그하거나 클릭하여 업로드"}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        * 파일명: 한글, 영문, 숫자, 공백, . - _ ( ) [ ] %
                      </Typography>
                    </Box>
                    {fileName && !isDragging && (
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2.5,
                          background: "#f8fafc",
                          minWidth: 300,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#1e40af" }}>
                          📄 {fileName}
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                  <input 
                    hidden 
                    type="file" 
                    accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handleFileUpload} 
                  />
                </Box>
              </Paper>
            </Fade>
          );

        case 1:
          return (
            <Slide direction="left" in timeout={500}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                }}
              >
                <Typography variant="h3" gutterBottom fontWeight={700} mb={4}>
                  ⚙️ 요약 설정
                </Typography>
                <SummarySettings
                  sumTab={sumTab}
                  setSumTab={setSumTab}
                  sumField={sumField}
                  setSumField={setSumField}
                  sumLevel={sumLevel}
                  setSumLevel={setSumLevel}
                  sumSentCount={sumSentCount}
                  setSumSentCount={setSumSentCount}
                  sumTopicCount={sumTopicCount}
                  setSumTopicCount={setSumTopicCount}
                  sumKeywordCount={sumKeywordCount}
                  setSumKeywordCount={setSumKeywordCount}
                  keywords={keywords}
                  setKeywords={setKeywords}
                  setAiSummaryType={setAiSummaryType}
                  setDbSummaryTypeKorean={setDbSummaryTypeKorean}
                />
              </Paper>
            </Slide>
          );

        case 2:
          return (
            <Fade in timeout={500}>
              <Box>
                {loadingSum ? (
                  <ParticleLoading message="AI가 문서를 요약하고 있습니다" />
                ) : summaryText ? (
                  <Paper
                    elevation={6}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: "#ffffff",
                    }}
                  >
                    <Stack spacing={3}>
                      <Typography variant="h4" fontWeight={700}>
                        ✅ 요약 완료!
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={12}
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            bgcolor: "white",
                          },
                        }}
                      />
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => handleSave('summary')}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            borderWidth: 2,
                            borderColor: "#3b82f6",
                            color: "#3b82f6",
                            "&:hover": { 
                              borderWidth: 2,
                              borderColor: "#2563eb",
                              bgcolor: "rgba(59, 130, 246, 0.04)",
                            },
                          }}
                        >
                          저장하기
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => downloadAsPDF(summaryText, fileName || "summary", dbSummaryTypeKorean)}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            background: "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #2563eb 0%, #0e7490 100%)",
                            },
                          }}
                        >
                          PDF 다운로드
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="large"
                          onClick={handleStop}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            borderWidth: 2,
                            "&:hover": { 
                              borderWidth: 2,
                            },
                          }}
                        >
                          그만하기
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}
              </Box>
            </Fade>
          );

        case 3:
          // 문제 설정
          return (
            <Slide direction="left" in timeout={500}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                }}
              >
                <Typography variant="h3" gutterBottom fontWeight={700} mb={4}>
                  ⚙️ 문제 설정
                </Typography>
                <ProblemSettings
                  qTab={qTab}
                  setQTab={setQTab}
                  qField={qField}
                  setQField={setQField}
                  qLevel={qLevel}
                  setQLevel={setQLevel}
                  qCount={qCount}
                  setQCount={setQCount}
                  optCount={optCount}
                  setOptCount={setOptCount}
                  blankCount={blankCount}
                  setBlankCount={setBlankCount}
                  optionFormat={optionFormat}
                  setOptionFormat={setOptionFormat}
                  summaryText={summaryText}
                  openSummaryDialog={openSummaryDialog}
                  setOpenSummaryDialog={setOpenSummaryDialog}
                  openSavedSummariesDialog={() => {}}
                  hasSummaryText={!!summaryText}
                  showSavedSummaryButton={false} // 저장된 요약 선택 버튼 숨김
                />
              </Paper>
            </Slide>
          );

        case 4:
          // 문제 생성
          return (
            <Fade in timeout={500}>
              <Box>
                {loadingQ ? (
                  <ParticleLoading message="AI가 문제를 생성하고 있습니다" />
                ) : questionText && isJsonFormat ? (
                  <Paper
                    elevation={6}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: "#ffffff",
                    }}
                  >
                    <Stack spacing={3}>
                      <Typography variant="h4" fontWeight={700}>
                        ✅ 문제 생성 완료!
                      </Typography>
                      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 3 }}>
                        <QuestionRenderer questions={parsedQuestions} />
                      </Box>
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => handleSave('question')}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            borderWidth: 2,
                            borderColor: "#3b82f6",
                            color: "#3b82f6",
                            "&:hover": { 
                              borderWidth: 2,
                              borderColor: "#2563eb",
                              bgcolor: "rgba(59, 130, 246, 0.04)",
                            },
                          }}
                        >
                          저장하기
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => downloadAsPDF(questionText, fileName || "questions", aiQuestionPromptKeys_Korean[qTab])}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            },
                          }}
                        >
                          PDF 다운로드
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}
              </Box>
            </Fade>
          );

        default:
          return null;
      }
    }

    // 문제 생성 모드 - 파일 업로드
    if (mode === 'question' && questionSource === 'upload') {
      switch (activeStep) {
        case 0:
          // 파일 업로드
          return (
            <Fade in timeout={500}>
              <Paper
                elevation={6}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                  p: 6,
                  borderRadius: 4,
                  background: "#ffffff",
                  textAlign: "center",
                  position: "relative",
                  border: isDragging ? "3px dashed #3b82f6" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <Box
                  component="label"
                  sx={{
                    display: "block",
                    p: 8,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: isDragging ? "#3b82f6" : (file ? "#10b981" : "#e2e8f0"),
                    background: isDragging
                      ? "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)"
                      : file
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(8, 145, 178, 0.02) 100%)",
                    "&:hover": {
                      borderColor: isDragging ? "#3b82f6" : (file ? "#059669" : "#3b82f6"),
                      transform: isDragging ? "none" : "translateY(-4px)",
                      boxShadow: isDragging
                        ? "0 12px 24px rgba(59, 130, 246, 0.2)"
                        : file 
                        ? "0 12px 24px rgba(16, 185, 129, 0.15)" 
                        : "0 12px 24px rgba(59, 130, 246, 0.15)",
                    },
                  }}
                >
                  <Stack spacing={3} alignItems="center">
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        background: isDragging
                          ? "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)"
                          : file
                          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                          : "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)",
                        transition: "all 0.3s ease",
                        transform: isDragging ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {file && !isDragging ? (
                        <CheckCircle sx={{ fontSize: 60 }} />
                      ) : (
                        <CloudUpload sx={{ fontSize: 60 }} />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" gutterBottom fontWeight={700} sx={{ 
                        color: isDragging ? "#3b82f6" : (file ? "#059669" : "#3b82f6"),
                        transition: "all 0.3s ease"
                      }}>
                        {isDragging ? "파일을 놓으세요" : (file ? "파일 준비 완료!" : "파일을 선택하세요")}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {isDragging ? "여기에 파일을 놓으세요" : "PDF, PPT, PPTX 파일을 드래그하거나 클릭하여 업로드"}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        * 파일명: 한글, 영문, 숫자, 공백, . - _ ( ) [ ] %
                      </Typography>
                    </Box>
                    {fileName && !isDragging && (
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2.5,
                          background: "#f8fafc",
                          minWidth: 300,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#1e40af" }}>
                          📄 {fileName}
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                  <input 
                    hidden 
                    type="file" 
                    accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handleFileUpload} 
                  />
                </Box>
              </Paper>
            </Fade>
          );

        case 1:
          // 문제 설정 (요약 설정 단계 제거)
          return (
            <Slide direction="left" in timeout={500}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                }}
              >
                <Typography variant="h3" gutterBottom fontWeight={700} mb={4}>
                  ⚙️ 문제 설정
                </Typography>
                <ProblemSettings
                  qTab={qTab}
                  setQTab={setQTab}
                  qField={qField}
                  setQField={setQField}
                  qLevel={qLevel}
                  setQLevel={setQLevel}
                  qCount={qCount}
                  setQCount={setQCount}
                  optCount={optCount}
                  setOptCount={setOptCount}
                  blankCount={blankCount}
                  setBlankCount={setBlankCount}
                  optionFormat={optionFormat}
                  setOptionFormat={setOptionFormat}
                  summaryText=""
                  openSummaryDialog={false}
                  setOpenSummaryDialog={() => {}}
                  openSavedSummariesDialog={() => {}}
                  hasSummaryText={false}
                />
              </Paper>
            </Slide>
          );

        case 2:
          // 문제 생성
          return (
            <Fade in timeout={500}>
              <Box>
                {loadingQ ? (
                  <ParticleLoading message="AI가 문제를 생성하고 있습니다" />
                ) : questionText && isJsonFormat ? (
                  <Paper
                    elevation={6}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: "#ffffff",
                    }}
                  >
                    <Stack spacing={3}>
                      <Typography variant="h4" fontWeight={700}>
                        ✅ 문제 생성 완료!
                      </Typography>
                      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 3 }}>
                        <QuestionRenderer questions={parsedQuestions} />
                      </Box>
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => handleSave('question')}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            borderWidth: 2,
                            borderColor: "#3b82f6",
                            color: "#3b82f6",
                            "&:hover": { 
                              borderWidth: 2,
                              borderColor: "#2563eb",
                              bgcolor: "rgba(59, 130, 246, 0.04)",
                            },
                          }}
                        >
                          저장하기
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => downloadAsPDF(questionText, fileName || "questions", aiQuestionPromptKeys_Korean[qTab])}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            },
                          }}
                        >
                          PDF 다운로드
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}
              </Box>
            </Fade>
          );

        default:
          return null;
      }
    }

    // 문제 생성 모드 - 저장된 요약본
    if (mode === 'question' && questionSource === 'saved') {
      switch (activeStep) {
        case 0:
          // 요약본 선택 확인 화면 (배경색 흰색으로 변경)
          return (
            <Fade in timeout={500}>
              <Paper
                elevation={6}
                sx={{
                  p: 6,
                  borderRadius: 4,
                  background: "#ffffff", // 배경색을 흰색으로 변경
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: "0 auto 24px",
                    background: isSummarySelected
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  }}
                >
                  {isSummarySelected ? (
                    <CheckCircle sx={{ fontSize: 60 }} />
                  ) : (
                    <LibraryBooks sx={{ fontSize: 60 }} />
                  )}
                </Avatar>
                <Typography variant="h3" gutterBottom fontWeight={700}>
                  {isSummarySelected ? "요약본 선택 완료!" : "요약본을 선택해주세요"}
                </Typography>
                
                {isSummarySelected ? (
                  <>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                      선택한 요약본: {fileName || "untitled"}
                    </Typography>
                    <Paper
                      sx={{
                        p: 3,
                        maxHeight: 300,
                        overflow: "auto",
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-wrap", textAlign: "left" }}
                      >
                        {summaryText}
                      </Typography>
                    </Paper>
                    <Button
                      variant="outlined"
                      startIcon={<LibraryBooks />}
                      onClick={() => setOpenSavedSummariesDialog(true)}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        borderWidth: 2,
                        borderColor: "#10b981",
                        color: "#10b981",
                        "&:hover": {
                          borderWidth: 2,
                          borderColor: "#059669",
                          bgcolor: "rgba(16, 185, 129, 0.04)",
                        },
                      }}
                    >
                      요약본 다시 선택하기
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      아래 버튼을 클릭하여 저장된 요약본을 선택하세요
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<LibraryBooks />}
                      onClick={() => setOpenSavedSummariesDialog(true)}
                      sx={{
                        borderRadius: 3,
                        px: 5,
                        py: 1.5,
                        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                        },
                      }}
                    >
                      요약본 선택하기
                    </Button>
                  </>
                )}
              </Paper>
            </Fade>
          );

        case 1:
          // 문제 설정 (현재 요약본 보기 활성화)
          return (
            <Slide direction="left" in timeout={500}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                }}
              >
                <Typography variant="h3" gutterBottom fontWeight={700} mb={4}>
                  ⚙️ 문제 설정
                </Typography>
                <ProblemSettings
                  qTab={qTab}
                  setQTab={setQTab}
                  qField={qField}
                  setQField={setQField}
                  qLevel={qLevel}
                  setQLevel={setQLevel}
                  qCount={qCount}
                  setQCount={setQCount}
                  optCount={optCount}
                  setOptCount={setOptCount}
                  blankCount={blankCount}
                  setBlankCount={setBlankCount}
                  optionFormat={optionFormat}
                  setOptionFormat={setOptionFormat}
                  summaryText={summaryText}
                  openSummaryDialog={openSummaryDialog}
                  setOpenSummaryDialog={setOpenSummaryDialog}
                  openSavedSummariesDialog={() => setOpenSavedSummariesDialog(true)}
                  hasSummaryText={!!summaryText}
                />
              </Paper>
            </Slide>
          );

        case 2:
          // 문제 생성 (동일)
          return (
            <Fade in timeout={500}>
              <Box>
                {loadingQ ? (
                  <ParticleLoading message="AI가 문제를 생성하고 있습니다" />
                ) : questionText && isJsonFormat ? (
                  <Paper
                    elevation={6}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: "#ffffff",
                    }}
                  >
                    <Stack spacing={3}>
                      <Typography variant="h4" fontWeight={700}>
                        ✅ 문제 생성 완료!
                      </Typography>
                      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 3 }}>
                        <QuestionRenderer questions={parsedQuestions} />
                      </Box>
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => handleSave('question')}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            borderWidth: 2,
                            borderColor: "#3b82f6",
                            color: "#3b82f6",
                            "&:hover": { 
                              borderWidth: 2,
                              borderColor: "#2563eb",
                              bgcolor: "rgba(59, 130, 246, 0.04)",
                            },
                          }}
                        >
                          저장하기
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => downloadAsPDF(questionText, fileName || "questions", aiQuestionPromptKeys_Korean[qTab])}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            },
                          }}
                        >
                          PDF 다운로드
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}
              </Box>
            </Fade>
          );

        default:
          return null;
      }
    }

    return null;
  };

  return (
    <>
      <Header />
      <PageNavigator />
      <Box
        sx={{
          minHeight: "100vh",
          p: 4,
          pt: 12,
          background: "#ffffff",
        }}
      >
        <Container maxWidth="lg">
          {/* Stepper 표시 조건 수정 - 문제 생성 소스 선택 화면에서는 숨김 */}
          {mode && !(mode === 'question' && !questionSource) && (
            <Paper
              elevation={8}
              sx={{
                p: 4,
                borderRadius: 4,
                mb: 4,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(59, 130, 246, 0.1)",
              }}
            >
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        "& .MuiStepLabel-label": {
                          fontSize: "1.1rem",
                          fontWeight: 600,
                        },
                        "& .MuiStepIcon-root": {
                          color: "#93c5fd",
                        },
                        "& .MuiStepIcon-root.Mui-active": {
                          color: "#3b82f6",
                        },
                        "& .MuiStepIcon-root.Mui-completed": {
                          color: "#2563eb",
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          )}

          <Box sx={{ minHeight: 500, mb: 4 }}>
            {renderStepContent()}
          </Box>

          {/* 네비게이션 버튼도 문제 생성 소스 선택 화면에서는 숨김 */}
          {mode && !(mode === 'question' && !questionSource) && (
            <Stack direction="row" justifyContent="space-between" sx={{ px: 2 }}>
              <Button
                disabled={!mode}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#3b82f6",
                  "&:hover": {
                    bgcolor: "rgba(59, 130, 246, 0.08)",
                  },
                }}
              >
                이전
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                disabled={
                  // 요약 생성 모드
                  (mode === 'summary' && activeStep === 0 && !file) ||
                  (mode === 'summary' && activeStep === 2 && !summaryText) ||
                  (mode === 'summary' && activeStep === 4 && !questionText) ||
                  // 문제 생성 모드 - 파일 업로드
                  (mode === 'question' && questionSource === 'upload' && activeStep === 0 && !file) ||
                  (mode === 'question' && questionSource === 'upload' && activeStep === 2 && !questionText) ||
                  // 문제 생성 모드 - 저장된 요약본
                  (mode === 'question' && questionSource === 'saved' && activeStep === 0 && !isSummarySelected) ||
                  (mode === 'question' && questionSource === 'saved' && activeStep === 2 && !questionText) ||
                  // 마지막 단계
                  (mode === 'summary' && activeStep === steps.length - 1) ||
                  (mode === 'question' && activeStep === steps.length - 1)
                }
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)",
                  boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #0e7490 100%)",
                    boxShadow: "0 6px 30px rgba(37, 99, 235, 0.5)",
                  },
                }}
              >
                {(mode === 'summary' && activeStep === 1) 
                  ? "요약 생성" 
                  : (mode === 'summary' && activeStep === 3)
                  ? "문제 생성"
                  : (mode === 'question' && activeStep === steps.length - 2) 
                  ? "문제 생성" 
                  : "다음"}
              </Button>
            </Stack>
          )}
        </Container>

        <SavedSummaryDialog
          open={openSavedSummariesDialog}
          onClose={() => setOpenSavedSummariesDialog(false)}
          onSelectSummary={handleSelectSavedSummary}
        />

        <SaveNameDialog
          open={openSaveNameDialog}
          onClose={() => setOpenSaveNameDialog(false)}
          onSave={handleConfirmSave}
          defaultName={fileName || 'untitled'}
          title={saveDialogType === 'summary' ? '요약 저장' : '문제 저장'}
          type={saveDialogType}
        />

        <Snackbar
          open={openSumDoneSnackbar}
          onClose={() => setOpenSumDoneSnackbar(false)}
          autoHideDuration={3000}
        >
          <Alert severity="success" sx={{ fontSize: "1.1rem" }}>
            ✅ 요약 저장 완료!
          </Alert>
        </Snackbar>

        <Snackbar
          open={openQDoneSnackbar}
          onClose={() => setOpenQDoneSnackbar(false)}
          autoHideDuration={3000}
        >
          <Alert severity="success" sx={{ fontSize: "1.1rem" }}>
            ✅ 문제 저장 완료!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}