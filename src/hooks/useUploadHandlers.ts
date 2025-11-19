import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  aiSummaryAPI,
  aiQuestionAPI,
  summaryAPI,
  questionAPI,
  SummaryItem,
} from '../services/api';
import { aiQuestionPromptKeys_Korean } from '../constants/upload';

export const useUploadHandlers = (state: any) => {
  const { user } = useAuth();

  // 파일 유효성 검사
  const validateFile = useCallback((f: File): boolean => {
    const allowedExtensions = ['pdf', 'ppt', 'pptx'];
    const fileExtension = f.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert('PDF, PPT, PPTX 파일만 업로드 가능합니다.');
      return false;
    }
    
    const fileNameWithoutExt = f.name.substring(0, f.name.lastIndexOf('.'));
    const validFileNamePattern = /^[가-힣a-zA-Z0-9.\-_()[\]% ]+$/;
    
    if (!validFileNamePattern.test(fileNameWithoutExt)) {
      alert('파일명에는 한글, 영문, 숫자, 공백, 그리고 . - _ ( ) [ ] % 기호만 사용할 수 있습니다.');
      return false;
    }
    
    return true;
  }, []);

  // JSON 파싱
  const parseQuestionJson = useCallback((jsonText: string): boolean => {
    try {
      const data = JSON.parse(jsonText);
      
      if (!data.questions || !Array.isArray(data.questions)) {
        console.error('Invalid JSON structure: questions array not found');
        return false;
      }
      
      if (data.questions.length === 0) {
        console.error('No questions generated');
        return false;
      }
      
      for (const question of data.questions) {
        if (!question.question_text) {
          console.error('Invalid question: missing question_text');
          return false;
        }
      }
      
      state.setParsedQuestions(data.questions);
      state.setIsJsonFormat(true);
      return true;
    } catch (error) {
      console.error('JSON parsing error:', error);
      state.setIsJsonFormat(false);
      return false;
    }
  }, [state]);

  // 요약 생성
  const handleGenerateSummary = useCallback(async () => {
    if (!state.file || !user) return alert('파일 선택 및 로그인 필요');
    
    state.setLoadingSum(true);
    state.setSummaryError(false);
    
    try {
      const fd = new FormData();
      fd.append('file', state.file);
      fd.append('summary_type', state.aiSummaryType);
      fd.append('field', state.sumField);
      fd.append('level', state.sumLevel);
      fd.append('sentence_count', String(state.sumSentCount));
      
      if (state.sumTab === 2) fd.append('topic_count', String(state.sumTopicCount));
      if (state.sumTab === 4) {
        fd.append('keyword_count', String(state.sumKeywordCount));
        if (state.sumKeywordCount > 0) {
          const validKeywords = state.keywords.filter((k: string) => k && k.trim().length > 0);
          if (validKeywords.length > 0) {
            fd.append('user_keywords', validKeywords.join(','));
          }
        }
      }

      const res = await aiSummaryAPI.generateSummary(fd);
      state.setSummaryText(res.data.summary);
      state.setActiveStep(2);
    } catch (e: any) {
      console.error('요약 생성 오류:', e);
      state.setSummaryError(true);
      state.setActiveStep(2);
    } finally {
      state.setLoadingSum(false);
    }
  }, [state, user]);

  // 파일에서 문제 생성
  const handleGenerateQuestionFromFile = useCallback(async () => {
    if (!state.file || !user) return alert('파일 선택 및 로그인 필요');
    
    state.setLoadingQ(true);
    state.setQuestionError(false);
    
    try {
      const fd = new FormData();
      fd.append('file', state.file);
      fd.append('generation_type', `문제 생성_${aiQuestionPromptKeys_Korean[state.qTab]}`);
      fd.append('field', state.qField);
      fd.append('level', state.qLevel);
      fd.append('question_count', String(state.qCount));
      
      if (state.qTab === 0) {
        fd.append('choice_count', String(state.optCount));
        fd.append('choice_format', state.optionFormat);
      }
      if (state.qTab === 1) fd.append('array_choice_count', String(state.optCount));
      if (state.qTab === 2) fd.append('blank_count', String(state.blankCount));

      const res = await aiQuestionAPI.generateQuestionsFromFile(fd);
      state.setQuestionText(res.data.result);
      const isValid = parseQuestionJson(res.data.result);
      if (!isValid) state.setQuestionError(true);
      state.setActiveStep(2);
    } catch (e: any) {
      console.error('문제 생성 오류:', e);
      state.setQuestionError(true);
      state.setActiveStep(2);
    } finally {
      state.setLoadingQ(false);
    }
  }, [state, user, parseQuestionJson]);

  // 요약본에서 문제 생성
  const handleGenerateQuestion = useCallback(async () => {
    if (!state.summaryText || !user) return alert('요약 후 문제 생성을 눌러주세요');
    
    state.setLoadingQ(true);
    state.setQuestionError(false);
    
    try {
      const payload: any = {
        generation_type: `문제 생성_${aiQuestionPromptKeys_Korean[state.qTab]}`,
        summary_text: state.summaryText,
        field: state.qField,
        level: state.qLevel,
        question_count: state.qCount,
      };
      
      if (state.qTab === 0) {
        payload.choice_count = state.optCount;
        payload.choice_format = state.optionFormat;
      }
      if (state.qTab === 1) payload.array_choice_count = state.optCount;
      if (state.qTab === 2) payload.blank_count = state.blankCount;

      const res = await aiQuestionAPI.generateQuestions(payload);
      state.setQuestionText(res.data.result);
      const isValid = parseQuestionJson(res.data.result);
      if (!isValid) state.setQuestionError(true);
      
      if (state.mode === 'summary') {
        state.setActiveStep(4);
      } else if (state.mode === 'question' && state.questionSource === 'saved') {
        state.setActiveStep(2);
      }
    } catch (e: any) {
      console.error('문제 생성 오류:', e);
      state.setQuestionError(true);
      
      if (state.mode === 'summary') {
        state.setActiveStep(4);
      } else if (state.mode === 'question' && state.questionSource === 'saved') {
        state.setActiveStep(2);
      }
    } finally {
      state.setLoadingQ(false);
    }
  }, [state, user, parseQuestionJson]);

  // 저장
  const handleConfirmSave = useCallback(async (customName: string) => {
    if (!user || !state.fileName) return;
    
    try {
      if (state.saveDialogType === 'summary') {
        await summaryAPI.saveSummary({
          userId: user.id,
          fileName: state.fileName,
          summaryName: customName,
          summaryType: state.dbSummaryTypeKorean,
          summaryText: state.summaryText,
        });
        state.setOpenSumDoneSnackbar(true);
      } else {
        await questionAPI.saveQuestion({
          userId: user.id,
          fileName: state.fileName,
          questionName: customName,
          questionType: aiQuestionPromptKeys_Korean[state.qTab],
          questionText: state.questionText,
        });
        state.setOpenQDoneSnackbar(true);
      }
      state.setOpenSaveNameDialog(false);
    } catch (e) {
      alert('저장 중 오류');
    }
  }, [state, user]);

  return {
    validateFile,
    parseQuestionJson,
    handleGenerateSummary,
    handleGenerateQuestionFromFile,
    handleGenerateQuestion,
    handleConfirmSave,
  };
};
