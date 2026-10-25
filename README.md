## [CORE-1] Kluczowe decyzje i dlaczego je podjąłem

**Architektura i Logika Biznesowa:**

- **Brak bazy danych i Pinii:** Stan filtrów, wyszukiwania, sortowania i paginacji trzymany jest w całości w URL (parsowany i walidowany przez schemat `zod`). Dzięki temu link z ustawionymi filtrami renderuje się poprawnie po stronie serwera (SSR), można go udostępnić, a nawigacja „wstecz” w przeglądarce działa bez zarzutu. Niepoprawne parametry w URL spadają do wartości domyślnych zamiast psuć stronę.
- **Waluty i Ceny:** Założyłem, że ceny są podane w euro, netto (excl. VAT). Formatuję je przez `Intl.NumberFormat` z locale `en-IE` z dwoma miejscami po przecinku (np. 1499 → `€1,499.00`). Dla paneli i baterii liczę też cenę za jednostkę (`€/W`, `€/kWh`), co pozwala porównywać produkty o różnej mocy/pojemności.
- **Routing i Layouty:** Listing działa pod `/catalog/[[category]]` (opcjonalny parametr: `/catalog` to wszystkie produkty, `/catalog/batteries` to kategoria) i korzysta z osobnego layoutu `catalog`. Jest to przygotowanie pod przyszłą rozbudowę o nowe widoki i strony. Nieznana kategoria zwraca błąd 404.
- **Filtrowanie po stronie serwera:** Całe filtrowanie, sortowanie i paginacja dzieje się w endpoincie `/api/products`, a klient dostaje tylko bieżącą stronę wyników razem z licznikami (kategorie, producenci) i zakresami suwaków.
- **Menedżer pakietów:** Użyłem `pnpm` - na dysku oszczędza miejsce.

**Optymalizacja i Wydajność (Performance):**

- **Wyszukiwarka:** Zapytanie wysyłane jest z debounce 300 ms (`useDebounceFn` z VueUse) i dopiero od 2 znaków, co zapobiega niepotrzebnym strzałom do serwera przy każdym wciśnięciu klawisza. Kolejne zmiany w trakcie jednego pisania podmieniają wpis w historii (`replace`), żeby „wstecz” nie przechodziło po każdej literze.
- **Paginacja:** Domyślnie 12 produktów na stronę (opcje: 12, 24, 48). Mniejsza strona to mniejszy payload HTML z SSR i mniej elementów do wyrenderowania.
- **Lighthouse / CLS:** Karta produktu ma stały kontener na grafikę (`aspect-ratio 4/3`), w którym obecnie wyświetlana jest ikona kategorii. Po dodaniu prawdziwych zdjęć układ nie będzie przeskakiwał.

**UX :**

- **Responsywność:** Na desktopie (od breakpointu `lg`) filtry znajdują się w kolumnie po lewej stronie. Na tabletach i mobile filtry są ukryte pod przyciskiem „Filters” (z licznikiem aktywnych filtrów), a siatka produktów zajmuje całą szerokość.
- **Filtry w wysuwanym panelu (Drawer):** Na mniejszych urządzeniach filtry otwierają się w panelu wysuwanym od dołu, z przyciskami „Clear all” i „Show N products”. Użytkownik skupia się na jednym zadaniu na raz, a lista produktów nie jest spychana w dół przez rozbudowane filtry.
- **Aktywne filtry:** Wybrane filtry wyświetlane są jako „chipy” z możliwością usunięcia pojedynczego filtra lub wszystkich naraz. Pusty wynik pokazuje komunikat z akcją wyczyszczenia filtrów.

## [CORE-2] Jak pozyskałem kWh/W i jakie przypadki brzegowe obsłużyłem

- **Parsowanie:** Do odczytu danych użyłem paczki `csv-parse/sync`. Uzasadnienie: jest sprawdzona i stabilna, choć autorski parser pozwoliłby na mniejszą ilość zależności. Plik leży w `server/assets` (Nitro server assets, więc trafia do builda i działa na każdym hostingu), jest parsowany tylko raz przy pierwszym odczycie i trzymany w pamięci.
- **Reguły i algorytm:** Baterie mają zawsze podaną wartość `kWh` w opisie, a każdy panel ma wartość `W`. Akcesoria nie mają tych wartości. Z opisu biorę **pierwszą liczbę bezpośrednio przed jednostką kategorii** (`W` dla paneli, `kWh` dla baterii) i sprawdzam ją krzyżowo z **ostatnią liczbą w nazwie** produktu (np. „PowerFlow Stack 7.5” → 7.5).
- **Przypadki brzegowe (Edge cases):**
  - 5 baterii ma w opisie drugą wartość `kWh` (np. „up to 30kWh”, „three 3.5kWh modules”) - wzięcie pierwszego wystąpienia zwraca właściwą pojemność.
  - 3 baterie mają dopisek „48V”, a część opisów zawiera inne wartości z jednostką `V` - zakotwiczenie na pełnej jednostce (`kWh`/`W` z granicą słowa) je pomija.
  - Jeśli wartość z opisu i z nazwy się nie zgadzają albo jej brak, produkt dostaje `rating = null` i w logach serwera pojawia się ostrzeżenie - zamiast pokazywać błędną wartość.

## [CORE-3] [SEO] Podejście do indeksowania

- **Link kanoniczny:** Ustawiony zawsze na stronę główną danej kategorii (np. URL z `?page=12` kieruje kanonicznie do samej kategorii, aby przeciwdziałać duplikacji treści).
- **Robots Meta Tag:** Używam dyrektywy `noindex, follow`, gdy URL zawiera parametr wyszukiwania (`q`) lub numer strony jest większy niż 1 (`page > 1`). Pozwala to botom podążać za odnośnikami, ale trzyma podstrony listingu o mniejszej wartości z dala od indeksu Google.
- **Tytuł z filtrów:** `<title>` budowany jest z aktywnych filtrów, np. „Batteries 5–10 kWh · PowerFlow | nuxt-store” (przy 3+ producentach: „3 manufacturers”), a opis meta zawiera liczbę produktów.
- **Opisy kategorii:** Każda kategoria posiada własny, krótki opis, co podnosi wartość w SEO.

## [CORE-4] Jakby było więcej czasu (Czego celowo nie zrobiłem)

- **Dynamiczne kategorie:** Linki kategorii w nagłówku (`categoryLinks` w `app/layouts/catalog.vue`) powinny być generowane z jednego źródła.
- **Analityka:** Integracja z Google Analytics oraz Microsoft Clarity.
- **SEO & Open Graph:** Dane strukturalne Schema.org (`ItemList`, `Product`, `BreadcrumbList`), sitemap, `robots.txt` i obrazy Open Graph - najprościej przez moduł `nuxt-seo` (`@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`, `nuxt-og-image`).
- **Lighthouse / Wydajność:** Moduł `@nuxt/fonts` (self-hosting fontów). imgproxy lub `@nuxt/image` do serwowania zdjęć w odpowiednich rozmiarach i formatach. Cache odpowiedzi API, a przy większym katalogu wyszukiwarka pełnotekstowa (np. Elasticsearch). Migracja na Vite+. Przy linkach do stron produktowych.
- **UX / i18n:** Moduł Nuxt i18n do zmiany języka, regionu oraz waluty. Przełącznik widoku listingu (małe/duże kafelki, lista). Dodanie „quick links” do stopki.
- **WCAG (Wyszukiwarka):** Podpowiedzi w wyszukiwarce z pełną obsługą WAI-ARIA: pole z `role="combobox"` i `aria-activedescendant`, lista `role="listbox"` z grupami, nawigacja klawiaturą (↑/↓, Enter, Esc) ze skrótami opisanymi w stopce listy.
- **Architektura:** Ewentualne wydzielenie komponentów UI do osobnej warstwy Nuxt (monorepo), gdyby miały być wykorzystywane w innych aplikacjach.

## [CORE-6] Realizowane kroki

1. Pierwszym krokiem było użycie narzędzia Claude Design do stworzenia wczesnego prototypu widoków (HTML) – pliki w katalogu `html_figma_view/`.
2. Konfiguracja środowiska dedykowana dla AI, wygenerowana z instrukcji: `/setup-matt-pocock-skills`.
3. Pierwsza sesja to wczytanie kontekstu: `init` oraz `/grill-with-docs`.
4. Każde zdefiniowane zadanie było od teraz realizowane w osobnej, świeżej sesji. Pozwalało to na uniknięcie gubienia wątków i halucynacji przez LLM.
