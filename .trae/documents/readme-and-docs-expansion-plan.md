# Plan rozbudowy dokumentacji Fumadocs oraz plików README.md dla całego ekosystemu Strafe.js

## 1. Podsumowanie (Summary)
Celem zadania jest kompleksowe dopracowanie i rozbudowanie dokumentacji projektu **Strafe.js** (w języku angielskim, spójnie z publikacją na npm i GitHub Packages):
1. **Główny plik `README.md`** — rozbudowa o architekturę monorepo, tabelę pakietów, poprawienie nieaktualnych sygnatur w przykładach (`ready` emitujące `ReadyPayload`, `ctx.spaceId`), dodanie przykładów użycia dla każdej z 8 paczek oraz instrukcji budowania i testowania.
2. **Dedykowane pliki `README.md` dla wszystkich 8 pakietów** w `packages/` — utworzenie 7 brakujących plików `README.md` (`create-strafebot`, `@strafe-js/rest`, `@strafe-js/ws`, `@strafe-js/builders`, `@strafe-js/formatters`, `@strafe-js/collection`, `@strafe-js/util`) oraz gruntowna rozbudowa istniejącego `packages/strafebot/README.md`.
3. **Rozbudowa dokumentacji Fumadocs (`docs/content/docs/`)** — wydzielenie osobnych, szczegółowych podstron dla każdej paczki wraz z pełnym API Reference (z użyciem komponentów `<MethodCard />`, `<PropertyTable />`, `<Badge />`) oraz dodanie pogłębionych podstron dla klienta, komend, REST, Gateway i CLI.

---

## 2. Analiza stanu obecnego (Current State Analysis)
- **Pliki `README.md`**:
  - Istnieją tylko 2 pliki: główny [README.md](file:///workspace/README.md) oraz [packages/strafebot/README.md](file:///workspace/packages/strafebot/README.md).
  - W obu plikach występują drobne niezgodności z rzeczywistym API w kodzie źródłowym:
    - W `client.on('ready', (user) => ...)` zdarzenie `ready` w [Client.ts](file:///workspace/packages/strafebot/src/Client.ts#L213-L237) przekazuje obiekt `ReadyPayload` (`{ user, spaces, rooms }`), więc dostęp do nazwy użytkownika to `info.user.username` (lub `client.user?.username`).
    - W przykładzie komendy `kick` użyto `ctx.space!.id`, podczas gdy klasa [Context.ts](file:///workspace/packages/strafebot/src/commands/Context.ts#L67-L69) udostępnia getter `ctx.spaceId`.
  - Pozostałe 7 pakietów w `/workspace/packages/` nie posiada własnych plików `README.md`, co powoduje brak opisu na stronach pakietów w npm / GitHub Packages.
- **Dokumentacja Fumadocs (`docs/content/docs/`)**:
  - Pakiety `@strafe-js/builders`, `@strafe-js/formatters`, `@strafe-js/collection` i `@strafe-js/util` są obecnie opisane skrótowo na jednej wspólnej stronie [packages/overview.mdx](file:///workspace/docs/content/docs/packages/overview.mdx).
  - Sekcje `strafebot/`, `commands/`, `rest/`, `ws/` oraz `cli/` zawierają po jednym pliku przeglądowym i można je wzbogacić o dedykowane podstrony (np. Events Reference, Arguments & Validation, Error Handling & Rate Limits).

---

## 3. Planowane zmiany (Proposed Changes)

### Etap 1: Aktualizacja głównego pliku `README.md` oraz `packages/strafebot/README.md`
1. **[README.md](file:///workspace/README.md)**:
   - Naprawienie przykładów kodu (`ready` payload `info.user.username`, `ctx.spaceId!`, przykład użycia schematu argumentów `arguments` obok `ctx.args`).
   - Dodanie tabeli pakietów z linkami do katalogów, opisem odpowiedzialności i komendą instalacji.
   - Dodanie zwięzłych sekcji „How to use each package" prezentujących użycie każdego z 8 pakietów (`@strafe-js/strafebot`, `create-strafebot`, `@strafe-js/rest`, `@strafe-js/ws`, `@strafe-js/builders`, `@strafe-js/formatters`, `@strafe-js/collection`, `@strafe-js/util`).
   - Dodanie sekcji Development (`npm install`, `npm run build`, `npm test`, `npm run docs:dev`, `npm run docs:build`).
2. **[packages/strafebot/README.md](file:///workspace/packages/strafebot/README.md)**:
   - Rozbudowa o pełny przewodnik po klasie `Client` (opcje konstruktora `ClientOptions`, kolekcje cache `spaces`, `rooms`, `spaceRooms`, `members`, metody `login`, `fetchMembers`, `fetchMember`, `resolveMemberPermissions`, `destroy`).
   - Dodanie dokumentacji `CommandHandler`, `command()`, schematów `arguments`, zdarzeń strażników (`commandPermissionDenied`, `commandBotPermissionDenied`, `commandCooldown`, `commandInvalidArguments`, `commandError`) oraz metod `Context`.

### Etap 2: Utworzenie plików `README.md` dla pozostałych 7 pakietów
Każdy plik `README.md` będzie zawierał odznaki (badges), opis, instrukcję instalacji, kompletne przykłady użycia oraz dokumentację wszystkich eksportowanych klas, funkcji i typów:
1. **`/workspace/packages/create-strafe-bot/README.md`** (`create-strafebot`):
   - Użycie interaktywnego kreatora (`npm create strafebot@latest my-bot` / `npx create-strafebot my-bot`).
   - Opis obu szablonów (`Full Command Bot` vs `Minimal Event Bot`) i struktury generowanego projektu.
   - Dokumentacja generatora komend (`npx create-strafebot command <name> [--mod | --admin]`).
2. **`/workspace/packages/@strafe-js/rest/README.md`** (`@strafe-js/rest`):
   - Konfiguracja `REST` (`RESTOptions`: `baseUrl`, `token`, `authScheme`, `retries`, `userAgent`).
   - Automatyczna obsługa limitów zapytań HTTP 429 (`Retry-After` / `RateLimitError`) oraz błędów `StrafeError`.
   - Dokumentacja wszystkich metod niskopoziomowych (`request`, `get`, `post`, `patch`, `put`, `delete`) oraz domenowych (`getMe`, `getMySpaces`, `getSpaces`, `getSpace`, `getSpaceRooms`, `getSpaceMembers`, `getSpaceMember`, `createMessage`, `editMessage`, `deleteMessage`, `listMessages`, `getMessage`, `triggerTyping`, `addReaction`, `removeReaction`, `createInvite`, `kickMember`, `banMember`, `uploadAttachment`).
3. **`/workspace/packages/@strafe-js/ws/README.md`** (`@strafe-js/ws`):
   - Konfiguracja `Gateway` (`GatewayOptions`: `url`, `token`, `authScheme`, `heartbeatIntervalMs`, `reconnect`, `reconnectDelay`, `maxReconnectDelay`).
   - Opis cyklu życia połączenia, automatycznego `Ping`/`Pong` oraz wykładniczego backoffu z losowym jitterem.
   - Tabela kodów `GatewayOp` oraz normalizacji zdarzeń `SNAKE_CASE` → `camelCase`.
   - Dokumentacja metod (`connect`, `disconnect`, `ping`, `send`, `subscribe`, `unsubscribe`, `sendTyping`).
4. **`/workspace/packages/@strafe-js/builders/README.md`** (`@strafe-js/builders`):
   - Klasa `MessageBuilder` i funkcja fabrykująca `message()` (`.setContent()`, `.setReply()`, `.setMentions()`, `.setRoleMentions()`, `.mentionEveryone()`, `.setAttachments()`, `.toJSON()`).
   - Funkcje budujące maski uprawnień: `permissions(list)` oraz `permissionMask(...items)`.
5. **`/workspace/packages/@strafe-js/formatters/README.md`** (`@strafe-js/formatters`):
   - Dokumentacja i przykłady dla `userMention(id)`, `roleMention(id)`, `roomMention(id)`, `customEmoji(name, id, animated?)` oraz `escapeMarkdown(text)`.
6. **`/workspace/packages/@strafe-js/collection/README.md`** (`@strafe-js/collection`):
   - Dokumentacja klasy `Collection<K, V>` rozszerzającej `Map<K, V>`.
   - Przykłady użycia metod `find`, `filter`, `map`, `some`, `every`, `first()`, `first(count)`, `array()`, `keyArray()`.
7. **`/workspace/packages/@strafe-js/util/README.md`** (`@strafe-js/util`):
   - Tabela wszystkich 28 flag `Permission` oraz stałej `ALL_PERMISSIONS`.
   - Dokumentacja klasy `BitField` (`has`, `add`, `remove`, `toArray`, `toJSON`, `valueOf`) i funkcji `resolvePermission`.
   - Dokumentacja stałych `RoomType` i `GatewayOp`, funkcji `isSnowflake` i `sleep`, klas błędów `StrafeError` i `RateLimitError` oraz interfejsów modeli API (`User`, `Space`, `Room`, `Role`, `Message`, `Attachment`, `SpaceMember`, `ReadyPayload`).

### Etap 3: Rozbudowa stron dokumentacji Fumadocs (`docs/content/docs/`)
1. **Dedykowane strony dla każdego pakietu w `docs/content/docs/packages/`**:
   - Aktualizacja [docs/content/docs/packages/meta.json](file:///workspace/docs/content/docs/packages/meta.json) do listy: `["overview", "builders", "formatters", "collection", "util"]`.
   - Rozbudowa [docs/content/docs/packages/overview.mdx](file:///workspace/docs/content/docs/packages/overview.mdx) jako strony porównawczej ekosystemu z kartami `<Cards>` prowadzącymi do poszczególnych pakietów.
   - Utworzenie `/workspace/docs/content/docs/packages/builders.mdx` — pełna dokumentacja `@strafe-js/builders` z komponentami `<MethodCard />`.
   - Utworzenie `/workspace/docs/content/docs/packages/formatters.mdx` — pełna dokumentacja `@strafe-js/formatters` z komponentami `<MethodCard />`.
   - Utworzenie `/workspace/docs/content/docs/packages/collection.mdx` — pełna dokumentacja `@strafe-js/collection` z komponentami `<MethodCard />`.
   - Utworzenie `/workspace/docs/content/docs/packages/util.mdx` — pełna dokumentacja `@strafe-js/util` (`BitField`, `Permission`, `StrafeError`, `RateLimitError`, modele danych) z `<MethodCard />` i `<PropertyTable />`.
2. **Rozbudowa pozostałych sekcji w `docs/content/docs/`**:
   - **`strafebot/`**: dodanie `/workspace/docs/content/docs/strafebot/events.mdx` (pełna referencja wszystkich zdarzeń Gateway i CommandHandler z typami ładunków) oraz aktualizacja `strafebot/meta.json`.
   - **`commands/`**: dodanie `/workspace/docs/content/docs/commands/arguments.mdx` (szczegółowy przewodnik po `ArgumentsSchema`, tokenizacji cudzysłowów, walidacji `min`/`max`/`choices`, `Attachment` i obsłudze `ArgumentValidationError`) oraz aktualizacja `commands/meta.json`.
   - **`rest/`**: rozbudowa [docs/content/docs/rest/overview.mdx](file:///workspace/docs/content/docs/rest/overview.mdx) o pełną dokumentację wszystkich metod endpointów (`getMe`, `getSpaces`, `getSpaceRooms`, `getSpaceMembers`, `listMessages`, `triggerTyping`, `addReaction`, `removeReaction`, `createInvite`, `kickMember`, `banMember`, `uploadAttachment`) i obsługę błędów.
   - **`ws/`**: rozbudowa [docs/content/docs/ws/overview.mdx](file:///workspace/docs/content/docs/ws/overview.mdx) o wszystkie opcje `GatewayOptions`, metody (`connect`, `disconnect`, `ping`, `send`, `subscribe`, `unsubscribe`, `sendTyping`) i przykłady nasłuchiwania na ramki `raw`.
   - **`cli/`**: rozbudowa [docs/content/docs/cli/overview.mdx](file:///workspace/docs/content/docs/cli/overview.mdx) o dokładny opis flag CLI, zmiennych środowiskowych i generowanego kodu.
   - Aktualizacja linków na stronie głównej [docs/src/app/page.tsx](file:///workspace/docs/src/app/page.tsx), aby kafelki `@strafe-js/builders` i `@strafe-js/collection` prowadziły bezpośrednio do `/docs/packages/builders` i `/docs/packages/collection`.

---

## 4. Założenia i decyzje (Assumptions & Decisions)
- **Język dokumentacji**: Angielski (zgodnie z wyborem użytkownika i standardem repozytorium).
- **Struktura Fumadocs**: Osobne, szczegółowe podstrony dla każdej paczki w menu bocznym (zgodnie z wyborem użytkownika).
- **Zgodność z kodem**: Wszystkie sygnatury metod, typy i przykłady są w 100% zgodne z aktualnym kodem TypeScript w `packages/`.

---

## 5. Weryfikacja (Verification Steps)
1. Uruchomienie `npm run build` w katalogu głównym, aby upewnić się, że wszystkie pakiety kompilują się bez błędów.
2. Uruchomienie `npm test`, aby potwierdzić przejście wszystkich testów jednostkowych.
3. Uruchomienie `npm run docs:build`, aby zweryfikować poprawność kompilacji wszystkich nowych i zaktualizowanych plików `.mdx`, wygenerowanie statycznego indeksu wyszukiwania `/api/search` oraz brak błędów typów w Next.js.
