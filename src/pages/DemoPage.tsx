import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { CheckCircleOutline, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PageNavigator from '../components/common/PageNavigator';
import NavigationBlocker from '../components/upload/NavigationBlocker';
import ErrorDisplay from '../components/upload/ErrorDisplay';
import ResultDisplay from '../components/upload/ResultDisplay';
import {
  aiQuestionPromptKeys_Korean,
  aiSummaryPromptKeys,
  dbSummaryPromptKeys_Korean,
} from '../constants/upload';
import { DEMO_CONTENTS } from '../constants/demo';
import { useAuth } from '../contexts/AuthContext';
import { demoAPI, DemoTopic, questionAPI } from '../services/api';
import { Question } from '../types/upload';
import { downloadAsPDF } from '../utils/pdfUtils';
import SummarySettings from '../components/upload/SummarySettings';
import ProblemSettings from '../components/upload/ProblemSettings';

const cardSx = {
  p: { xs: 2.5, sm: 3 },
  borderRadius: 4,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
  border: '1px solid #e2e8f0',
};

const parseQuestionJson = (jsonText: string): Question[] | null => {
  try {
    const data = JSON.parse(jsonText);
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      return null;
    }

    const isValid = data.questions.every((question: Question) => !!question.question_text);
    if (!isValid) {
      return null;
    }

    return data.questions;
  } catch (error) {
    return null;
  }
};

export default function DemoPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [topics, setTopics] = useState<DemoTopic[]>([]);
  const [selectedTopicKey, setSelectedTopicKey] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicLoadError, setTopicLoadError] = useState('');
  const [openDemoContentDialog, setOpenDemoContentDialog] = useState(false);

  const [sumTab, setSumTab] = useState(0);
  const [aiSummaryType, setAiSummaryType] = useState(aiSummaryPromptKeys[0]);
  const [dbSummaryTypeKorean, setDbSummaryTypeKorean] = useState(dbSummaryPromptKeys_Korean[0]);
  const [sumField, setSumField] = useState('언어');
  const [sumLevel, setSumLevel] = useState('비전공자');
  const [sumSentCount, setSumSentCount] = useState(3);
  const [sumTopicCount, setSumTopicCount] = useState(1);
  const [sumKeywordCount, setSumKeywordCount] = useState(3);
  const [keywords, setKeywords] = useState<string[]>([]);

  const [qTab, setQTab] = useState(0);
  const [qField, setQField] = useState('언어');
  const [qLevel, setQLevel] = useState('비전공자');
  const [qCount, setQCount] = useState(3);
  const [optCount, setOptCount] = useState(4);
  const [blankCount, setBlankCount] = useState(1);
  const [optionFormat, setOptionFormat] = useState('단답형');
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryError, setSummaryError] = useState('');

  const [questionLoading, setQuestionLoading] = useState(false);
  const [savingAndSolving, setSavingAndSolving] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [isJsonFormat, setIsJsonFormat] = useState(false);
  const [openQDoneSnackbar, setOpenQDoneSnackbar] = useState(false);

  const isGenerating = summaryLoading || questionLoading;

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.key === selectedTopicKey) ?? null,
    [topics, selectedTopicKey]
  );

  const selectedDemoContent = selectedTopicKey ? DEMO_CONTENTS[selectedTopicKey] : undefined;

  const requireLogin = useCallback(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return false;
    }

    return true;
  }, [isLoggedIn, navigate]);

  const parseApiError = (error: any): string => {
    const status = error?.response?.status;
    if (status === 401) {
      return '로그인이 필요합니다. 다시 로그인 후 시도해 주세요.';
    }
    if (status === 429) {
      return '요청 횟수를 초과했습니다. 30분 후 다시 시도해 주세요.';
    }

    return error?.response?.data?.detail || error?.message || '요청 중 오류가 발생했습니다.';
  };

  const loadTopics = useCallback(async () => {
    setLoadingTopics(true);
    setTopicLoadError('');

    try {
      const response = await demoAPI.getTopics();
      const topicList = response.data?.topics ?? [];
      setTopics(topicList);

      if (topicList.length > 0) {
        setSelectedTopicKey((current) => current || topicList[0].key);
      }
    } catch (error: any) {
      setTopicLoadError(parseApiError(error));
    } finally {
      setLoadingTopics(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const handleGenerateSummary = async () => {
    if (!selectedTopicKey) {
      setSummaryError('주제를 먼저 선택해 주세요.');
      return;
    }
    if (!requireLogin()) return;

    setSummaryLoading(true);
    setSummaryError('');

    try {
      const response = await demoAPI.summarize({
        topicKey: selectedTopicKey,
        summaryType: aiSummaryType,
        summary_type: aiSummaryType,
        level: sumLevel,
        field: sumField,
        sentenceCount: sumSentCount,
        sentence_count: sumSentCount,
        topicCount: sumTopicCount,
        topic_count: sumTopicCount,
        keywordCount: sumKeywordCount,
        keyword_count: sumKeywordCount,
        userKeywords: keywords.filter((keyword) => keyword && keyword.trim().length > 0),
        user_keywords: keywords.filter((keyword) => keyword && keyword.trim().length > 0),
      });

      setSummaryText(response.data?.summary ?? '');
    } catch (error: any) {
      setSummaryError(parseApiError(error));
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!selectedTopicKey) {
      setQuestionError('주제를 먼저 선택해 주세요.');
      return;
    }
    if (!requireLogin()) return;

    setQuestionLoading(true);
    setQuestionError('');
    setParsedQuestions([]);
    setIsJsonFormat(false);

    try {
      const normalizedCount = Math.min(Math.max(qCount, 1), 5);
      const questionType = aiQuestionPromptKeys_Korean[qTab];
      const response = await demoAPI.generate({
        topicKey: selectedTopicKey,
        questionType,
        question_type: questionType,
        questionCount: normalizedCount,
        question_count: normalizedCount,
        level: qLevel,
        field: qField,
        choiceCount: optCount,
        choice_count: optCount,
        arrayChoiceCount: optCount,
        array_choice_count: optCount,
        blankCount,
        blank_count: blankCount,
        choiceFormat: optionFormat,
        choice_format: optionFormat,
      });

      const parsed = response.data?.parsed;
      const questions = response.data?.questions;
      const rawText = parsed
        ? JSON.stringify({ questions })
        : typeof questions === 'string'
          ? questions
          : JSON.stringify(questions, null, 2);

      setQuestionText(rawText);

      if (parsed) {
        const parsedData = parseQuestionJson(rawText);
        if (parsedData) {
          setParsedQuestions(parsedData);
          setIsJsonFormat(true);
        } else {
          setQuestionError('문제 형식을 해석하지 못했습니다. 다시 시도해 주세요.');
          setIsJsonFormat(false);
        }
      }
    } catch (error: any) {
      setQuestionError(parseApiError(error));
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleForceNavigation = () => {
    setSummaryLoading(false);
    setQuestionLoading(false);
    setSavingAndSolving(false);
  };

  const handleSaveAndSolve = async () => {
    if (!requireLogin() || !user) return;
    if (!questionText) return;

    setSavingAndSolving(true);

    try {
      const baseName = selectedTopic?.title || 'demo-questions';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');

      await questionAPI.saveQuestion({
        userId: user.id,
        fileName: baseName,
        questionName: `${baseName}-실습용-${timestamp}`,
        questionType: aiQuestionPromptKeys_Korean[qTab],
        questionText,
      });

      setOpenQDoneSnackbar(true);
      setTimeout(() => {
        navigate('/solve-questions');
      }, 1800);
    } catch (error: any) {
      setQuestionError(parseApiError(error));
    } finally {
      setSavingAndSolving(false);
    }
  };

  return (
    <>
      <Header />
      <PageNavigator />
      <NavigationBlocker
        when={isGenerating}
        message={summaryLoading ? '요약 생성 중입니다. 페이지를 나가시겠습니까?' : '문제 생성 중입니다. 페이지를 나가시겠습니까?'}
        onNavigationAttempt={handleForceNavigation}
      />

      <Box sx={{ minHeight: '100vh', background: '#ffffff', pt: { xs: 10, sm: 12 }, pb: 8 }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ ...cardSx, mb: 3 }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              데모 체험
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              실제 업로드 없이 주제를 선택해 즉시 요약과 문제를 생성할 수 있습니다.
            </Typography>

            {loadingTopics ? (
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <CircularProgress size={20} />
                <Typography color="text.secondary">데모 주제를 불러오는 중입니다...</Typography>
              </Stack>
            ) : topicLoadError ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={loadTopics}>
                    다시 시도
                  </Button>
                }
              >
                {topicLoadError}
              </Alert>
            ) : (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="demo-topic-label">데모 주제</InputLabel>
                  <Select
                    labelId="demo-topic-label"
                    value={selectedTopicKey}
                    label="데모 주제"
                    onChange={(event) => setSelectedTopicKey(String(event.target.value))}
                  >
                    {topics.map((topic) => (
                      <MenuItem key={topic.key} value={topic.key}>
                        {topic.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedTopic && (
                  <Stack spacing={1.5}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      {selectedTopic.description}
                    </Alert>
                    <Stack direction="row" justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setOpenDemoContentDialog(true)}
                        disabled={!selectedDemoContent}
                      >
                        데모 내용 보기
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            )}
          </Paper>

          <Dialog
            open={openDemoContentDialog}
            onClose={() => setOpenDemoContentDialog(false)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              {selectedDemoContent?.title || '데모 내용'}
            </DialogTitle>
            <DialogContent dividers>
              <Typography
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  margin: 0,
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                {selectedDemoContent?.text || '표시할 데모 내용이 없습니다.'}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDemoContentDialog(false)}>닫기</Button>
            </DialogActions>
          </Dialog>

          <Stack spacing={3}>
            <Paper elevation={0} sx={cardSx}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                즉시 요약 생성
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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading || loadingTopics || !selectedTopicKey}
                >
                  {summaryLoading ? '요약 생성 중...' : '요약 생성하기'}
                </Button>
                {!isLoggedIn && (
                  <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
                    로그인하고 사용하기
                  </Button>
                )}
              </Stack>
            </Paper>

            {summaryLoading && (
              <Paper elevation={0} sx={{ ...cardSx, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 1.5 }} color="text.secondary">
                  요약을 생성하고 있습니다...
                </Typography>
              </Paper>
            )}

            {!summaryLoading && !!summaryError && (
              <ErrorDisplay
                errorType="generation_failed"
                errorMessage={summaryError}
                onRetry={handleGenerateSummary}
              />
            )}

            {!summaryLoading && !summaryError && !!summaryText && (
              <ResultDisplay
                type="summary"
                text={summaryText}
                fileName={selectedTopic?.title || 'demo-summary'}
                contentType={dbSummaryTypeKorean}
                onTextChange={setSummaryText}
                onSave={() => alert('데모 결과 저장은 지원되지 않습니다. 업로드 페이지에서 저장해 주세요.')}
                onDownload={() =>
                  downloadAsPDF(
                    summaryText,
                    selectedTopic?.title || 'demo-summary',
                    dbSummaryTypeKorean
                  )
                }
                onRegenerate={handleGenerateSummary}
                disabled={summaryLoading}
                showSaveButton={false}
              />
            )}

            <Paper elevation={0} sx={cardSx}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                즉시 문제 생성
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
                openSummaryDialog={openSummaryDialog}
                setOpenSummaryDialog={setOpenSummaryDialog}
                openSavedSummariesDialog={() => {}}
                hasSummaryText={false}
                showSavedSummaryButton={false}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerateQuestion}
                  disabled={questionLoading || loadingTopics || !selectedTopicKey}
                >
                  {questionLoading ? '문제 생성 중...' : '문제 생성하기'}
                </Button>
                {!isLoggedIn && (
                  <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
                    로그인하고 사용하기
                  </Button>
                )}
              </Stack>
            </Paper>

            {questionLoading && (
              <Paper elevation={0} sx={{ ...cardSx, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 1.5 }} color="text.secondary">
                  문제를 생성하고 있습니다...
                </Typography>
              </Paper>
            )}

            {!questionLoading && !!questionError && (
              <ErrorDisplay
                errorType="generation_failed"
                errorMessage={questionError}
                onRetry={handleGenerateQuestion}
              />
            )}

            {!questionLoading && !questionError && !!questionText && isJsonFormat && (
              <ResultDisplay
                type="question"
                text={questionText}
                isJsonFormat={isJsonFormat}
                parsedQuestions={parsedQuestions}
                fileName={selectedTopic?.title || 'demo-questions'}
                contentType={aiQuestionPromptKeys_Korean[qTab]}
                onSave={() => alert('데모 결과 저장은 지원되지 않습니다. 업로드 페이지에서 저장해 주세요.')}
                onDownload={() =>
                  downloadAsPDF(
                    questionText,
                    selectedTopic?.title || 'demo-questions',
                    aiQuestionPromptKeys_Korean[qTab]
                  )
                }
                onRegenerate={handleGenerateQuestion}
                disabled={questionLoading || savingAndSolving}
                showSaveButton={false}
                onPractice={handleSaveAndSolve}
                practiceButtonLabel={savingAndSolving ? '저장 중...' : '저장 후 문제풀기'}
              />
            )}

            {!questionLoading && !questionError && !!questionText && !isJsonFormat && (
              <Paper elevation={0} sx={{ ...cardSx }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  문제 생성 결과
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  문제를 구조화된 형식으로 파싱하지 못했습니다. 아래 원문 결과를 확인해 주세요.
                </Alert>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, maxHeight: 500, overflow: 'auto', whiteSpace: 'pre-wrap' }}
                >
                  {questionText}
                </Paper>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() =>
                      downloadAsPDF(
                        questionText,
                        selectedTopic?.title || 'demo-questions',
                        aiQuestionPromptKeys_Korean[qTab]
                      )
                    }
                  >
                    PDF 다운로드
                  </Button>
                  <Button variant="outlined" onClick={handleGenerateQuestion}>
                    다시 생성하기
                  </Button>
                  <Button variant="outlined" color="success" onClick={handleSaveAndSolve} disabled={savingAndSolving}>
                    {savingAndSolving ? '저장 중...' : '저장 후 문제풀기'}
                  </Button>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={openQDoneSnackbar}
        onClose={() => setOpenQDoneSnackbar(false)}
        autoHideDuration={10000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: { xs: 0, sm: 400 },
            width: { xs: 'calc(100vw - 32px)', sm: 'auto' },
            background: '#E8F9EE',
            color: '#1a5d3a',
            borderRadius: 2,
            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            px: 2,
            py: 1.5,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
          }}
        >
          <CheckCircleOutline sx={{ fontSize: 22, color: '#1a5d3a', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 500, flexGrow: 1, color: '#1a5d3a' }}>
            문제 저장이 완료되었습니다!
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setOpenQDoneSnackbar(false);
              navigate('/mypage');
            }}
            sx={{
              bgcolor: '#34C759',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1.5,
              px: 1.5,
              py: 0.5,
              flexShrink: 0,
              '&:hover': { bgcolor: '#28a745' },
            }}
          >
            마이페이지
          </Button>
          <IconButton
            size="small"
            onClick={() => setOpenQDoneSnackbar(false)}
            sx={{ color: '#1a5d3a', '&:hover': { bgcolor: 'rgba(26,93,58,0.1)' } }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>
    </>
  );
}
