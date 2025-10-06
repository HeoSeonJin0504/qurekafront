// src/components/Header.tsx
import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Box,
  Typography
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountCircle from '@mui/icons-material/AccountCircle'
import LogoImage from '../assets/images/큐레카_로고 이미지.png' 
import { Avatar } from '@mui/material'
import { Chip } from '@mui/material'

export default function Header() {
  const navigate = useNavigate()
  const { isLoggedIn, logout, user} = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
 
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const handleLogout = () => {
    logout()
    handleMenuClose()
    navigate('/')
  }
  const handleMypage = () => {
    handleMenuClose()
    navigate('/mypage')
  }

  return (
    <AppBar position="static" color="transparent" elevation={3}>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        paddingTop: 1.5,    // 헤더 여백 추가
        paddingBottom: 1.5
      }}>
        {/* 로고 클릭하면 홈으로 */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <img
            src={LogoImage}
            alt="큐레카 로고"
            style={{ height: 60, marginRight: 8 }}  // 기존 80에서 100으로 변경
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* 홈 버튼: 로고 왼쪽 혹은 실습하기 왼쪽에 배치 */}
          <Button
            variant="text"
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', mr: 2, fontSize: '1.3rem' }}
          >
            홈
          </Button>
          {/* 실습하기 버튼: react-router로 업로드 페이지 이동 */}
          <Button
            variant="text"
            onClick={() => navigate('/upload')}
            sx={{ textTransform: 'none', mr: 2, fontSize: '1.3rem' }}
          >
            실습하기
          </Button>
          {/* 문제 풀기 버튼 추가 */}
          <Button
            variant="text"
            onClick={() => navigate('/solve-questions')}
            sx={{ textTransform: 'none', mr: 2, fontSize: '1.3rem' }}
          >
            문제 풀기
          </Button>

          {isLoggedIn ? (
            <>
          <Chip
            label={user?.name || '사용자'}
            onClick={handleMenuOpen}
            avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
              {user?.name?.charAt(0) || 'U'}
            </span>
          </Avatar>
          }
            variant="outlined"
            clickable
            sx={{ 
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: 'black', // 글씨 색상을 흰색으로 변경
              borderColor: 'white', // 테두리 색상을 흰색으로 변경
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'white', // 호버 시에도 테두리 색상 유지
                color: 'black' // 호버 시에도 글씨 색상 유지
              }
            }}
          />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMypage}>마이페이지</MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/login')}
              sx={{ 
                fontSize: '1.1rem',
                py: 0.5,  
                height: 'auto'  
              }} 
            >
              로그인
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
