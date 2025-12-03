import React, { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  FormHelperText,
  CircularProgress
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { userAPI } from '../services/api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

interface SignUpForm {
  userId: string
  name: string
  age: string
  gender: string
  phone: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<SignUpForm>({
    userId: '',
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // 유효성 검사 상태
  const [phoneError, setPhoneError] = useState<string>('')
  
  // 아이디 중복 확인 상태
  const [isIdChecked, setIsIdChecked] = useState<boolean>(false)
  const [isIdValid, setIsIdValid] = useState<boolean>(false)
  const [idCheckMessage, setIdCheckMessage] = useState<string>('')
  
  // 🆕 로딩 상태 추가
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isCheckingId, setIsCheckingId] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    
    // 아이디 변경 시 중복확인 상태 초기화
    if (name === 'userId') {
      setIsIdChecked(false)
      setIsIdValid(false)
      setIdCheckMessage('')
    }
    
    // 전화번호 형식 검증
    if (name === 'phone') {
      validatePhoneNumber(value)
    }
  }

  // 전화번호 형식 검증 함수
  const validatePhoneNumber = (phone: string) => {
    // 하이픈 제거 후 검사
    const cleanPhone = phone.replace(/-/g, '')
    
    // 빈 값이면 오류 메시지 없음
    if (!cleanPhone) {
      setPhoneError('')
      return
    }
    
    // 010으로 시작하는 11자리 숫자인지 확인
    const phoneRegex = /^010\d{8}$/
    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError('010으로 시작하는 11자리 숫자를 입력해주세요')
    } else {
      setPhoneError('')
    }
  }

  const handleGenderChange = (e: SelectChangeEvent<string>) => {
    setForm(prev => ({ ...prev, gender: e.target.value }))
  }

  const handleIdCheck = async () => {
    // 입력 값 검증
    if (!form.userId.trim()) {
      setIdCheckMessage('아이디를 입력해주세요.');
      setIsIdChecked(true);
      setIsIdValid(false);
      return;
    }

    // 🆕 중복 확인 중 버튼 비활성화
    setIsCheckingId(true);
    
    try {
      const { data } = await userAPI.checkUserid(form.userId)
      setIdCheckMessage('사용 가능한 아이디입니다.'); 
      setIsIdChecked(true);
      setIsIdValid(true);
    } catch (err: any) {
      // 백엔드에서 오는 실제 오류 메시지 표시
      if (err.response?.data?.message) {
        setIdCheckMessage(err.response.data.message);
      } else {
        setIdCheckMessage('중복 확인 중 오류가 발생했습니다.');
      }
      setIsIdChecked(true);
      setIsIdValid(false);
      console.error('ID 중복 확인 오류:', err);
    } finally {
      // 🆕 로딩 상태 해제
      setIsCheckingId(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 🆕 이미 제출 중이면 중복 실행 방지
    if (isSubmitting) {
      return;
    }
    
    // 아이디 중복확인 여부 검증
    if (!isIdChecked || !isIdValid) {
      alert('아이디 중복 확인이 필요합니다.');
      return;
    }
    
    // 필수 필드 검증
    if (!form.userId.trim() || !form.name.trim() || !form.age || !form.gender || !form.phone.trim() || !form.password.trim()) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }
    
    // 비밀번호 일치 검증
    if (form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }
    
    // 전화번호 형식 검증
    const cleanPhone = form.phone.replace(/-/g, '')
    const phoneRegex = /^010\d{8}$/
    if (!phoneRegex.test(cleanPhone)) {
      alert('올바른 전화번호 형식이 아닙니다. 010으로 시작하는 11자리 숫자를 입력해주세요.')
      return
    }
    
    // 🆕 제출 시작 - 버튼 비활성화
    setIsSubmitting(true);
    
    try {
      await userAPI.register({
        userid: form.userId,
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        phone: cleanPhone,
        email: form.email || undefined,
        password: form.password
      })
      alert('회원가입이 완료되었습니다.')
      navigate('/login')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message
      const statusCode = err.response?.status
      
      // 🆕 429 에러 처리 (Rate Limit 또는 동시 요청)
      if (statusCode === 429) {
        if (errorMessage.includes('동시')) {
          alert('회원가입 처리 중입니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert('너무 많은 회원가입 시도가 있었습니다. 15분 후에 다시 시도해주세요.');
        }
      } 
      // 🆕 409 에러 처리 (중복 데이터)
      else if (statusCode === 409) {
        if (errorMessage.includes('전화번호')) {
          alert('이미 등록된 전화번호입니다.');
        } else if (errorMessage.includes('이름')) {
          alert('이미 등록된 이름입니다.');
        } else if (errorMessage.includes('아이디')) {
          alert('이미 등록된 아이디입니다.');
          // 아이디 중복 확인 상태 초기화
          setIsIdChecked(false);
          setIsIdValid(false);
          setIdCheckMessage('');
        } else {
          alert(errorMessage);
        }
      }
      // 기존 에러 처리
      else if (errorMessage.includes('이미 등록된 전화번호')) {
        alert('이미 등록된 전화번호입니다.')
      } else if (errorMessage.includes('이미 등록된 이름')) {
        alert('이미 등록된 이름입니다.')
      } else {
        alert(errorMessage)
      }
    } finally {
      // 🆕 제출 완료 - 버튼 활성화
      setIsSubmitting(false);
    }
  }

  // 전화번호 자동 하이픈 추가 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value)
    setForm(prev => ({ ...prev, phone: formattedNumber }))
    validatePhoneNumber(formattedNumber)
  }

  return (
    <>
      <Header />
      <Container 
        maxWidth="sm"
        sx={{ mt: 5 }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
          }}
        >
          <Typography variant="h2" align="center" gutterBottom>
            회원가입
          </Typography>

          <Stack spacing={3}>
            {/* 1행: 아이디 + 중복확인 */}
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  required
                  name="userId"
                  label="아이디"
                  placeholder="사용할 아이디 입력"
                  value={form.userId}
                  onChange={handleChange}
                  sx={{ flex: 1 }}
                  error={isIdChecked && !isIdValid}
                  disabled={isSubmitting} // 🆕 제출 중 비활성화
                />
                <Button
                  variant="outlined"
                  onClick={handleIdCheck}
                  sx={{ width: 120 }}
                  disabled={isCheckingId || isSubmitting} // 🆕 로딩 중 비활성화
                >
                  {isCheckingId ? <CircularProgress size={20} /> : '중복 확인'}
                </Button>
              </Stack>
              {isIdChecked && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  ml: 1, 
                  mt: 0.5,
                  color: isIdValid ? 'success.main' : 'error.main'
                }}>
                  {isIdValid ? <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} /> : <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />}
                  <Typography variant="caption">{idCheckMessage}</Typography>
                </Box>
              )}
            </Box>

            {/* 2행: 이름 + 나이 */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                name="name"
                label="이름"
                placeholder="이름 입력"
                value={form.name}
                onChange={handleChange}
                sx={{ flex: 1 }}
                disabled={isSubmitting} // 🆕
              />
              <TextField
                fullWidth
                required
                name="age"
                label="나이"
                type="number"
                placeholder="나이 입력"
                value={form.age}
                onChange={handleChange}
                sx={{ flex: 1 }}
                disabled={isSubmitting} // 🆕
              />
            </Stack>

            {/* 3행: 성별 + 전화번호 */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth required sx={{ flex: 1 }}>
                <InputLabel>성별</InputLabel>
                <Select
                  name="gender"
                  label="성별"
                  value={form.gender}
                  onChange={handleGenderChange}
                  disabled={isSubmitting} // 🆕
                >
                  <MenuItem value="">
                    <em>선택하세요</em>
                  </MenuItem>
                  <MenuItem value="male">남성</MenuItem>
                  <MenuItem value="female">여성</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                required
                name="phone"
                label="전화번호"
                placeholder="01012345678"
                value={form.phone}
                onChange={handlePhoneChange}
                error={!!phoneError}
                helperText={phoneError || "010으로 시작하는 11자리 숫자"}
                sx={{ flex: 1 }}
                inputProps={{
                  maxLength: 13 // 하이픈 포함 최대 길이
                }}
                disabled={isSubmitting} // 🆕
              />
            </Stack>

            {/* 4행: 이메일 */}
            <TextField
              fullWidth
              name="email"
              label="이메일"
              type="email"
              placeholder="이메일 입력 (선택사항)"
              value={form.email}
              onChange={handleChange}
              disabled={isSubmitting} // 🆕
            />

            {/* 5행: 비밀번호 */}
            <TextField
              fullWidth
              required
              name="password"
              label="비밀번호"
              type="password"
              placeholder="비밀번호 입력"
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting} // 🆕
            />

            {/* 6행: 비밀번호 확인 */}
            <TextField
              fullWidth
              required
              name="confirmPassword"
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호 재입력"
              value={form.confirmPassword}
              onChange={handleChange}
              error={form.confirmPassword !== '' && form.password !== form.confirmPassword}
              helperText={
                form.confirmPassword !== '' && form.password !== form.confirmPassword
                  ? "비밀번호가 일치하지 않습니다"
                  : ""
              }
              disabled={isSubmitting} // 🆕
            />

            {/* 회원가입 버튼 */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button 
                variant="contained" 
                type="submit" 
                sx={{ width: 200, height: 48 }}
                disabled={!!phoneError || !isIdValid || !isIdChecked || isSubmitting} // 🆕 제출 중 비활성화
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : '회원가입'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Container>
    </>
  )
}