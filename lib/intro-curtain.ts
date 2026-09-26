/**
 * Shared by the intro curtain (a client component) and the site layout (a server
 * component), so it lives in a plain module: a constant exported from a
 * 'use client' file reaches the server only as a reference, not as its value.
 */

/** sessionStorage key, set once the curtain has played in this tab. */
export const INTRO_SEEN_KEY = 'koter:intro-seen';

/**
 * Runs inline, before the first paint: in a tab that has already seen the
 * curtain it marks the document so CSS never draws the curtain at all, rather
 * than drawing it and taking it away again once the JavaScript arrives.
 */
export const INTRO_SKIP_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)}))document.documentElement.classList.add('k-curtain-skip')}catch(e){}`;
