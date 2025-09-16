import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'light', // 다크 모드도 쉽게 전환 가능
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
    },
    primary: {
      main: '#2563eb', // 더 깊고 세련된 블루
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e', // 더 차분한 틸 색상
      light: '#14b8a6',
      dark: '#0d5a54',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a',
      light: '#22c55e',
      dark: '#15803d',
    },
    warning: {
      main: '#ea580c',
      light: '#fb923c',
      dark: '#c2410c',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
    },
    text: {
      primary: '#0f172a', // 더 깊은 검정
      secondary: '#475569', // 부드러운 회색
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: [
      'Pretendard Variable',
      'Pretendard',
      'Noto Sans KR',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: '#0f172a',
    },
    h2: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h3: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
      color: '#0f172a',
    },
    h4: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
      color: '#1e293b',
    },
    h5: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      color: '#1e293b',
    },
    h6: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#334155',
    },
    body1: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.7,
      color: '#334155',
    },
    body2: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#475569',
    },
    button: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    caption: {
      fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Pretendard Variable, Pretendard, Noto Sans KR, Inter, sans-serif',
          backgroundColor: '#fafbfc',
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '*': {
          boxSizing: 'border-box',
        },
        ':focus-visible': {
          outline: '2px solid #2563eb',
          outlineOffset: '2px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '0.875rem',
          minHeight: 44,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #f1f5f9',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#e2e8f0',
              borderWidth: 1.5,
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#f1f5f9',
        },
      },
    },
  },
})

// 다크 테마도 함께 제공 (필요시 사용)
export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#64748b',
    },
    divider: '#334155',
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)