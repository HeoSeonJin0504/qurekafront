// src/AppRouter.tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SignupPage from '../pages/SignupPage'
import LoginPage from '../pages/Login'
import Home from '../pages/Home'
import UploadPage from '../pages/UploadPage'
import Mypage from '../pages/Mypage'
import QuestionSolvePage from '../pages/QuestionSolvePage'
import PrivateRoute from '../routes/PrivateRoute'
import ScrollToTop from '../components/common/ScrollToTop' // 새로운 컴포넌트 가져오기

export default function AppRouter() {
  return (
    <>
      {/* 페이지 이동 시 상단으로 스크롤하는 컴포넌트 */}
      <ScrollToTop />

      <Routes>
        {/* 공개 경로 */}
        <Route path="/" element={<Home />} />
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
