// src/pages/Login.tsx
import React, { useState } from 'react'
import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Paper,
  Alert,
  Box,
  Typography
} from '@mui/material'
import { Visibility, VisibilityOff, Home, Google } from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { userAPI } from '../services/api'
import Header from '../components/Header'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false) // 로그인 정보 기억 여부
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleClickShowPassword = () => setShowPassword(prev => !prev)

  const handleLogin = async () => {
    setError(null)
    try {
      const res = await userAPI.login(email, password, rememberMe)
      if (res.data.success) {
        // 실제 응답 구조: { success, tokens: { accessToken }, user }
        login(res.data.tokens.accessToken, res.data.user)
        navigate('/')
      } else {
        setError(res.data.message || '로그인에 실패했습니다.')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || '서버 오류로 로그인할 수 없습니다.')
    }
  }

  return (
    <>
      <Header />
      <Container 
        maxWidth="sm" 
        sx={{ mt: 8 }}
      >
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
          }}
        >
          <Typography variant="h5" align="center" fontWeight={600} mb={3}>
            어서오세요!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box>
            <TextField
              fullWidth
              margin="normal"
              label="아이디"
              variant="outlined"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="off"
            />
            <TextField
              fullWidth
              margin="normal"
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              placeholder="12자 이상 입력하세요."
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={2}>
            <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                }
                label="로그인 정보 기억"
              />
              <RouterLink to="#" style={{ textDecoration: 'none' }}>
                비밀번호 찾기
              </RouterLink>
            </Box>

            <Button
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
              onClick={handleLogin}
            >
              로그인
            </Button>

            <Box display="flex" justifyContent="center" gap={2} mt={1}>
              {/* 구글 로그인 아이콘 */}
              <IconButton>
                <Google />
              </IconButton>
              {/* 홈 버튼: 클릭 시 "/"로 이동 */}
              <IconButton component={RouterLink} to="/">
                <Home />
              </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" mt={3} textAlign="center">
              계정이 없으신가요?{' '}
              <RouterLink to="/signup" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                회원가입
              </RouterLink>
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  )
}
