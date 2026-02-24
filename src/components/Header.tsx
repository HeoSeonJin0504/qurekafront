// src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react'
import styled, { css, keyframes, createGlobalStyle } from 'styled-components'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LogoImage from '../assets/images/큐레카_로고 이미지.png'

// ── 애니메이션 ──────────────────────────────────────────────
const underlineAnim = keyframes`
  from { width: 0; left: 50%; }
  to   { width: 100%; left: 0; }
`

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ── 전역: 드로어 열릴 때 스크롤 잠금 ────────────────────────
const NoScroll = createGlobalStyle<{ $lock: boolean }>`
  body { overflow: ${({ $lock }) => ($lock ? 'hidden' : '')}; }
`

// ── 헤더 쉘 ────────────────────────────────────────────────
const HeaderShell = styled.header`
  position: sticky;
  top: 0;
  z-index: 200;
  width: 100%;
  height: 70px;
  padding: 0 40px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);

  @media (max-width: 768px) {
    padding: 0 20px;
    height: 60px;
  }
`

// ── 로고 ────────────────────────────────────────────────────
const LogoLink = styled(NavLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
`

const Logo = styled.img`
  height: 52px;
  cursor: pointer;
  @media (max-width: 768px) { height: 40px; }
`

// ── 데스크톱 Nav ─────────────────────────────────────────────
const DesktopNav = styled.ul`
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 70px;

  li { display: flex; align-items: center; height: 100%; }

  a {
    text-decoration: none;
    color: #333;
    position: relative;
    font-size: 1.1em;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 8px;
    transition: background 0.2s;
    white-space: nowrap;

    &:hover { background: #f0f0f0; }

    &.active {
      font-weight: 700;
      &::after {
        content: "";
        position: absolute;
        bottom: 2px;
        height: 3px;
        background: #3b82f6;
        border-radius: 2px;
        animation: ${underlineAnim} 0.3s ease-out forwards;
      }
    }
  }

  @media (max-width: 768px) { display: none; }
`

// ── 유저 배지 + 드롭다운 ────────────────────────────────────
const UserBadgeWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const UserBadge = styled.button`
  background: #f0f7ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 1em;
  font-weight: 700;
  cursor: pointer;
  color: #1e3a8a;
  transition: background 0.2s;
  &:hover { background: #dbeafe; }
`

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 130px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  overflow: hidden;
  animation: ${slideDown} 0.18s ease;
  z-index: 300;
`

const DropdownBtn = styled.button<{ $danger?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 0.95em;
  font-weight: 500;
  color: ${({ $danger }) => ($danger ? '#dc2626' : '#333')};
  &:hover { background: ${({ $danger }) => ($danger ? '#fff1f2' : '#f5f5f5')}; }
`

// ── 로그인 링크 (비로그인 데스크톱) ─────────────────────────
const LoginNavLink = styled(NavLink)`
  text-decoration: none;
  font-size: 1em !important;
  font-weight: 700 !important;
  padding: 6px 18px !important;
  border-radius: 8px;
  border: 2px solid #3b82f6;
  color: #3b82f6 !important;
  background: none;
  transition: background 0.2s, color 0.2s !important;
  white-space: nowrap;

  &:hover {
    background: #3b82f6 !important;
    color: #fff !important;
  }
`

// ── 햄버거 버튼 ──────────────────────────────────────────────
const HamburgerBtn = styled.button<{ $open: boolean }>`
  display: none;
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
  &:hover { background: #f0f0f0; }

  span {
    display: block;
    width: 22px;
    height: 2px;
    background: #333;
    border-radius: 2px;
    transition: transform 0.25s, opacity 0.25s;
  }

  ${({ $open }) => $open && css`
    span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  `}

  @media (max-width: 768px) { display: flex; }
`

// ── 모바일 오버레이 ──────────────────────────────────────────
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

// ── 모바일 슬라이드다운 메뉴 ─────────────────────────────────
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

// ════════════════════════════════════════════════════════════
export default function Header() {
  const { isLoggedIn, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavigation = (path: string) => {
    if (location.pathname === path) {
      window.location.reload()
    } else {
      navigate(path)
    }
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  const handleMypage = () => {
    setDropdownOpen(false)
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

      <HeaderShell>
        <LogoLink to="/" className="main-link" onClick={(e) => { e.preventDefault(); handleNavigation('/') }}>
          <Logo src={LogoImage} alt="큐레카 로고" />
        </LogoLink>

        {/* 데스크톱 메뉴 */}
        <DesktopNav>
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={isActive(item.path) ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavigation(item.path) }}
                data-navigation="true"
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            {isLoggedIn ? (
              <UserBadgeWrap ref={dropdownRef}>
                <UserBadge onClick={() => setDropdownOpen(v => !v)}>
                  {user?.name || '사용자'}님 ▾
                </UserBadge>
                {dropdownOpen && (
                  <Dropdown>
                    <DropdownBtn onClick={handleMypage}>마이페이지</DropdownBtn>
                    <DropdownBtn $danger onClick={handleLogout}>로그아웃</DropdownBtn>
                  </Dropdown>
                )}
              </UserBadgeWrap>
            ) : (
              <LoginNavLink
                to="/login"
                className={isActive('/login') ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavigation('/login') }}
              >
                로그인
              </LoginNavLink>
            )}
          </li>
        </DesktopNav>

        {/* 모바일 햄버거 */}
        <HamburgerBtn
          $open={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="메뉴 열기/닫기"
        >
          <span />
          <span />
          <span />
        </HamburgerBtn>
      </HeaderShell>

      <MobileOverlay $open={mobileOpen} onClick={() => setMobileOpen(false)} />

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