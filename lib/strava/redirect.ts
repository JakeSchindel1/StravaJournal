/**
 * Safe redirect validation - prevents open redirects.
 * Only allows relative paths that start with / and don't escape the app.
 */

const ALLOWED_PREFIXES = ["/account", "/profile", "/dashboard", "/onboarding", "/"];

/** Validates redirectTo and returns a safe path, or defaultPath if invalid */
export function sanitizeRedirectTo(
  redirectTo: string | null | undefined,
  defaultPath = "/account"
): string {
  if (!redirectTo || typeof redirectTo !== "string") return defaultPath;

  const trimmed = redirectTo.trim();
  if (!trimmed.startsWith("/")) return defaultPath;

  // Reject absolute URLs, protocol-relative, or paths with //
  if (trimmed.startsWith("//") || trimmed.includes("://")) return defaultPath;

  // Must be a simple path - no query/hash for validation (we allow them but be cautious)
  const pathOnly = trimmed.split("?")[0].split("#")[0];
  if (pathOnly !== pathOnly.replace(/\.\./g, "")) return defaultPath; // no .. traversal

  // Whitelist: only allow known internal paths
  const isAllowed = ALLOWED_PREFIXES.some(
    (p) => pathOnly === p || (p !== "/" && pathOnly.startsWith(p + "/"))
  );
  return isAllowed ? trimmed : defaultPath;
}
