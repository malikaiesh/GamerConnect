/**
 * Creates a SEO-friendly URL slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The slug
 */
export function createSlug(text) {
  return text
    .toString()                 // Convert to string
    .toLowerCase()              // Convert to lowercase
    .trim()                     // Remove whitespace from both ends
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/&/g, '-and-')     // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')   // Remove all non-word characters (except hyphens)
    .replace(/\-\-+/g, '-')     // Replace multiple hyphens with a single hyphen
    .replace(/^-+/, '')         // Remove leading hyphens
    .replace(/-+$/, '');        // Remove trailing hyphens
}

/**
 * Checks if a slug is already in use by another game
 * @param {Object} db - Database connection
 * @param {string} slug - The slug to check
 * @param {number} excludeId - Optional game ID to exclude from the check (for updates)
 * @returns {Promise<boolean>} - True if the slug is available, false if already in use
 */
export async function isSlugAvailable(db, slug, excludeId = null) {
  // If excludeId is provided, don't consider that game when checking for duplicates
  if (excludeId) {
    const { count } = await db.query.games.findFirst({
      where: (games, { eq, and, ne }) => 
        and(eq(games.slug, slug), ne(games.id, excludeId)),
      columns: {
        count: db.fn.count()
      }
    });
    return count === 0;
  } else {
    const { count } = await db.query.games.findFirst({
      where: (games, { eq }) => eq(games.slug, slug),
      columns: {
        count: db.fn.count()
      }
    });
    return count === 0;
  }
}

/**
 * Generates a unique slug for a game
 * @param {Object} db - Database connection
 * @param {string} title - The game title to generate the slug from
 * @param {number} excludeId - Optional game ID to exclude from uniqueness check
 * @returns {Promise<string>} - A unique slug
 */
export async function generateUniqueSlug(db, title, excludeId = null) {
  let baseSlug = createSlug(title);
  let finalSlug = baseSlug;
  let counter = 1;
  
  // Keep checking until we find an available slug
  while (!(await isSlugAvailable(db, finalSlug, excludeId))) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return finalSlug;
}