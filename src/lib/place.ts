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

/**
 * Validates a place name.
 * Returns an error message if invalid, or null if valid.
 */
export function validatePlaceName(name: string): string | null {
  const normalized = normalizePlaceName(name);
  const slug = generateSlug(name);

  if (normalized.length < 3) {
    return "Place name must be at least 3 characters";
  }

  if (normalized.length > 50) {
    return "Place name must be 50 characters or less";
  }

  if (slug.length < 3) {
    return "Place name must contain at least 3 alphanumeric characters";
  }

  if (slug.length > 30) {
    return "Place slug must be 30 characters or less";
  }

  return null;
}
