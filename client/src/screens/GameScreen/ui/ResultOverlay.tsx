import type { RoundResolvedPayload } from "../../../game/types";
import { getOutcomePresentation } from "../model/outcomes";
import { buildBallChoreography } from "../model/reveal";

const OUTCOME_LABELS: Record<RoundResolvedPayload["result"]["outcome"], string> = {
  GOL: "GOL!",
  OBRONA_PERFEKCYJNA: "OBRONA!",
  OBRONA_NOGA: "OBRONA NOGĄ!",
  FUKS_BRAMKARZA: "FUKS BRAMKARZA!",
  SLUPEK_POPRZECZKA: "SŁUPEK!",
  NAD_POPRZECZKA: "NAD POPRZECZKĄ!",
};

// Тот же корпус/экран, что у HUD (см. ui/Hud.tsx, --color-scoreboard-*) —
// один и тот же "физический объект" стадиона, просто два разных табло.
// Различие между исходами — только акцентный цвет контура/текста, не сам
// материал: гол — мятный (тот же LED-зелёный, что у счёта в HUD), сейв —
// холодный голубой, мимо — золото (уже основной акцентный цвет проекта,
// кнопки/бейджи). Три разных объекта на сцене выглядели бы шумно — один
// объект с разным "свечением" читается спокойнее.
const EFFECT_THEME: Record<"goal" | "save" | "miss", { accent: string; glow: string }> = {
  goal: { accent: "var(--color-scoreboard-led)", glow: "rgba(127,214,163,0.55)" },
  save: { accent: "#8ecbf5", glow: "rgba(142,203,245,0.5)" },
  miss: { accent: "var(--color-gold-500)", glow: "rgba(255,201,60,0.5)" },
};

interface ResultOverlayProps {
  result: RoundResolvedPayload;
}

// Раньше это было полноэкранное затемнение (bg-black/60) с текстом
// посередине — перекрывало всю сцену, ради которой всё затевалось, в тот
// самый момент, когда на ней и так происходит самое интересное (полёт мяча,
// нырок вратаря, см. ui/Ball.tsx + model/reveal.ts). Теперь — компактный
// баннер сверху-по-центру, HUD живёт в углу (см. Hud.tsx) — не пересекаются.
//
// animation-delay = impactAt из той же хореографии, что двигает мяч (см.
// model/reveal.ts) — баннер не опережает развязку, въезжает ПОСЛЕ момента
// касания. key={result.round} — гарантирует remount (и значит перезапуск
// .animate-banner-drop) на каждый новый раунд.
export default function ResultOverlay({ result }: ResultOverlayProps) {
  const presentation = getOutcomePresentation(result.result.outcome);
  const choreography = buildBallChoreography(result);
  const theme = EFFECT_THEME[presentation.sceneEffect];
  const delayMs = Math.round(choreography.impactAt * choreography.durationSec * 1000);
  const isGoal = result.result.isGoal;

  return (
    <div
      key={result.round}
      className="animate-banner-drop absolute left-1/2 top-6 z-40"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className="rounded-[1.1cqh] border-[0.35cqh] p-[0.45cqh] shadow-[0_0.5cqh_1.2cqh_rgba(0,0,0,0.4)]"
        style={{ borderColor: theme.accent, background: theme.accent }}
      >
        <div className="min-w-[22rem] rounded-[0.7cqh] bg-[var(--color-scoreboard-screen)] px-6 py-4 text-center">
          <p className="font-['Press_Start_2P'] text-[10px] uppercase tracking-widest text-[var(--color-scoreboard-frame)]">
            Runda {result.round}
          </p>
          <h2
            className="mt-2 font-['Press_Start_2P'] text-2xl uppercase leading-relaxed sm:text-3xl"
            style={{ color: theme.accent, textShadow: `0 0 1.4cqh ${theme.glow}` }}
          >
            {OUTCOME_LABELS[result.result.outcome]}
          </h2>
          <p className="mt-2 font-[Poppins] text-sm font-semibold text-white/85">{result.result.details}</p>
          {isGoal && (
            <p className="mt-2 font-['Press_Start_2P'] text-xs" style={{ color: theme.accent }}>
              +{result.result.pointsAwarded} PKT
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
