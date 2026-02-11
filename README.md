# Free Resume

A free, open-source resume builder that converts LinkedIn PDF exports into professional, single-page CVs — entirely in your browser.

## Why I built this

Most resume builders either cost money, lock your data behind an account, or send your personal information to a server. Free Resume is different:

- **Completely free** — no paywalls, no premium tiers
- **No data leaves your browser** — everything runs client-side, nothing is sent to any server
- **Open source** — inspect the code, contribute, or fork it for your own use

## Features

- **LinkedIn PDF import** — upload your LinkedIn profile PDF and get a structured resume instantly
- **Multiple templates** — choose from different professional layouts
- **Auto-fit** — content is automatically trimmed and adjusted to fit a single page
- **Dark mode** — full dark mode support for comfortable editing
- **Internationalization** — available in English and Swedish
- **PDF export** — download your finished resume as a high-quality PDF
- **Fully client-side** — no server, no database, no account required

## Getting started

### Prerequisites

- Node.js 18+
- pnpm

### Install and run

```bash
# Clone the repository
git clone https://github.com/baehrendtz/FreeResume.git
cd FreeResume

# Install dependencies
pnpm install

# Start the dev server
pnpm dev:app
```

The app will be available at `http://localhost:3000`.

### Build for production

```bash
pnpm build
```

## Project structure

This is a monorepo managed with pnpm workspaces:

```
apps/
  simplecv/    # The main resume builder app (Next.js)
  landing/     # Landing page
```

The resume builder (`apps/simplecv`) is a Next.js App Router application that builds as a static export — no server runtime needed.

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Ensure lint and build pass:
   ```bash
   pnpm --filter @freeresume/app lint
   pnpm --filter @freeresume/app build
   ```
5. Commit your changes and open a pull request

## License

MIT — see [LICENSE](LICENSE) for details.
