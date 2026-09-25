import { useEffect } from "react";
import GameButton from "../../../components/ui/Button";
import Panel from "../../../components/ui/Panel";
import ScarfStripe from "../../../components/ui/ScarfStripe";
import Tag from "../../../components/ui/Tag";
import PartnerLogo from "../../../components/brand/PartnerLogo";
import { ASSET_CREDITS, CHARACTER_ART, DEVELOPERS } from "../model/credits";

// Стенд без присмотра: если ребёнок открыл окно и ушёл — закрываем сами.
const AUTO_CLOSE_MS = 60_000;

interface CreditsDialogProps {
  onClose: () => void;
}

// Окно "Autorzy": сначала команда (разработчики и партнёры), ниже —
// авторы чужих ассетов (шрифты, позже спрайты персонажей LPC). Живёт
// внутри сцены 1920×1080 лобби; тап по затемнению или "Zamknij" закрывает.
export default function CreditsDialog({ onClose }: CreditsDialogProps) {
  useEffect(() => {
    const id = setTimeout(onClose, AUTO_CLOSE_MS);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-ink/45" onClick={onClose} role="dialog" aria-modal="true" aria-label="Autorzy">
      <Panel className="flex max-h-[920px] w-[1100px] flex-col items-center" onClick={(event) => event.stopPropagation()}>
        <ScarfStripe className="h-20 shrink-0 shadow-[0_4px_0_0_var(--color-ink)]" />
        <Tag className="-mt-[60px] px-8 pb-3 pt-2 font-display text-[60px] font-normal uppercase">Autorzy</Tag>

        <div className="grid w-full gap-10 overflow-y-auto overscroll-contain px-16 pb-6 pt-8 [touch-action:pan-y]">
          <section className="grid gap-4">
            <h2 className="font-display text-[56px] uppercase leading-none">Twórcy gry</h2>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-4">
              {DEVELOPERS.map((person) => (
                <li key={person.name} className="grid">
                  <span className="text-[34px] font-bold">{person.name}</span>
                  <span className="text-[24px] font-medium text-ink-500">{person.role}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-4">
            <h2 className="font-display text-[56px] uppercase leading-none">Partnerzy</h2>
            <div className="flex flex-wrap items-center gap-8 pb-2">
              <PartnerLogo partner="wks" />
              <PartnerLogo partner="roboklocki" />
            </div>
          </section>

          <section className="grid gap-4">
            <h2 className="font-display text-[56px] uppercase leading-none">Grafika i czcionki</h2>
            <ul className="grid gap-3">
              <li className="grid gap-1">
                <span className="text-[28px] font-bold">{CHARACTER_ART.work}</span>
                <span className="text-[22px] font-medium leading-snug text-ink-700">{CHARACTER_ART.authors.join(", ")}</span>
                <span className="text-[20px] font-medium text-ink-500">
                  {CHARACTER_ART.source} · {CHARACTER_ART.licenses.join(", ")}
                </span>
              </li>
              {ASSET_CREDITS.map((asset) => (
                <li key={asset.work} className="grid">
                  <span className="text-[28px] font-bold">{asset.work}</span>
                  <span className="text-[22px] font-medium text-ink-500">
                    {asset.authors}
                    {asset.license && ` · ${asset.license}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="w-full shrink-0 px-16 pb-10 pt-4">
          <GameButton size="md" onClick={onClose} className="w-full uppercase">
            Zamknij
          </GameButton>
        </div>
      </Panel>
    </div>
  );
}
