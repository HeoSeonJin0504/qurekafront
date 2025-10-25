export interface FileItem {
  id: number
  name: string  // 파일명
  displayName: string  // 요약본 이름
  date: string
  time: string
  createdAt: string
  text: string
  summaryType: string
}

export interface QuestionItem {
  id: number
  name: string  // 파일명
  displayName: string  // 문제 이름
  date: string
  time: string
  createdAt: string
  text: string
  type: string
  displayType: string
  options?: any[]
  answer?: string
  correct_option_index?: number
  explanation?: string
  rawJson?: string
}
