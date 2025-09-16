import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { backendAPI, tokenStorage, userAPI } from '../services/api'

export interface User {
  id: number
  userid: string
  name: string
  email?: string
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  login: (token: string, user: User) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: async () => {},
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 앱 로딩 시 토큰 유효성 검사 및 사용자 정보 로드
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // tokenStorage에서 토큰이 있는지 확인
        if (tokenStorage.hasTokens()) {
          // 토큰 유효성 검증
          const { success, user: userData } = await userAPI.validateToken()

          if (success && userData) {
            setUser(userData)
            setIsLoggedIn(true)
          } else {
            // 유효하지 않은 토큰은 삭제
            await logout()
          }
        }
      } catch (error) {
        console.error('인증 상태 확인 중 오류:', error)
        await logout()
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const login = (newToken: string, newUser: User) => {
    setUser(newUser)
    setIsLoggedIn(true)
    // 참고: tokenStorage에 토큰 저장은 이미 userAPI.login에서 처리됨
  }

  const logout = async () => {
    try {
      await userAPI.logout()
    } catch (e) {
      console.warn('로그아웃 API 호출 중 에러', e)
    }

    setUser(null)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
