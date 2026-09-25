import Tag from "../ui/Tag";

// Логотипы партнёров стенда. Файлов пока нет — место под них уже
// зарезервировано (230×88 в шапке лобби), а до их появления в слоте стоит
// аккуратная текстовая метка. Когда появятся файлы: положить их в
// src/assets/partners/ и прописать импорт в `src` ниже — вёрстка не меняется.
const PARTNERS = {
  wks: { name: "WKS Śląsk", src: undefined as string | undefined },
  roboklocki: { name: "Roboklocki", src: undefined as string | undefined },
} as const;

export type PartnerId = keyof typeof PARTNERS;

export default function PartnerLogo({ partner }: { partner: PartnerId }) {
  const { name, src } = PARTNERS[partner];

  return (
    <div className="flex h-[88px] w-[230px] items-center justify-center">
      {src ? (
        <img src={src} alt={name} className="max-h-full max-w-full object-contain" />
      ) : (
        <Tag tone="paper" className="uppercase tracking-wide">
          {name}
        </Tag>
      )}
    </div>
  );
}
