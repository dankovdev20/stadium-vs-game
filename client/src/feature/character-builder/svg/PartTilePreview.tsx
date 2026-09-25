import { useId, type ReactElement } from "react";
import type { CharacterOption } from "../model/options";
import type { BuilderCategory } from "../ui/CategoryTabs";
import { HEAD_VARIANTS } from "./parts/head";
import { BODY_VARIANTS } from "./parts/body";
import { LEGS_VARIANTS } from "./parts/legs";
import { PartGradient, SkinGradient, type PartFills, type PartProps } from "./shared";

const VARIANTS: Record<BuilderCategory, Record<string, (props: PartProps) => ReactElement>> = {
  head: HEAD_VARIANTS,
  body: BODY_VARIANTS,
  legs: LEGS_VARIANTS,
};

// Обрезка viewBox по региону интереса каждой категории — карточка в
// гардеробе показывает только саму часть, крупно, без остального силуэта.
const VIEW_BOX: Record<BuilderCategory, string> = {
  head: "52 -4 96 104",
  body: "28 84 144 102",
  legs: "55 196 90 124",
};

interface PartTilePreviewProps {
  category: BuilderCategory;
  option: CharacterOption;
  className?: string;
}

export default function PartTilePreview({ category, option, className = "" }: PartTilePreviewProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const prefix = `${uid}-t`;
  const variants = VARIANTS[category];
  const Geometry = variants[option.variant] ?? Object.values(variants)[0];

  // Заготовка под пиксель-арт: готовая PNG-карточка детали (см. CharacterOption.thumb).
  if (option.thumb) return <img src={option.thumb} alt="" className={`pixelated object-contain ${className}`} />;
  const fills: PartFills = { primary: `url(#${prefix}-p)`, accent: `url(#${prefix}-a)`, metal: `url(#${prefix}-m)` };

  return (
    <svg viewBox={VIEW_BOX[category]} className={className} aria-hidden="true">
      <defs>
        <SkinGradient id={`${prefix}-skin`} />
        <PartGradient id={`${prefix}-p`} color={option.palette.primary} />
        <PartGradient id={`${prefix}-a`} color={option.palette.accent} />
        <PartGradient id={`${prefix}-m`} color={option.palette.metal ?? "#4a3527"} />
      </defs>
      <Geometry fills={fills} skinFill={`url(#${prefix}-skin)`} />
    </svg>
  );
}
