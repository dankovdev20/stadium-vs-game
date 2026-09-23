import { type ReactNode } from "react";
import { motion, type TargetAndTransition } from "motion/react";
import { KEEPER_NEUTRAL, type KeeperPose } from "../model/reveal";

// KeeperPose — набор пяти конкретных числовых полей (x/y/rotate/scaleX/scaleY),
// но у Target/TargetAndTransition из motion есть индексная сигнатура под
// CSS-переменные (--foo), которой у именованного интерфейса нет — приводим
// один раз здесь, а не заражаем model/reveal.ts деталями конкретной
// анимационной библиотеки.
function asMotionTarget(pose: KeeperPose): TargetAndTransition {
  return pose as TargetAndTransition;
}

interface PoseLayerProps {
  pose: KeeperPose | null;
  children: ReactNode;
}

// Реакция вратаря на исход — целиком спрайт (translate/rotate/scale
// вокруг точки стоп), а не покостная анимация внутри SVG: части персонажа
// (голова/торс/ноги, см. feature/character-builder/svg) — независимые
// силуэты под смену вариантов гардероба, не рига под прыжок/подкат.
// Наклон ВСЕГО спрайта вокруг стоп ("50% 100%") — тот же трюк, что в
// аркадных спрайтовых играх для "нырка", и не требует трогать анатомию
// персонажа.
//
// Отдельный слой ПОД якорем позиционирования (см. PenaltyScene) — у якоря
// уже есть свой transform на CSS-анимации входа (.animate-character-enter,
// см. index.css); если бы поза жила на том же узле, motion и CSS-анимация
// начали бы писать в одно и то же свойство transform и конфликтовать.
//
// key={pose ? "reacting" : "idle"} — намеренный ремаунт вместо расчёта на
// то, что motion.div сам подхватит смену `animate` между рендерами: на
// практике (см. историю разработки) обновление ЗНАЧЕНИЙ одного и того же
// инстанса иногда не запускало анимацию вообще (пропадал переход в
// нейтральную позу -> позу-реакцию без единого кадра движения). Свежий
// маунт с явным initial/animate — та же тактика, что и
// .animate-character-enter в index.css, только на Framer Motion, и
// гарантированно проигрывает переход каждый раз.
export default function PoseLayer({ pose, children }: PoseLayerProps) {
  return (
    <motion.div
      key={pose ? "reacting" : "idle"}
      style={{ transformOrigin: "50% 100%" }}
      initial={pose ? asMotionTarget(KEEPER_NEUTRAL) : false}
      animate={asMotionTarget(pose ?? KEEPER_NEUTRAL)}
      transition={pose ? { type: "spring", stiffness: 300, damping: 16, mass: 0.9 } : { type: "spring", stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
