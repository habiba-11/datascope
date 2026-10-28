// Settings for the online database (Part 22). How to fill these in, step by
// step: docs/backend-setup-guide.md.
//
// enabled:        false = no database: work stays in the browser, files are the
//                 fallback (the app works fully either way).
// url:            your Supabase "Project URL", e.g. 'https://abcdefgh.supabase.co'
// publishableKey: your Supabase PUBLISHABLE key ('sb_publishable_...').
//                 It is meant to be public: the database rules decide what it may do.
//                 NEVER put the secret key ('sb_secret_...') or the database password here.
export const BACKEND = {
  enabled: true,
  url: 'https://auzqfqphiycppiwjplkl.supabase.co',
  publishableKey: 'sb_publishable_GM3Wy-nPH7WIeP2aaL16gA_XYK8--vh',
};

// True when the database is switched on AND filled in.
export function backendReady() {
  return BACKEND.enabled && BACKEND.url !== '' && BACKEND.publishableKey !== '';
}
