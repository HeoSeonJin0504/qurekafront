// src/AppRouter.tsx
import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import SignupPage from '../pages/SignupPage'
import LoginPage from '../pages/Login'
import Home from '../pages/Home'
import DemoPage from '../pages/DemoPage'
import UploadPage from '../pages/UploadPage'
import Mypage from '../pages/Mypage'
import QuestionSolvePage from '../pages/QuestionSolvePage'
import PrivateRoute from '../routes/PrivateRoute'
import ScrollToTop from '../components/common/ScrollToTop'
import { useAuth } from '../contexts/AuthContext' // 🆕 추가
import { userAPI } from '../services/api' // 🆕 추가

export default function AppRouter() {
  const { login, logout } = useAuth() // 🆕 추가

  // 🆕 앱 시작 시 토큰 검증
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const result = await userAPI.validateToken()
        if (result.success && result.user) {
          // 유효한 토큰이면 사용자 정보 복원
          // accessToken은 이미 저장되어 있음
          login('', result.user) // accessToken은 인터셉터에서 자동 처리
        } else {
          // 유효하지 않은 토큰이면 로그아웃 처리
          logout()
        }
      } catch (error) {
        console.error('토큰 검증 실패:', error)
        logout()
      }
    }

    verifyToken()
  }, []) // 🆕 컴포넌트 마운트 시 한 번만 실행

  return (
    <>
      {/* 페이지 이동 시 상단으로 스크롤하는 컴포넌트 */}
      <ScrollToTop />

      <Routes>
        {/* 공개 경로 */}
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 보호된 경로 */}
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <Mypage />
            </PrivateRoute>
          }
        />
        <Route
          path="/solve-questions"
          element={
            <PrivateRoute>
              <QuestionSolvePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  )
}
