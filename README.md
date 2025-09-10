# 🚀 AI 채팅 서비스 (LIONROCKET)

React + TypeScript + Express.js로 구현된 AI 캐릭터 채팅 서비스입니다.

## 📋 프로젝트 개요

- **프론트엔드**: React 19 + TypeScript + Vite + styled-components
- **백엔드**: Express.js + TypeScript + SQLite
- **상태 관리**: @tanstack/react-query + React Hooks
- **스타일링**: styled-components + 다크모드 지원

## 🛠️ 개발 환경 요구사항

- **Node.js**: v20.19.5 (LTS)
- **npm**: v10.8.2
- **브라우저**: Chrome, Firefox, Safari (최신 버전)

## 🚀 설치 및 실행

### 1. 백엔드 실행

```bash
cd backend
npm install
npm run build
node dist/index.js
```

백엔드 서버가 `http://localhost:4000`에서 실행됩니다.

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

## ⚙️ 환경변수 설정

### 백엔드 (.env)

```env
PORT=4000
DB_PATH=data/app.db
UPLOAD_DIR=uploads
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=lionrocket-secret-key-2024
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 프론트엔드 (.env)

```env
VITE_API_BASE=http://localhost:4000
```

## ✨ 주요 기능

### 🔐 인증 시스템

- JWT 기반 인증 (httpOnly 쿠키)
- 회원가입/로그인/로그아웃
- 보호된 라우트 (RequireAuth)

### 🤖 AI 캐릭터 관리

- 기본 제공 캐릭터 3개
- 사용자 정의 캐릭터 생성
- 캐릭터 이름, 프롬프트, 썸네일 설정
- 이미지 업로드 (2MB 제한, PNG/JPEG/WEBP)

### 💬 채팅 기능

- 실시간 AI 채팅
- 메시지 200자 제한
- 캐릭터별 독립적 대화
- 타임스탬프 표시
- 로딩 상태 표시
- 메시지 재전송 기능

### 🎨 사용자 경험

- 반응형 디자인
- 다크모드 토글
- 무한 스크롤 (메시지 히스토리)
- 멀티탭 동기화 (BroadcastChannel)
- 입력 초안 자동 저장
- 마지막 캐릭터 기억

## 🔧 개발 스크립트

### 백엔드

```bash
npm run dev      # 개발 모드 (ts-node-dev)
npm run build    # TypeScript 컴파일
npm start        # 프로덕션 실행
```

### 프론트엔드

```bash
npm run dev      # 개발 서버 (Vite)
npm run build    # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

## 📝 API 문서

### 인증

- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃
- `GET /auth/me` - 사용자 정보

### 캐릭터

- `GET /characters` - 캐릭터 목록
- `POST /characters` - 캐릭터 생성
- `DELETE /characters/:id` - 캐릭터 삭제

### 채팅

- `POST /chat` - 메시지 전송
- `GET /messages/:characterId` - 메시지 히스토리
