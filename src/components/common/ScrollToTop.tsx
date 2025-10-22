import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop 컴포넌트
 * 페이지 라우팅이 변경될 때마다 화면을 맨 위로 스크롤하게.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 라우트 변경 시 페이지 상단으로 스크롤
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다
};

export default ScrollToTop;
