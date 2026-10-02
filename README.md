# nitipatl.github.io

Personal site and blog of **Nitipat Lowichakornthikun**, built with [Astro](https://astro.build/) and deployed to [GitHub Pages](https://nitipatl.github.io/).

## Develop

```bash
npm install
npm run dev
```

Requires Node.js 22+.

## Build

```bash
npm run build
npm run preview
```

## Content

Blog posts live in `src/content/blog/*.md` (and `.mdx`).

## Deploy

- **Source:** `master` (Astro project)
- **Published site:** `gh-pages` branch (contents of `dist/`)
- Pages source: branch `gh-pages` / path `/`

To republish after changes:

```bash
npm run build
# copy dist/ to gh-pages branch and push
```

Optional later: add `.github/workflows/deploy.yml` (needs a token with `workflow` scope) and switch Pages to “GitHub Actions”.
