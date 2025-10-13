// src/components/DownloadTxtButton.tsx
import React from 'react'
import { Button } from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'

interface DownloadTxtButtonProps {
  text: string       // 요약 텍스트 또는 문제 텍스트
  filename: string   // ex. "my_summary.txt" or "my_question.txt"
}

export const DownloadTxtButton = ({ text, filename }: DownloadTxtButtonProps) => {
  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([text], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Button 
      onClick={handleDownload} 
      size="small"
      startIcon={<GetAppIcon />}
      variant="outlined"
    >
      텍스트 다운로드
    </Button>
  )
}
