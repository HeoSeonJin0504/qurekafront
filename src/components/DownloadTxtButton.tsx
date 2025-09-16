// src/components/DownloadTxtButton.tsx
import React from 'react'
import Button from '@mui/material/Button'

interface DownloadProps {
  text: string       // 요약 텍스트 또는 문제 텍스트
  filename: string   // ex. "my_summary.txt" or "my_question.txt"
}

export function DownloadTxtButton({ text, filename }: DownloadProps) {
  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outlined" size="small" onClick={handleDownload}>
      텍스트 다운로드
    </Button>
  )
}
