# ContextWord

> Don't just learn what a word means. Understand what it means here.

ContextWord is an open-source Chrome extension that lets you double-click a word and see its definition without leaving the page. Definitions come from a bundled offline WordNet dictionary, so normal lookups are private and fast.

## Features

- Double-click a word to open a definition card on the webpage.
- Offline definitions, parts of speech, synonyms, and surrounding sentence context.
- Handles common word forms such as plurals, `-ed`, `-ing`, and `-ies` words.
- Draggable, keyboard-accessible panel; press `Escape` or click `×` to close it.
- Light theme by default, with System and Dark options.
- Local recent-lookup history and enable/disable toggle.
- Optional online dictionary fallback for words absent from the offline data.

## Install locally

### Requirements

- Google Chrome or another Chromium-based browser
- Node.js 20 or later
- npm

### Build

```bash
git clone <repository-url>
cd Dictonary-extension
npm install
npm run build
```

### Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode** in the upper-right corner.
3. Click **Load unpacked**.
4. Select the project's `dist` folder:

   ```text
   D:\Dictonary-extension\dist
   ```

5. Open or refresh a normal `http://` or `https://` webpage.

Do not select `src`, `assets`, or `content.js`; Chrome must load the `dist` folder containing `manifest.json`.

## How to use ContextWord

1. Visit an article, blog, documentation page, or another normal webpage.
2. Double-click one regular word, for example `ephemeral`, `psychologists`, or `symphony`.
3. The ContextWord card appears in the bottom-right with the definition and original sentence.
4. Drag the card by its header to move it.
5. Click `×` or press `Escape` to close it.

Click the ContextWord toolbar icon to view recent lookups or open **Settings**.

### Settings

- **Enable double-click lookup**: turn lookup on or off.
- **Save lookup history**: save a limited list of words locally.
- **Theme**: choose Light, System, or Dark.
- **Use online dictionary for missing words**: disabled by default. When enabled, only a selected word not found in the offline dataset is sent to `dictionaryapi.dev`. No webpage text is sent.

## Development

```bash
npm run dev       # rebuild when files change
npm run build     # type-check and create dist/
npm run lint      # lint TypeScript and React code
npm run test      # run unit tests
```

After any build, click **Reload** for ContextWord at `chrome://extensions`, then refresh each webpage you are testing. A page that was open during reload can show `Extension context invalidated`; refreshing that page installs the new content script.

## Offline dictionary

The release includes 147,806 processed WordNet 3.0 entries in `public/data/wordnet-v2/`. Entries are split by their first three letters so ContextWord loads only a small local shard for a lookup. End users do not download or configure this data.

Maintainers can regenerate it from the official WordNet files:

```bash
npm run build:dictionary
```

The downloaded source data belongs in `vendor/` and is ignored by Git. Retain the attribution in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) when distributing the dataset.

## Privacy and permissions

ContextWord requests:

- `storage` to keep settings, cached results, and recent lookups locally.
- Access to `api.dictionaryapi.dev` only for the optional online fallback.

By default, all definitions use the bundled offline dictionary. ContextWord has no account, analytics, or browsing-history collection. It never sends the full webpage or sentence context to a server.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Nothing appears after double-clicking | Reload ContextWord in `chrome://extensions`, refresh the webpage, then double-click a normal word. |
| `Extension context invalidated` | Refresh the webpage after reloading the extension. |
| Chrome says a file is illegal | Re-run `npm run build` and load only the current `dist` folder. |
| An online service error appears | Disable **Use online dictionary for missing words** in Settings to use offline-only lookup. |
| It does not work on a Chrome page | Extensions cannot run on `chrome://` pages or the Chrome Web Store. |

## Roadmap

- Context-specific AI explanations through a user-configured or self-hosted backend
- Saved vocabulary, export, and review tools
- Definition-sense selection and learning features

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance. ContextWord is licensed under the [MIT License](LICENSE).
