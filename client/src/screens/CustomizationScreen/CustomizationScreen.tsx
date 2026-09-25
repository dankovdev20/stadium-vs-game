import { useState } from "react";
import ScreenShell from "../../components/layout/ScreenShell";
import PixelIcon from "../../components/ui/PixelIcon";
import Tag from "../../components/ui/Tag";
import { useGameEmit, useGameState } from "../../game/GameContext";
import CharacterBuilder from "../../feature/character-builder/ui/CharacterBuilder";
import type { CharacterSelection, PlayerRole } from "../../game/types";

const ROLE_LABELS: Record<PlayerRole, string> = { player_1: "Gracz 1", player_2: "Gracz 2" };

export default function CustomizationScreen() {
  const emit = useGameEmit();
  const { sync, myRole } = useGameState();
  const [submitted, setSubmitted] = useState(false);
  // После F5/реконнекта локальный флаг пустой, но сервер уже мог принять
  // персонажа — тогда кнопка должна остаться в "ожидании", а не звать жать снова.
  const confirmedOnServer = !!(myRole && sync?.characters[myRole]);

  // Статус соперника — только чтение state:sync (персонаж соперника
  // появляется там, как только сервер его принял): ребёнок видит, что
  // происходит у второго терминала, а не ждёт в пустоту.
  const rivalRole: PlayerRole | null = myRole ? (myRole === "player_1" ? "player_2" : "player_1") : null;
  const rivalReady = !!(rivalRole && sync?.characters[rivalRole]);

  const handleSubmit = (character: CharacterSelection) => {
    setSubmitted(true);
    emit("character:submit", character);
  };

  return (
    <ScreenShell>
      <header className="absolute inset-x-12 top-10 grid h-[100px] grid-cols-[1fr_auto_1fr] items-center">
        {myRole ? (
          <Tag tone="gold" className="justify-self-start px-[22px] pb-4 pt-3.5 text-[32px] uppercase">
            {ROLE_LABELS[myRole]}
          </Tag>
        ) : (
          <span />
        )}
        <h1 className="text-outline font-display text-[104px] font-normal uppercase leading-none">Zbuduj zawodnika</h1>
        {rivalRole ? (
          rivalReady ? (
            <Tag tone="grass" className="justify-self-end text-[28px]">
              <PixelIcon name="check" scale={4} /> {ROLE_LABELS[rivalRole]} gotowy
            </Tag>
          ) : (
            <Tag tone="dashed" className="justify-self-end text-[28px]">
              {ROLE_LABELS[rivalRole]} wybiera<span className="animate-px-blink">…</span>
            </Tag>
          )
        ) : (
          <span />
        )}
      </header>

      <CharacterBuilder onSubmit={handleSubmit} disabled={submitted || confirmedOnServer} />
    </ScreenShell>
  );
}
