/*
 * Fixed site values. Deliberately NOT in the CMS.
 *
 * The admin panel covers the fields expected to change: the hero sentence, the
 * About text, the project cards, the skills and the social URLs. These do not
 * change, so they stay repo edits (spec.md section 3.5).
 *
 * Recorded consequence, so it is not a surprise later: changing the contact
 * email is a repo edit. That matters more than it looks, because a custom
 * domain is planned and usually brings a new address with it.
 *
 * PERSONAL DETAILS ARE RESTRICTED TO EMAIL ONLY. No location, no photo, no
 * phone number, anywhere on the site, in metadata, or in structured data.
 */

export const NAME = 'Ahmad Rashid';

export const EMAIL = 'ahmadrashid4332@gmail.com';

/** Fixed path, so a previously shared link keeps working across updates. */
export const RESUME_PATH = '/files/resume.pdf';

/*
 * 50 to 60 characters. No leftover framework default.
 */
export const SEO_TITLE = 'Ahmad Rashid, Web Developer studying agentic AI';

/*
 * 150 to 160 characters.
 */
export const SEO_DESCRIPTION =
	'Web developer building small, fast websites and shipping them end to end. Currently studying agentic AI. See recent projects, or get in touch by email.';
