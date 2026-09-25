import Panel from "../../../components/ui/Panel";
import PixelIcon from "../../../components/ui/PixelIcon";

interface RoleHintProps {
  isStriker: boolean;
  hasChosen: boolean;
  rivalChosen: boolean;
  roundResultVisible: boolean;
}

// Подсказка внизу по центру (на месте прежней StatusPill): ЧТО я делаю в
// этом раунде и что от меня ждут. Роль — сразу тремя сигналами: цвет
// (коралл/лазурь), иконка (мяч/перчатка) и слово ("STRZELASZ!"/"BRONISZ!"),
// потому что роли меняются каждый раунд и одного кольца под ногами детям
// мало. Прячется на время ROUND_RESULT — там внимание держит баннер.
//
// Высота намеренно небольшая (~115px от нижнего края): выше стоит метка
// "TO TY" под вратарём, пересекаться с ней нельзя.
export default function RoleHint({ isStriker, hasChosen, rivalChosen, roundResultVisible }: RoleHintProps) {
  if (roundResultVisible) return null;

  const title = hasChosen ? "Gotowe!" : isStriker ? "Strzelasz!" : "Bronisz!";
  const subtitle = hasChosen
    ? rivalChosen
      ? "Uwaga… strzał!"
      : "Czekamy na rywala…"
    : rivalChosen
      ? "Rywal już wybrał. Twój ruch!"
      : isStriker
        ? "Wybierz, gdzie kopnąć"
        : "Wybierz, gdzie skoczyć";

  return (
    <Panel className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6 py-3 pl-3 pr-9">
      <span
        className={`pix-frame grid h-[88px] w-[88px] shrink-0 place-items-center [--px-depth:8px] ${isStriker ? "surface-coral" : "surface-azure"}`}
      >
        <PixelIcon name={isStriker ? "ball" : "glove"} scale={6} />
      </span>
      <span className="grid gap-0.5 whitespace-nowrap">
        <span className={`font-display text-[60px] uppercase leading-[0.85] ${isStriker ? "text-coral-900" : "text-azure-900"}`}>{title}</span>
        <span className="text-[28px] font-semibold leading-tight">{subtitle}</span>
      </span>
    </Panel>
  );
}
