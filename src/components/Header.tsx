// src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LogoImage from '../assets/images/큐레카_로고 이미지.png'

// MUI imports (PC 헤더용)
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'

// ── 전역: 모바일 드로어 열릴 때 스크롤 잠금 ─────────────────
const NoScroll = createGlobalStyle<{ $lock: boolean }>`
  body { overflow: ${({ $lock }) => ($lock ? 'hidden' : '')}; }
`

// ════════════════════════════════════════
// 모바일 전용 styled-components (768px 이하)
// ════════════════════════════════════════

const MobileOverlay = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.38);
    z-index: 150;
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
    transition: opacity 0.25s;
  }
`

const MobileMenu = styled.nav<{ $open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: #fff;
    z-index: 180;
    padding: 6px 0 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
    transform: ${({ $open }) => ($open ? 'translateY(0)' : 'translateY(-110%)')};
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  }
`

const MobileNavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  text-decoration: none;
  color: #374151;
  font-size: 1.05em;
  font-weight: 600;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover, &.active {
    background: #eff6ff;
    color: #1d4ed8;
  }
`

const MobileUserSection = styled.div`
  padding: 12px 24px 4px;
  border-top: 2px solid #f0f0f0;
  margin-top: 4px;
`

const MobileUserLabel = styled.p`
  font-size: 0.85em;
  color: #9ca3af;
  margin: 0 0 10px;
`

const MobileActionBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  margin-bottom: 8px;
  transition: background 0.2s;
  &:hover { background: #f0f0f0; }
`

const MobileLogoutBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: #fff1f2;
  border: 1.5px solid #fecdd3;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #ffe4e6; }
`

const MobileLoginBtn = styled(NavLink)`
  display: block;
  margin: 10px 24px 4px;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 10px;
  text-align: center;
  font-size: 1em;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`

// 햄버거 버튼 (모바일에서만 표시)
const HamburgerWrap = styled.div`
  display: none;
  @media (max-width: 768px) { display: flex; }
`

const HamburgerBtn = styled.button<{ $open: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.2s;
  &:hover { background: rgba(0,0,0,0.06); }

  span {
    display: block;
    width: 22px;
    height: 2px;
    background: #333;
    border-radius: 2px;
    transition: transform 0.25s, opacity 0.25s;
  }

  ${({ $open }) => $open && `
    span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  `}
`

// ════════════════════════════════════════
// 메인 컴포넌트
// ════════════════════════════════════════
export default function Header() {
  const { isLoggedIn, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // PC 드롭다운 (MUI Menu)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // 모바일 드로어
  const [mobileOpen, setMobileOpen] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md')) // ≤ 900px → 모바일

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => {
    setMobileOpen(false)
    setAnchorEl(null)
  }, [location.pathname])

  const handleNavigation = (path: string) => {
    if (location.pathname === path) {
      window.location.reload()
    } else {
      navigate(path)
    }
    setMobileOpen(false)
  }

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogout = () => {
    logout()
    handleMenuClose()
    setMobileOpen(false)
    navigate('/')
  }

  const handleMypage = () => {
    handleMenuClose()
    setMobileOpen(false)
    navigate('/mypage')
  }

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { label: '홈', path: '/' },
    { label: '실습하기', path: '/upload' },
    { label: '문제 풀기', path: '/solve-questions' },
  ]

  return (
    <>
      <NoScroll $lock={mobileOpen} />

      {/* ── PC 헤더 (MUI AppBar) ── */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={3}
        sx={{ display: { xs: 'none', md: 'flex' } }}
      >
        <Toolbar sx={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 1.5,
          paddingBottom: 1.5,
        }}>
          {/* 로고 */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => handleNavigation('/')}
          >
            <img
              src={LogoImage}
              alt="큐레카 로고"
              style={{ height: 60, marginRight: 8 }}
            />
          </Box>

          {/* 메뉴 + 유저 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="text"
              onClick={() => handleNavigation('/')}
              sx={{ textTransform: 'none', mr: 2, fontSize: '1.3rem' }}
              data-navigation="true"
            >
              홈
            </Button>
            <Button
              variant="text"
              onClick={() => handleNavigation('/upload')}
              sx={{ textTransform: 'none', mr: 2, fontSize: '1.3rem' }}
              data-navigation="true"
            >
              실습하기
            </Button>
            <Button
              variant="text"
              onClick={() => handleNavigation('/solve-questions')}
              sx={{ textTransform: 'none', mr: 2, fontSize: '1.3rem' }}
              data-navigation="true"
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
                    color: 'black',
                    borderColor: 'white',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'white',
                      color: 'black',
                    },
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
                sx={{ fontSize: '1.1rem', py: 0.5, height: 'auto' }}
              >
                로그인
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── 모바일 헤더 (기존 styled-components) ── */}
      <header style={{
        display: isMobile ? 'flex' : 'none',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        width: '100%',
        height: '60px',
        padding: '0 20px',
        background: '#fff',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        boxSizing: 'border-box',
      }}>
        <NavLink
          to="/"
          onClick={(e) => { e.preventDefault(); handleNavigation('/') }}
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <img src={LogoImage} alt="큐레카 로고" style={{ height: 40 }} />
        </NavLink>

        <HamburgerBtn
          $open={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="메뉴 열기/닫기"
        >
          <span />
          <span />
          <span />
        </HamburgerBtn>
      </header>

      {/* 모바일 오버레이 */}
      <MobileOverlay $open={mobileOpen} onClick={() => setMobileOpen(false)} />

      {/* 모바일 슬라이드 메뉴 */}
      <MobileMenu $open={mobileOpen}>
        {navItems.map(item => (
          <MobileNavItem
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); handleNavigation(item.path) }}
            data-navigation="true"
          >
            {item.label}
          </MobileNavItem>
        ))}

        {isLoggedIn ? (
          <MobileUserSection>
            <MobileUserLabel>{user?.name || '사용자'}님으로 로그인 중</MobileUserLabel>
            <MobileActionBtn onClick={handleMypage}>마이페이지</MobileActionBtn>
            <MobileLogoutBtn onClick={handleLogout}>로그아웃</MobileLogoutBtn>
          </MobileUserSection>
        ) : (
          <MobileLoginBtn
            to="/login"
            onClick={(e) => { e.preventDefault(); handleNavigation('/login') }}
          >
            로그인
          </MobileLoginBtn>
        )}
      </MobileMenu>
    </>
  )
}