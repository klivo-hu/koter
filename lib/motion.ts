/** Shared motion constants, so every animation on the site moves the same way. */

/** Long, decelerating ease — the house curve. */
export const EASE = 'power3.out';
/** Accelerating counterpart, for elements leaving. */
export const EASE_IN = 'power2.in';

export const DUR = {
  fast: 0.28,
  base: 0.62,
  slow: 0.9,
  hero: 1.15,
} as const;

/** Stagger between siblings in a group reveal. */
export const STAGGER = 0.075;

/** How far a revealing element travels, in pixels. Deliberately small. */
export const SHIFT = 28;
