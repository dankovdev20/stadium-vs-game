#!/usr/bin/env node
// Сборка спрайтов персонажей из слоёв Universal LPC (см. characters.config.json).
//
//   npm run characters                 — пересобрать src/assets/characters
//   npm run characters -- --preview x.png  — плюс картинка-превью всех вариантов
//
// Слои скачиваются ОДИН раз (кэш в scripts/characters/.cache, не в git) из
// публичного репозитория генератора; игра грузит уже готовые PNG из
// src/assets/characters — стенду интернет не нужен.
//
// Как делится персонаж: у каждой вещи генератора есть zPos (глубина слоя).
// База — голое тело (zPos 10). Всё, что входит в вариант части (голова,
// корпус, ноги), склеивается в ОДИН PNG на анимацию в порядке zPos. Слои
// ниже тела (zPos < 10 — например, длинные волосы/хвост за спиной) уходят в
// отдельный `<anim>.back.png`, который рисуется ПОД телом. Порядок частей в
// игре: back → base → legs → body → head (у LPC ноги < 30, корпус 30–99,
// голова ≥ 100 — диапазоны не пересекаются, поэтому склейка по частям точна).

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLIENT = path.resolve(HERE, "../..");
const CACHE = path.join(HERE, ".cache");
const OUT = path.join(CLIENT, "src/assets/characters");
const FRAME = 64;
const BASE_Z = 10;
const PART_ORDER = ["legs", "body", "head"];

const config = JSON.parse(await fs.readFile(path.join(HERE, "characters.config.json"), "utf8"));
const previewArg = process.argv.indexOf("--preview");
const previewPath = previewArg > -1 ? path.resolve(process.argv[previewArg + 1]) : null;

// ---------- загрузка с кэшем ----------

async function fetchCached(rel) {
  const cached = path.join(CACHE, rel);
  try {
    return await fs.readFile(cached);
  } catch {
    // нет в кэше — качаем
  }
  const url = `${config.source}/${rel.split("/").map(encodeURIComponent).join("/")}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} для ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(cached), { recursive: true });
  await fs.writeFile(cached, buf);
  return buf;
}

const defs = new Map();
async function loadDef(name) {
  if (!defs.has(name)) {
    const buf = await fetchCached(`sheet_definitions/${name}.json`);
    if (!buf) throw new Error(`Нет определения "${name}" в sheet_definitions`);
    defs.set(name, JSON.parse(buf.toString("utf8")));
  }
  return defs.get(name);
}

// ---------- слои ----------

/** combat_idle в определениях называется "combat" (так же делает сам генератор). */
const supportKey = (anim) => (anim === "combat_idle" ? "combat" : anim);

async function resolveItem(item) {
  const def = await loadDef(item.def);
  if (!def.variants?.includes(item.variant)) {
    throw new Error(`"${item.def}": нет варианта "${item.variant}". Есть: ${def.variants?.join(", ")}`);
  }
  const layers = Object.keys(def)
    .filter((key) => /^layer_\d+$/.test(key) && def[key]?.[config.bodyType])
    .map((key) => ({ zPos: def[key].zPos, dir: def[key][config.bodyType] }));
  if (layers.length === 0) throw new Error(`"${item.def}" не поддерживает тип тела "${config.bodyType}"`);
  const missing = config.animations.filter((a) => !def.animations?.includes(supportKey(a)));
  if (missing.length) throw new Error(`"${item.def}" без анимаций: ${missing.join(", ")}`);
  return { def, item, layers };
}

async function loadLayerPng(dir, anim, variant) {
  const candidates = [variant.replaceAll(" ", "_"), variant];
  for (const file of candidates) {
    const buf = await fetchCached(`spritesheets/${dir}${anim}/${file}.png`);
    if (buf) return PNG.sync.read(buf);
  }
  return null;
}

// ---------- склейка ----------

function blank(width, height) {
  const png = new PNG({ width, height });
  png.data.fill(0);
  return png;
}

/** Обычное наложение "src поверх dst" (не premultiplied). */
function over(dst, src) {
  if (dst.width !== src.width || dst.height !== src.height) {
    throw new Error(`Размеры слоёв не совпадают: ${dst.width}×${dst.height} vs ${src.width}×${src.height}`);
  }
  const d = dst.data;
  const s = src.data;
  for (let i = 0; i < d.length; i += 4) {
    const sa = s[i + 3] / 255;
    if (sa === 0) continue;
    const da = d[i + 3] / 255;
    const a = sa + da * (1 - sa);
    for (let c = 0; c < 3; c++) d[i + c] = Math.round((s[i + c] * sa + d[i + c] * da * (1 - sa)) / a);
    d[i + 3] = Math.round(a * 255);
  }
}

async function composeAnim(resolvedItems, anim) {
  const layers = [];
  for (const { item, layers: itemLayers } of resolvedItems) {
    for (const layer of itemLayers) {
      const png = await loadLayerPng(layer.dir, anim, item.variant);
      if (png) {
        layers.push({ zPos: layer.zPos, png });
      } else if (layer.zPos < BASE_Z) {
        // Слой за спиной (волосы/хвост) есть не у всех анимаций — например,
        // "hurt" смотрит только вперёд. Генератор тоже просто пропускает такие.
        console.warn(`  ! нет заднего слоя ${layer.dir}${anim} — пропущен`);
      } else {
        throw new Error(`Нет слоя spritesheets/${layer.dir}${anim}/${item.variant}.png`);
      }
    }
  }
  layers.sort((a, b) => a.zPos - b.zPos);
  const { width, height } = layers[0].png;
  const front = blank(width, height);
  const back = blank(width, height);
  let hasBack = false;
  for (const layer of layers) {
    if (layer.zPos < BASE_Z) {
      over(back, layer.png);
      hasBack = true;
    } else {
      over(front, layer.png);
    }
  }
  return { front, back: hasBack ? back : null, width, height };
}

// ---------- авторы ----------

const credits = new Map();
function collectCredits(resolvedItems) {
  for (const { def, layers } of resolvedItems) {
    for (const layer of layers) {
      const dir = layer.dir.replace(/\/$/, "");
      for (const credit of def.credits ?? []) {
        if (dir.startsWith(credit.file) && !credits.has(credit.file)) {
          credits.set(credit.file, {
            file: credit.file,
            authors: credit.authors ?? [],
            licenses: credit.licenses ?? [],
            urls: credit.urls ?? [],
            notes: credit.notes ?? "",
          });
        }
      }
    }
  }
}

// ---------- сборка ----------

async function writePng(file, png) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, PNG.sync.write(png));
}

const manifest = {
  $comment: "Сгенерировано scripts/characters/build-characters.mjs — не править руками.",
  frameSize: FRAME,
  bodyType: config.bodyType,
  directions: ["up", "left", "down", "right"],
  animations: {},
  partOrder: PART_ORDER,
  parts: {},
};

await fs.rm(OUT, { recursive: true, force: true });

const base = await Promise.all(config.base.map(resolveItem));
collectCredits(base);
const composed = { base: {} };
for (const anim of config.animations) {
  const { front, width, height } = await composeAnim(base, anim);
  manifest.animations[anim] = { frames: width / FRAME, rows: height / FRAME };
  composed.base[anim] = front;
  await writePng(path.join(OUT, "base", `${anim}.png`), front);
}
console.log(`base: ${config.animations.length} анимаций`);

for (const part of PART_ORDER) {
  manifest.parts[part] = [];
  composed[part] = {};
  for (const option of config.parts[part]) {
    const resolved = await Promise.all(option.items.map(resolveItem));
    collectCredits(resolved);
    let hasBack = false;
    composed[part][option.id] = {};
    for (const anim of config.animations) {
      const { front, back, width, height } = await composeAnim(resolved, anim);
      const expected = manifest.animations[anim];
      if (width / FRAME !== expected.frames || height / FRAME !== expected.rows) {
        throw new Error(`${part} #${option.id} ${anim}: сетка ${width}×${height} не совпадает с базой`);
      }
      await writePng(path.join(OUT, part, String(option.id), `${anim}.png`), front);
      if (back) {
        hasBack = true;
        await writePng(path.join(OUT, part, String(option.id), `${anim}.back.png`), back);
      }
      composed[part][option.id][anim] = { front, back };
    }
    manifest.parts[part].push({ id: option.id, label: option.label, tagline: option.tagline, back: hasBack });
    console.log(`${part} #${option.id} ${option.label}${hasBack ? " (+ слой за спиной)" : ""}`);
  }
}

await fs.writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await fs.writeFile(path.join(OUT, "credits.json"), JSON.stringify([...credits.values()], null, 2) + "\n");
console.log(`Готово: ${OUT} (${credits.size} записей об авторах)`);

// ---------- превью (не в проект) ----------

if (previewPath) {
  // 3 ряда (голова/корпус/ноги) × 6 вариантов: в каждой клетке персонаж с
  // этим вариантом и первыми вариантами остальных частей, кадр idle "вниз".
  const SCALE = 4;
  const cell = FRAME * SCALE;
  const out = blank(cell * 6, cell * 3);
  const row = 2; // down
  const frameOf = (png) => {
    const f = blank(FRAME, FRAME);
    PNG.bitblt(png, f, 0, row * FRAME, FRAME, FRAME, 0, 0);
    return f;
  };
  PART_ORDER.slice().reverse().forEach((focus, r) => {
    config.parts[focus].forEach((option, c) => {
      const pick = (part) => (part === focus ? option.id : config.parts[part][0].id);
      const frame = blank(FRAME, FRAME);
      for (const part of PART_ORDER) {
        const back = composed[part][pick(part)].idle.back;
        if (back) over(frame, frameOf(back));
      }
      over(frame, frameOf(composed.base.idle));
      for (const part of PART_ORDER) over(frame, frameOf(composed[part][pick(part)].idle.front));
      for (let y = 0; y < cell; y++) {
        for (let x = 0; x < cell; x++) {
          const si = ((Math.floor(y / SCALE) * FRAME) + Math.floor(x / SCALE)) * 4;
          const di = (((r * cell + y) * out.width) + c * cell + x) * 4;
          frame.data.copy(out.data, di, si, si + 4);
        }
      }
    });
  });
  await writePng(previewPath, out);
  console.log(`Превью: ${previewPath}`);
}
