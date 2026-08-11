// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// The single base URL. Canonical and Open Graph absolute URLs derive from
	// this and from nothing else, so moving to a custom domain later is a
	// one-line change rather than a sweep through every tag.
	site: 'https://ahmad-rashid-portfolio.vercel.app',

	// 100% prerendered. No adapter and no serverless functions: the admin panel
	// is two static files served from public/, so nothing here needs a server.
	output: 'static',
});
