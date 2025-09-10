export type Character = {
  id: number;
  owner_user_id: number | null;
  name: string;
  prompt: string;
  thumbnail_path: string | null;
  created_at: number;
};
