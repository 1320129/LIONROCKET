# AI 사용 안내

- 서버 전용: API 키는 백엔드 `.env`에 저장합니다. 프론트엔드로 절대 노출하지 않습니다.
- 환경변수
  - `ANTHROPIC_API_KEY`=발급받은 키(`sk-ant-...`)
  - `CORS_ORIGIN`=http://localhost:5173

### 에러/재시도 정책

- 프론트: `apiWithRetry`로 최대 2회 지수 백오프(400ms, 800ms) 재시도
- 백엔드: 외부 오류 시 5xx/502 반환, 실패 시 메시지 저장 안 함
- 유효성: 입력 200자 초과 시 400 반환

### 로컬 셋업

1. 백엔드 환경변수 설정

```
cd backend
cp .env.example .env
# .env 를 열어 아래 라인 추가/수정
# ANTHROPIC_API_KEY=sk-ant-...
```

2. 서버 재시작

```
npm run build
node dist/index.js
```
