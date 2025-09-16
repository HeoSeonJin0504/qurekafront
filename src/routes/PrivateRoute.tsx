// src/routes/PrivateRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Box, CircularProgress } from '@mui/material'

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth()

  // 인증 상태 확인이 진행 중인 경우 로딩 표시
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // 로딩이 끝난 후 로그인 상태가 아니면 로그인 페이지로 리디렉션
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // 로그인 상태이면 자식 컴포넌트 렌더링
  return <>{children}</>
}

export default PrivateRoute
