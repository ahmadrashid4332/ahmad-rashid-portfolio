# ahmad-rashid-portfolio

Personal portfolio site for Ahmad Rashid. Single page, statically generated.

## Stack

- **Astro**, `output: 'static'` — 100% prerendered, no adapter, no serverless functions
- **Vanilla CSS** with custom properties, no framework
- **System font stack**, no webfonts and no third-party font requests
- **Astro content collections** typed by a single zod schema
- **Sveltia CMS** at `/admin` for editing content from a phone
- Hosted on **Vercel**

## Local development

```sh
npm install
npm run dev      # dev server
npm run build    # production build to ./dist
npm run preview  # preview the production build
```

## Structure

```
src/data/        content, typed by one zod schema
src/layouts/     base document shell
src/components/  one component per section
src/pages/       index.astro and 404.astro
src/styles/      design tokens and base styles
src/assets/      project screenshots, processed at build time
public/admin/    Sveltia CMS
public/files/    resume PDF, at a fixed path
```

## Notes

Two interactive behaviours ship JavaScript: the theme toggle and click-to-copy on
the email address. Everything else is static HTML.

Project screenshots upload to `src/assets/` rather than `public/` so that Astro
converts them and infers their dimensions. Uploads to `public/` are served
unprocessed.
