import wksLogo from "../../assets/WKS.png";
import roboklockiLogo from "../../assets/Roboklocki.png";

// Логотипы партнёров стенда — на белых "табличках спонсоров", как рекламные
// щиты вокруг поля. Табличка решает сразу две задачи: у логотипа
// Roboklocki непрозрачный белый фон, и на белой табличке он просто
// сливается с ней (вырезать фон не нужно — никаких ореолов по краям букв);
// а оба логотипа получают одинаковую пиксельную рамку, как всё в игре.
//
// Обе таблички одной высоты (88px). Герб WKS — щит без названия клуба
// крупными буквами, поэтому он чуть крупнее (76px, поля поуже) и с подписью
// "WKS Śląsk / Wrocław" рядом: иначе издалека это просто "какой-то герб".
const PLATE = "pix-frame surface-white inline-flex h-[88px] items-center [--px-depth:6px] [--px-drop:8px]";

export type PartnerId = "wks" | "roboklocki";

export default function PartnerLogo({ partner }: { partner: PartnerId }) {
  if (partner === "wks") {
    return (
      <div className={`${PLATE} gap-3.5 pl-2.5 pr-5`}>
        <img src={wksLogo} alt="" className="block h-[76px] w-auto" draggable={false} />
        <span className="grid leading-none">
          <span className="font-display text-[40px] uppercase leading-[0.85] text-wks-green">WKS Śląsk</span>
          <span className="text-[20px] font-bold uppercase tracking-[0.14em] text-ink">Wrocław</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`${PLATE} px-3.5`}>
      <img src={roboklockiLogo} alt="Roboklocki" className="block h-16 w-auto" draggable={false} />
    </div>
  );
}
