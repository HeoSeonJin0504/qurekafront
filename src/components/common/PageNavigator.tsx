import React, { useEffect, useState } from 'react';
import { Box, Fab, Zoom, Tooltip, Divider, useMediaQuery, useTheme } from '@mui/material';
import { KeyboardArrowUp, Home, Create, Person, LiveHelp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PageNavigatorProps {
  additionalButtons?: {
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  }[];
}

const PageNavigator: React.FC<PageNavigatorProps> = ({ additionalButtons }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:1300px)');
  
  // 스크롤 위치에 따라 상단 이동 버튼 표시 여부 결정
  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300); // 300px 이상 스크롤 시 버튼 표시
    };

    window.addEventListener('scroll', checkScrollPosition);
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, []);

  // 페이지 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 페이지 이동 함수들 - 페이지 상단으로 스크롤 추가
  const goToPage = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  // 개별 페이지 이동 함수들
  const goToHome = () => goToPage('/');
  const goToUpload = () => goToPage('/upload');
  const goToMypage = () => goToPage('/mypage');
  const goToSolveQuestions = () => goToPage('/solve-questions');

  // 모바일 버전 - 상단 이동 버튼만 표시
  if (isMobile) {
    return (
      <>
        {showScrollTop && (
          <Zoom in={showScrollTop}>
            <Fab
              color="primary"
              size="medium"
              onClick={scrollToTop}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                opacity: 0.9,
                zIndex: 1000,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                '&:hover': { opacity: 1 }
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </Zoom>
        )}
      </>
    );
  }

  // 데스크톱 버전 - 모든 버튼 표시
  return (
    <Box
      sx={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000,
        '& > *': {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* 상단으로 이동 버튼 */}
      <Zoom in={showScrollTop}>
        <Tooltip title="맨 위로" placement="left">
          <Fab
            color="primary"
            size="medium"
            onClick={scrollToTop}
            sx={{
              opacity: 0.9,
              '&:hover': { opacity: 1 }
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Tooltip>
      </Zoom>

      <Divider sx={{ my: 0.5 }} />

      {/* 홈으로 이동 버튼 */}
      <Tooltip title="홈" placement="left">
        <Fab
          color="default"
          size="medium"
          onClick={goToHome}
          sx={{
            bgcolor: 'background.paper',
            opacity: 0.9,
            '&:hover': { opacity: 1 }
          }}
        >
          <Home />
        </Fab>
      </Tooltip>

      {/* 로그인 필요 기능들 */}
      {isLoggedIn && (
        <>
          {/* 실습하기 페이지 이동 버튼 */}
          <Tooltip title="실습하기" placement="left">
            <Fab
              color="info"
              size="medium"
              onClick={goToUpload}
              sx={{
                opacity: 0.9,
                '&:hover': { opacity: 1 }
              }}
            >
              <Create />
            </Fab>
          </Tooltip>

          {/* 마이페이지 이동 버튼 */}
          <Tooltip title="마이페이지" placement="left">
            <Fab
              color="secondary"
              size="medium"
              onClick={goToMypage}
              sx={{
                opacity: 0.9,
                '&:hover': { opacity: 1 }
              }}
            >
              <Person />
            </Fab>
          </Tooltip>

          {/* 문제풀기 페이지 이동 버튼 */}
          <Tooltip title="문제풀기" placement="left">
            <Fab
              color="success"
              size="medium"
              onClick={goToSolveQuestions}
              sx={{
                opacity: 0.9,
                '&:hover': { opacity: 1 }
              }}
            >
              <LiveHelp />
            </Fab>
          </Tooltip>
        </>
      )}

      {/* 추가 버튼들 (각 페이지에서 필요한 기능 버튼) */}
      {additionalButtons?.map((button, idx) => (
        <Tooltip key={idx} title={button.tooltip} placement="left">
          <Fab
            color={button.color || 'default'}
            size="medium"
            onClick={button.onClick}
            sx={{
              opacity: 0.9,
              '&:hover': { opacity: 1 }
            }}
          >
            {button.icon}
          </Fab>
        </Tooltip>
      ))}
    </Box>
  );
};

export default PageNavigator;