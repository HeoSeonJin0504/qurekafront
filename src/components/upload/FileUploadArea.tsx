import React from 'react';
import {
  Paper,
  Box,
  Stack,
  Avatar,
  Typography,
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import { Fade } from '@mui/material';

interface FileUploadAreaProps {
  file: File | null;
  fileName: string | null;
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  file,
  fileName,
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
}) => {
  return (
    <Fade in timeout={500}>
      <Paper
        elevation={6}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        sx={{
          p: 6,
          borderRadius: 4,
          background: "#ffffff",
          textAlign: "center",
          position: "relative",
          border: isDragging ? "3px dashed #3b82f6" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          component="label"
          sx={{
            display: "block",
            p: 8,
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            borderRadius: 3,
            border: "2px solid",
            borderColor: isDragging ? "#3b82f6" : (file ? "#10b981" : "#e2e8f0"),
            background: isDragging
              ? "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)"
              : file
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)"
              : "linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(8, 145, 178, 0.02) 100%)",
            "&:hover": {
              borderColor: isDragging ? "#3b82f6" : (file ? "#059669" : "#3b82f6"),
              transform: isDragging ? "none" : "translateY(-4px)",
              boxShadow: isDragging
                ? "0 12px 24px rgba(59, 130, 246, 0.2)"
                : file 
                ? "0 12px 24px rgba(16, 185, 129, 0.15)" 
                : "0 12px 24px rgba(59, 130, 246, 0.15)",
            },
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Avatar
              sx={{
                width: 120,
                height: 120,
                background: isDragging
                  ? "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)"
                  : file
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)",
                transition: "all 0.3s ease",
                transform: isDragging ? "scale(1.1)" : "scale(1)",
              }}
            >
              {file && !isDragging ? (
                <CheckCircle sx={{ fontSize: 60 }} />
              ) : (
                <CloudUpload sx={{ fontSize: 60 }} />
              )}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom fontWeight={700} sx={{ 
                color: isDragging ? "#3b82f6" : (file ? "#059669" : "#3b82f6"),
                transition: "all 0.3s ease"
              }}>
                {isDragging ? "파일을 놓으세요" : (file ? "파일 준비 완료!" : "파일을 선택하세요")}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {isDragging ? "여기에 파일을 놓으세요" : "PDF, PPT, PPTX 파일을 드래그하거나 클릭하여 업로드"}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                * 파일명: 한글, 영문, 숫자, 공백, . - _ ( ) [ ] %
              </Typography>
            </Box>
            {fileName && !isDragging && (
              <Paper
                elevation={3}
                sx={{
                  p: 2.5,
                  background: "#f8fafc",
                  minWidth: 300,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#1e40af" }}>
                  📄 {fileName}
                </Typography>
              </Paper>
            )}
          </Stack>
          <input 
            hidden 
            type="file" 
            accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={onFileChange} 
          />
        </Box>
      </Paper>
    </Fade>
  );
};

export default FileUploadArea;
