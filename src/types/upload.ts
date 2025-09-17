export type MainTab = 'summary' | 'problem'

export type AiSummaryPromptKey =
  | '내용 요약_기본 요약'
  | '내용 요약_핵심 요약'
  | '내용 요약_주제 요약'
  | '내용 요약_목차 요약'
  | '내용 요약_키워드 요약'

export type DbSummaryPromptKey_Korean =
  | '기본 요약'
  | '핵심 요약'
  | '주제 요약'
  | '목차 요약'
  | '키워드 요약'

export type AiQuestionPromptKey_Korean =
  | 'n지 선다형'
  | '순서 배열형'
  | '빈칸 채우기형'
  | '참거짓형'
  | '단답형'
  | '서술형'

export interface Question {
  question_text: string
  options?: Array<{ id: string; text: string }>
  correct_answer?: string | boolean
  items?: Array<{ id: string; text: string }>
  correct_sequence?: string[]
  blanks?: Array<{ correct_answer: string; options?: Array<{ id: string; text: string }> }>
  alternative_answers?: string[]
  answer_keywords?: string[]
  model_answer?: string
  explanation?: string
}
