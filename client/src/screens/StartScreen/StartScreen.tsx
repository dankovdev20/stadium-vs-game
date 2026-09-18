import { Settings, Users, CircleDot } from "lucide-react";
import Background from "../../assets/titleScreenScene2.png";
import GameButton from "../../components/ui/Button";
import Panel from "../../components/ui/Panel";

interface StartScreenProps {
  onPlay: () => void;
  onOpenSettings?: () => void;
  onOpenAuthors?: () => void;
}

export default function StartScreen({
  onPlay,
  onOpenSettings,
  onOpenAuthors,
}: StartScreenProps) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[var(--color-grass-500)]">
      <img
        src={Background}
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Atrybucja — lewy dolny róg */}
      <div className="absolute bottom-5 left-5 z-10 font-[Poppins] text-xs font-semibold text-white/70">
        © 2026 Your Studio Name
      </div>

      {/* Przyciski drugorzędne */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-3">
        <button
          onClick={onOpenSettings}
          aria-label="Ustawienia"
          className="flex h-14 w-14 items-center justify-center rounded-2xl border-b-[5px] border-[var(--color-cream-300)] bg-[var(--color-cream-100)] text-[var(--color-ink-900)] transition-all duration-100 active:translate-y-[3px] active:border-b-[2px]"
        >
          <Settings size={24} strokeWidth={2.5} />
        </button>

        <button
          onClick={onOpenAuthors}
          aria-label="Autorzy"
          className="flex h-14 w-14 items-center justify-center rounded-2xl border-b-[5px] border-[var(--color-cream-300)] bg-[var(--color-cream-100)] text-[var(--color-ink-900)] transition-all duration-100 active:translate-y-[3px] active:border-b-[2px]"
        >
          <Users size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Centralny blok */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4">
        <div className="-mt-20 flex flex-col min-h-72 items-center gap-10">
          <Panel className="p-8">
            <h1 className="text-center font-[Anton] text-6xl uppercase tracking-wide text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] sm:text-7xl">
              Penalty Showdown
            </h1>
          </Panel>

          <GameButton onClick={onPlay} icon={CircleDot}>
            Zacznij grę
          </GameButton>
        </div>
      </div>
    </div>
  );
}
