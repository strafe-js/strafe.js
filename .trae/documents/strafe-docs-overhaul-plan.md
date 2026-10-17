# Plan: Modernizacja Dokumentacji Strafe.js, Stylizacja Blokow Kodu IDE, Dodatki Fumadocs i Nowe Sekcje

## 1. Podsumowanie
Celem planu jest kompleksowa rozbudowa i odswiezenie strony dokumentacji (`docs/`):
1. **Nowy styl blokow kodu (`IDE Strafe Dark + Shiki`)**: pelne kolorowanie skladni TypeScript/JavaScript/Bash/JSON/INI, dedykowany komponent `<CodeWindow />` z paskiem naglowkowym pliku/jezyka, numeracja linii, podswietlaniem linii i przyciskiem `Copy` we wszystkich widokach (w MDX, na stronie glownej `page.tsx`, w `MethodCard`, `PropertyTable`, `CommandBuilder`, `PermissionCalculator` oraz `ApiPlayground`).
2. **Integracja komponentow Fumadocs UI**: rejestracja i uzycie w plikach `.mdx` komponentow `Tabs` / `Tab`, `Steps` / `Step`, `Callout`, `Accordions` / `Accordion` oraz `Files` / `Folder` / `File`.
3. **Nowe poradniki i interaktywne narzedzie**:
   - Poradnik `docs/content/docs/guides/oauth2.mdx` (przeplyw OAuth2, zakresy `identify`, `email`, `spaces`, `spaces.join`, `bot`, linki instalacyjne `generateBotInviteUrl`, wymiana tokenow i dodawanie uzytkownika do Space).
   - Poradnik `docs/content/docs/guides/e2ee-and-push.mdx` (obsluga szyfrowanych pokoi i wiadomosci E2EE w bocie, `isEncryptedRoom`, `isEncryptedMessage`, zdarzenie `encryptedMessageCreate` oraz subskrypcje Web Push RFC 8291).
   - Interaktywne narzedzie `<OAuth2Generator />` na nowej podstronie `docs/content/docs/tools/oauth2-generator.mdx` do generowania linkow instalacyjnych bota (`/oauth2/authorize`) oraz kodu TypeScript na zywo.
4. **Rozbudowa istniejacych stron dokumentacji**: uzupelnienie stron `@strafe-js/rest`, `@strafe-js/ws`, `@strafe-js/strafebot`, `@strafe-js/builders`, `@strafe-js/util` oraz `Getting Started` o zakladki menedzerow pakietow (`npm`, `pnpm`, `yarn`, `bun`), drzewka plikow, ramki `Callout` i nowe metody API.

---

## 2. Analiza Obecnego Stanu
- **Brak kolorowania skladni w komponentach React**: W plikach `docs/src/app/page.tsx`, `docs/src/components/MethodCard.tsx`, `docs/src/components/PropertyTable.tsx`, `docs/src/components/ApiPlayground.tsx`, `docs/src/components/CommandBuilder.tsx` i `docs/src/components/PermissionCalculator.tsx` uzywane sa surowe znaczniki `<pre><code>` wyswietlajace jednokolorowy tekst bez podswietlania tokenow TS/JS/JSON, bez numerow linii i bez naglowkow plikow.
- **Konfiguracja Shiki i CSS w `docs/source.config.ts` i `docs/src/app/global.css`**: `source.config.ts` uzywa domyslnego `defineConfig()` bez skonfigurowanego motywu ciemnego dopasowanego do palety Strafe (`#0b0d11` / `#171a20` / `#509b6b`), a `global.css` posiada jedynie 3 proste reguly dla `.dark pre` i `code`.
- **Brak zarejestrowanych komponentow Fumadocs UI w MDX**: Plik `docs/src/app/docs/[[...slug]]/page.tsx` eksportuje `defaultMdxComponents`, ale nie udostepnia gotowych do uzycia w `.mdx` komponentow `Tab`, `Tabs`, `Step`, `Steps`, `Callout`, `Accordion`, `Accordions`, `File`, `Folder`, `Files`.
- **Brak dedykowanych stron dla OAuth2, E2EE i Web Push**: Nowe funkcje dodane w v1.2.0 nie maja jeszcze osobnych poradnikow ani interaktywnego generatora URL instalacyjnego bota.

---

## 3. Proponowane Zmiany

### 3.1. Styl Blokow Kodu (`IDE Strafe Dark`) i Komponent `CodeWindow.tsx`
- **`docs/source.config.ts`**:
  - Skonfigurowanie `rehypeCodeOptions` w `defineConfig({ mdxOptions: { rehypeCodeOptions: { themes: { light: 'github-dark', dark: 'github-dark' } } } })` tak, aby kazdy blok kodu w MDX mial spojne, kontrastowe tokeny Shiki na ciemnym tle.
- **`docs/src/app/global.css`**:
  - Dodanie rozbudowanych stylow dla blokow kodu Fumadocs (`figure.shiki`, `pre`, `code`, paskow naglowkowych z tytulem pliku `figcaption`, przyciskow kopiowania, podswietlanych linii `[data-highlighted-line]`, numeracji linii `code[data-line-numbers]` oraz scrollbarow w stylu Strafe `#0b0d11` / `#2a2f39` / `#509b6b`).
- **`docs/src/components/CodeWindow.tsx` (nowy plik)**:
  - Lekki, wielokrotnego uzytku komponent kliencki renderujacy blok kodu w stylu IDE Strafe Dark z:
    - Paskiem tytulowym (kropki okna / ikona jezyka, nazwa pliku np. `src/index.ts`, badge jezyka `TypeScript` / `JSON` / `Bash`, przycisk `Copy` ze stanem `Copied`).
    - Opcjonalna numeracja linii (`showLineNumbers`).
    - Tokenizacja i kolorowaniem skladni TypeScript / JavaScript / JSON / Bash (slowa kluczowe, stringi, typy, komentarze, wywolania funkcji, liczby, klucze JSON).
- **Aktualizacja komponentow uzywajacych surowego `<pre><code>`**:
  - `docs/src/app/page.tsx`: zastapienie surowego `<pre>` w sekcji `Quick Example` komponentem `<CodeWindow title="src/index.ts" lang="ts" showLineNumbers code={...} />` oraz dodanie karty dla nowego generatora OAuth2.
  - `docs/src/components/MethodCard.tsx`: uzycie `<CodeWindow />` w zakladce `Usage Example`.
  - `docs/src/components/PropertyTable.tsx`: uzycie `<CodeWindow />` dla rozwinanych przykladow wlasciwosci.
  - `docs/src/components/ApiPlayground.tsx`: uzycie `<CodeWindow />` dla generowanego kodu SDK oraz odpowiedzi JSON.
  - `docs/src/components/CommandBuilder.tsx`: uzycie `<CodeWindow />` dla wygenerowanego modulu komendy.
  - `docs/src/components/PermissionCalculator.tsx`: uzycie `<CodeWindow />` dla wygenerowanego kodu maski uprawnien.

### 3.2. Dodatki i Komponenty Fumadocs UI w MDX
- **`docs/src/app/docs/[[...slug]]/page.tsx` oraz `docs/src/app/docs/layout.tsx`**:
  - Zarejestrowanie w `mdxComponents`:
    - `Tab`, `Tabs` z `fumadocs-ui/components/tabs`
    - `Step`, `Steps` z `fumadocs-ui/components/steps`
    - `Callout` z `fumadocs-ui/components/callout`
    - `Accordion`, `Accordions` z `fumadocs-ui/components/accordion`
    - `File`, `Folder`, `Files` z `fumadocs-ui/components/files`
    - `CodeWindow` oraz `OAuth2Generator`
  - Dodanie linku do `OAuth2 & Invite Generator` w pasku nawigacji `docs/src/app/docs/layout.tsx`.

### 3.3. Nowe Narzedzie Interaktywne: `OAuth2Generator.tsx`
- **`docs/src/components/OAuth2Generator.tsx` (nowy plik)**:
  - Interaktywny kalkulator i generator linkow OAuth2 (`/oauth2/authorize`):
    - Pola: `Client ID`, `Base URL` (`https://app.strafe.chat`), `Redirect URI`, `State`, `Space ID` oraz przelacznik `Lock Space Picker (disable_space_select)`.
    - Wybor zakresow OAuth2 (`bot`, `identify`, `email`, `spaces`, `spaces.join`) z opisami.
    - Szybkie presety uprawnien bota (`Read & Post (7)`, `Default @everyone (10723359)`, `Moderator`, `Administrator (2048)`) oraz przelaczniki bitow uprawnien.
    - Podglad wygenerowanego URL z przyciskiem kopiowania oraz wygenerowany kod TypeScript uzywajacy `generateBotInviteUrl` / `generateOAuth2Url` w `<CodeWindow />`.
- **`docs/content/docs/tools/oauth2-generator.mdx` (nowy plik)** oraz aktualizacja `docs/content/docs/tools/meta.json`.

### 3.4. Nowe Poradniki i Rozbudowa Istniejacych Stron MDX
- **`docs/content/docs/guides/oauth2.mdx` (nowy plik)**:
  - Dokumentacja tworzenia aplikacji w Developer Portal, generowania linkow instalacyjnych bota (`generateBotInviteUrl`, `client.generateInviteUrl`), autoryzacji uzytkownikow (`generateOAuth2Url`), wymiany kodu na tokeny (`rest.exchangeOAuth2Code`, `rest.refreshOAuth2Token`, `rest.revokeOAuth2Token`), odczytu `/oauth2/@me` (`rest.getOAuth2Me`) oraz dodawania uzytkownika do serwera z zakresem `spaces.join` (`rest.addSpaceMemberWithToken`).
- **`docs/content/docs/guides/e2ee-and-push.mdx` (nowy plik)**:
  - Dokumentacja szyfrowania End-to-End (E2EE) w Strafe (`e2ee_enabled`, brak `plaintext`, obecny `ciphertext`), wykrywania szyfrowanych pokoi i wiadomosci (`isEncryptedRoom`, `isEncryptedMessage`, `client.isRoomEncrypted`, `ctx.isEncryptedRoom`, zdarzenie `encryptedMessageCreate`), obslugi `SPACE_CREATE` i `SESSION_REVOKED`, oraz konfiguracji Web Push (`getPushVapidKey`, `putPushSubscription`, `PushPayload`).
- **Aktualizacja `docs/content/docs/guides/meta.json`**:
  - Dodanie `"oauth2"` oraz `"e2ee-and-push"` do listy stron poradnikow.
- **Ulepszenie istniejacych stron MDX za pomoca komponentow Fumadocs**:
  - `docs/content/docs/index.mdx`: dodanie zakladek instalacji `Tabs` (`npm`, `pnpm`, `yarn`, `bun`), kart nawigacyjnych do nowych poradnikow i narzedzi oraz tytulow plikow w blokach kodu (`title="src/index.ts"`).
  - `docs/content/docs/guides/getting-started.mdx`: uzycie komponentu `<Steps>` dla procesu tworzenia bota, `<Files>` / `<Folder>` / `<File>` do wizualizacji struktury projektu wygenerowanego przez `create-strafebot`, `<Tabs>` dla menedzerow pakietow oraz `<Callout>` dla wskazowek dotyczacych bezpieczeństwa tokena i uprawnien.
  - `docs/content/docs/guides/permissions.mdx`, `docs/content/docs/ws/overview.mdx`, `docs/content/docs/rest/overview.mdx`, `docs/content/docs/cli/overview.mdx`: dodanie naglowkow plikow w blokach kodu, ramek `<Callout>` oraz zwijanych sekcji `<Accordions>` z odpowiedziami na czeste pytania protokolowe.

---

## 4. Zalozenia i Decyzje
- Wszystkie teksty, komentarze i dokumentacja w repozytorium beda w 100% zgodne z `AGENTS.md` oraz zasadami `miqdadbadjuber/anti-slop` (zero pauz `U+2014` i polpauz `U+2013`, brak zabronionych slow marketingowych, konkretne opisy techniczne).
- Komponent `<CodeWindow />` nie wymaga zadnych ciezkich zewnetrznych zaleznosci runtime i dziala zarowno w statycznym eksporcie Next.js (`output: 'export'`), jak i w interaktywnych narzedziach klienckich.

---

## 5. Kroki Weryfikacji
1. Uruchomienie `npm test` w katalogu glownym w celu potwierdzenia, ze wszystkie pakiety i testy jednostkowe przechodza bez bledow.
2. Uruchomienie `npm run docs:build` w celu weryfikacji kompilacji MDX, typow TypeScript oraz statycznego eksportu wszystkich stron dokumentacji (w tym nowych stron `guides/oauth2`, `guides/e2ee-and-push` oraz `tools/oauth2-generator`).
3. Sprawdzenie za pomoca wyszukiwania wyrazen regularnych (`[—–]`), ze w calym katalogu `docs/` nie wystepuja znaki `U+2014` ani `U+2013`.
