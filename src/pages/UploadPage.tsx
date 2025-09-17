// src/pages/UploadPage.tsx
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
  Tabs,
  Tab,
  LinearProgress,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import Header from "../components/Header";
import SummarySettings from "../components/upload/SummarySettings";
import ProblemSettings from "../components/upload/ProblemSettings";
import QuestionRenderer from "../components/upload/QuestionRenderer";
import { useAuth } from "../contexts/AuthContext";
import {
  aiSummaryAPI,
  aiQuestionAPI,
  summaryAPI,
  questionAPI,
} from "../services/api";
import { downloadAsPDF } from "../utils/pdfUtils";
import {
  MainTab,
  AiSummaryPromptKey,
  DbSummaryPromptKey_Korean,
  Question,
} from "../types/upload";
import {
  aiSummaryPromptKeys,
  dbSummaryPromptKeys_Korean,
  aiQuestionPromptKeys_Korean,
  questionLabels,
} from "../constants/upload";
import { jsPDF } from "jspdf";

export default function UploadPage() {
  const { user } = useAuth();

  // common state
  const [mainTab, setMainTab] = useState<MainTab>("summary");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // modal state
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);

  // summary state
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

  // problem state
  const [qTab, setQTab] = useState(0);
  const [qField, setQField] = useState("언어");
  const [qLevel, setQLevel] = useState("비전공자");
  const [qCount, setQCount] = useState(3);
  const [optCount, setOptCount] = useState(4);
  const [blankCount, setBlankCount] = useState(1);
  const [questionText, setQuestionText] = useState("");
  const [loadingQ, setLoadingQ] = useState(false);
  const [optionFormat, setOptionFormat] = useState("단답형");

  // snackbar state
  const [openSumDoneSnackbar, setOpenSumDoneSnackbar] = useState(false);
  const [openQDoneSnackbar, setOpenQDoneSnackbar] = useState(false);

  // parsed questions state
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [isJsonFormat, setIsJsonFormat] = useState(false);

  useEffect(() => {
    // jsPDF 폰트 로드를 조건부로 처리
    const loadFont = async () => {
      try {
        const response = await fetch("/fonts/NotoSansKR-Regular.ttf");
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const b64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );

          if (jsPDF && jsPDF.API) {
            jsPDF.API.addFileToVFS("NotoSansKR-Regular.ttf", b64);
            jsPDF.API.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
          }
        }
      } catch (error) {
        console.log("폰트 로드 실패:", error);
      }
    };

    loadFont();
  }, []);

  // handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileName(f?.name ?? null);
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

      if (sumTab === 2) {
        fd.append("topic_count", String(sumTopicCount));
      }

      if (sumTab === 4) {
        fd.append("keyword_count", String(sumKeywordCount));
        if (sumKeywordCount > 0) {
          const validKeywords = keywords.filter(
            (k) => k && k.trim().length > 0
          );
          if (validKeywords.length > 0) {
            fd.append("user_keywords", validKeywords.join(","));
          }
        }
      }

      const res = await aiSummaryAPI.generateSummary(fd);
      setSummaryText(res.data.summary);
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.detail || "요약 생성 오류");
    } finally {
      setLoadingSum(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!user || !fileName) return;
    try {
      await summaryAPI.saveSummary({
        userId: user.id,
        fileName,
        summaryType: dbSummaryTypeKorean,
        summaryText,
      });
      setOpenSumDoneSnackbar(true);
    } catch (e) {
      console.error(e);
      alert("요약 저장 중 오류");
    }
  };

  const parseQuestionJson = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      if (data.questions && Array.isArray(data.questions)) {
        setParsedQuestions(data.questions);
        setIsJsonFormat(true);
        return true;
      }
    } catch (error) {
      console.error("JSON 파싱 오류:", error);
    }
    setIsJsonFormat(false);
    setParsedQuestions([]);
    return false;
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
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.detail || "문제 생성 오류");
    } finally {
      setLoadingQ(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!user || !fileName) return;
    try {
      await questionAPI.saveQuestion({
        userId: user.id,
        fileName,
        questionType: aiQuestionPromptKeys_Korean[qTab],
        questionText,
      });
      setOpenQDoneSnackbar(true);
    } catch (e) {
      console.error(e);
      alert("문제 저장 중 오류");
    }
  };

  const handleDownloadSummary = async () => {
    try {
      await downloadAsPDF(
        summaryText,
        fileName || "result",
        `${dbSummaryTypeKorean} 요약`
      );
    } catch (error) {
      alert("PDF 다운로드 중 오류가 발생했습니다.");
    }
  };

  const handleDownloadQuestion = async () => {
    try {
      await downloadAsPDF(
        questionText,
        fileName || "result",
        `${aiQuestionPromptKeys_Korean[qTab]} 문제`
      );
    } catch (error) {
      alert("PDF 다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <Header />

      <Box
        sx={{
          minHeight: "100vh",
          p: 4,
          pt: "40px",
          background: (theme) =>
            theme.palette.mode === "light"
              ? "linear-gradient(145deg, #ffffff 0%, #f4f7fa 100%)"
              : "linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h1" fontWeight="500" align="center" mb={3}>
            문서 업로드
          </Typography>

          {/* Upload Box */}
          <Box
            component="label"
            sx={{
              display: "block",
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 6,
              textAlign: "center",
              mb: 4,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#1976d2",
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "#1976d2",
                  "&:hover": { bgcolor: "#1565c0" },
                }}
              >
                <CloudUpload sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  파일 선택
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  여기를 클릭하거나 파일을 드래그하세요
                </Typography>
              </Box>
              {fileName && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                  <Typography variant="body2" fontWeight="medium">
                    📄 {fileName}
                  </Typography>
                </Paper>
              )}
            </Stack>
            <input hidden type="file" onChange={handleFileUpload} />
          </Box>

          {/* Main Tabs */}
          <Box mb={5} display="flex" justifyContent="center">
            <Tabs
              value={mainTab}
              onChange={(_, v) => setMainTab(v)}
              sx={{
                minHeight: 48,
                bgcolor: "white",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.300",
                boxShadow: 1,
                "& .MuiTabs-indicator": {
                  height: "100%",
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  zIndex: 0,
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  zIndex: 1,
                  color: "text.secondary",
                  "&.Mui-selected": { color: "white" },
                },
              }}
            >
              <Tab label="요약 생성" value="summary" sx={{ minWidth: 120 }} />
              <Tab label="문제 생성" value="problem" sx={{ minWidth: 120 }} />
            </Tabs>
          </Box>

          {mainTab === "summary" ? (
            <>
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

              {/* Generate Summary */}
              <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerateSummary}
                  disabled={loadingSum}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                        : "linear-gradient(45deg, #1565C0 30%, #0277BD 90%)",
                  }}
                >
                  ✨ 요약 생성
                </Button>
              </Stack>
              {loadingSum && (
                <LinearProgress sx={{ mb: 3, height: 6, borderRadius: 1 }} />
              )}

              {/* Summary Result */}
              {summaryText && (
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: 3,
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)"
                        : "linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)",
                  }}
                >
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        pb: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "success.main",
                          color: "success.contrastText",
                        }}
                      >
                        📄
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, flexGrow: 1 }}
                      >
                        요약 결과
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleDownloadSummary}
                      >
                        📄 PDF 다운로드
                      </Button>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      minRows={8}
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                    <Stack
                      direction="row"
                      justifyContent="center"
                      spacing={2}
                      sx={{ pt: 1 }}
                    >
                      <Button
                        variant="outlined"
                        onClick={handleSaveSummary}
                        sx={{ borderRadius: 2.5, px: 3 }}
                      >
                        💾 요약 저장
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => setMainTab("problem")}
                        sx={{ borderRadius: 2.5, px: 3 }}
                      >
                        🎯 문제 생성
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              )}

              <Snackbar
                open={openSumDoneSnackbar}
                onClose={() => {}}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
              >
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => setOpenSumDoneSnackbar(false)}
                      sx={{ alignSelf: "center" }}
                    >
                      확인
                    </Button>
                  }
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    요약 저장이 완료되었습니다!
                  </Box>
                </Alert>
              </Snackbar>
            </>
          ) : (
            <>
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
              />
              {/* Generate Question */}
              <Box textAlign="center" mb={2}>
                <Button
                  variant="contained"
                  onClick={handleGenerateQuestion}
                  disabled={loadingQ}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                        : "linear-gradient(45deg, #1565C0 30%, #0277BD 90%)",
                  }}
                >
                  ✏️ 문제 생성
                </Button>
              </Box>
              {loadingQ && (
                <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 1 }} />
              )}

              {/* Question Result */}
              {questionText && (
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: 3,
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? "linear-gradient(145deg, #e8f0fe 0%, #f0f4ff 100%)"
                        : "linear-gradient(145deg, #2d3440 0%, #1a1f2a 100%)",
                  }}
                >
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        pb: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "info.main",
                          color: "info.contrastText",
                        }}
                      >
                        📝
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, flexGrow: 1 }}
                      >
                        생성된 문제
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleDownloadQuestion}
                      >
                        ⬇️ 다운로드
                      </Button>
                    </Box>

                    {/* JSON 형식일 때는 파싱된 결과를 보여주고, 아닐 때는 기존 텍스트 */}
                    {isJsonFormat ? (
                      <QuestionRenderer questions={parsedQuestions} />
                    ) : (
                      <Typography
                        style={{ whiteSpace: "pre-wrap" }}
                        color="text.secondary"
                      >
                        {questionText}
                      </Typography>
                    )}

                    <Stack direction="row" justifyContent="center" spacing={2}>
                      <Button
                        variant="outlined"
                        onClick={handleSaveQuestion}
                        sx={{ borderRadius: 2.5, px: 3 }}
                      >
                        💾 문제 저장
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              )}

              <Snackbar
                open={openQDoneSnackbar}
                onClose={() => {}}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
              >
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => setOpenQDoneSnackbar(false)}
                      sx={{ alignSelf: "center" }}
                    >
                      확인
                    </Button>
                  }
                >
                  문제 저장이 완료되었습니다!
                </Alert>
              </Snackbar>
            </>
          )}

          {/* Summary Dialog */}
          <Dialog
            open={openSummaryDialog}
            onClose={() => setOpenSummaryDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>요약 내용 보기</DialogTitle>
            <DialogContent dividers>
              <Typography component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                {summaryText || "먼저 요약을 생성해 주세요."}
              </Typography>
            </DialogContent>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}
