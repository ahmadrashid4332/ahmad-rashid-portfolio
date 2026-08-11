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

### Editing from the admin panel

Sign in at `/admin` with a fine-grained GitHub personal access token scoped to
this repository only.

**Edit everything you want to change, then save once.** Each save is a commit,
and each commit is a build. Saving five fields separately queues five builds that
run one at a time.

**After saving, check the live site, not the CMS.** A save that commits to the
wrong branch looks successful in the panel and never reaches the site.

Two rules the form cannot enforce for you:

1. **A screenshot needs a description.** The schema requires alt text whenever an
   image is set, but the form cannot make one field conditional on another. Save
   an image with the description blank and the form accepts it, then the build
   fails. The site stays up on its last good version, but the edit will not
   appear.
2. **The resume must be named `resume.pdf` before you upload it.** The download
   link points at a fixed path so that any link already shared keeps working.
   Uploading a file under another name publishes it alongside the old one and
   leaves the button pointing at the old file.

### Bumping Sveltia

The CMS version is pinned in `public/admin/index.html`. It loads from a CDN and
is pre-1.0 with a fast release cadence, so an unpinned version could break the
panel with no deploy on our side. Bumping is a one-line change, and is not done
until you have logged in and saved something on the new version.
