/**
 * 캐릭터 관련 타입 정의
 * 모든 캐릭터 관련 컴포넌트와 훅에서 사용하는 공통 타입들
 */

// 기본 캐릭터 타입
export type Character = {
  id: number;
  owner_user_id: number | null;
  name: string;
  prompt: string;
  thumbnail_path: string | null;
  created_at: number;
};

// 캐릭터 생성 요청 타입
export type CreateCharacterRequest = {
  name: string;
  prompt: string;
  thumbnail?: File;
};

// 캐릭터 생성 응답 타입 (API 응답)
export type CreateCharacterResponse = Character;

// 캐릭터 목록 조회 응답 타입
export type CharactersResponse = Character[];
