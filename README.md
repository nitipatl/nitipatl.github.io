# nitipatl.github.io

Personal site and blog of **Nitipat Lowichakornthikun**, built with [Astro](https://astro.build/).

Live: https://nitipatl.github.io/

## Branches

| Branch | Contents |
|--------|----------|
| `astro` | Astro source (edit here) |
| `master` | Built static site served by GitHub Pages |
| `gh-pages` | Older deploy attempt (unused) |

## Develop

```bash
git checkout astro
npm install   # Node.js 22+
npm run dev
```

## Publish

```bash
git checkout astro
npm run build
# Copy dist/* to master branch root (with .nojekyll) and push master
```

Optional: copy `docs/deploy-pages.workflow.yml` to `.github/workflows/deploy.yml` when your GitHub token has the `workflow` scope, then switch Pages to “GitHub Actions”.

## Content

Posts: `src/content/blog/*.md`
