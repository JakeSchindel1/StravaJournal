/**
 * Public @grex.fit addresses for UI and legal contact copy.
 * Keeps support, sales, and privacy inboxes consistent across the app.
 * (noreply@, beta@, etc. are reserved for transactional mail — wire those in senders when you add email.)
 */
export const SITE_EMAIL = {
  hello: "hello@grex.fit",
  support: "support@grex.fit",
  jake: "jake@grex.fit",
  privacy: "privacy@grex.fit",
  feedback: "feedback@grex.fit",
  info: "info@grex.fit",
  noreply: "noreply@grex.fit",
  beta: "beta@grex.fit"
} as const;

export type SiteEmailKey = keyof typeof SITE_EMAIL;
