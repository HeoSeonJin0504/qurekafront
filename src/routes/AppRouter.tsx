// src/AppRouter.tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SignupPage from '../pages/SignupPage'
import LoginPage from '../pages/Login'
import Home from '../pages/Home'
import UploadPage from '../pages/UploadPage'
//import QuestionCreatePage from '../pages/QuestionCreatePage'
import Mypage from '../pages/Mypage'
import PrivateRoute from '../routes/PrivateRoute'

export default function AppRouter() {
  return (
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
      {/* <Route
        path="/question-create"
        element={
          <PrivateRoute>
            <QuestionCreatePage />
          </PrivateRoute>
        }
      /> */}
      <Route
        path="/mypage"
        element={
          <PrivateRoute>
            <Mypage />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}
