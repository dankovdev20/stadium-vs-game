import PixelSprite, { type PixelSpriteProps } from "./PixelSprite";
import { FEET } from "../model/sprites";

// Персонаж, привязанный к точке опоры по СТОПАМ: родитель — точка на
// газоне/подиуме (нулевого размера), спрайт рисуется так, что его стопы
// (FEET в кадре 64×64) приходятся ровно в эту точку. Так же якорились и
// прежние SVG-персонажи (см. GameScreen/model/zoneLayout — KEEPER_SPOT и
// STRIKER_SPOT — это точки, где стоят ноги).
export default function CharacterSprite(props: Omit<PixelSpriteProps, "crop">) {
  return (
    <PixelSprite
      {...props}
      className="absolute"
      style={{ left: -FEET.x * props.scale, top: -FEET.y * props.scale }}
    />
  );
}
