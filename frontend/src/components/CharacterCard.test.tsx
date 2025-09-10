import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { CharacterCard } from "./CharacterCard";
import { theme } from "../styles/theme";
import { Character } from "../types/character";
import { describe, it, expect, vi } from "vitest";

describe("CharacterCard", () => {
  const character: Character = {
    id: 1,
    owner_user_id: null,
    name: "Test",
    prompt: "Hello world",
    thumbnail_path: null,
    created_at: 0,
  };

  it("renders character name", () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterCard
          character={character}
          apiBase=""
          onChat={vi.fn()}
          onDelete={vi.fn()}
        />
      </ThemeProvider>
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("calls handlers on button clicks", () => {
    const onChat = vi.fn();
    const onDelete = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <CharacterCard
          character={character}
          apiBase=""
          onChat={onChat}
          onDelete={onDelete}
        />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText("대화하기"));
    fireEvent.click(screen.getByText("삭제"));
    expect(onChat).toHaveBeenCalledWith(character);
    expect(onDelete).toHaveBeenCalledWith(character.id);
  });
});
