interface StatusPillProps {
  hasChosen: boolean;
  rivalChosen: boolean;
  roundResultVisible: boolean;
}

// Раньше это была строка текста в общем flex-потоке, отъедавшая полосу
// экрана снизу (см. GameScreen). Теперь — плавающий чип над травой,
// нижняя треть арта там всегда свободна от ворот/персонажей. Прячется на
// время ROUND_RESULT — ResultOverlay в это время сам держит внимание,
// дублировать его незачем.
export default function StatusPill({ hasChosen, rivalChosen, roundResultVisible }: StatusPillProps) {
  if (roundResultVisible) return null;

  const label = hasChosen
    ? "Twój wybór zapisany. Czekaj na strzał!"
    : rivalChosen
      ? "Rywal podjął decyzję! Twój ruch!"
      : "Wybierz strefę";

  return (
    <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
      <p className="whitespace-nowrap border-2 border-white/25 bg-black/45 px-5 py-2 font-[Poppins] text-sm font-semibold text-white/90 shadow-[4px_4px_0_rgba(0,0,0,0.35)] backdrop-blur-[2px] sm:text-base">
        {label}
      </p>
    </div>
  );
}
