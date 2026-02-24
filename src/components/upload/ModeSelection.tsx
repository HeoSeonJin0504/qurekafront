// src/components/upload/ModeSelection.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── 레이아웃 ────────────────────────────────────────────────
const Wrapper = styled.div`
  padding: 32px 0;
  animation: ${fadeInUp} 0.5s ease both;
`

const Title = styled.h2`
  text-align: center;
  font-size: clamp(1.4em, 3vw, 2em);
  font-weight: 700;
  margin: 0 0 40px;
  color: #1f2937;

  @media (max-width: 600px) {
    margin-bottom: 24px;
  }
`

const CardRow = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
  }
`

// ── 카드 ────────────────────────────────────────────────────
const Card = styled.div<{ $accent: string; $shadow: string }>`
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(229,231,235,0.8);
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${({ $shadow }) => $shadow};
  }

  @media (max-width: 600px) {
    max-width: 100%;
    padding: 28px 20px;
    flex-direction: row;
    text-align: left;
    gap: 20px;
    &:hover { transform: none; }
  }
`

const IconCircle = styled.div<{ $gradient: string }>`
  width: 88px;
  height: 88px;
  min-width: 88px;
  border-radius: 50%;
  background: ${({ $gradient }) => $gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 2.5em;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);

  @media (max-width: 600px) {
    width: 64px;
    height: 64px;
    min-width: 64px;
    font-size: 1.8em;
    margin-bottom: 0;
  }
`

const CardBody = styled.div``

const CardTitle = styled.h3`
  font-size: clamp(1em, 2vw, 1.25em);
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 10px;
`

const CardDesc = styled.p`
  font-size: clamp(0.88em, 1.5vw, 1em);
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  /* ✅ 핵심: whiteSpace nowrap 제거 → 줄바꿈 허용 */
  white-space: normal;
  word-break: keep-all;
`

// ════════════════════════════════════════════════════════════
type Mode = 'summary' | 'question' | null;
type QuestionSource = 'upload' | 'saved' | null;

interface ModeSelectionProps {
  onSelectMode: (mode: Mode) => void;
}

interface QuestionSourceSelectionProps {
  onSelectSource: (source: QuestionSource) => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => (
  <Wrapper>
    <Title>무엇을 생성하시겠습니까?</Title>
    <CardRow>
      <Card
        $accent="#3b82f6"
        $shadow="0 12px 40px rgba(59,130,246,0.3)"
        onClick={() => onSelectMode('summary')}
      >
        <IconCircle $gradient="linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)">
          📄
        </IconCircle>
        <CardBody>
          <CardTitle>요약본 및 문제 생성</CardTitle>
          <CardDesc>파일을 업로드하여 요약본 및 문제를 생성합니다</CardDesc>
        </CardBody>
      </Card>

      <Card
        $accent="#8b5cf6"
        $shadow="0 12px 40px rgba(139,92,246,0.3)"
        onClick={() => onSelectMode('question')}
      >
        <IconCircle $gradient="linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)">
          📝
        </IconCircle>
        <CardBody>
          <CardTitle>문제 생성</CardTitle>
          {/* ✅ 문제 1 수정: whiteSpace nowrap 제거로 잘림 해결 */}
          <CardDesc>파일 또는 저장된 요약본으로 문제를 바로 생성합니다</CardDesc>
        </CardBody>
      </Card>
    </CardRow>
  </Wrapper>
);

export const QuestionSourceSelection: React.FC<QuestionSourceSelectionProps> = ({ onSelectSource }) => (
  <Wrapper>
    <Title>어떤 방법으로 문제를 생성하시겠습니까?</Title>
    <CardRow>
      <Card
        $accent="#3b82f6"
        $shadow="0 12px 40px rgba(59,130,246,0.3)"
        onClick={() => onSelectSource('upload')}
      >
        <IconCircle $gradient="linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)">
          ☁️
        </IconCircle>
        <CardBody>
          <CardTitle>파일 업로드</CardTitle>
          <CardDesc>파일을 업로드하여 문제 생성</CardDesc>
        </CardBody>
      </Card>

      <Card
        $accent="#10b981"
        $shadow="0 12px 40px rgba(16,185,129,0.3)"
        onClick={() => onSelectSource('saved')}
      >
        <IconCircle $gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
          📚
        </IconCircle>
        <CardBody>
          <CardTitle>저장된 요약본</CardTitle>
          <CardDesc>저장된 요약본으로 바로 문제 생성</CardDesc>
        </CardBody>
      </Card>
    </CardRow>
  </Wrapper>
);