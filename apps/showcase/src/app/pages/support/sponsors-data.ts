// The sponsors credited on /support. Hand-curated: add an entry as each sponsor
// comes in (GitHub Sponsors does not expose a public list without an API token,
// so this stays a simple committed array). An empty list renders the invitation
// state. Order is by tier then arrival; keep it short and tasteful.
//
// This curated list is deliberately separate from the README sponsors wall,
// which `.github/workflows/sponsors.yml` auto-syncs from GitHub Sponsors. Keeping
// the showcase list by hand lets logos and tier labels stay intentional.

export interface Sponsor {
  /** Display name (person or company). Used for the avatar label + initials. */
  name: string;
  /** Where the avatar/name links — their GitHub, site, or the sponsorship. */
  url: string;
  /** Optional logo/avatar URL; omitted falls back to initials. */
  imageUrl?: string;
  /** Optional short tier label, e.g. "Team" or "Keep the lights on". */
  tier?: string;
}

export const SPONSORS: Sponsor[] = [];
