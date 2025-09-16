// src/App.tsx
import React from 'react'
import AppRouter from './routes/AppRouter'
import { AuthProvider } from './contexts/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
