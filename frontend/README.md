# 프론트엔드 (React + TypeScript + Vite)

이 폴더는 서비스의 프론트엔드를 포함합니다. 개발용 로컬 실행 방법과 환경설정을 안내합니다.

## 실행 방법

```
cd frontend
cp .env.example .env
npm i
npm run dev
```

브라우저에서 `http://localhost:5173` 로 접속합니다.

## 환경변수

- `.env`
  - `VITE_API_BASE=http://localhost:4000` (백엔드 API 주소)

## 개발 메모

- 라우팅: `react-router-dom`
- 상태: React 훅 기반 로컬 상태
- 네트워크: `src/lib/api.ts`의 `api`, `apiWithRetry`
- 테마: 라이트/다크 토글 지원

## 스크립트

- `npm run dev`: 개발 서버 실행 (HMR)

## 주의사항

- API 요청은 인증 쿠키를 포함합니다(`credentials: "include"`).
- 백엔드 CORS 설정(`CORS_ORIGIN`)이 프론트 주소와 일치해야 합니다.
