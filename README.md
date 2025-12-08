# Qurekafront
Qurekafront는 강의 자료를 기반으로 요약본과 문제를 자동 생성하는 학습 플랫폼의 **프론트엔드(React)**입니다.

---

## 프로젝트 개요

사용자가 강의자료(PDF, PPT)를 업로드하면 ChatGPT API가 이를 분석하여 요약본과 문제를 자동으로 생성합니다. 
사용자는 생성된 요약본과 문제를 저장하고, 문제를 풀어볼 수 있으며, 원하는 문제를 즐겨찾기에 추가하여 관리할 수 있습니다.

### 본 프로젝트 주요 기능

- **요약**: 학습 자료를 핵심만 추출하여 빠르게 파악
- **문제 생성**: 6가지 문제 유형 지원
- **학습**: 생성한 요약본과 문제를 저장하고 학습
- **즐겨찾기**: 중요한 문제를 폴더별로 분류하여 관리

### 페이지 구성
| 페이지 | 설명 |
|--------|------|
| **홈(Home)** | 서비스 소개 및 사용 가이드 |
| **로그인/회원가입** | JWT 기반 인증 시스템 |
| **실습하기(Upload)** | 파일 업로드 및 요약/문제 생성 |
| **문제 풀기(Solve)** | 저장된 문제를 풀고 채점 |
| **마이페이지(Mypage)** | 생성 이력 조회 및 관리 |

### 주요 UI 기능

#### 1. **요약 생성**
- **5가지 요약 유형**
  - 기본 요약 / 핵심 요약 / 주제별 요약 / 목차 요약 / 키워드 요약
- **설정 옵션**
  - 분야(언어, 과학, 사회 등) 선택
  - 문장 수, 주제 수, 키워드 수 조절
  - 사용자 정의 키워드 입력
- **실시간 편집 및 다운로드**
  - 생성된 요약본을 바로 수정 가능
  - PDF/TXT 형식으로 다운로드

#### 2. **문제 생성**
- **6가지 문제 유형**
  - n지 선다형 / 순서 배열형 / 빈칸 채우기형
  - 참/거짓형 / 단답형 / 서술형
- **생성 방식**
  - 파일에서 직접 생성
  - 저장된 요약본으로 생성
- **문제 설정**
  - 문제 수(1~5개), 보기 수, 빈칸 수 등 세부 조정
  - 보기 형식 선택 (숫자/알파벳)

#### 3. **문제 풀이 시스템**
  - 문제 유형별 최적화된 입력 인터페이스
  - 실시간 정답 확인 및 해설 제공
- **학습 관리**
  - 즐겨찾기 기능 (폴더별 분류)
  - 학습 결과 통계 제공
  - 틀린 문제 재도전 기능
  - 즐겨찾기 문제 연속 풀이

#### 4. **마이페이지**
- 생성한 요약본/문제 목록 조회
- 검색, 필터링, 정렬 기능
- 이름 변경, 삭제, PDF 다운로드

#### 5. **즐겨찾기 시스템**
- 폴더 생성 및 관리
- 문제별 즐겨찾기 추가/제거
- 폴더 간 문제 이동
- 즐겨찾기 추가 날짜 기록

### 🔌 API 연동 방식
- **Axios 기반 HTTP 통신**
- **JWT 토큰 인증**
  - Access Token: 30분 유효
  - Refresh Token: 7일 유효 (자동 갱신)
  - 자동 로그인 기능 (localStorage/sessionStorage 선택)
- **에러 핸들링**
  - 401 에러 시 자동 토큰 재발급
  - 429 에러 시 Rate Limit 안내
  - 파일 텍스트 길이 검증 (최소 200자)

---

## 🛠️ 기술 스택 (Tech Stack)

### Core
- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안정성 및 개발 생산성 향상
- **Vite** - 빠른 개발 서버 및 빌드 도구

### UI/UX
- **Material-UI (MUI)** - 디자인 시스템 및 컴포넌트
  - `@mui/material`, `@mui/icons-material`
  - `@emotion/react`, `@emotion/styled` - 스타일링
- **React Router** - 페이지 라우팅 및 네비게이션

### 상태 관리
- **React Context API** - 인증 상태 관리 (AuthContext)
- **Custom Hooks** - 컴포넌트 로직 재사용
  - `useUploadState` - 파일 업로드 상태 관리
  - `useUploadHandlers` - 요약/문제 생성 로직

### HTTP 통신
- **Axios** - REST API 통신
  - 인터셉터로 토큰 자동 갱신
  - 요청/응답 전처리

### 파일 처리
- **jsPDF** - PDF 생성 및 다운로드
- **jsPDF-AutoTable** - PDF 테이블 생성
- **html2canvas** - HTML 요소를 이미지로 변환

### 코드 품질
- **TypeScript** - 타입 체크로 런타임 에러 방지

## 📁 프로젝트 구조

```
qurekafront/
├── public/                 # 정적 파일
│   └── fonts/             # 폰트 파일 (NotoSansKR)
├── src/
│   ├── assets/            # 이미지 및 정적 리소스
│   │   └── images/        # 프로젝트 이미지 파일
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── common/       # 공통 컴포넌트
│   │   │   ├── PageNavigator.tsx   # 페이지 네비게이션
│   │   │   └── ScrollToTop.tsx     # 스크롤 최상단 이동
│   │   ├── upload/       # 업로드 관련 컴포넌트
│   │   │   ├── FileUploadArea.tsx
│   │   │   ├── SummarySettings.tsx
│   │   │   ├── ProblemSettings.tsx
│   │   │   ├── ResultDisplay.tsx
│   │   │   ├── ErrorDisplay.tsx
│   │   │   ├── SaveNameDialog.tsx
│   │   │   ├── SavedSummaryDialog.tsx
│   │   │   ├── ModeSelection.tsx
│   │   │   ├── NavigationBlocker.tsx
│   │   │   └── QuestionRenderer.tsx
│   │   ├── questions/    # 문제 풀이 관련 컴포넌트
│   │   │   ├── QuestionSolver.tsx
│   │   │   ├── MultipleChoiceQuestion.tsx
│   │   │   ├── TrueFalseQuestion.tsx
│   │   │   ├── FillInTheBlankQuestion.tsx
│   │   │   ├── SequenceQuestion.tsx
│   │   │   ├── ShortAnswerQuestion.tsx
│   │   │   ├── DescriptiveQuestion.tsx
│   │   │   └── QuestionResultSummary.tsx
│   │   ├── mypage/       # 마이페이지 관련 컴포넌트
│   │   │   ├── FileListSection.tsx
│   │   │   ├── QuestionDetailDialog.tsx
│   │   │   └── RenameDialog.tsx
│   │   ├── Header.tsx           # 헤더 컴포넌트
│   │   └── ServiceFlowDemo.tsx  # 서비스 플로우 데모
│   ├── contexts/         # React Context
│   │   └── AuthContext.tsx      # 인증 컨텍스트
│   ├── hooks/            # Custom Hooks
│   │   ├── useUploadState.ts
│   │   └── useUploadHandlers.ts
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── SignupPage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── QuestionSolvePage.tsx
│   │   └── Mypage.tsx
│   ├── routes/           # 라우팅
│   │   ├── AppRouter.tsx
│   │   └── PrivateRoute.tsx
│   ├── services/         # API 통신 로직
│   │   └── api.ts        # Axios 인스턴스 및 API 함수
│   ├── types/            # TypeScript 타입 정의
│   │   ├── upload.ts
│   │   └── mypage.ts
│   ├── utils/            # 유틸리티 함수
│   │   └── pdfUtils.ts   # PDF 생성 유틸리티
│   ├── constants/        # 상수 정의
│   │   └── upload.ts     # 업로드 관련 상수
│   ├── App.tsx           # 앱 진입점
│   └── main.tsx          # React 렌더링
├── .env                   # 환경 변수
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 환경 변수 (.env)

`.env` 파일을 생성하고 다음 내용을 설정하세요:
```env
# 백엔드 서버(Node.JS) 주소
VITE_BACKEND_URL=http://localhost:3000

# AI 서버(FastAPI) 서버 주소
VITE_FASTAPI_URL=http://localhost:8000/api

# 프론트엔드(React) 서버 주소
VITE_FRONTEND_URL=http://localhost:5173
```

## 설치 및 실행

### 1. 저장 클론
```bash
git clone <repository-url>
cd qurekafront
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 위의 환경 변수를 설정합니다.

### 4. 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 페이지 흐름 (UX Flow)

```
1. 페이지 방문
   ↓
2. 로그인/회원가입
   - 아이디 중복 확인
   - 자동 로그인 선택
   ↓
3. 실습하기 페이지
   ├─ 모드 선택 (요약 생성 / 문제 생성)
   ├─ 파일 업로드 (PDF/PPT)
   ├─ 요약 유형 선택 및 설정
   ├─ AI 요약 생성 대기
   ├─ 요약본 확인 및 편집
   ├─ 요약본 저장/다운로드
   └─ (선택) 문제 생성
       ├─ 문제 유형 선택
       ├─ 세부 설정
       ├─ AI 문제 생성 대기
       └─ 문제 저장
   ↓
4. 문제 풀기 페이지
   ├─ 내 문제 모음 또는 즐겨찾기 선택
   ├─ 문제 풀이
   ├─ 정답 확인 및 해설 보기
   ├─ 즐겨찾기 추가 (폴더 선택)
   ├─ 학습 결과 요약 확인
   └─ 틀린 문제 재도전
   ↓
5. 마이페이지
   ├─ 생성한 요약본/문제 목록 확인
   ├─ 검색 및 필터링
   ├─ 이름 변경
   ├─ PDF 다운로드
   └─ 삭제
```

## 📝 학습 포인트

### 핵심 개념

- **컴포넌트 기반 개발**: 재사용 가능한 UI 조각으로 앱 구성
- **Props & State**: 컴포넌트 간 데이터 전달 및 상태 관리
- **Hooks**: `useState`, `useEffect`, `useContext` 등으로 함수형 컴포넌트에서 상태 관리
- **Context API**: 전역 상태 관리 (로그인 정보 등)
- **Custom Hooks**: 로직 재사용을 위한 커스텀 훅 작성
- **TypeScript**: 타입 안정성으로 런타임 에러 감소
- **React Router**: 페이지 라우팅 및 보호된 경로(PrivateRoute) 구현
- **Axios Interceptors**: 요청/응답 전처리 및 토큰 자동 갱신

### 주요 구현 기능

- **단계별 UI**: Stepper 컴포넌트로 진행 단계 표시
- **파일 유효성 검사**: 파일 형식 및 파일명 검증
- **에러 처리**: 서버 에러 타입별 사용자 친화적 메시지 표시
- **PDF 생성**: jsPDF를 활용한 한글 폰트 지원 PDF 다운로드
- **즐겨찾기 시스템**: 폴더별 문제 관리 및 상태 캐싱
- **문제 풀이**: 6가지 문제 유형별 맞춤 UI 및 자동 채점
- **학습 결과 추적**: 정답률, 틀린 문제 재도전 기능

## 개발
본 프로젝트는 **Claude Sonnet 3.7** AI를 활용하여 코드 리뷰, 리팩토링, 문서화 작업을 수행했습니다.

## 저장소
본 프로젝트는 3개의 저장소로 구성되어 있습니다:

- **프론트엔드 (React)** - 현재 저장소
  
- **백엔드 (Node.JS)** - 사용자 인증, 데이터 관리, API 서버
  - https://github.com/HeoSeonJin0504/qurekanode-supabase.git
  
- **AI 서버 (FastAPI)** - ChatGPT API 관련 기능
  - https://github.com/hanataba227/qureka-fastapi.git

