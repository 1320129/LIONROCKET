import React from "react";
import { api } from "../lib/api";
import { API_BASE } from "../lib/config";
import { broadcastLogout, saveLastCharacter } from "../lib/persist";

type Character = {
  id: number;
  owner_user_id: number | null;
  name: string;
  prompt: string;
  thumbnail_path: string | null;
  created_at: number;
};

export default function HomePage() {
  const [me, setMe] = React.useState<{ id: number; email: string } | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [characters, setCharacters] = React.useState<Character[]>([]);

  const [name, setName] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const previewUrl = React.useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api<{ id: number; email: string }>("/auth/me");
        setMe(res);
        const list = await api<Character[]>("/characters");
        setCharacters(list);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onLogout() {
    await api("/auth/logout", { method: "POST" });
    broadcastLogout();
    location.href = "/login";
  }

  async function onCreateCharacter(e: React.FormEvent) {
    e.preventDefault();
    setFileError(null);
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setFileError("PNG/JPEG/WEBP만 업로드 가능합니다.");
        return;
      }
      const max = 2 * 1024 * 1024;
      if (file.size > max) {
        setFileError("이미지 최대 2MB까지 허용됩니다.");
        return;
      }
    }
    const fd = new FormData();
    fd.append("name", name);
    fd.append("prompt", prompt);
    if (file) fd.append("thumbnail", file);
    const res = await fetch(`${API_BASE}/characters`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    if (!res.ok) {
      const t = await res.text();
      alert(`생성 실패: ${t}`);
      return;
    }
    const created = (await res.json()) as Character;
    setCharacters((prev) => [created, ...prev]);
    setName("");
    setPrompt("");
    setFile(null);
  }

  async function onDeleteCharacter(id: number) {
    if (!confirm("이 캐릭터를 삭제하시겠습니까? 관련 대화도 함께 삭제됩니다."))
      return;
    try {
      await api(`/characters/${id}`, { method: "DELETE" });
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      alert(e?.message || "삭제 실패");
    }
  }

  function goChat(c: Character) {
    saveLastCharacter(c.id);
    try {
      localStorage.setItem(`characterName:${c.id}`, c.name);
    } catch {}
    location.href = `/chat/${c.id}`;
  }

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>환영합니다</h2>
      <div style={{ marginBottom: 12 }}>로그인: {me?.email}</div>
      <button onClick={onLogout}>로그아웃</button>

      <h3 style={{ marginTop: 24 }}>캐릭터 생성</h3>
      <form
        onSubmit={onCreateCharacter}
        style={{ display: "grid", gap: 8, maxWidth: 480 }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          required
        />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="프롬프트"
          required
        />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {previewUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={previewUrl}
              width={64}
              height={64}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
            <button type="button" onClick={() => setFile(null)}>
              이미지 제거
            </button>
          </div>
        )}
        {fileError && <div style={{ color: "red" }}>{fileError}</div>}
        <button type="submit">생성</button>
      </form>

      <h3 style={{ marginTop: 24 }}>캐릭터 목록</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {characters.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 8,
            }}
          >
            {c.thumbnail_path && (
              <img
                src={`${API_BASE}/${c.thumbnail_path}`}
                alt={c.name}
                width={48}
                height={48}
                loading="lazy"
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {c.prompt.slice(0, 80)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => goChat(c)}>
                대화하기
              </button>
              <button type="button" onClick={() => onDeleteCharacter(c.id)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
