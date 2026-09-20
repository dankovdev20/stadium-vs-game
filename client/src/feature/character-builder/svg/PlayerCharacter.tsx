import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CharacterOption } from "../model/options";
import { HEAD_VARIANTS } from "./parts/head";
import { BODY_VARIANTS } from "./parts/body";
import { LEGS_VARIANTS } from "./parts/legs";
import { PartGradient, SkinGradient, type PartFills } from "./shared";

interface PlayerCharacterProps {
  head: CharacterOption;
  body: CharacterOption;
  legs: CharacterOption;
  className?: string;
}

function fillsFrom(prefix: string): PartFills {
  return { primary: `url(#${prefix}-p)`, accent: `url(#${prefix}-a)`, metal: `url(#${prefix}-m)` };
}

function PartDefs({ prefix, option }: { prefix: string; option: CharacterOption }) {
  return (
    <>
      <PartGradient id={`${prefix}-p`} color={option.palette.primary} />
      <PartGradient id={`${prefix}-a`} color={option.palette.accent} />
      <PartGradient id={`${prefix}-m`} color={option.palette.metal ?? "#4a3527"} />
    </>
  );
}

// Единая точка сборки футболиста из трёх независимо анимируемых групп
// (голова/торс/ноги, см. svg/parts/*). transformOrigin на каждой группе
// выставлен у сустава (шея/бедро) заранее — под будущие squash/stretch-
// анимации ударов и прыжков в самой игре; сейчас группы им не пользуются,
// просто рендерят геометрию варианта.
//
// Каждая часть — отдельная AnimatePresence, keyed по option.id: силуэты
// разных вариантов асимметричны (хвостик торчит вправо, козырёк кепки —
// влево...), и без перехода смена варианта читалась как "персонажа дёрнуло"
// — мгновенная подмена силуэта на новый с другими краями. Плавный
// fade+scale вместо жёсткой подмены полностью убирает этот эффект, не
// трогая при этом две другие части (AnimatePresence на голову не задевает
// тело/ноги — переключается только тот <g>, у которого правда сменился id).
//
// Градиенты каждой части красятся через id, построенный из React.useId() —
// на поле одновременно стоят два игрока (и ещё по карточке на вариант в
// гардеробе), а id внутри <defs> должен быть уникален на весь документ,
// иначе url(#...) у одного инстанса начнёт красить другой. Кожа (лицо,
// открытые руки) — один общий градиент на весь инстанс, не зависит от
// того, какая часть его использует.
export default function PlayerCharacter({ head, body, legs, className = "" }: PlayerCharacterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const headPrefix = `${uid}-h`;
  const bodyPrefix = `${uid}-b`;
  const legsPrefix = `${uid}-l`;
  const skinFill = `url(#${uid}-skin)`;

  const HeadGeometry = HEAD_VARIANTS[head.variant] ?? Object.values(HEAD_VARIANTS)[0];
  const BodyGeometry = BODY_VARIANTS[body.variant] ?? Object.values(BODY_VARIANTS)[0];
  const LegsGeometry = LEGS_VARIANTS[legs.variant] ?? Object.values(LEGS_VARIANTS)[0];

  return (
    <svg viewBox="0 0 200 322" className={className} role="img" aria-label="Piłkarz">
      <defs>
        <SkinGradient id={`${uid}-skin`} />
        <PartDefs prefix={headPrefix} option={head} />
        <PartDefs prefix={bodyPrefix} option={body} />
        <PartDefs prefix={legsPrefix} option={legs} />
      </defs>

      <AnimatePresence initial={false}>
        <motion.g
          key={`legs-${legs.id}`}
          data-part="legs"
          style={{ transformOrigin: "100px 214px" }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <LegsGeometry fills={fillsFrom(legsPrefix)} skinFill={skinFill} />
        </motion.g>
      </AnimatePresence>

      <AnimatePresence initial={false}>
        <motion.g
          key={`body-${body.id}`}
          data-part="body"
          style={{ transformOrigin: "100px 135px" }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <BodyGeometry fills={fillsFrom(bodyPrefix)} skinFill={skinFill} />
        </motion.g>
      </AnimatePresence>

      <AnimatePresence initial={false}>
        <motion.g
          key={`head-${head.id}`}
          data-part="head"
          style={{ transformOrigin: "100px 78px" }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <HeadGeometry fills={fillsFrom(headPrefix)} skinFill={skinFill} />
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
