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
  Typography,
  CircularProgress // 🆕 추가
} from '@mui/material'
import { Visibility, VisibilityOff, Home, Google } from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { userAPI } from '../services/api'
import Header from '../components/Header'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [userid, setUserid] = useState('') // 🔧 email → userid 변경
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // 🆕 로딩 상태 추가
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleClickShowPassword = () => setShowPassword(prev => !prev)

  const handleLogin = async () => {
    // 🆕 이미 로딩 중이면 중복 실행 방지
    if (isLoading) {
      return;
    }
    
    setError(null)
    setIsLoading(true) // 🆕 로딩 시작
    
    try {
      const res = await userAPI.login(userid, password, rememberMe) // 🔧 email → userid 변경
      if (res.data.success) {
        login(res.data.tokens.accessToken, res.data.user)
        navigate('/')
      } else {
        setError(res.data.message || '로그인에 실패했습니다.')
      }
    } catch (err: any) {
      console.error(err)
      const statusCode = err.response?.status
      const errorMessage = err.response?.data?.message || '서버 오류로 로그인할 수 없습니다.'
      
      // 🆕 429 에러 처리
      if (statusCode === 429) {
        setError('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false) // 🆕 로딩 종료
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
              value={userid} // 🔧 email → userid 변경
              onChange={e => setUserid(e.target.value)} // 🔧 setEmail → setUserid 변경
              autoComplete="off"
              disabled={isLoading} // 🆕 로딩 중 비활성화
            />
            <TextField
              fullWidth
              margin="normal"
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              placeholder="8자 이상 입력하세요." // 🔧 12자 → 8자로 수정 (회원가입 정책과 일치)
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="off"
              disabled={isLoading} // 🆕 로딩 중 비활성화
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end" disabled={isLoading}>
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
                    disabled={isLoading} // 🆕 로딩 중 비활성화
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
              disabled={isLoading} // 🆕 로딩 중 비활성화
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
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
