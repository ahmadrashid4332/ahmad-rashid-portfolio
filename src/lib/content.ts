import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type ProjectEntry = CollectionEntry<'projects'>;

/*
 * Content access, with the build guards attached.
 *
 * Everything here runs at build time on a static site, so a thrown error fails
 * the build rather than reaching a visitor. That is the intended protection:
 * the last good deploy stays live, which is the same behaviour as invalid data
 * being rejected by zod.
 */

/**
 * Projects, sorted for display.
 *
 * Ascending on `order`, so order 1 renders first and holds the featured
 * position. The rendered sequence must match the CMS list top to bottom: if he
 * drags a card to the top and it appears third on the site, the panel is lying
 * to him.
 *
 * Display order never depends on filename or on filesystem read order.
 */
export async function getProjects() {
	const projects = await getCollection('projects');

	/*
	 * Backstop only. The authoritative empty-collection guard lives in
	 * astro.config.mjs and reads the directory on disk, because this check
	 * CANNOT fire on its own: Astro's content layer keeps entries in
	 * node_modules/.astro/data-store.json and the glob loader does not clear
	 * them when their source files disappear, so `projects` stays populated
	 * from cache even with the data directory emptied.
	 *
	 * Kept anyway because it costs nothing and covers the case where a future
	 * loader change does surface an empty collection here.
	 */
	if (projects.length === 0) {
		throw new Error(
			'Build stopped: the projects collection resolved empty. See requireProjects() in astro.config.mjs.',
		);
	}

	/*
	 * Ascending, so order 1 renders first and holds the featured position.
	 * No upper bound: the curation limit of 3 to 5 is the owner's to enforce.
	 */
	return projects.sort((a, b) => a.data.order - b.data.order);
}

/**
 * True once any project carries a screenshot.
 *
 * Selects between the two Projects layouts: hairline rows while no project has
 * an image, bordered cards once one does. Once any project has an image, all
 * of them render as cards and those without simply omit the image area. Row and
 * card treatments are never mixed within one list. spec.md section 8.6b.
 */
export function anyProjectHasImage(projects: ProjectEntry[]) {
	return projects.some((project) => Boolean(project.data.image));
}

/** Site-level singleton. */
export async function getSite() {
	const site = await getEntry('site', 'site');

	if (!site) {
		throw new Error(
			'Build stopped: src/data/site.md is missing. It holds the hero sentence, the About text and the social URLs.',
		);
	}

	return site.data;
}

/** Skills singleton. */
export async function getSkills() {
	const skills = await getEntry('skills', 'skills');

	if (!skills) {
		throw new Error(
			'Build stopped: src/data/skills.md is missing.',
		);
	}

	// Empty groups are rejected by the schema, so nothing here can render an
	// empty group heading. spec.md section 8.8.
	return skills.data.groups;
}
