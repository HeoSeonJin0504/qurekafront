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
  id: number;
  name: string;
  displayName?: string;
  date: string;
  time: string;
  createdAt: string;
  text: string;
  type?: string;
  displayType?: string;
  options?: any[];
  answer?: any;
  correct_option_index?: number;
  explanation?: string;
  rawJson?: string;
  folderId?: number;
  favoriteId?: number;
  questionIndex?: number;
  isFavoriteContext?: boolean;  // 🆕 추가 - 즐겨찾기 컨텍스트인지 표시
}
