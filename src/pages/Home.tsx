// src/pages/Home.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import PageNavigator from "../components/common/PageNavigator";
import ServiceFlowDemo from '../components/ServiceFlowDemo';

import questionTypesImage from "../assets/images/questionType.png";
import projectMatterImage from "../assets/images/project_matter.png";
import projectMatter2Image from "../assets/images/project_matter2.png";
import aiImage from "../assets/images/ai.png";
import heyImage from "../assets/images/heyImage.png";

// ── 애니메이션 ──────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ── 공통 레이아웃 ────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fff;
`

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`

// ── 버튼 ────────────────────────────────────────────────────
const PrimaryBtn = styled.button`
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(59,130,246,0.35);
  color: #fff;
  padding: 14px 36px;
  font-size: 1.1em;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59,130,246,0.45);
    opacity: 0.95;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 1.05em;
    padding: 14px 28px;
  }
`

const IndigoBtn = styled(PrimaryBtn)`
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  box-shadow: 0 4px 15px rgba(99,102,241,0.35);
  &:hover { box-shadow: 0 8px 24px rgba(99,102,241,0.45); }
`

const HeroBtnGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    align-items: center;
  }
`

const DemoBtn = styled.button`
  display: inline-block;
  background: #fff;
  border: 2px solid #3b82f6;
  border-radius: 50px;
  color: #2563eb;
  padding: 11px 28px;
  font-size: 0.98em;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: #eff6ff;
    box-shadow: 0 8px 24px rgba(37,99,235,0.2);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`

// ════════════════════════════════════════════════════════════
// ─── 1. 히어로 섹션 ──────────────────────────────────────────
// ════════════════════════════════════════════════════════════
const HeroSection = styled.section`
  background: #fff;
  padding: 48px 0 40px;

  @media (max-width: 768px) {
    padding: 32px 0 36px;
  }
`

const HeroInner = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
`

const HeroText = styled.div`
  flex: 1;

  @media (max-width: 768px) {
    order: 1;
    width: 100%;
  }
`

const HeroTitle = styled.h1`
  font-size: clamp(1.8em, 4vw, 2.8em);
  font-weight: 800;
  line-height: 1.3;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const HeroSubtitle = styled.p`
  font-size: clamp(0.95em, 2vw, 1.15em);
  color: #6b7280;
  line-height: 1.75;
  margin: 0 0 28px;
  font-weight: 400;
`

const HeroImgBox = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    order: 0;
    width: 100%;
  }
`

const HeroImg = styled.img`
  width: 100%;
  max-width: 380px;
  height: auto;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
  animation: ${fadeInUp} 0.8s ease both;

  @media (max-width: 768px) {
    max-width: 220px;
  }
`

// ════════════════════════════════════════════════════════════
// ─── 2. 특장점 카드 섹션 ─────────────────────────────────────
// ════════════════════════════════════════════════════════════
const FeatureCardSection = styled.section`
  background: #f8fafc;
  padding: 60px 0;

  @media (max-width: 768px) {
    padding: 40px 0;
  }
`

const CardGrid = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`

const Card = styled.div`
  flex: 1;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(229,231,235,0.8);
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  animation: ${fadeInUp} 0.6s ease both;

  &:nth-child(2) { animation-delay: 0.15s; }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.10);
  }

  @media (max-width: 768px) {
    padding: 24px 20px;
    flex-direction: row;
    text-align: left;
    gap: 16px;
    &:hover { transform: none; }
  }
`

const CardImg = styled.img`
  width: 100%;
  max-width: 220px;
  height: auto;
  margin-bottom: 20px;
  border-radius: 10px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.08));

  @media (max-width: 768px) {
    width: 80px;
    max-width: 80px;
    margin-bottom: 0;
    flex-shrink: 0;
  }
`

const CardBody = styled.div`
  @media (max-width: 768px) {
    flex: 1;
  }
`

const CardTitle = styled.h3`
  font-size: clamp(1.05em, 2vw, 1.3em);
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 10px;
`

const CardText = styled.p`
  font-size: clamp(0.9em, 1.5vw, 1em);
  color: #6b7280;
  line-height: 1.7;
  margin: 0;
`

// ════════════════════════════════════════════════════════════
// ─── 3. 피처 섹션 ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════
const FeatureSection = styled.section`
  background: #fff;
  padding: 60px 0;

  @media (max-width: 768px) {
    padding: 40px 0;
  }
`

const FeatureBlock = styled.div`
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(229,231,235,0.8);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  padding: 48px 40px;
  margin-bottom: 32px;
  transition: box-shadow 0.3s;

  &:hover { box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
  &:last-child { margin-bottom: 0; }

  @media (max-width: 768px) {
    padding: 24px 20px;
    margin-bottom: 20px;
    border-radius: 14px;
  }
`

const FeatureRow = styled.div<{ $reverse?: boolean }>`
  display: flex;
  align-items: center;
  gap: 48px;
  flex-direction: ${({ $reverse }) => ($reverse ? 'row-reverse' : 'row')};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`

const FeatureTextBox = styled.div`
  flex: 1;
`

const FeatureTitle = styled.h2<{ $gradient?: string }>`
  font-size: clamp(1.2em, 2.5vw, 1.7em);
  font-weight: 700;
  line-height: 1.35;
  margin: 0 0 16px;
  background: ${({ $gradient }) => $gradient || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const FeatureText = styled.p`
  font-size: clamp(0.9em, 1.6vw, 1.05em);
  color: #4b5563;
  line-height: 1.85;
  margin: 0;
`

const FeatureImgBox = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`

const FeatureImg = styled.img`
  width: 100%;
  max-width: 360px;
  height: auto;
  border-radius: 12px;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.10));
  transition: transform 0.3s;
  &:hover { transform: scale(1.02); }

  @media (max-width: 768px) {
    max-width: 100%;
    &:hover { transform: none; }
  }
`

// ── 사용법 스텝 ──────────────────────────────────────────────
const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
`

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`

const StepBadge = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  margin-top: 2px;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    min-width: 32px;
    font-size: 0.9em;
  }
`

const StepText = styled.p`
  font-size: clamp(0.9em, 1.6vw, 1.05em);
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
  padding-top: 8px;

  @media (max-width: 768px) {
    padding-top: 5px;
  }
`

const BtnCenter = styled.div`
  display: flex;
  justify-content: center;
`

// ════════════════════════════════════════════════════════════
// ─── 4. CTA 섹션 ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════
const CTASection = styled.section`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 80px 20px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 52px 20px;
  }
`

const CTATitle = styled.h2`
  font-size: clamp(1.5em, 3.5vw, 2.2em);
  font-weight: 700;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const CTASubtitle = styled.p`
  font-size: clamp(0.95em, 2vw, 1.2em);
  color: #6b7280;
  margin: 0 0 32px;
  font-weight: 400;
`

// ════════════════════════════════════════════════════════════
// ─── 컴포넌트 ────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════
function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const goStart = () => navigate(isLoggedIn ? '/upload' : '/login');
  const goDemo = () => navigate('/demo');

  const steps = [
    "요약 또는 문제 생성 중 원하는 기능을 선택하세요.",
    "학습할 강의자료를 업로드하세요.",
    "원하는 옵션을 설정하고 생성 버튼을 클릭하세요.",
    "생성된 요약 내용을 수정 및 다운로드 할 수 있습니다.",
    "같은 방식으로 문제도 생성할 수 있습니다.",
  ];

  return (
    <PageWrapper>
      <Header />
      <PageNavigator />

      {/* ── 히어로 ── */}
      <HeroSection>
        <Container>
          <HeroInner>
            <HeroImgBox>
              <HeroImg src={aiImage} alt="AI 도우미" />
            </HeroImgBox>
            <HeroText>
              <HeroTitle>Qureka와 함께라면<br />공부 걱정은 끝!</HeroTitle>
              <HeroSubtitle>
                강의자료를 업로드하면 AI가 요약과<br />
                맞춤형 문제를 제공합니다.<br />
                더 효율적인 공부, 지금 경험해보세요!
              </HeroSubtitle>
              <HeroBtnGroup>
                <DemoBtn onClick={goDemo}>업로드 없이 빠른 체험하기</DemoBtn>
                <PrimaryBtn onClick={goStart}>시작하기! 🚀</PrimaryBtn>
              </HeroBtnGroup>
            </HeroText>
          </HeroInner>
        </Container>
      </HeroSection>

      {/* ── 특장점 카드 ── */}
      <FeatureCardSection>
        <Container>
          <CardGrid>
            <Card>
              <CardImg src={projectMatterImage} alt="다양한 유형 지원" />
              <CardBody>
                <CardTitle>다양한 유형 지원</CardTitle>
                <CardText>
                  요약 유형과 문제 유형을 다양하게 지원하여<br />
                  맞춤형 콘텐츠로 학습 효율을 높여드립니다.
                </CardText>
              </CardBody>
            </Card>
            <Card>
              <CardImg src={projectMatter2Image} alt="초보자도 쉽게 사용 가능" />
              <CardBody>
                <CardTitle>초보자도 쉽게 사용 가능</CardTitle>
                <CardText>
                  분야, 난이도 등을 직접 선택하여<br />
                  쉽고 편하게 다양한 학습 자료를 생성해 보세요.
                </CardText>
              </CardBody>
            </Card>
          </CardGrid>
        </Container>
      </FeatureCardSection>

      {/* ── 피처 섹션들 ── */}
      <FeatureSection>
        <Container>

          {/* Block 1 */}
          <FeatureBlock>
            <FeatureRow>
              <FeatureTextBox>
                <FeatureTitle>AI로 더 똑똑하고 빠르게<br />요약 및 문제 생성</FeatureTitle>
                <FeatureText>
                  복잡한 문서도 핵심만 뽑아 요약하고 맞춤형 문제를 만들어줍니다.<br />
                  클릭 몇 번으로 요약본 및 문제를 생성할 수 있습니다.<br />
                  공부는 간단하게, 시험 대비는 똑똑하게 준비해 보세요.
                </FeatureText>
              </FeatureTextBox>
              <FeatureImgBox>
                <FeatureImg src={heyImage} alt="AI 요약" style={{ maxWidth: 280 }} />
              </FeatureImgBox>
            </FeatureRow>
          </FeatureBlock>

          {/* Block 2 */}
          <FeatureBlock>
            <FeatureRow $reverse>
              <FeatureTextBox>
                <FeatureTitle $gradient="linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)">
                  내 스타일, 내 방식대로<br />나만의 학습 설계
                </FeatureTitle>
                <FeatureText>
                  기본 요약부터 주제별, 목차별 요약까지,<br />
                  선택형부터 서술형까지 다양한 옵션을 제공합니다.<br />
                  나에게 맞는 방식으로 요약하고, 원하는 형태로 문제를 만들어 보세요.
                </FeatureText>
              </FeatureTextBox>
              <FeatureImgBox>
                <FeatureImg src={questionTypesImage} alt="문제 유형" style={{ maxWidth: 440 }} />
              </FeatureImgBox>
            </FeatureRow>
          </FeatureBlock>

          {/* Block 3 – 사용법 */}
          <FeatureBlock>
            <FeatureRow>
              <FeatureTextBox>
                <FeatureTitle $gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
                  큐레카 사용 방법
                </FeatureTitle>
                <StepList>
                  {steps.map((step, i) => (
                    <StepItem key={i}>
                      <StepBadge>{i + 1}</StepBadge>
                      <StepText>{step}</StepText>
                    </StepItem>
                  ))}
                </StepList>
                <BtnCenter>
                  <IndigoBtn onClick={goStart}>지금 시작하기 ✨</IndigoBtn>
                </BtnCenter>
              </FeatureTextBox>
              <FeatureImgBox>
                <ServiceFlowDemo maxWidth="100%" />
              </FeatureImgBox>
            </FeatureRow>
          </FeatureBlock>

        </Container>
      </FeatureSection>

      {/* ── CTA ── */}
      <CTASection>
        <CTATitle>지금 바로 Qureka와 함께!</CTATitle>
        <CTASubtitle>나만의 요약본 및 문제를 생성하세요!</CTASubtitle>
        <PrimaryBtn onClick={goStart}>지금 시작하기 ✨</PrimaryBtn>
      </CTASection>
    </PageWrapper>
  );
}

export default Home;