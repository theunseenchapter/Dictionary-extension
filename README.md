# ContextWord

> Understand what a word means where you found it.

ContextWord is a privacy-first Chromium extension for looking up words without leaving the page. Double-click a word to open a compact definition panel with its meaning, the sentence it appeared in, related words, and pronunciation.

Definitions are resolved from a bundled offline WordNet dictionary by default, so routine lookups are fast and do not send webpage content anywhere.

## Highlights

- **Double-click lookup** — select one word on a webpage and ContextWord opens its definition panel.
- **Context-aware reading** — view the sentence containing the selected word alongside its definition.
- **Offline by default** — most lookups are served from the bundled WordNet dataset.
- **Pronunciation support** — play a provided audio recording when available, or use your browser's speech voice.
- **Language-aware speech** — ContextWord detects the selected sentence's language and uses a compatible browser voice when one is installed.
- **Word-form matching** — common plurals and `-ed`, `-ing`, and `-ies` forms can resolve to their base entries.
- **Useful controls** — drag the definition panel, press `Escape`, or use the close button.
- **Configurable auto-close** — choose how long a definition stays visible, or keep it open until you close it.
- **Local history** — see recent lookups from the toolbar flyout.
- **Optional online fallback** — look up an unavailable word through DictionaryAPI only when you explicitly enable it.

## Install locally

### Requirements

- Google Chrome, Microsoft Edge, or another Chromium-based browser
- Node.js 20 or later
- npm

### Build the extension

```bash
git clone <repository-url>
cd Dictonary-extension
npm install
npm run build
```

### Load it in your browser

1. Open `chrome://extensions` (or your browser's extensions page).
2. Turn on **Developer mode**.
3. Select **Load unpacked**.
4. Choose the generated `dist` directory — not `src` or the project root.
5. Pin ContextWord from the extensions menu if you want quick access to its toolbar flyout.
6. Open or refresh an ordinary `http://` or `https://` webpage.

After changing the source, rebuild the extension, click **Reload** on its extensions-page card, and refresh the webpage you are testing.

## Using ContextWord

1. Visit a regular webpage such as an article, blog, or documentation site.
2. Double-click a single word, for example `ephemeral`.
3. Read the definition and the original sentence in the panel.
4. Use the speaker control to play pronunciation.
5. Drag the panel by its header if you want to move it.
6. Close it with **×**, by pressing `Escape`, or by waiting for the configured auto-close delay.

Click the ContextWord icon in the browser toolbar to open the flyout. It shows the extension status, recent lookups, and a link to Settings.

> ContextWord cannot run on browser-internal pages such as `chrome://` or on the Chrome Web Store.

## Settings

| Setting | What it does |
| --- | --- |
| Enable double-click lookup | Turns webpage lookup on or off. |
| Save lookup history | Keeps recent words on this device. |
| Close definitions automatically | Sets the number of seconds before a definition panel closes. Set it to `0` to keep panels open. The default is 10 seconds. |
| Theme | Select Light, System, or Dark presentation for the definition panel. |
| Use online dictionary for missing words | Allows a word absent from the offline dictionary to be sent to DictionaryAPI. This is off by default. |

## Privacy and permissions

ContextWord requests only the permissions required for its core behavior:

- **`storage`** stores settings and recent lookups locally in the browser.
- **`https://api.dictionaryapi.dev/*`** is used only if you enable the optional fallback for words missing from the bundled dictionary.

By default, ContextWord does not send the selected word, webpage text, or sentence context to any server. It has no account system, analytics, or browsing-history collection. When the optional fallback is enabled, only the missing lookup word is sent to DictionaryAPI; sentence context is never sent.

## Development

```bash
npm run dev              # rebuild while files change
npm run build            # type-check and create dist/
npm run lint             # lint the project
npm run test             # run unit tests
npm run build:dictionary # regenerate the offline dictionary data
```

### Project structure

```text
src/
  background/   Extension service worker and dictionary fallback
  components/   Shared React UI, including the definition panel
  content/      Webpage selection and panel injection
  options/      Settings page
  popup/        Browser-toolbar flyout
  services/     Storage and dictionary access
  utils/        Selection, word, and theme helpers
public/         Manifest and offline dictionary data
scripts/        Build and dictionary-generation scripts
dist/           Generated extension ready to load (created by npm run build)
```

## Offline dictionary

The extension ships with processed WordNet 3.0 data in `public/data/wordnet-v2/`. Entries are split into small files by their first three letters, which lets the extension load only the relevant local data for a lookup.

End users do not need to download or configure this data. Maintainers can regenerate it with:

```bash
npm run build:dictionary
```

The source WordNet files are placed in `vendor/`, which is ignored by Git. Keep the attribution in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) when distributing the dataset.

## Troubleshooting

| Issue | Try this |
| --- | --- |
| Nothing appears when I double-click | Make sure the extension is enabled in its settings, then reload the extension and refresh the webpage. |
| I see “Extension context invalidated” | Refresh the webpage after reloading the extension. |
| Chrome rejects the selected folder | Run `npm run build` and select the generated `dist` folder. |
| An online lookup fails | Turn off the online fallback to use offline-only lookup, or check your internet connection. |
| It does not work on a specific page | The extension cannot run on `chrome://` pages, the Chrome Web Store, or other browser-restricted pages. |

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance. ContextWord is available under the [MIT License](LICENSE).