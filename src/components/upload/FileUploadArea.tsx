// src/components/upload/FileUploadArea.tsx
import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// ── 애니메이션 ──────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
`

// ── 바깥 카드 ────────────────────────────────────────────────
const UploadCard = styled.div<{ $dragging: boolean }>`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 32px 24px;
  animation: ${fadeIn} 0.5s ease both;
  border: ${({ $dragging }) => ($dragging ? '3px dashed #3b82f6' : '1px solid rgba(229,231,235,0.8)')};
  transition: border 0.2s;

  @media (max-width: 600px) {
    padding: 20px 16px;
    border-radius: 14px;
  }
`

// ── 클릭 가능한 업로드 영역 ──────────────────────────────────
const UploadLabel = styled.label<{ $dragging: boolean; $hasFile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
  border-radius: 14px;
  border: 2px solid;
  border-color: ${({ $dragging, $hasFile }) =>
    $dragging ? '#3b82f6' : $hasFile ? '#10b981' : '#e2e8f0'};
  background: ${({ $dragging, $hasFile }) =>
    $dragging
      ? 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(8,145,178,0.08) 100%)'
      : $hasFile
      ? 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.05) 100%)'
      : 'linear-gradient(135deg, rgba(59,130,246,0.02) 0%, rgba(8,145,178,0.02) 100%)'};
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;

  &:hover {
    border-color: ${({ $dragging, $hasFile }) =>
      $dragging ? '#3b82f6' : $hasFile ? '#059669' : '#3b82f6'};
    transform: ${({ $dragging }) => ($dragging ? 'none' : 'translateY(-3px)')};
    box-shadow: 0 10px 24px rgba(59,130,246,0.12);
  }

  @media (max-width: 600px) {
    padding: 28px 16px;
    gap: 12px;
    &:hover { transform: none; }
  }
`

// ── 아이콘 원 ────────────────────────────────────────────────
const IconCircle = styled.div<{ $dragging: boolean; $hasFile: boolean }>`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: ${({ $dragging, $hasFile }) =>
    $dragging
      ? 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)'
      : $hasFile
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8em;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transition: all 0.3s;
  transform: ${({ $dragging }) => ($dragging ? 'scale(1.1)' : 'scale(1)')};

  ${({ $dragging }) => $dragging && css`
    animation: ${bounce} 0.8s ease-in-out infinite;
  `}

  @media (max-width: 600px) {
    width: 72px;
    height: 72px;
    font-size: 2em;
  }
`

// ── 텍스트 ──────────────────────────────────────────────────
const UploadTitle = styled.h3<{ $dragging: boolean; $hasFile: boolean }>`
  font-size: clamp(1.1em, 2.5vw, 1.4em);
  font-weight: 700;
  color: ${({ $dragging, $hasFile }) =>
    $dragging ? '#3b82f6' : $hasFile ? '#059669' : '#3b82f6'};
  margin: 0;
  transition: color 0.3s;
`

const UploadSubText = styled.p`
  font-size: clamp(0.85em, 1.8vw, 1em);
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  word-break: keep-all;
`

const UploadCaption = styled.span`
  font-size: 0.8em;
  color: #9ca3af;
  display: block;
`

// ── 선택된 파일 배지 ─────────────────────────────────────────
const FileBadge = styled.div`
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 20px;
  width: 100%;
  max-width: 360px;
  text-align: center;
`

const FileBadgeText = styled.p`
  font-size: 0.95em;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
  word-break: break-all;
`

// ════════════════════════════════════════════════════════════
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
    <UploadCard
      $dragging={isDragging}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <UploadLabel htmlFor="file-upload-input" $dragging={isDragging} $hasFile={!!file}>
        <IconCircle $dragging={isDragging} $hasFile={!!file}>
          {file && !isDragging ? '✅' : '☁️'}
        </IconCircle>

        <div>
          <UploadTitle $dragging={isDragging} $hasFile={!!file}>
            {isDragging ? '파일을 놓으세요' : file ? '파일 준비 완료!' : '파일을 선택하세요'}
          </UploadTitle>
        </div>

        <UploadSubText>
          {isDragging
            ? '여기에 파일을 놓으세요'
            : 'PDF, PPT, PPTX 파일을 드래그하거나 클릭하여 업로드'}
        </UploadSubText>

        <UploadCaption>
          * 파일명: 한글, 영문, 숫자, 공백, . - _ ( ) [ ] %
        </UploadCaption>

        {fileName && !isDragging && (
          <FileBadge>
            <FileBadgeText>📄 {fileName}</FileBadgeText>
          </FileBadge>
        )}

        <input
          id="file-upload-input"
          hidden
          type="file"
          accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={onFileChange}
        />
      </UploadLabel>
    </UploadCard>
  );
};

export default FileUploadArea;