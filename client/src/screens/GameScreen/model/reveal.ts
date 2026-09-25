import type { RoundResolvedPayload } from "../../../game/types";
import { GOAL_LANDMARKS, STRIKER_SPOT, ZONE_POINT, ZONES, type ZoneId } from "./zoneLayout";
import { getOutcomePresentation, type OutcomePresentation } from "./outcomes";

/**
 * Хореография развязки раунда — то, что раньше было "мяч долетает точкой
 * до цели" (см. историю ui/Ball.tsx). Раскладывает один result в конкретные
 * тайминги и координаты, которыми управляют ui/Ball.tsx (полёт),
 * ui/ImpactFX.tsx (эффект удара) и позы персонажей (ui/PoseLayer.tsx) —
 * сами компоненты ничего не решают, только рисуют то, что здесь посчитано.
 *
 * Бюджет по времени ЖЁСТКИЙ и НЕ управляется клиентом: сервер держит фазу
 * ROUND_RESULT ровно 4000мс (см. server/src/gameRoom.js, resolveRound ->
 * setTimeout(nextRound, 4000)), после чего меняет state независимо от того,
 * доиграла ли анимация. Вся хореография ниже укладывается в ~1.1с движения
 * + баннер держится на экране до конца окна — с запасом, чтобы даже на
 * медленном планшете ничего не обрубило.
 */

const KICK_MS = 140; // замах — мяч ещё у ноги, персонажи готовятся
const FLIGHT_MS = 420; // полёт start -> apex -> contact
const HITSTOP_MS = 110; // короткая заморозка кадра в момент касания — "вес" удара
const SETTLE_MS = 430; // что происходит С мячом ПОСЛЕ касания (в сетку/отбив/за кадр)

export const BALL_TIMELINE_MS = KICK_MS + FLIGHT_MS + HITSTOP_MS + SETTLE_MS;

/**
 * 6 опорных точек мяча (см. BallChoreography.points) и, соответственно,
 * 6 временных меток: замах-держит-мяч / замах-конец (та же позиция) /
 * апекс дуги (середина полёта) / касание (конец полёта) / касание-держит
 * (хит-стоп, та же позиция) / точка успокоения. Между ними — 5 отрезков,
 * у каждого свой easing (см. ui/Ball.tsx: массив `easings`).
 */
export const BALL_TIMES = [
  0,
  KICK_MS,
  KICK_MS + FLIGHT_MS / 2,
  KICK_MS + FLIGHT_MS,
  KICK_MS + FLIGHT_MS + HITSTOP_MS,
  BALL_TIMELINE_MS,
].map((ms) => ms / BALL_TIMELINE_MS);

export type Point = { x: number; y: number };

export interface BallChoreography {
  /** 6 точек траектории — start, start(hold), apex, contact, contact(hold/хит-стоп), settle. */
  points: [Point, Point, Point, Point, Point, Point];
  /** Момент касания (0..1 от общей длительности) — по нему синхронизируются FX/тряска/конфетти/поза вратаря. */
  impactAt: number;
  /** Общая длительность в секундах — для transition.duration в motion. */
  durationSec: number;
  contactPoint: Point;
  presentation: OutcomePresentation;
}

const BALL_START: Point = { x: STRIKER_SPOT.x + 4, y: STRIKER_SPOT.y - 6 };

function zoneSide(zone: ZoneId): -1 | 0 | 1 {
  const point = ZONE_POINT[zone];
  const dx = point.x - GOAL_LANDMARKS.goalCenterX;
  if (Math.abs(dx) < 3) return 0;
  return dx < 0 ? -1 : 1;
}

function isTopZone(zone: ZoneId): boolean {
  return ZONES.find((z) => z.id === zone)?.isTop ?? true;
}

function apexFor(start: Point, contact: Point, lift: number): Point {
  return { x: (start.x + contact.x) / 2, y: Math.min(start.y, contact.y) - lift };
}

/** Считает всю траекторию мяча по одному result — единственная точка входа для ui/Ball.tsx. */
export function buildBallChoreography(result: RoundResolvedPayload): BallChoreography {
  const zone = result.strikerZone as ZoneId;
  const zonePoint = ZONE_POINT[zone] ?? ZONE_POINT[2];
  const presentation = getOutcomePresentation(result.result.outcome);
  const side = zoneSide(zone);
  const top = isTopZone(zone);

  let contact: Point;
  let settle: Point;
  let lift: number;

  switch (presentation.ball) {
    case "post": {
      // Удар в раму: мяч отскакивает от штанги наружу (от центра ворот) и
      // чуть вниз, от перекладины — вниз-назад на поле, потом растворяется
      // (см. ui/Ball.tsx: fades). Отскок короткий — мяч не улетает за экран.
      contact = side < 0 ? GOAL_LANDMARKS.postLeft : side > 0 ? GOAL_LANDMARKS.postRight : GOAL_LANDMARKS.crossbarCenter;
      settle = side === 0 ? { x: contact.x - 3, y: contact.y + 12 } : { x: contact.x + side * 9, y: contact.y + 10 };
      lift = 20;
      break;
    }
    case "over": {
      // Над перекладиной: мяч чиркает по верхнему краю рамы над выбранной
      // зоной, подскакивает вверх-назад (за ворота) и растворяется. Раньше
      // улетал точкой y=-12, то есть просто за верх экрана.
      const barX = Math.min(Math.max(zonePoint.x, GOAL_LANDMARKS.postLeft.x + 2), GOAL_LANDMARKS.postRight.x - 2);
      // Центр мяча — на радиус выше рамы (мяч ~9cqh, радиус ≈ 4.5% сцены):
      // мяч касается перекладины, а не проходит сквозь неё.
      contact = { x: barX, y: GOAL_LANDMARKS.crossbarTop - 4.5 };
      settle = { x: contact.x + side * 4, y: contact.y - 9 };
      lift = 22;
      break;
    }
    case "deflected": {
      contact = zonePoint;
      const punchOut = presentation.keeper === "fingertip" ? 15 : presentation.keeper === "leg" ? 9 : 4;
      const dir = side === 0 ? 1 : side;
      settle = {
        x: contact.x + dir * punchOut,
        y: Math.min(GOAL_LANDMARKS.groundY - 4, contact.y + (top ? 16 : 10)),
      };
      lift = 14;
      break;
    }
    case "zone":
    default: {
      contact = zonePoint;
      settle = { x: contact.x + (contact.x - GOAL_LANDMARKS.goalCenterX) * 0.22, y: contact.y - 2 };
      lift = 16;
      break;
    }
  }

  const apex = apexFor(BALL_START, contact, lift);

  return {
    points: [BALL_START, BALL_START, apex, contact, contact, settle],
    impactAt: BALL_TIMES[3],
    durationSec: BALL_TIMELINE_MS / 1000,
    contactPoint: contact,
    presentation,
  };
}

/** Поза-реакция вратаря — целиком спрайт наклоняется/смещается, без покостной анимации (см. ui/PoseLayer). */
export interface KeeperPose {
  x: number;
  y: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
}

export const KEEPER_NEUTRAL: KeeperPose = { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 };

export function buildKeeperPose(result: RoundResolvedPayload): KeeperPose {
  const zone = result.strikerZone as ZoneId;
  const side = zoneSide(zone);
  const top = isTopZone(zone);
  const presentation = getOutcomePresentation(result.result.outcome);

  switch (presentation.keeper) {
    case "beaten": {
      // Прыгает НЕ в ту сторону — противоход. На центр ворот падает "спиной", наугад.
      const wrongSide = side === 0 ? -1 : -side;
      return { x: wrongSide * 92, y: 34, rotate: wrongSide * 58, scaleX: 1, scaleY: 0.92 };
    }
    case "catch":
      return { x: side * 58, y: top ? -22 : 18, rotate: side * 20, scaleX: 1.04, scaleY: 1.06 };
    case "leg":
      return { x: side * 66, y: 34, rotate: side * 38, scaleX: 1.05, scaleY: 0.82 };
    case "fingertip":
      return { x: side * 112, y: top ? -14 : 22, rotate: side * 30, scaleX: 1.1, scaleY: 1.1 };
    case "watch":
    default:
      return KEEPER_NEUTRAL;
  }
}
