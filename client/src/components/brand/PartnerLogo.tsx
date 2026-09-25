import wksLogo from "../../assets/WKS.png";
import roboklockiLogo from "../../assets/Roboklocki.png";

// Логотипы партнёров стенда — на белых "табличках спонсоров", как рекламные
// щиты вокруг поля. Табличка решает сразу две задачи: у логотипа
// Roboklocki непрозрачный белый фон, и на белой табличке он просто
// сливается с ней (вырезать фон не нужно — никаких ореолов по краям букв);
// а оба логотипа получают одинаковую пиксельную рамку, как всё в игре.
//
// Высота логотипа — 64px: герб WKS нарисован ровно 64×64, в 1:1 он чёткий
// (при масштабировании растровый герб начинает мылиться).
const PARTNERS = {
  wks: { name: "WKS Śląsk Wrocław", src: wksLogo },
  roboklocki: { name: "Roboklocki", src: roboklockiLogo },
} as const;

export type PartnerId = keyof typeof PARTNERS;

export default function PartnerLogo({ partner }: { partner: PartnerId }) {
  const { name, src } = PARTNERS[partner];

  return (
    <div className="pix-frame surface-white inline-grid place-items-center px-3.5 py-3 [--px-depth:6px] [--px-drop:8px]">
      <img src={src} alt={name} className="block h-16 w-auto" draggable={false} />
    </div>
  );
}
