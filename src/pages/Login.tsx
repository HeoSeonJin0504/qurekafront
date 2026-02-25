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
  Alert,
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Visibility, VisibilityOff, Home, Google } from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { userAPI } from '../services/api'
import Header from '../components/Header'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [userid, setUserid] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleClickShowPassword = () => setShowPassword(prev => !prev)

  const handleLogin = async () => {
    if (isLoading) return
    setError(null)
    setIsLoading(true)
    try {
      const res = await userAPI.login(userid, password, rememberMe)
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
      if (statusCode === 429) {
        setError('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 엔터 키 로그인
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <>
      <Header />
      <Container
        maxWidth="sm"
        sx={{
          mt: isMobile ? 4 : 8,
          px: isMobile ? 2 : 3,
          // 모바일: 화면 전체 높이 채우기
          minHeight: isMobile ? 'calc(100vh - 60px)' : 'auto',
          display: isMobile ? 'flex' : 'block',
          flexDirection: 'column',
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}
      >
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onKeyDown={handleKeyDown}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile ? 2 : 3,
            p: isMobile ? 3 : 4,
          }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            align="center"
            fontWeight={700}
            mb={isMobile ? 2 : 3}
          >
            어서오세요!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: isMobile ? '0.85rem' : '1rem' }}>
              {error}
            </Alert>
          )}

          <Box>
            <TextField
              fullWidth
              margin="normal"
              label="아이디"
              variant="outlined"
              value={userid}
              onChange={e => setUserid(e.target.value)}
              autoComplete="username"
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              inputProps={{ style: { fontSize: isMobile ? '1rem' : undefined } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              inputProps={{ style: { fontSize: isMobile ? '1rem' : undefined } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={isLoading}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
              mb={isMobile ? 1.5 : 2}
              flexWrap="wrap"
              gap={0.5}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    로그인 정보 기억
                  </Typography>
                }
              />
              <RouterLink
                to="#"
                style={{
                  textDecoration: 'none',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  color: '#1976d2',
                }}
              >
                비밀번호 찾기
              </RouterLink>
            </Box>

            <Button
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                mb: isMobile ? 1.5 : 2,
                py: isMobile ? 1.2 : undefined,
                fontSize: isMobile ? '1rem' : undefined,
                borderRadius: isMobile ? 2 : undefined,
              }}
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
            </Button>

            <Box display="flex" justifyContent="center" gap={2} mt={1}>
              <IconButton size={isMobile ? 'medium' : 'large'}>
                <Google fontSize={isMobile ? 'medium' : 'large'} />
              </IconButton>
              <IconButton
                component={RouterLink}
                to="/"
                size={isMobile ? 'medium' : 'large'}
              >
                <Home fontSize={isMobile ? 'medium' : 'large'} />
              </IconButton>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={isMobile ? 2 : 3}
              textAlign="center"
              fontSize={isMobile ? '0.82rem' : undefined}
            >
              계정이 없으신가요?{' '}
              <RouterLink
                to="/signup"
                style={{
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  color: '#1976d2',
                }}
              >
                회원가입
              </RouterLink>
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  )
}