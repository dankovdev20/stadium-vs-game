# Stadium VS — Penalty Showdown

Gra 1 na 1 w rzuty karne na dwa dotykowe terminale w jednej sieci lokalnej,
przygotowana na stoisko WKS Śląsk Wrocław × Roboklocki. Serwer jest jedynym
źródłem prawdy: klient nie liczy goli ani obron, tylko wybiera strefę
i odtwarza wynik przysłany przez serwer.

## Jak się gra

1. **Lobby** — każdy gracz na swoim terminalu wybiera stanowisko (Gracz 1 / Gracz 2).
2. **Konstruktor** — obaj składają swojego zawodnika (głowa, korpus, nogi).
3. **Mecz** — 10 rund, w każdej rundzie role się zamieniają: strzelec
   wybiera jedną z 5 stref bramki, bramkarz — gdzie się rzuci.
   Górne strefy dają 2 pkt, dolne 1 pkt; trafiona strefa = pewna obrona.
4. **Koniec meczu** — jeśli obaj w ciągu 10 s wybiorą „Zagraj ponownie”,
   grają jeszcze raz; w przeciwnym razie stoisko wraca do lobby dla
   kolejnej pary.

Gra sama pilnuje pętli stoiska (bezczynność, rozłączenia, odejście graczy
w trakcie meczu) — nikt z obsługi nie musi niczego klikać.

## Szybki start (serwer + klient do developmentu)

```bash
# terminal 1 — backend
cd server
npm install
npm start        # http://localhost:3000 (lub po IP w sieci lokalnej), pod supervisorem

# terminal 2 — frontend
cd client
npm install
npm run dev      # http://localhost:5173
```

Klient łączy się z prawdziwym serwerem, jeśli w `client/.env.local` ustawiono
`VITE_WS_URL` — w przeciwnym razie działa na lokalnej atrapie
(`services/connection/mockConnection.ts`), która sama symuluje drugiego
gracza, co jest wygodne przy pracy w pojedynkę. Wskaźnik w lewym górnym rogu
(`DevPanel`, tylko w buildzie dev) pokazuje aktywny tryb — `SERWER` lub `MOCK`.

### Tryb stoiska (wystawa)

```bash
npm run setup   # jednorazowo: zależności klienta i serwera
npm run stand   # zbuduj klienta i uruchom serwer: gra pod http://IP:3000
```

Na terminalach (kioskach) nic nie trzeba instalować — wystarczy Chrome
otwarty na adresie serwera, który serwer wypisuje przy starcie. Internet nie
jest potrzebny, wystarczy wspólna sieć lokalna.

Szczegóły — sieć, kioski, kolejność uruchamiania, co robić przy awarii:
[STAND.md](STAND.md).

## Mapa projektu

```
client/src/
  App.tsx              — przełączanie ekranów według fazy meczu (FSM)
  game/                — stan meczu, kontrakt z serwerem → zob. game/README.md
  services/connection/ — abstrakcja transportu (socket/atrapa) → zob. README.md
  screens/             — jeden komponent na fazę FSM (Lobby/Customization/Game/...)
  feature/             — samodzielne moduły logika+UI → zob. feature/README.md
  components/ui/       — system komponentów (Button/Panel/Tag/...)
  components/layout/   — KioskStage (scena 1920×1080) i ScreenShell (tło ekranów)
  styles/tokens.css    — wszystkie nazwane kolory/rozmiary projektu w jednym miejscu
  dev/devPanel.tsx     — panel serwisowy (tylko import.meta.env.DEV)

server/
  server.js            — punkt wejścia, serwowanie klienta, handlery socket.io
  scripts/supervise.js — supervisor: automatyczny restart serwera po awarii
  src/gameRoom.js      — maszyna stanów pokoju → zob. server/README.md
  src/gameRules.js     — tabela stref i prawdopodobieństw wyniku strzału
  tests/               — node --test (testy jednostkowe + Monte Carlo)

shared/put_me_in_context.md — pełny kontrakt: zdarzenia WebSocket, FSM,
  specyfikacja ekranów (rozdział 5), zmiany względem wersji wyjściowej (rozdział 7)
```

Wewnętrzna dokumentacja modułów (README w podfolderach, komentarze w kodzie)
jest po rosyjsku.

## Gdzie czego szukać

| Pytanie | Gdzie patrzeć |
|---|---|
| Jak uruchomić grę na stoisku | [STAND.md](STAND.md) |
| Jakie zdarzenia wysyła/odbiera socket | `shared/put_me_in_context.md`, rozdział 3 |
| Jak odczytać stan meczu w komponencie | `client/src/game/README.md` |
| Jak dodać nowe zdarzenie serwera | `client/src/game/README.md` |
| Jak działa głosowanie „Zagraj ponownie” i auto-reset przy bezczynności | `server/README.md` + `put_me_in_context.md`, rozdział 7 |
| Konwencja `model/`+`ui/` dla nowych funkcji | `client/src/feature/README.md` |
| Kolory, rozmiary pól dotyku, motyw | `client/src/styles/tokens.css` |

## Testy

```bash
npm test                # z katalogu głównego: testy serwera + lint klienta
cd server && npm test   # gameRules.js + gameRoom.js, natychmiast (t.mock.timers)
cd client && npx tsc -b --noEmit && npx eslint .
```
