/* ==========================================================================
   Gozmar CMS — backend configuration (placeholders)
   Fill these in to enable the Supabase backend + GitHub "publish to Git".
   Until then the CMS runs in LOCAL mode (browser localStorage only).

   HOW TO FILL:
   1. Create a Supabase project (free tier is enough for this single site).
   2. Run supabase/schema.sql in the Supabase SQL editor (creates cms_content + RLS).
   3. Project Settings → API: copy "Project URL" and "anon public" key below.
   4. (Optional) GitHub publish: enable, set owner/repo, and either click the
      "Publish to Git" button (needs a PAT) OR just run the
      "Publish CMS content to Git" workflow manually in GitHub Actions.
   ========================================================================== */
window.CMS_CONFIG = {
    /* ---------- Supabase ---------- */
    supabaseUrl: "",          // e.g. https://abcd1234.supabase.co
    anonKey: "",              // public anon key (safe to ship to the browser)
    table: "cms_content",
    rowId: 1,                 // single-row table; content lives in `data` (jsonb)

    /* ---------- GitHub "publish to Git" (bakes content into the repo) ---------- */
    github: {
        enabled: false,       // set true to enable the in-admin Publish button
        owner: "",             // GitHub owner / org, e.g. "gozmardynamics"
        repo: "",              // repo name, e.g. "Gozmar-Dynamics-Website"
        token: ""              // GitHub PAT with `repo` scope. Prefer running the
                               // GitHub Action manually instead of storing a token here.
    },

    /* ---------- Admin login (Supabase Auth) ---------- */
    authEnabled: false        // when true, wire a login UI; writes require an admin session
};
