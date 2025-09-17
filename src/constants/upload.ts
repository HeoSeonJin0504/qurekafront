import { AiSummaryPromptKey, DbSummaryPromptKey_Korean, AiQuestionPromptKey_Korean } from '../types/upload'

export const summaryLabels = ['기본', '핵심', '주제', '목차', '키워드']

export const aiSummaryPromptKeys: AiSummaryPromptKey[] = [
  '내용 요약_기본 요약',
  '내용 요약_핵심 요약',
  '내용 요약_주제 요약',
  '내용 요약_목차 요약',
  '내용 요약_키워드 요약',
]

export const dbSummaryPromptKeys_Korean: DbSummaryPromptKey_Korean[] = [
  '기본 요약',
  '핵심 요약',
  '주제 요약',
  '목차 요약',
  '키워드 요약',
]

export const questionLabels = [
  'n지 선다형',
  '순서 배열형',
  '빈칸 채우기형',
  '참/거짓형',
  '단답형',
  '서술형',
]

export const aiQuestionPromptKeys_Korean: AiQuestionPromptKey_Korean[] = [
  'n지 선다형',
  '순서 배열형',
  '빈칸 채우기형',
  '참거짓형',
  '단답형',
  '서술형',
]

export const FIELD_OPTIONS = ['언어', '과학', '사회', '경제', '인문학', '공학','철학','종교']
export const LEVEL_OPTIONS = [
  { value: '비전공자', icon: '📚' },
  { value: '전공자', icon: '🎓' },
]
