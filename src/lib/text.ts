// text utils

const PUBLIC_HOST = 'https://files.maila.ai'; // public host
const INTERNAL_PREFIX = '/app/output_clips/'; // internal prefix

/**
 * Example:
 * to_public('/app/output_clips/a/b.wav') -> 'https://files.maila.ai/a/b.wav'
 */
export function to_public(path: string): string { // map to public
  return path.startsWith(INTERNAL_PREFIX) // check prefix
    ? PUBLIC_HOST + path.slice(INTERNAL_PREFIX.length - 1) // replace prefix
    : path; // return as is
}

/**
 * Example:
 * to_kebab("All right, that's it!") -> 'all-right-thats-it'
 */
export function to_kebab(s: string): string { // kebab case
  const lower = s.toLowerCase(); // to lower
  const stripped = lower.replace(/[^a-z0-9\s-]/g, ''); // remove punct
  const norm_space = stripped.replace(/\s+/g, ' ').trim(); // norm spaces
  const hyph = norm_space.replace(/\s/g, '-'); // spaces to hyphen
  const dedup = hyph.replace(/-+/g, '-'); // collapse hyphens
  return dedup; // result
}

/**
 * Example:
 * split_kebab('all-right-thats-it') -> ['all','right','thats','it']
 */
export function split_kebab(s: string): string[] { // split kebab
  if (!s) return []; // guard
  return s.split('-').filter(Boolean); // split
}

/**
 * Example:
 * last_slug('.../002_name_can-opener.wav') -> 'can-opener'
 */
export function last_slug(file_name: string): string { // last slug
  const base = file_name.replace(/\.[a-z0-9]+$/i, ''); // remove ext
  const idx = base.lastIndexOf('_'); // last underscore
  const tail = idx >= 0 ? base.slice(idx + 1) : base; // tail
  const clean = tail.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'); // clean
  return clean; // slug
}

/**
 * Example:
 * file_name('/x/y/a.wav') -> 'a.wav'
 */
export function file_name(path: string): string { // name from path
  const parts = path.split('/'); // split
  return parts[parts.length - 1] || path; // last
}