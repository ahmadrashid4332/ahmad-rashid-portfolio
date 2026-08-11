// @ts-check
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

/**
 * BUILD GUARD 1 of 2 (spec.md section 8.5).
 *
 * Projects are the point of the site, so an empty projects section is not a
 * state worth rendering gracefully. Failing the build keeps the last good
 * deploy live, which is the same protective behaviour as invalid data.
 *
 * WHY THIS READS THE DISK INSTEAD OF THE COLLECTION.
 *
 * The obvious version of this guard checks `getCollection('projects').length`
 * inside the page. That does not work, and it fails silently, which is worse
 * than not having it.
 *
 * Astro's content layer persists entries in node_modules/.astro/data-store.json
 * and the glob loader does not clear entries whose source files have gone: it
 * warns "No files found" and leaves the store intact. A build with every
 * project file deleted therefore succeeds and renders all three projects from
 * cache. Verified 2026-08-12, which is precisely what Gate 3 exists to catch.
 *
 * The directory on disk is the source of truth, so that is what this reads.
 * It runs before content is loaded, and it cannot be fooled by a warm cache.
 */
function requireProjects() {
	return {
		name: 'require-projects',
		hooks: {
			'astro:build:start': () => {
				const dir = fileURLToPath(new URL('./src/data/projects', import.meta.url));

				const entries = existsSync(dir)
					? readdirSync(dir).filter((file) => file.endsWith('.md'))
					: [];

				if (entries.length === 0) {
					throw new Error(
						[
							'Build stopped: the projects collection is empty.',
							'',
							'Projects are the point of the site. Rather than deploy a page with',
							'an empty section, the build fails and the last good deploy stays',
							'live.',
							'',
							`Expected at least one .md file in: ${dir}`,
						].join('\n'),
					);
				}

				/*
				 * Deliberately no upper bound. The curation limit of 3 to 5 is
				 * enforced by the owner, not the compiler: he can add a project
				 * from his phone, and a hard failure here would take the site's
				 * last good deploy hostage to a content decision.
				 * spec.md section 8.6.
				 */
			},
		},
	};
}

/**
 * BUILD GUARD 2 of 2 (spec.md section 5.3).
 *
 * Astro does not validate the contents of public/, so nothing else catches a
 * missing resume. Without this the site would deploy a download button that
 * 404s, and a dead link is called out as actively damaging.
 *
 * Failing the build means the last good deploy stays live instead.
 */
function requireResumePdf() {
	return {
		name: 'require-resume-pdf',
		hooks: {
			'astro:build:start': () => {
				const path = fileURLToPath(
					new URL('./public/files/resume.pdf', import.meta.url),
				);

				if (!existsSync(path)) {
					throw new Error(
						[
							'Build stopped: public/files/resume.pdf is missing.',
							'',
							'The Resume button points at a fixed path so that any previously',
							'shared link keeps working across updates. Deploying without the',
							'file would ship a button that 404s.',
							'',
							`Expected at: ${path}`,
						].join('\n'),
					);
				}
			},
		},
	};
}

// https://astro.build/config
export default defineConfig({
	// The single base URL. Canonical and Open Graph absolute URLs derive from
	// this and from nothing else, so moving to a custom domain later is a
	// one-line change rather than a sweep through every tag.
	site: 'https://ahmad-rashid-portfolio.vercel.app',

	// 100% prerendered. No adapter and no serverless functions: the admin panel
	// is two static files served from public/, so nothing here needs a server.
	output: 'static',

	// Phosphor glyphs, inlined as SVG at build time via Iconify. Same icon set
	// the design skill reaches for, with zero runtime JS and no React.
	integrations: [
		requireProjects(),
		requireResumePdf(),
		icon({ include: { ph: ['*'] } }),
	],
});
