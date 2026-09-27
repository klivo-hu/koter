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

/** A very long, soft deceleration: most of the move early, then a slow settle. */
export const EASE_SETTLE = 'expo.out';

/**
 * How photographs (and the map) enter: from a little below and a touch small,
 * fading in quickly while the move settles slowly. Only opacity and transform
 * change, so the browser composites it without repainting the picture. Pictures
 * that come into view together follow each other `stagger` seconds apart.
 */
export const MEDIA_REVEAL = {
  y: 40,
  scale: 0.97,
  fade: 0.9,
  settle: 1.3,
  stagger: 0.08,
} as const;
