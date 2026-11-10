// Settings for the online database (Part 22). How to fill these in, step by
// step: docs/project-notes.md, section 3.
//
// enabled:        true = children's work goes online by itself, and the teacher
//                 logs in with email + password. (false: work stays in each
//                 browser, and the teacher dashboard can only show DEMO data.)
// url:            your Supabase "Project URL", e.g. 'https://abcdefgh.supabase.co'
// publishableKey: your Supabase PUBLISHABLE key ('sb_publishable_...').
//                 It is meant to be public: the database rules decide what it may do.
//                 NEVER put the secret key ('sb_secret_...') or the database password here.
//
// ON since 4 Nov 2026: Prof and the GIU ethics check agreed that children's
// work may go online (anonymous codes only, docs/project-notes.md, section 5).
export const BACKEND = {
  enabled: true,
  url: 'https://auzqfqphiycppiwjplkl.supabase.co',
  publishableKey: 'sb_publishable_GM3Wy-nPH7WIeP2aaL16gA_XYK8--vh',
};

// Features that can be switched off for a pilot group (Part 58a, 10 Nov 2026).
// wardrobe: true = children can dress Pip (Pip's Wardrobe). false = the
//           "Dress Pip" buttons are hidden and Pip wears his explorer hat and
//           magnifier everywhere, so that group's data has no wardrobe at all.
export const FEATURES = {
  wardrobe: true,
};

// True when the database is switched on AND filled in.
export function backendReady() {
  return BACKEND.enabled && BACKEND.url !== '' && BACKEND.publishableKey !== '';
}
