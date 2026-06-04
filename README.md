# Editor Writing Goals

Editor Writing Goals is a lightweight WordPress plugin that adds writing goals and content metrics to the block editor sidebar. It is editor-only and does not add frontend output, tracking, AI features, or external API calls.

## Features

- Live word, character, paragraph, heading, and reading-time metrics.
- Per-post word and character goals.
- Global default goals from `Settings > Editor Writing Goals`.
- Title and excerpt length checks.
- Basic readability insights.

## Requirements

- WordPress 6.5 or later.
- PHP 7.4 or later.
- Node.js and npm only for development builds.

## Installation

1. Copy this folder to `wp-content/plugins/editor-writing-goals`.
2. In WordPress admin, go to `Plugins`.
3. Activate `Editor Writing Goals`.
4. Open a post or page in the block editor.
5. Use the `Writing Goals` panel in the document sidebar.

## Development

Install dependencies:

```bash
npm install
```

Build production assets:

```bash
npm run build
```

Watch source files during development:

```bash
npm run start
```

Lint JavaScript:

```bash
npm run lint:js
```

## Manual Testing

Automated tests are not included yet. Before release, verify:

- The plugin activates without PHP errors.
- `Settings > Editor Writing Goals` saves default goals and feature toggles.
- The `Writing Goals` sidebar panel appears in the block editor.
- Word, character, paragraph, heading, and reading-time counts update while editing.
- Per-post word and character targets save and reload correctly.
- Title, excerpt, and readability sections respect the settings toggles.
- No content is added to the frontend.

## License

GPL-2.0-or-later. See the plugin header and `readme.txt` for WordPress.org metadata.
