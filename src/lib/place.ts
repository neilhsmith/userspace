/**
 * Normalizes a place name (display name).
 * - Trims leading/trailing spaces
 * - Collapses multiple spaces into one
 */
export function normalizePlaceName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Generates a slug from a place name.
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes non-alphanumeric characters (except hyphens)
 * - Trims leading/trailing hyphens
 * - Collapses multiple hyphens into one
 */
export function generateSlug(name: string): string {
  return normalizePlaceName(name)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

