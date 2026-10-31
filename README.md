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
* **Scheduler** (Log-Bereinigung): Cron `* * * * * php artisan schedule:run`.
* Reverse-Proxy: Pufferung für `/chat/stream` ausschalten (`X-Accel-Buffering: no` wird gesendet).
* Echte Mail-Konfiguration (`MAIL_*`) für E-Mail-Verifizierung, Passwort-Reset und Export-Benachrichtigung. Mit `MAIL_MAILER=log` werden keine E-Mails versendet (der Systemstatus weist darauf hin).
* Für höhere Last `CACHE_STORE`/`QUEUE_CONNECTION`/`SESSION_DRIVER` auf Redis stellen; es sind keine Code-Änderungen nötig.

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
