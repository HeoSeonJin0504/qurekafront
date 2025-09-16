import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function extractHostFromUrl(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch (e) {
    console.warn(`Invalid URL: ${url}`);
    return null;
  }
}

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  
  const allowedHosts: string[] = ['localhost'];
  
  // 환경 변수에서 URL을 찾아 호스트 추출
  const urlEnvVars = ['VITE_BACKEND_URL', 'VITE_FASTAPI_URL', 'VITE_FRONTEND_URL'];
  
  // 모든 URL 환경 변수에서 호스트 추출하여 허용 목록에 추가
  urlEnvVars.forEach(key => {
    const url = env[key];
    if (url) {
      const host = extractHostFromUrl(url);
      if (host && !allowedHosts.includes(host)) {
        allowedHosts.push(host);
      }
    }
  });
  
  console.log('Allowed hosts:', allowedHosts);
  
  return {
    plugins: [react()],
    server: {
      allowedHosts
    },
  };
});
