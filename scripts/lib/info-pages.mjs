// @ts-check
/* The site-information pages: privacy.html, terms.html, accessibility.html.
 *
 * EVERY factual statement in the privacy policy describes behaviour
 * confirmed in the code or by loading the pages in a browser — see the
 * audit notes beside each section. If the site's behaviour changes (a new
 * storage key, a new third-party request, a form), change this text in the
 * same commit. tests/info-pages.test.mjs checks the facts it can check.
 *
 * Edit the text here, then run: node scripts/build-info-pages.mjs */
import { SITE, SUPPORT_EMAIL, pageShell, esc } from './site-pages.mjs';

const GENERATOR = 'scripts/build-info-pages.mjs';
const SOURCE = 'scripts/lib/info-pages.mjs';

/** Shown on every page that has no `updated` of its own; change it whenever the text of such a page changes. */
export const LAST_UPDATED = { iso: '2026-11-17', text: '17 November 2026' };

export const OPERATOR = 'Adam Arab';
export const LOCATION = 'Dubai, UAE';

const mail = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
const ACCENTS = ['fo-accent-yellow', 'fo-accent-coral', 'fo-accent-sage', 'fo-accent-lavender'];

/** @param {string[]} items */
const list = items => `<ul class="cp-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
/** @param {string} text */
const p = text => `<p class="fo-prose">${text}</p>`;

/**
 * @typedef {{head: string, body: string}} Section
 * @typedef {{file: string, title: string, eyebrow: string, h1: string, intro: string, description: string, sections: Section[], updated?: {iso: string, text: string}}} InfoPage
 */

/** @type {InfoPage} */
const privacy = {
  file: 'privacy.html',
  // Its own date, so a change here does not move the date on terms.html (which uses LAST_UPDATED).
  updated: { iso: '2026-11-18', text: '18 November 2026' },
  title: 'Privacy policy · Altiora',
  eyebrow: 'Privacy',
  h1: 'Privacy policy',
  intro: 'Altiora is a free website that helps students compare university course entry requirements with their own subjects and grades. This page explains, in plain English, what happens to your information when you use it.',
  description: 'How Altiora handles your information: no accounts, no cookies, and what you enter stays in your own browser.',
  sections: [
    { head: 'Who runs Altiora',
      body: p(`Altiora is run by ${OPERATOR}, in ${LOCATION}. If you have a question about this policy or your information, email ${mail}.`) },
    { head: 'The short version',
      // Audit: zero cookies on every page type; app state only in localStorage;
      // third-party hosts are static.cloudflareinsights.com and
      // cloudflareinsights.com only (fonts are served from /fonts).
      body: list([
        'There are no accounts. You never give us a name, email address or password to use Altiora.',
        'Altiora does not use cookies.',
        'What you enter (your subjects, grades, shortlist and notes) is saved only in your own browser. It is not sent to us, and we can’t see it.',
        'We count visits with Cloudflare Web Analytics, which doesn’t use cookies and doesn’t receive anything you enter.',
      ]) },
    { head: 'What Altiora saves, and where',
      // Audit: state.js — one localStorage key, altiora_state_v1, with the fields
      // listed; a probe key written and removed at once; no fetch/XHR/beacon in
      // the site's own code. index.html, fields/, courses/, universities/ write
      // no storage.
      body: p('When you use the Check my subjects page, Altiora saves your progress in your browser’s <strong>local storage</strong>: a small storage area on your own device that belongs to this website. It keeps one entry, called <code>altiora_state_v1</code>, which holds:') +
        list([
          'your qualification system, year group and the stage you’re at;',
          'your subjects and predicted grades;',
          'your interests and the fields you’ve kept;',
          'the courses on your shortlist;',
          'your story bank entries and application checklist ticks;',
          'your personal statement drafts;',
          'the date and time of your first and most recent visit.',
        ]) +
        // Audit: state.js _init() — a first load stamps meta.firstVisit / lastVisit and saves, before any input.
        p('The entry is created the first time you open the Check my subjects page, with only those visit times, before you enter anything.') +
        p('This stays in the browser on the device you used. It is not sent to us or to anyone else. If you use a different device or browser, your information won’t be there unless you move it with a backup file (see below).') +
        p('To check that saving works, Altiora writes a test value and deletes it straight away. If your browser blocks storage, Altiora still works but saves nothing.') +
        // Audit: strengths-param.js sets sessionStorage openStrengthsMode for ?mode=strengths; main.js init()
        // reads it and removes it at once.
        p('If you open the Check my subjects page from the “Start from your strengths and interests” link, one temporary marker is set in <strong>session storage</strong> when the link is opened, to tell the page to open that view, and it is removed as the page starts. Session storage lasts only for that browser tab.') +
        p('The home page, the field guides and the course and university pages save nothing.') },
    { head: 'Backups and downloads',
      // Audit: main.js exportBackupFile (Blob download), FileReader import,
      // shortlist CSV (Blob download). No upload anywhere.
      body: p('“Save my plan to a file” saves your whole plan as a file on your device, and “Restore my plan from a file” reads a file you choose from your device. Downloading your shortlist as a spreadsheet also creates the file on your device. None of these files are uploaded anywhere.') },
    { head: 'How to delete your information',
      // Audit: data is only in localStorage; the profile menu's "Erase my plan from this device"
      // removes every key the site owns (AltioraState.erasePlan).
      body: p('Because everything is stored in your browser, you delete it there. In your browser’s settings, clear the site data for <strong>usealtiora.com</strong> (browsers call this “site data”, “website data” or “cookies and site data”). This removes everything Altiora saved. You can also erase your plan on the website itself: open the profile menu and choose “Erase my plan from this device”. If you made a backup file, delete that file too.') },
    { head: 'Cookies and storage',
      // Audit: every page type loaded in a fresh browser; context cookies and
      // document.cookie empty; no cookie header sent to any third party.
      body: p('<strong>Altiora does not use any cookies</strong>, and neither does the service it loads (Cloudflare Web Analytics). We loaded every type of page in a fresh browser and no cookies were created. That is why there is no cookie banner.') +
        p('The only browser storage the site uses is the local storage and session storage described above. Only the Check my subjects page uses it, only to make that page work, and it is never sent anywhere.') },
    { head: 'Visit counting: Cloudflare Web Analytics',
      // Audit: beacon payload keys — location (query string removed), referrer
      // (when present), browser engine/version, load timings, memory, a random
      // page-load ID, site token; request headers carry user-agent and referer,
      // no cookie. No storage read.
      body: p('To see how many people visit and which pages are used, Altiora uses Cloudflare Web Analytics. It does not use cookies or browser storage. When a page loads, a small script from Cloudflare sends Cloudflare:') +
        list([
          'the address of the page you’re on, without anything after a “?” in the address;',
          'the address of the page that linked you there, if there was one;',
          'your browser type and version;',
          'technical measurements of how quickly the page loaded;',
          'like any request over the internet, your IP address.',
        ]) +
        p('It does not receive your subjects, grades, shortlist or anything else you enter. Cloudflare handles this information under its own privacy policy.') },
    { head: 'Hosting: GitHub Pages',
      // Audit: CNAME + README — the site is static files served by GitHub Pages.
      // What GitHub logs is not known from the code, so it is stated generally.
      body: p('The website is hosted on GitHub Pages, run by GitHub. Like any web host, GitHub’s servers receive your IP address and the details of each request your browser makes when a page loads, such as which file was requested and your browser type, and GitHub may keep records of these requests. GitHub handles this information under its own privacy statement.') },
    { head: 'Emailing us',
      // Audit: no contact form; support is a mailto: link only. The sentence on
      // how emails are used is the operator's commitment, not code behaviour.
      body: p(`There is no contact form. If you email ${mail}, your message reaches us as an ordinary email, with your email address and whatever you write. We use it only to reply to you and to deal with what you’ve told us. Please don’t include personal information we don’t need.`) },
    { head: 'Who Altiora is for',
      // Audit: no accounts, no sign-up, no form sends data off the device (the
      // story bank form saves to localStorage).
      body: p('Altiora is intended for students aged 14 and over. It does not collect personal information through forms: there are no accounts, no sign-up and no contact form, and anything you write is saved only in your browser.') },
    { head: 'Links to other websites',
      body: p('The Check my subjects page and the course pages link to universities’ own websites. When you follow one of those links you leave Altiora, and that website’s own privacy policy applies.') },
    { head: 'Changes to this policy',
      body: p('If the way the site handles information changes, we will update this page and the date at the top.') },
  ],
};

/** @type {InfoPage} */
const terms = {
  file: 'terms.html',
  title: 'Terms of use · Altiora',
  eyebrow: 'Terms',
  h1: 'Terms of use',
  intro: 'Altiora is free to use, with no account. By using it you agree to these terms. They are short, so please read them.',
  description: 'Altiora’s terms of use: free information only, not admissions advice, and always confirm requirements with the university.',
  sections: [
    { head: 'Free information, not advice',
      body: p('Altiora gives general information about university courses and their entry requirements, free of charge. It is not professional, careers or admissions advice, and it does not replace advice from your school, the university or a qualified adviser.') },
    { head: 'Always check with the university',
      body: p('Entry requirements change every year, and universities can change them at any time. Before you choose subjects or apply, always confirm the requirements on the university’s official course page.') },
    { head: 'How requirements are labelled',
      body: p('Each requirement in Altiora is labelled <strong>verified</strong>, <strong>partly verified</strong> or <strong>not verified</strong>, with the date it was checked and a link to the official source where there is one. Some requirements are only partly verified or have not yet been checked; they are marked that way so you know to check them yourself.') },
    { head: 'No guarantees',
      body: p('We work to keep the information accurate, but we cannot guarantee that it is complete, correct or up to date. A result in Altiora, such as a “strong match”, is not a prediction or a promise of an offer or of admission. Only universities make admissions decisions.') },
    { head: 'Your information',
      body: p('What you enter is saved only in your own browser. The <a href="privacy.html">privacy policy</a> explains what the site does with information.') },
    { head: 'Who runs Altiora',
      body: p(`Altiora is run by ${OPERATOR}, in ${LOCATION}. Contact: ${mail}.`) },
    { head: 'Changes to these terms',
      body: p('We may update these terms. The date at the top shows when they last changed.') },
  ],
};

/** @type {InfoPage} */
const accessibility = {
  file: 'accessibility.html',
  title: 'Accessibility · Altiora',
  eyebrow: 'Accessibility',
  h1: 'Accessibility',
  intro: 'Altiora should work for everyone, including people who use a keyboard, a screen reader, zoom or a small screen. This page says what has been done, what is still limited, and how to tell us about a problem.',
  description: 'What Altiora does for accessibility, its known limitations, and how to report a problem.',
  updated: { iso: '2026-11-18', text: '18 November 2026' },
  sections: [
    { head: 'What we have done',
      // Each line: scripts/verify-pass/matching/axe.mjs (its VIEWS list, widths,
      // panels, WCAG 2.0 A/AA tags, 12px minimum text, 375px overflow) and the
      // keyboard pass recorded in the commit that added this page. Emoji icons
      // are aria-hidden; programmatic scrolling goes through scrollMotion().
      body: list([
        '<strong>Automated checks.</strong> We test the home page, the main views of the Check my subjects page (from the first questions to Applying, including its pop-up panels and dialogs), the course list, a course page, a university page, every field guide and these information pages with axe-core against the WCAG 2.0 Level A and AA rules, at desktop and phone widths, with every expandable panel both open and closed. The most recent check found no violations.',
        '<strong>Contrast.</strong> Text colours are checked for contrast against WCAG AA as part of those automated checks.',
        '<strong>Text size.</strong> No text on the checked pages is smaller than 12px.',
        '<strong>Small screens.</strong> The checked pages fit a 375px-wide screen without sideways scrolling.',
        '<strong>Keyboard.</strong> Every link, button and form control can be reached and used with the keyboard, and shows a clear outline when it has focus. We have tested the About panel, the subject picker, the grade selectors and the Entry requirements panels by keyboard.',
        '<strong>Screen readers.</strong> Decorative icons are hidden from screen readers. Course statuses are always written out in words, never shown by colour or icon alone.',
        '<strong>Motion.</strong> If your device is set to reduce motion, animations are switched off.',
      ]) },
    { head: 'Known limitations',
      body: list([
        'Automated tools cannot find every problem, and we have not yet tested the site with a full range of screen readers and browsers.',
        'Requirement text is taken from universities’ own pages, so it can include their abbreviations and wording.',
        'The university websites we link to are outside our control and may not meet the same standard.',
      ]) },
    { head: 'Report a problem',
      body: p(`If something on Altiora is hard to use or doesn’t work with your device or assistive technology, email ${mail}. Tell us which page you were on and what happened, and we will look into it.`) },
  ],
};

export const INFO_PAGE_CONTENT = [privacy, terms, accessibility];

/**
 * @param {InfoPage} page
 * @param {{pieces: ReturnType<typeof import('./site-pages.mjs').appPieces>, pagesCssV: string}} env
 */
export function infoPageHtml(page, env) {
  const sections = page.sections.map((s, i) =>
    `      <section class="fo-section"><h2 class="fo-section__head ${ACCENTS[i % ACCENTS.length]}">${esc(s.head)}</h2>${s.body}</section>`).join('\n');
  const body = `      <header class="fo__header">
        <span class="fo__eyebrow">${esc(page.eyebrow)}</span>
        <h1 class="fo__title">${esc(page.h1)}</h1>
        <p class="fo__desc">${esc(page.intro)}</p>
        <p class="cp-crumbs">Last updated <time datetime="${(page.updated ?? LAST_UPDATED).iso}">${(page.updated ?? LAST_UPDATED).text}</time></p>
      </header>
${sections}
      <p><a class="fo-back" href="./">← Back to Altiora</a></p>`;
  return pageShell({
    ...env, base: '', generator: GENERATOR, source: SOURCE, body,
    title: page.title, description: page.description, url: `${SITE}/${page.file}`,
  });
}
