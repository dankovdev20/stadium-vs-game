import type { RoundOutcome } from "../../../game/types";

/**
 * Презентационная карта серверных исходов.
 * Клиент НИЧЕГО не вычисляет — он только выбирает анимацию под result.outcome,
 * который пришёл в round:resolved.
 */

export type BallDestination =
  | "zone" // мяч доходит до выбранной зоны
  | "deflected" // мяч сбит с траектории у самой зоны
  | "post" // штанга / перекладина
  | "over"; // выше ворот

export type KeeperAction =
  | "catch" // намертво, руками
  | "leg" // нога в шпагате
  | "fingertip" // кончиками пальцев, фукс
  | "beaten" // вратарь пойман на противоходе
  | "watch"; // мяч мимо ворот — вратарь просто провожает взглядом

export interface OutcomePresentation {
  title: string;
  fallbackDetails: string;
  ball: BallDestination;
  keeper: KeeperAction;
  sceneEffect: "goal" | "save" | "miss";
}

export const OUTCOME_PRESENTATION: Record<RoundOutcome, OutcomePresentation> = {
  GOL: { title: "GOL!", fallbackDetails: "Piłka w siatce!", ball: "zone", keeper: "beaten", sceneEffect: "goal" },
  OBRONA_PERFEKCYJNA: {
    title: "OBRONA!",
    fallbackDetails: "Bramkarz wyczuł intencję i obronił strzał!",
    ball: "deflected",
    keeper: "catch",
    sceneEffect: "save",
  },
  OBRONA_NOGA: {
    title: "OBRONA NOGĄ!",
    fallbackDetails: "Bramkarz zdołał sparować piłkę nogą!",
    ball: "deflected",
    keeper: "leg",
    sceneEffect: "save",
  },
  FUKS_BRAMKARZA: {
    title: "FUKS BRAMKARZA!",
    fallbackDetails: "Niewiarygodna losowa obrona bramkarza!",
    ball: "deflected",
    keeper: "fingertip",
    sceneEffect: "save",
  },
  SLUPEK_POPRZECZKA: {
    title: "SŁUPEK!",
    fallbackDetails: "Strzał w słupek lub poprzeczkę!",
    ball: "post",
    keeper: "watch",
    sceneEffect: "miss",
  },
  NAD_POPRZECZKA: {
    title: "NAD POPRZECZKĄ!",
    fallbackDetails: "Piłka przeleciała nad poprzeczką!",
    ball: "over",
    keeper: "watch",
    sceneEffect: "miss",
  },
};

export function getOutcomePresentation(outcome: RoundOutcome): OutcomePresentation {
  return OUTCOME_PRESENTATION[outcome] ?? OUTCOME_PRESENTATION.GOL;
}
