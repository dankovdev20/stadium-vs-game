import ScreenShell from "../layout/ScreenShell";

// Терминал без роли, пока на стенде идёт матч (роль не восстановилась после
// перезагрузки или сервер её уже забыл). Раньше такой терминал показывал
// экран матча с "TO TY" и активными зонами, но сервер молча игнорировал тапы.
// Сам экран ничего не делает: когда матч закончится или комнату сбросят,
// фаза вернётся в LOBBY и App покажет выбор роли.
export default function SpectatorScreen() {
  return (
    <ScreenShell tone="dark">
      <div className="flex h-full min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-['Press_Start_2P'] text-2xl uppercase leading-relaxed text-[#d7e9dc] drop-shadow-[3px_3px_0_#234f38] sm:text-4xl">
          Trwa mecz
        </h1>
        <p className="font-['Press_Start_2P'] text-xs uppercase leading-relaxed text-[#b9d4c0]/80 sm:text-sm">
          Poczekaj, aż stanowisko się zwolni
        </p>
      </div>
    </ScreenShell>
  );
}
