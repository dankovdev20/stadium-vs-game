import ScreenShell from "../layout/ScreenShell";
import Panel from "../ui/Panel";
import PixelIcon from "../ui/PixelIcon";

// Терминал без роли, пока на стенде идёт матч (роль не восстановилась после
// перезагрузки или сервер её уже забыл). Раньше такой терминал показывал
// экран матча с "TO TY" и активными зонами, но сервер молча игнорировал тапы.
// Сам экран ничего не делает: когда матч закончится или комнату сбросят,
// фаза вернётся в LOBBY и App покажет выбор роли.
export default function SpectatorScreen() {
  return (
    <ScreenShell>
      <Panel className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 justify-items-center gap-6 px-24 pb-16 pt-14 text-center">
        <span className="animate-ball-hop text-ink">
          <PixelIcon name="ball" scale={10} />
        </span>
        <h1 className="font-display text-[120px] font-normal uppercase leading-[0.85]">Trwa mecz</h1>
        <p className="text-[34px] font-semibold text-ink-700">Poczekaj, aż stanowisko się zwolni</p>
      </Panel>
    </ScreenShell>
  );
}
