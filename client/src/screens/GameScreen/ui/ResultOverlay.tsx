import type { PlayerRole, RoundResolvedPayload } from "../../../game/types";
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

const ROLE_LABELS: Record<PlayerRole, string> = { player_1: "Gracz 1", player_2: "Gracz 2" };

// Тот же корпус/экран, что у табло (HUD) — один "физический объект"
// стадиона. Исход кодируется цветом корпуса и свечения LED: гол — трава и
// мятный LED, сейв — лазурь, мимо — золото.
const EFFECT_THEME: Record<"goal" | "save" | "miss", { surface: string; text: string; glow: string }> = {
  goal: { surface: "surface-grass", text: "text-led", glow: "rgb(127 214 163 / 0.6)" },
  save: { surface: "surface-azure", text: "text-azure-300", glow: "rgb(159 208 247 / 0.55)" },
  miss: { surface: "surface-gold", text: "text-gold-500", glow: "rgb(255 201 60 / 0.5)" },
};

interface ResultOverlayProps {
  result: RoundResolvedPayload;
}

// Баннер результата сверху по центру — не полноэкранное затемнение: в этот
// момент на сцене самое интересное (полёт мяча, нырок вратаря). HUD в
// левом углу; ширина баннера ограничена, чтобы с ним не пересекаться.
//
// animation-delay = impactAt из той же хореографии, что двигает мяч (см.
// model/reveal.ts) — баннер въезжает ПОСЛЕ касания. key={result.round} —
// перезапуск .animate-banner-drop на каждый новый раунд.
export default function ResultOverlay({ result }: ResultOverlayProps) {
  const presentation = getOutcomePresentation(result.result.outcome);
  const choreography = buildBallChoreography(result);
  const theme = EFFECT_THEME[presentation.sceneEffect];
  const delayMs = Math.round(choreography.impactAt * choreography.durationSec * 1000);
  const label = OUTCOME_LABELS[result.result.outcome];
  const isGoal = result.result.isGoal;

  return (
    <div key={result.round} className="animate-banner-drop absolute left-1/2 top-10 z-40" style={{ animationDelay: `${delayMs}ms` }}>
      <div className={`pix-frame pix-frame-lg p-3 [--px-depth:8px] [--px-drop:12px] ${theme.surface}`}>
        <div className="grid min-w-[600px] max-w-[640px] justify-items-center gap-1 bg-board-screen px-12 pb-5 pt-3.5 text-center shadow-[inset_0_0_0_4px_var(--color-board-edge)]">
          <span className="text-[24px] font-semibold uppercase tracking-[0.1em] text-board-text">Runda {result.round}</span>
          <h2
            className={`font-display font-normal leading-[0.8] ${theme.text} ${label.length <= 7 ? "text-[170px]" : "text-[88px]"}`}
            style={{ textShadow: `0 0 20px ${theme.glow}` }}
          >
            {label}
          </h2>
          {isGoal ? (
            <p className="text-[32px] font-bold text-gold-500">
              +{result.result.pointsAwarded} PKT · {ROLE_LABELS[result.strikerRole]}
            </p>
          ) : (
            <p className="text-[28px] font-semibold text-board-text">{result.result.details}</p>
          )}
        </div>
      </div>
    </div>
  );
}
