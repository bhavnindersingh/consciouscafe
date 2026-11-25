/**
 * The /sanctuary hero (SanctuaryHero.js) is a carousel: first the Sanctuary's
 * own slide — a muted background video and "Come to Conscious Sanctuary" —
 * then the next few gatherings on the calendar, each with its photo (a weekly
 * class once). The events come from the live calendar, so they change by
 * themselves; only the brand slide's media is set here.
 *
 * Brand video: a Gumlet video id (muted, looping, no controls — the home
 * hero's clip for now). `poster` paints first and stands in when someone
 * prefers reduced motion.
 */
export const SANCTUARY_HERO_BRAND = {
  gumletId: '6925f88a3c99376d4fd48188',
  poster: 'images/hero-poster.jpg',
  seconds: 9,
};

/** How many upcoming gatherings follow the brand slide, and how long each shows. */
export const SANCTUARY_HERO_EVENTS = 6;
export const SANCTUARY_HERO_EVENT_SECONDS = 6;
