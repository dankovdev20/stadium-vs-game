// Шарф WKS проезжает через экран на входе в матч — одна фирменная анимация
// на всю игру (.animate-scarf-wipe, index.css). Рендерится один раз на
// маунт GameScreen (он живёт весь матч, через все раунды), потом остаётся
// за правым краем и ничего не перекрывает (pointer-events-none).
export default function ScarfWipe() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
      <div className="scarf-lg animate-scarf-wipe absolute -inset-x-16 -inset-y-8 -skew-x-6" />
    </div>
  );
}
