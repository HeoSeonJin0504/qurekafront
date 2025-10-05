export interface FileItem {
  id: number
  name: string
  date: string
  time: string
  createdAt: string
  text: string
  summaryType?: string
}

export interface QuestionItem {
  id: number
  name: string
  date: string
  time: string
  createdAt: string
  text: string
  type: string
  displayType?: string
  options?: string[]
  answer?: string
  correct_option_index?: number
  explanation?: string
  rawJson?: string  // 원본 JSON 텍스트 저장
}
