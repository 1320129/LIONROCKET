# AI Usage Notes

## Claude (Anthropic) Proxy

- Server-side only: API 키는 백엔드 `.env`에 저장합니다. 프론트엔드로 절대 노출하지 않습니다.
- 환경변수
  - `ANTHROPIC_API_KEY`=발급받은 키(`sk-ant-...`)
  - (옵션) `CORS_ORIGIN`=http://localhost:5173

### 서버 라우트

- POST `/chat`
  - Headers: `Content-Type: application/json`
  - Cookie: 로그인 세션 필요
  - Body
    - `message`: string (1~200자)
    - `characterId`: number (optional, 캐릭터 프롬프트 적용 시)
    - `model`: string (optional, 기본값: `claude-3-5-sonnet-20240620`)
  - Response
    - `{ reply: string, createdAt: number }`

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

### 스모크 테스트 (로그인 → 채팅)

```
# 1) 회원가입 또는 로그인 (쿠키 저장)
curl -sS -X POST 'http://localhost:4000/auth/login' \
  -H 'Content-Type: application/json' \
  -c /tmp/cj \
  -d '{"email":"test@example.com","password":"secret123"}'

# 2) 채팅 호출 (200자 제한)
curl -sS -X POST 'http://localhost:4000/chat' \
  -H 'Content-Type: application/json' \
  -b /tmp/cj \
  -d '{"message":"안녕! 한 줄로만 답해줘"}'
```

### 주의사항

- 요청 길이 제한: 메시지는 200자 이하
- API 키 보안: `.env`와 서버에서만 관리, Git에 커밋 금지
- 모델 변경 시 `model` 필드로 지정 가능
- 이미지 업로드: png/jpeg/webp, 2MB 이하
