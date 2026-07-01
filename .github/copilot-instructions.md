# Copilot Instructions for CodeStitch Intermediate Website Kit

## Project Overview

This is an **Eleventy-based static site generator** with **Decap CMS** for content management. Built by CodeStitch, it emphasizes rapid deployment and client-friendly content editing via a Git-backed CMS.

### Key Technologies
- **SSG**: Eleventy (11ty) v3.x with Nunjucks templating
- **CSS Preprocessor**: LESS (not Sass)
- **CMS**: Decap CMS (local & production support)
- **Build**: esbuild (JS), PostCSS (CSS), image optimization via Sharp
- **Hosting**: Netlify (see `netlify.toml`)
- **Deployment**: ~2 minutes with git-gateway backend

---

## Architecture & Data Flow

### Build Pipeline
```
src/
├── pages/ (Nunjucks + HTML frontmatter)      → /blog/, /about/, etc.
├── blog/ (Markdown + YAML frontmatter)       → /blog/<slug>/
├── assets/less/                              → PostCSS → /assets/css/
├── assets/js/                                → esbuild → /assets/js/
├── _data/client.js                           → Global template variables
├── _includes/layouts/ + components/          → Reusable template partials
└── admin/config.yml                          → Decap CMS configuration

↓ (Eleventy processes)

public/ (built site, deployed to Netlify)
```

### The Data Cascade
- **Global data** (`_data/client.js`): Available in all templates via `client.*`
- **Page frontmatter**: Markdown files use YAML frontmatter (`title`, `description`, `layout`, `permalink`, etc.)
- **Layouts**: Pages extend `layouts/base.html` (sitewide layout) or `layouts/post.html` (blog posts)
- **Collections**: Blog posts auto-collected from `src/content/blog/`

### Important Frontmatter Fields
```yaml
---
title: "Page Title | Company Name"
description: "Meta description (55-160 chars)"
permalink: "/page-slug/"                  # Controls output URL
layout: "layouts/base.html"               # Or "layouts/post.html" for blog
tags: ["post"]                            # For collections (blog only)
---
```

---

## Development Workflows

### Local Development
```bash
npm install              # Install dependencies (do this first)
npm start               # Runs watch:eleventy + watch:cms (parallel)
  # Opens: http://localhost:8080 (site) + http://localhost:8081 (CMS local)
npm run watch:eleventy  # SSG only (8080)
npm run watch:cms       # CMS only (8081)
```

### Production Build
```bash
npm run build           # Runs build:eleventy + build:cms
npm run build:eleventy  # Optimizes/minifies with ELEVENTY_ENV=PROD
```

**Key Differences (dev vs prod)**:
- `ELEVENTY_ENV=PROD`: Enables minification (HTML, CSS, JSON, XML) and disables source maps
- Dev includes full source maps; prod strips them for size

---

## Content Management

### Adding Blog Posts
1. **Via CMS UI**: Access `/admin/` in dev/production, create/edit posts
2. **Manually**: Add `.md` files to `src/content/blog/` with Decap CMS frontmatter fields:
   - `title`, `description`, `author`, `date`, `tags` (list), `image` (path), `imageAlt`, `body`
   - Decap auto-generates `url` slug

### Adding Pages
- Create `.html` file in `src/content/pages/`
- Use frontmatter with `title`, `description`, `permalink` (required to set URL)
- Extend `{% extends "layouts/base.html" %}`
- See `src/content/pages/_template.txt` for boilerplate

### CMS Configuration
- **File**: `src/admin/config.yml`
- **Backend**: `git-gateway` (production) + `local_backend: true` (dev)
- **Collections**: Currently supports `blog` collection only
- **Media folder**: `src/assets/images/blog` → served as `/assets/images/blog`

---

## Template & Styling Patterns

### Nunjucks Syntax (Critical)
```nunjucks
{% extends "layouts/base.html" %}          {# Template inheritance #}
{% block head %}...{% endblock %}           {# Block override #}
{% include "sections/header.html" %}       {# Partial include #}
{{ client.name }}                           {# Global data #}
{% getUrl "/image.jpg" | resize(...) %}   {# Image optimization #}
{{ date | postDate }}                       {# Filters #}
```

### LESS Organization
```
src/assets/less/
├── root.less           # Sitewide styles + CSS vars
├── about.less          # Loaded by /about page
├── blog.less, contact.less, projects.less, reviews.less
└── critical.less       # Above-fold CSS
```

**Build**: LESS → PostCSS (autoprefixer + production cssnano) → `/assets/css/*.css`

### Template Hierarchy
- **`layouts/base.html`**: Sitewide meta, navigation, footer (56 lines, very clean)
  - Blocks: `{% block head %}` (for page-specific `<link>` tags), `{% block body %}`
  - Available vars: `page.*`, `title`, `description`, `image`, `client.*`
- **`layouts/post.html`**: Extends base, adds blog post structure (77 lines)
- **`sections/`**: Navigation, header, footer partials
- **`components/`**: Reusable snippets (optional; not currently used)

---

## Plugins & Utilities

### Eleventy Plugins (Added in `.eleventy.js`)
| Plugin | Purpose | Config |
|--------|---------|--------|
| `@codestitchofficial/eleventy-plugin-sharp-images` | Image optimization/resizing | `src/config/plugins/images.js` |
| `@quasibit/eleventy-plugin-sitemap` | Auto-generate `sitemap.xml` | `src/config/plugins/sitemap.js` |
| `@codestitchofficial/eleventy-plugin-minify` | Minify HTML/CSS/JSON (prod only) | Built-in |

### Filters (Custom)
```nunjucks
{{ dateString | postDate }}   {# Human-readable (Luxon-powered) #}
{{ dateString | isoDate }}    {# ISO 8601 format #}
```

### Shortcodes
```nunjucks
{% year %}                     {# Current year (for copyright) #}
```

### Image Optimization
```nunjucks
{% getUrl "/assets/images/photo.jpg" | resize({ width: 640, height: 600 }) | avif %}
{# Outputs optimized AVIF path + generates multiple sizes automatically #}
{# Config: src/config/plugins/images.js #}
```

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `.eleventy.js` | Main Eleventy config (plugins, filters, shortcodes, passthrough) |
| `src/_data/client.js` | **Fill this with client info** (name, email, phone, address, domain, socials) |
| `src/admin/config.yml` | Decap CMS backend + collection definitions |
| `src/config/processors/less.js` | LESS → CSS build pipeline (source maps in dev, minify in prod) |
| `src/config/processors/javascript.js` | esbuild JS bundling |
| `netlify.toml` | Netlify build config + caching strategy |
| `package.json` | Dependencies + npm scripts |

---

## Common AI Agent Tasks

### ✅ Adding a New Page
1. Create `src/content/pages/new-page.html`
2. Add frontmatter: `title`, `description`, `permalink`
3. Extend `layouts/base.html`, use `{% block head %}` for page CSS, `{% block body %}` for content
4. Test: `npm start` → http://localhost:8080/new-page/

### ✅ Modifying Blog Post Template
- Edit `src/_includes/layouts/post.html`
- Blocks available: `head` (add styles), `body` (main content)
- Post variables in frontmatter: `title`, `author`, `date`, `image`, `imageAlt`, `body`

### ✅ Adding LESS Styles
1. Create/edit files in `src/assets/less/`
2. Link in template or import in `root.less`
3. Build auto-processes → `/assets/css/`

### ✅ Debugging Template Issues
- Check frontmatter YAML syntax (indentation matters)
- Verify `permalink` paths start with `/` and end with `/`
- Use `{% debug variable_name %}` in Nunjucks (outputs to build console)
- Review Eleventy log for cascade/layout errors

### ✅ Deploying to Netlify
1. Push to GitHub (configured in `netlify.toml`)
2. Netlify auto-runs: `npm run build` (deploys `public/`)
3. CMS accessible at `yoursite.netlify.app/admin`

---

## Important Conventions & Gotchas

1. **No trailing slashes in domain** (`src/_data/client.js`): `domain: "https://example.com"` ✓, not `.../` ✗
2. **LESS only** (not Sass): All CSS preprocessing via LESS → `src/assets/less/`
3. **Markdown in blog only**: Blog posts are `.md` files; pages are `.html` with Nunjucks
4. **Image paths**: Use `{% getUrl %}` shortcode for automatic optimization; reference via `/assets/images/`
5. **Git-backed CMS**: Decap commits changes directly to git (requires GitHub auth in production)
6. **Passthrough copy**: Assets in `src/assets/`, `src/admin/`, `src/_redirects` are copied verbatim (no Eleventy processing)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with LESS error | Check LESS syntax (indentation, imports), verify file paths are relative |
| CMS won't save changes | Ensure `git-gateway` backend is configured; check GitHub OAuth setup |
| Image not optimizing | Use `{% getUrl %}` shortcode + verify image file exists in `src/assets/images/` |
| Permalink creates wrong URL | Ensure frontmatter `permalink` is YAML string (quotes), ends with `/` |
| Template won't render | Check `layout` path in frontmatter; verify `_data/client.js` is valid JS |

---

## References

- **Eleventy Docs**: https://www.11ty.dev/docs/
- **Nunjucks Docs**: https://mozilla.github.io/nunjucks/
- **Decap CMS Docs**: https://decapcms.org/docs/intro/
- **LESS Docs**: http://lesscss.org/
- **CodeStitch Components**: https://codestitch.app/ (pre-built sections available)
