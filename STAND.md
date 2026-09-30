# Stadium VS na wystawie — budowanie i uruchomienie stoiska

## Jak to działa

```
        ┌──────────── router stoiska (własna sieć) ─────────┐
        │                                                    │
  Kiosk 1 (Chrome)                                  Kiosk 2 (Chrome)
  http://IP_SERWERA:3000                            http://IP_SERWERA:3000
        │                                                    │
        └────────────── Serwer gry (node, :3000) ────────────┘
             serwuje grę + prowadzi mecz przez WebSocket
```

- **Serwer** — jeden komputer z Node.js. Może to być osobny laptop albo
  jeden z dwóch kiosków. Serwuje zbudowaną grę i prowadzi mecz.
- **Kioski** — zwykły Chrome w trybie pełnoekranowym, otwarty na adresie
  serwera. Na kioskach nie trzeba niczego instalować ani budować.
- **Internet nie jest potrzebny.** Czcionki, grafiki i postacie są w buildzie,
  gra nie wysyła żadnych zewnętrznych zapytań. Na wystawie internet może
  być, ale gra działa i bez niego — ważne, żeby wszystkie trzy urządzenia
  były w jednej sieci lokalnej.

## Sieć — najważniejsze

1. **Lepiej własny router niż Wi-Fi wystawy.** Sieci gościnne często
   izolują urządzenia od siebie („client isolation”): internet działa, ale
   kioski nie widzą serwera. Własny router (może być bez internetu)
   całkowicie usuwa ten problem. Internet wystawy, jeśli jest potrzebny,
   można podłączyć do portu WAN routera — grze i tak nie jest potrzebny.
2. **Kablem, jeśli to możliwe.** Wi-Fi w hali z tysiącami telefonów bywa
   niestabilne. Krótkie zerwanie połączenia gra przetrwa (10 s na ponowne
   połączenie), ale kabel jest pewniejszy.
3. **Stały adres IP serwera.** W ustawieniach routera przypisz serwerowi
   stały adres (DHCP reservation), np. `192.168.0.10`. Inaczej po
   restarcie IP może się zmienić i kioski otworzą pustą stronę.
4. **Zapora (firewall).** Na Windows przy pierwszym uruchomieniu pojawi się
   okno z prośbą o dostęp dla Node.js — zaznacz **sieci prywatne**
   i zezwól. Na macOS — „Zezwalaj na połączenia przychodzące”.

## Pierwszy build (na komputerze-serwerze)

Wymagany Node.js 20+ (`node -v`). W katalogu głównym projektu:

```bash
npm run setup     # jednorazowo: instaluje zależności klienta i serwera
npm run build     # buduje grę do client/dist
npm start         # uruchamia serwer na :3000
```

Albo jednym poleceniem po `setup`: `npm run stand` (build + start).

Po starcie serwer sam wypisuje adres dla kiosków:

```
Serwer działa na http://localhost:3000
  Kiosk: http://192.168.0.10:3000   (panel testowy: /debug)
```

- `npm start` działa pod supervisorem: jeśli serwer się wyłoży, sam wstanie
  po sekundzie.
- Jeśli port jest zajęty (serwer już działa w innym oknie), pojawi się
  komunikat `Port 3000 jest zajęty` — zamknij stary.
- Ponowny build jest potrzebny tylko po zmianach w kodzie klienta. IP nie
  jest wpisywany do buildu — ten sam build działa w każdej sieci.

## Uruchomienie kiosków

Najpierw sprawdź w zwykłej przeglądarce na kiosku, czy otwiera się
`http://IP_SERWERA:3000`. Potem — tryb pełnoekranowy.

**Windows** (skrót lub plik `.bat`):

```bat
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 --noerrdialogs --disable-session-crashed-bubble --disable-features=Translate "http://192.168.0.10:3000"
```

**macOS**:

```bash
open -na "Google Chrome" --args --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 --noerrdialogs --disable-session-crashed-bubble --disable-features=Translate "http://192.168.0.10:3000"
```

Wyjście z trybu kiosku: `Alt+F4` (Windows) / `Cmd+Q` (macOS).

Na czas wystawy wyłącz też na kioskach usypianie ekranu, wygaszacz
i automatyczne aktualizacje systemu.

## Kolejność uruchamiania w dniu wystawy

1. Włącz router.
2. Włącz serwer → `npm start` → sprawdź, czy wypisany jest właściwy IP.
3. Włącz kioski → uruchom Chrome w trybie kiosku.
4. Sprawdzenie: na obu ekranach lobby „Wybierz stanowisko”, rozegraj jeden
   krótki mecz.

## Jak gra sama pilnuje pętli (nic nie trzeba klikać)

| Sytuacja | Co się dzieje |
|---|---|
| Mecz się skończył, nikt nie nacisnął „Zagraj ponownie” w ciągu 10 s | Oba ekrany → lobby |
| Obaj nacisnęli „Zagraj ponownie” | Znowu konstruktor postaci, ci sami gracze |
| Ktoś zajął miejsce w lobby i odszedł | Po 90 s → lobby |
| Nie dokończyli konstruktora | Po 90 s → lobby |
| Odeszli w trakcie meczu | 60 s bez wyboru strefy → lobby |
| Kiosk stracił sieć / odświeżono stronę | 10 s na powrót, gracz kontynuuje mecz; inaczej → lobby |
| Serwer się wyłożył | Supervisor podnosi go w 1 s, kioski łączą się ponownie same |

## Gdy coś pójdzie nie tak

- **Kiosk pokazuje błąd połączenia** — sprawdź, czy serwer działa i czy IP
  się nie zmienił (jest wypisywany przy starcie). Otwórz na kiosku
  `http://IP_SERWERA:3000/debug` — jeśli się nie otwiera, problem leży
  w sieci/zaporze.
- **Stoisko zawiesiło się w dziwnym stanie** — na `/debug` jest przycisk
  wymuszonego resetu pokoju; ostateczność — `Ctrl+C` i ponownie `npm start`.
- **Wszystko otwiera się tylko na samym serwerze, a nie na kioskach** — prawie
  zawsze to zapora serwera albo izolacja klientów w Wi-Fi (zob. „Sieć”).
