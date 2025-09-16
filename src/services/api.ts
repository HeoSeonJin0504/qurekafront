// src/services/api.ts 
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 토큰 관리 유틸리티 - 자동 로그인 여부에 따라 저장소 선택
export const tokenStorage = {
  // 스토리지 타입을 결정하는 키 (localStorage에 저장)
  storageTypeKey: 'tokenStorageType',
  
  // 스토리지 타입 설정 (자동 로그인 여부에 따라)
  setStorageType: (rememberMe: boolean) => {
    localStorage.setItem('tokenStorageType', rememberMe ? 'localStorage' : 'sessionStorage');
  },
  
  // 현재 스토리지 타입 가져오기
  getStorageType: () => {
    return localStorage.getItem('tokenStorageType') || 'sessionStorage';
  },
  
  // 토큰 저장소 선택 (자동 로그인 여부에 따라)
  getStorage: () => {
    return tokenStorage.getStorageType() === 'localStorage' ? localStorage : sessionStorage;
  },
  
  // 액세스 토큰 가져오기
  getAccessToken: () => {
    return tokenStorage.getStorage().getItem('accessToken');
  },
  
  // 리프레시 토큰 가져오기
  getRefreshToken: () => {
    return tokenStorage.getStorage().getItem('refreshToken');
  },
  
  // 토큰 저장 및 스토리지 타입 설정 개선
  setTokens: (accessToken: string, refreshToken: string, rememberMe?: boolean) => {
    // rememberMe 파라미터가 있으면 스토리지 타입 설정
    if (rememberMe !== undefined) {
      tokenStorage.setStorageType(rememberMe);
    }
    
    const storage = tokenStorage.getStorage();
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    
    // rememberMe 상태도 저장
    if (rememberMe !== undefined) {
      storage.setItem('rememberMe', String(rememberMe));
    }
  },
  
  // 자동 로그인 상태 확인 메서드 추가
  isRememberMeEnabled: () => {
    const storage = tokenStorage.getStorage();
    return storage.getItem('rememberMe') === 'true';
  },
  
  // 토큰 삭제하기
  clearTokens: () => {
    // 모든 스토리지에서 토큰 삭제 (안전하게)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    
    // 스토리지 타입 초기화 (선택사항)
    localStorage.removeItem('tokenStorageType');
  },
  
  // 액세스 토큰만 업데이트
  setAccessToken: (accessToken: string) => {
    tokenStorage.getStorage().setItem('accessToken', accessToken);
  },
  
  // 토큰 존재 여부 확인
  hasTokens: () => {
    const storage = tokenStorage.getStorage();
    return !!storage.getItem('accessToken') && !!storage.getItem('refreshToken');
  }
};

// Node.js 백엔드 (인증·저장·조회)
export const backendAPI = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1', // ngrok 사용 시 브라우저 경고 방지
  },
  withCredentials: false, // CORS 문제 해결을 위해 false로 변경
});

// 요청 인터셉터 - 요청 전 헤더에 액세스 토큰 추가
backendAPI.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 액세스 토큰 만료 시 갱신 처리
backendAPI.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // 401 Unauthorized 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers?.['X-Retry']) {
      try {
        const refreshToken = tokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          // 리프레시 토큰이 없는 경우 조용히 에러 반환
          return Promise.reject(error);
        }
        
        // 토큰 갱신 요청
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh-token`, 
          { refreshToken },
          { withCredentials: false } // 쿠키 포함 설정
        );
        
        // 새 액세스 토큰 저장
        const { accessToken } = response.data;
        tokenStorage.setAccessToken(accessToken);
        
        // 원래 요청 재시도
        if (originalRequest) {
          // 타입 안전하게 헤더를 설정
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['X-Retry'] = 'true';
          
          return backendAPI(originalRequest);
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        // 토큰 갱신 실패 시 토큰 제거
        tokenStorage.clearTokens();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// FastAPI (AI 생성 전용)
export const aiAPI = axios.create({
  baseURL: import.meta.env.VITE_FASTAPI_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1'
  }
});

// 사용자 관리 API 개선
export const userAPI = {
  checkUserid: (userid: string) =>
    backendAPI.post('/users/check-userid', { userid }),
    
  register: (data: any) =>
    backendAPI.post('/users/register', data),
    
  login: async (userid: string, password: string, rememberMe: boolean) => {
    try {
      const response = await backendAPI.post('/users/login', { userid, password, rememberMe });
      
      // 토큰과 사용자 정보 추출
      const { tokens, user } = response.data;
      
      // 토큰 저장 (자동 로그인 여부 전달)
      if (tokens && tokens.accessToken && tokens.refreshToken) {
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken, rememberMe);
      }
      
      return response;
    } catch (error) {
      console.error('로그인 중 오류:', error);
      throw error;
    }
  },
  
  // 로그아웃 메서드 추가
  logout: async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        // 이미 로그아웃된 상태라면 성공으로 처리
        return { success: true, message: '로그아웃 되었습니다.' };
      }
      
      try {
        // 서버에 로그아웃 요청 시도
        await backendAPI.post('/auth/logout', { refreshToken });
      } catch (apiError) {
        console.warn('서버 로그아웃 API 호출 실패:', apiError);
        // 서버 요청이 실패해도 진행
      }
      
      // 로컬에서 토큰 제거
      tokenStorage.clearTokens();
      return { success: true, message: '로그아웃 되었습니다.' };
    } catch (error) {
      // 예외가 발생해도 로컬 토큰은 삭제
      tokenStorage.clearTokens();
      console.error('로그아웃 중 에러 발생:', error);
      return { success: false, message: '로그아웃 처리가 완료되었습니다.' };
    }
  },
  
  // 토큰 검증 메서드 강화
  validateToken: async () => {
    try {
      if (!tokenStorage.hasTokens()) {
        return { success: false, message: '토큰이 없습니다.' };
      }
      
      const response = await backendAPI.get('/auth/verify');
      
      // 서버에서 응답받은 사용자 정보 반환
      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
          message: '유효한 토큰입니다.'
        };
      }
      
      return { success: false, message: '토큰이 유효하지 않습니다.' };
    } catch (error) {
      return { 
        success: false, 
        message: '토큰이 유효하지 않습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }
};

// AI 요약 생성 API (FastAPI) 
export const aiSummaryAPI = {
  generateSummary: (formData: FormData) =>
    aiAPI.post('/summarize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// AI 문제 생성 API (FastAPI)
export const aiQuestionAPI = {
  generateQuestions: (data: any) =>
    aiAPI.post('/generate', data, {
      headers: { 'Content-Type': 'application/json' },
    }),
};

// 요약 저장·조회·삭제 API
export interface SummaryItem {
  selection_id: number
  file_name: string
  summary_type: string
  created_at: string
  summary_text: string
}

export interface GetSummariesResponse {
  success: boolean
  count: number
  summaries: SummaryItem[]
}

export const summaryAPI = {
  getUserSummaries: (userId: number) =>
    backendAPI.get<GetSummariesResponse>(`/summaries/user/${userId}`),

  saveSummary: (data: {
    userId: number
    fileName: string
    summaryType: string
    summaryText: string
  }) =>
    backendAPI.post('/summaries', data),

  deleteSummary: (selectionId: number) =>
    backendAPI.delete(`/summaries/${selectionId}`),
    
  // 추가 메서드
  getSummaryById: (summaryId: number) =>
    backendAPI.get(`/summaries/${summaryId}`),
    
  searchSummaries: (userId: number, params: { query?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.type) queryParams.append('type', params.type);
    
    const url = `/summaries/search/${userId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    
    return backendAPI.get(url);
  },
  
  getSummaryMetadata: (userId: number) =>
    backendAPI.get(`/summaries/user/${userId}/meta`)
};

// ─── 문제 저장·조회·삭제 API (Node.js 백엔드) ─────────────────────────────────────────
export interface QuestionItem {
  selection_id: number
  file_name: string
  question_type: string
  created_at: string
  question_text: string
}

export interface GetQuestionsResponse {
  success: boolean
  count: number
  questions: QuestionItem[]
}

export const questionAPI = {
  getUserQuestions: (userId: number) =>
    backendAPI.get<GetQuestionsResponse>(`/questions/user/${userId}`),

  saveQuestion: (data: {
    userId: number
    fileName: string
    questionType: string
    questionText: string
  }) =>
    backendAPI.post('/questions', data),

  deleteQuestion: (selectionId: number) =>
    backendAPI.delete(`/questions/${selectionId}`),
    
  // 추가 메서드
  getQuestionById: (questionId: number) =>
    backendAPI.get(`/questions/${questionId}`),
    
  searchQuestions: (userId: number, params: { query?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.type) queryParams.append('type', params.type);
    
    const url = `/questions/search/${userId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    
    return backendAPI.get(url);
  }
};

// 요약 및 문제 생성 관련 통합 API 추가
export const generationAPI = {
  generateSummary: async (formData: FormData) => {
    try {
      const response = await aiAPI.post('/summarize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': '1'
        },
        withCredentials: false
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || '요약 생성 중 오류가 발생했습니다.');
      }
      throw new Error('서버 연결에 실패했습니다.');
    }
  },

  generateQuestion: async (requestData: any) => {
    try {
      const response = await aiAPI.post('/generate', requestData, {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || '문제 생성 중 오류가 발생했습니다.');
      }
      throw new Error('서버 연결에 실패했습니다.');
    }
  }
};

export default backendAPI;