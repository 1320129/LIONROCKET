# AI 채팅 서비스

## 설치 및 실행

### 백엔드

```
cd backend
cp .env.example .env
npm i

# (옵션) .env에 ANTHROPIC_API_KEY 설정 가능

npm run build
node dist/index.js
```

### 프론트엔드

```
cd frontend
cp .env.example .env
npm i
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 환경변수

- backend/.env
  - `PORT=4000`
  - `JWT_SECRET=변경-필수`
  - `CORS_ORIGIN=http://localhost:5173`
  - `UPLOAD_DIR=uploads`
  - `ANTHROPIC_API_KEY=sk-ant-...`
- frontend/.env
  - `VITE_API_BASE=http://localhost:4000`

## 기능

- 인증: JWT httpOnly 쿠키 기반 회원가입/로그인/로그아웃, 보호된 라우트
- 캐릭터: 기본 3개 + 사용자 생성, 썸네일 업로드(2MB, png/jpeg/webp)
- 채팅: Claude 프록시, 입력 200자 제한, 캐릭터별 메시지 저장
- UI: 반응형, 다크 모드 토글, 타임스탬프, 로딩, 지수 백오프 재시도
- 지속성: 입력 초안 복원, 마지막 캐릭터 기억, 멀티 탭 동기화

## 스크립트

- 백엔드: `npm run build` → `node dist/index.js`
- 프론트엔드: `npm run dev`

## 참고 사항

- API 키는 서버 전용입니다. 프론트엔드로 절대 노출하지 마세요.
- 빠른 테스트 순서 예시:
  - 로그인 후 → `/chat`에 200자 이하 메시지로 POST
  - 캐릭터 목록: 인증 후 `GET /characters`
