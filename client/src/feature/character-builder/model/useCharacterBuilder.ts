import { useState } from "react";
import type { CharacterSelection } from "../../../game/types";
import { HEAD_OPTIONS, BODY_OPTIONS, LEGS_OPTIONS } from "./options";
import type { BuilderCategory } from "../ui/CategoryTabs";

// По умолчанию выбран первый вариант каждой категории — на выставке ребёнок
// может сразу нажать "ZATWIERDŹ POSTAĆ", не разбираясь в конструкторе,
// а при желании поменять выбор до подтверждения.
export function useCharacterBuilder() {
  const [headId, setHeadId] = useState(HEAD_OPTIONS[0].id);
  const [bodyId, setBodyId] = useState(BODY_OPTIONS[0].id);
  const [legsId, setLegsId] = useState(LEGS_OPTIONS[0].id);
  const [activeCategory, setActiveCategory] = useState<BuilderCategory>("head");

  const character: CharacterSelection = { headId, bodyId, legsId };

  return {
    headId,
    bodyId,
    legsId,
    setHeadId,
    setBodyId,
    setLegsId,
    activeCategory,
    setActiveCategory,
    character,
  };
}
