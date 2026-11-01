# Vylaris AI

Vollwertige KI-Chat-Plattform auf **Laravel 13 (PHP 8.3)** mit **Inertia.js + React**. Die gesamte Serverlogik liegt in PHP; das Frontend ist reine Darstellung. Es werden ausschliesslich **externe, OpenAI-kompatible APIs** angesprochen – lokale oder selbst gehostete Modelle sind nicht vorgesehen.

Alles, was fachlich konfigurierbar ist (Provider, Schlüssel, Modelle, Parameter, STT/TTS, Websuche, Bildgenerierung, Dateien, Memory, RAG, Agenten, Rollen, Limits, globale Anweisungen), wird im Admin-Bereich in der Datenbank verwaltet – ohne Code-Änderung.

## Funktionsumfang

| Bereich | Umfang |
| --- | --- |
| Chat | Streaming (SSE), Markdown, Syntax-Highlighting, Code-Kopieren, Bearbeiten & Neu generieren, Bewertung, Suche, Favoriten, Archiv, Ordner, Projekte, Export einer Antwort als DOCX/PDF/XLSX/CSV/MD/TXT |
| Dateien | Mehrfach-Upload (PDF, DOCX, XLSX, CSV, TXT, MD, Bilder), serverseitige Textextraktion, Vision für Bilder, Tabellenanalyse |
| KI-Fähigkeiten | Websuche mit Quellen, Bildgenerierung, Dokumentenerstellung, Projekt-RAG, Langzeit-Memory, mehrstufige Agenten (Tool-Loop) |
| Sprache | Spracheingabe mit prüfbarem Transkript (STT) und Sprachausgabe (TTS) mit Stimme, Sprache, Geschwindigkeit, Format; je Funktion eigenes Modell/Provider |
| Provider | Vorlagen (OpenAI, OpenRouter, Azure OpenAI, Groq, Mistral, DeepSeek, Together, Gemini-kompatibel, xAI), frei definierbare Provider, Modell-Capabilities, automatische Modellwahl, Fallback-Provider |
| Admin | Dashboard, Provider & Modelle, Funktionen, Agenten, Benutzer, Rollen & Limits, Plattform-Einstellungen, Nutzung/Kosten, Fehlerprotokoll, Audit-Log, Systemstatus |
| Datenschutz | Datenexport (ZIP), Chats löschen, Konto vollständig löschen, einsehbares/editierbares Memory, DSG/DSGVO-orientiert |

Funktionen, die nicht eingerichtet sind (z. B. kein TTS-Modell, kein Suchanbieter), werden in der Oberfläche **deaktiviert und mit Begründung** angezeigt – es gibt keine Platzhalter-Funktionen.

## Installation

### Variante A: Web-Installer (ohne Konsole, z. B. Shared Hosting/Plesk)

1. Projekt hochladen; Document-Root auf `public/` setzen. `vendor/` (`composer install --no-dev`) und `public/build/` (`npm run build`) müssen vorhanden sein.
2. Die Seite im Browser aufrufen – ohne `.env` leitet sie automatisch auf `/install.php` weiter.
3. Den Installationsschlüssel aus `storage/app/install-key.txt` eingeben (schützt vor Übernahme durch Dritte), Plattform, Datenbank (SQLite oder MySQL), Queue-Modus, optional SMTP und den Administrator angeben.
4. Der Installer prüft das System, schreibt die `.env` (inkl. `APP_KEY`), führt Migrationen aus, legt Rollen, Funktionskatalog und Admin an, sperrt sich (`storage/app/installed.lock`) und löscht sich selbst. Fehlgeschlagene Läufe können nach Behebung der Ursache wiederholt werden.

Der Installer läuft nur auf einer frischen Installation (ohne `APP_KEY`); eine bestehende Installation wird nie überschrieben.

### Variante B: Konsole

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed          # Rollen (admin, user) und Funktionskatalog
php artisan vylaris:make-admin you@example.com   # Administrator anlegen (fragt nach Passwort)
npm run build
php artisan serve
```

Der **erste registrierte Benutzer** wird automatisch Administrator. Alternativ setzt `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` beim Seeden einen Admin.

Danach im Admin-Bereich: **Provider & Modelle → Aus Vorlage anlegen**, API-Schlüssel eintragen, Verbindung testen; unter **Funktionen** STT/TTS/Bildgenerierung/Websuche/RAG einem passenden Modell zuweisen.

### Produktion

* `APP_ENV=production`, `APP_DEBUG=false`, HTTPS, `TRUSTED_PROXIES` bei Reverse-Proxy.
* **Queue-Worker** (Dateiverarbeitung, Titel, Memory, Export): `php artisan queue:work --tries=2`  (z. B. via Supervisor/systemd).
* **Scheduler** (Log-Bereinigung, automatische Updates): Cron `* * * * * php artisan schedule:run` oder alternativ die Cron-URL (siehe unten).
* Reverse-Proxy: Pufferung für `/chat/stream` ausschalten (`X-Accel-Buffering: no` wird gesendet).
* Echte Mail-Konfiguration (`MAIL_*`) für E-Mail-Verifizierung, Passwort-Reset und Export-Benachrichtigung. Mit `MAIL_MAILER=log` werden keine E-Mails versendet (der Systemstatus weist darauf hin).
* Für höhere Last `CACHE_STORE`/`QUEUE_CONNECTION`/`SESSION_DRIVER` auf Redis stellen; es sind keine Code-Änderungen nötig.

## Updates über GitHub

Die Plattform aktualisiert sich selbst direkt aus dem GitHub-ZIP: Sobald die Datei `VERSION` im Repository (Branch `main`) **höher** ist als die lokale `VERSION`, wird das Release geladen und installiert.

* **Auslöser:** automatisch stündlich über den Scheduler (`vylaris:update --auto`, abschaltbar), manuell im Admin-Bereich unter *Updates & Cron* oder per Konsole (`php artisan vylaris:update`, `--check` prüft nur).
* **Ablauf:** Version vergleichen → ZIP laden und validieren (Pfad-Prüfung gegen Zip-Slip, Grössenlimits, VERSION im Archiv = VERSION auf GitHub, Frontend-Build vorhanden) → Wartungsmodus → Dateien austauschen mit Backup → `composer install` (nur wenn sich `composer.lock` geändert hat und Composer verfügbar ist, sonst Abbruch *vor* jeder Änderung) → Migrationen → Caches leeren, Queue-Worker neu starten → `VERSION` schreiben → Wartungsmodus beenden.
* **Sicherheitsnetz:** Schlägt ein Schritt fehl, werden alle geänderten Dateien aus dem Backup (`storage/app/updates/backup-*`, die letzten drei bleiben) wiederhergestellt. Ein fehlgeschlagenes Update wird nicht automatisch wiederholt.
* **Unberührt bleiben:** `.env`, `storage/`, `vendor/`, `node_modules/`, SQLite-Dateien, `public/install.php` (nach der Installation).
* **Privates Repository:** In *Updates & Cron* ein GitHub-Token (Lesezugriff auf *Contents*) hinterlegen; es wird verschlüsselt gespeichert. Repository und Branch sind dort ebenfalls einstellbar.

**Release-Routine** (Voraussetzung: der Build liegt im Repository, da Server kein Node benötigen):

```bash
npm run build                 # public/build wird mit eingecheckt
echo 2.3.0 > VERSION          # erst zuletzt erhöhen
git add -A && git commit -m "Release 2.3.0" && git push
```

Ohne `public/build/manifest.json` im Release bricht der Updater zum Schutz der Installation ab.

## Abos & Pläne

Admin → **Abos & Pläne**: Pläne mit Preis, Intervall, Testtagen, Limits (Nachrichten/Tag, Tokens/Monat, Uploads/Tag) und erlaubten Modellstufen. Ein kostenloser Plan kann als *Standardplan* für alle ohne Abo markiert werden. Limit-Rangfolge: persönlicher Override → Plan → Rollen-Limit (`-1` im Plan = unbegrenzt, leer = Rollen-Limit).

* Benutzer sehen Pläne und Verbrauch unter **Einstellungen → Abo & Nutzung**.
* Bezahlung über Stripe Checkout (kein SDK nötig): unter **Plattform → Abos** «Abos aktivieren», Secret Key und Webhook-Secret eintragen. Webhook-URL (Admin → Abos & Pläne): `https://deine-domain/webhooks/stripe` mit den Events `checkout.session.completed` und `customer.subscription.*`. Kundenportal (Zahlungsmittel, Rechnungen) wird in Stripe aktiviert.
* Abos lassen sich auch manuell vergeben (Geschenk, Rechnung). Pläne werden beim Setup (`db:seed`) mit Gratis/Pro/Max angelegt; bei bestehenden Installationen legst du sie im Admin an.

## Cron per URL

Hosting ohne Shell-Cron (z. B. Plesk-„Geplante Aufgaben“ → *URL abrufen*, cron-job.org): Die URL aus *Admin → Updates & Cron* (`/cron/<geheimer-token>`) jede Minute aufrufen. Sie führt `schedule:run` aus und – bei Datenbank-Queue – für bis zu 40 Sekunden den Queue-Worker (`--stop-when-empty`). Die Route läuft ohne Session/Cookies, ist ratenbegrenzt und gegen parallele Läufe gesperrt. Anzeigen oder neu erzeugen: Admin-Bereich oder `php artisan vylaris:cron-token [--regenerate]`.

## Architektur

```
app/
  Enums/Capability.php            Katalog technischer Fähigkeiten (chat, vision, stt, tts, …)
  Services/Ai/                    ProviderClient (HTTP/SSE), AiGateway (Fallback, Kosten, Logging),
                                  ModelRouter (Auto-Auswahl), ChatContextBuilder, ChatRunner (Tool-Loop)
  Services/Features/              FeatureManager (Funktionen + verschlüsselte Config), WebSearchService, UsageLimiter
  Services/Files/                 DocumentExtractor, Chunker, KnowledgeRetriever (RAG), DocumentBuilder, ImageStore
  Services/Tools/                 Tool-Registry + Werkzeuge der Agenten/Chats
  Http/Controllers/(Admin/)       dünne Controller, Policies für Eigentümerschaft
  Jobs/                           ProcessFile, GenerateChatTitle, ExtractMemories, ExportUserData
resources/js/                     Pages (Inertia), Components/chat, Components/ui, hooks, lib
```

**Datenmodell (Auszug):** `providers` → `ai_models` → `model_capabilities`; `features` (+ `feature_role`) verweisen auf ein Modell und tragen ihre Konfiguration als JSON; `roles` enthalten Rechte und Limits; `chats`/`messages`/`files`/`knowledge_chunks`/`memories`; `usage_logs`, `error_logs`, `audit_logs`; `agents`/`agent_runs`.

**Wichtige Entscheidungen**

* *Capabilities dynamisch in der DB:* Ein Modell erhält Capabilities per Admin-UI. Funktionen (STT, TTS, Bild, RAG-Embeddings) wählen nur Modelle mit der passenden Capability, getrennt konfigurierbar und mit unterschiedlichen Providern.
* *Ein Client für alle Provider:* `ProviderClient` spricht das OpenAI-Protokoll (Chat, Streaming, Audio, Bilder, Embeddings, `/models`); Azure wird über einen eigenen Treiber (Deployment-URL, `api-key`, api-version) abgedeckt.
* *Fallback:* Schlägt ein Modell fehl, werden Modelle von Providern mit Fallback-Flag in Prioritätsreihenfolge versucht; Fehler werden protokolliert, der Benutzer erhält eine verständliche Meldung.
* *RAG:* Mit einem Embeddings-Modell (Funktion „RAG“) werden Vektoren erzeugt, sonst lexikalische Suche – beides ohne lokale Modelle.
* *SSE statt WebSocket:* Streaming per `fetch` + Server-Sent-Events; Abbruch durch den Client stoppt den Lauf und speichert den bisherigen Text.

### Erweiterbarkeit

* **Neue Capability:** Case in `App\Enums\Capability` ergänzen → erscheint automatisch in der Modell-Verwaltung.
* **Neue Funktion:** Eintrag in `FeatureSeeder` (+ ggf. Validierung in `Admin\FeatureController::validatedConfig`).
* **Neues Werkzeug für Agenten:** Klasse von `App\Services\Tools\Tool` ableiten und in `ToolRegistry` registrieren; sie ist danach im Agenten-Editor wählbar.
* **Neue Provider-Vorlage:** Eintrag in `App\Support\ProviderTemplates`.
* **Neuer Websuche-Anbieter:** Treiber in `WebSearchService`.

## Sicherheit & Datenschutz

* Authentifizierung (Laravel Breeze), optionale E-Mail-Verifizierung (Plattform-Einstellung), optionales OAuth (Google/GitHub – erscheint erst, wenn im Admin konfiguriert).
* Rollen mit feingranularen Rechten, Limits pro Rolle und Benutzer, Rate-Limiting für Chat, Upload, Sprache, Admin.
* API-Schlüssel und Secrets (Provider, Websuche, OAuth) **verschlüsselt** (`APP_KEY`), nie an den Browser zurückgegeben; alle Provider-Aufrufe laufen serverseitig.
* SSRF-Schutz: Provider-/Such-URLs müssen HTTPS und öffentlich sein (keine privaten/lokalen Adressen).
* CSRF, CSP mit Nonce und weitere Security-Header, Markdown ohne rohes HTML (kein XSS).
* Uploads: Erweiterung und Inhalt (finfo) werden geprüft, Speicherung auf privater Disk ausserhalb des Web-Roots, Auslieferung nur an den Eigentümer.
* Strikte Datentrennung über Policies; Admins sehen Statistiken, aber keine Chatinhalte anderer Benutzer.
* Transparenz: Memory und Dateien sind in den Einstellungen einsehbar, änderbar und löschbar; Export und Konto-Löschung inklusive Dateien.
* **Hinweis zu Datenschutz:** Eingaben werden an die vom Administrator konfigurierten externen Anbieter übertragen. Betreiber müssen mit den Anbietern Auftragsverarbeitungsverträge abschliessen und eine Datenschutzerklärung bereitstellen (Kontakt unter *Plattform → Datenschutz* hinterlegbar).

## libraries.dev

Eingesetzt (Installation und Lizenz gemäss Paket):

* [`thinking-orbs`](https://libraries.dev) – „Thinking Orb“ als Denk-/Lade-Indikator und Bot-Avatar-Zustand.
* [`border-beam`](https://libraries.dev) – animierter Rand um das Eingabefeld während Streaming/Aufnahme.
* [`metal-fx`](https://libraries.dev/metal) – Metal-Effekt (WebGL) auf primären Buttons und dem Senden-Knopf (`Button`/`Metal` in `Components/ui`). Mit `metal={false}` abschaltbar; folgt dem Theme und friert bei «reduzierter Bewegung» ein.

**Ehrliche Einschränkung:** Für *Voice Glow* und *Bot Avatars* war zum Zeitpunkt der Umsetzung kein installierbares Paket verfügbar. Beide Komponenten wurden deshalb als eigene React-Komponenten umgesetzt (`Components/chat/VoiceGlow.jsx`, `BotAvatar.jsx`; der Avatar basiert auf dem Thinking Orb). Wird ein offizielles Paket veröffentlicht, lassen sie sich an einer Stelle austauschen.

## Tests

```bash
php artisan test --compact
```

Abgedeckt: Chat-Streaming inkl. Persistenz/Usage/Fallback/Fehler, Zugriffskontrolle (Datentrennung), Admin-Funktionen, Datei-Upload-Sicherheit, Sprache (STT/TTS), Datenschutz (Export/Löschung).

## Bekannte Grenzen

* Funktionen mit externem Anbieter (Websuche, STT, TTS, Bilder, Embeddings) funktionieren erst nach Konfiguration im Admin-Bereich; ohne Konfiguration sind sie sichtbar als „nicht konfiguriert“ markiert.
* Ob ein Modell Vision, Tools oder Reasoning tatsächlich unterstützt, wird nicht automatisch geprüft, sondern über die Capabilities gepflegt.
* Die Kostenanzeige basiert auf den im Admin hinterlegten Preisen und ist eine Schätzung.
* Validierungs- und System-E-Mails nutzen die Laravel-Standardsprache (`APP_LOCALE=en`); die Oberfläche selbst ist deutsch. Deutsche Sprachdateien können unter `lang/de` ergänzt werden.
