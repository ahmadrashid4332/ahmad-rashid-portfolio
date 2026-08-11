import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/*
 * One zod schema, and only one.
 *
 * No CMS-native typed API may be adopted alongside this. Two schemas drift
 * silently, and the drift only surfaces as a broken build or a wrong page.
 * spec.md section 3.1.
 *
 * The CMS field config in public/admin/config.yml must mirror everything here
 * exactly: required flags, patterns, and the conditional rule on imageAlt. That
 * mirroring is a standing correctness requirement, not one-time setup
 * (spec.md section 6.4).
 */

/*
 * Format only, never reachability.
 *
 * A build-time fetch would fail builds at random: the translator sits on a
 * cold-starting Cloud Run host, and an unrelated commit would be blamed.
 * Reachability is a pre-launch and periodic checklist item instead.
 * spec.md section 3.2.
 */
const httpsUrl = z
	.string()
	.regex(/^https:\/\/\S+$/, 'Must be an absolute https:// URL');

const projects = defineCollection({
	// One file per project so the CMS can create, delete and reorder entries
	// independently. Markdown with YAML frontmatter and no body.
	loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().min(1),
				description: z.string().min(1),
				tech: z.array(z.string().min(1)).min(1),
				// The only outbound link on a card. A project without one does
				// not ship.
				liveUrl: httpsUrl,
				// Controls display sequence. Written by the CMS drag-and-drop
				// reorder. Sorted ascending; order 1 is the featured position.
				order: z.number().int(),
				/*
				 * Optional, permanently. Not "optional until launch".
				 *
				 * All three screenshots are deferred to the admin panel, so a
				 * card must render correctly with no image at any point in the
				 * site's life. spec.md section 3.2.1.
				 *
				 * image() rather than a string path is what gives AVIF/WebP
				 * conversion and inferred width/height on a phone upload. It
				 * only works because media lands in src/assets/, not public/.
				 */
				image: image().optional(),
				imageAlt: z.string().min(1).optional(),
			})
			.superRefine((data, ctx) => {
				/*
				 * Alt text is required if and only if an image is set, enforced
				 * here rather than left to habit. A screenshot uploaded from a
				 * phone with no alt text would otherwise be an accessibility
				 * regression introduced by the convenience feature, and the CMS
				 * form is exactly where that would happen.
				 */
				if (data.image && !data.imageAlt) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['imageAlt'],
						message:
							'imageAlt is required when image is set. Describe the project, not the fact that it is a screenshot.',
					});
				}
			}),
});

/*
 * Site-level content. A singleton: one file, one entry.
 *
 * Holds only the fields expected to change. Name, role line, email, resume path
 * and the SEO strings are deliberately not here and remain repo edits
 * (spec.md section 3.5).
 */
const site = defineCollection({
	loader: glob({ pattern: 'site.md', base: './src/data' }),
	schema: z.object({
		// Carries the role and the positioning together. 20 words maximum.
		heroSentence: z.string().min(1),
		// 3 to 5 sentences, first person.
		about: z.string().min(1),
		githubUrl: httpsUrl,
		linkedinUrl: httpsUrl,
	}),
});

/*
 * Skills. A singleton holding a list of groups.
 *
 * Genuinely nested, which the flat-fields rule does not allow. That rule is
 * scoped to projects; this is the single explicit exception
 * (spec.md section 3.4).
 *
 * There is no proficiency, level, rating or percentage field, and none may ever
 * be added. The prohibition binds the data model so the option cannot creep
 * back in through the CMS form, where a "level" dropdown would look harmless.
 */
const skills = defineCollection({
	loader: glob({ pattern: 'skills.md', base: './src/data' }),
	schema: z.object({
		groups: z
			.array(
				z.object({
					category: z.string().min(1),
					// Never rendered as an empty group heading, so an empty
					// items array is rejected here rather than handled later.
					items: z.array(z.string().min(1)).min(1),
				}),
			)
			.min(1),
	}),
});

export const collections = { projects, site, skills };
