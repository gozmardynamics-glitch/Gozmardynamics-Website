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
    supabaseUrl: "https://izjnlrnwwcljqkrxnkai.supabase.co", // Project URL; do not include /rest/v1/
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5scm53d2NsanFrcnhua2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mjg5MjEsImV4cCI6MjEwMzQwNDkyMX0._GR5dpl2LC5Hq-28RxJVITLNRH7uOn21H0s3tV_nzgs", // public anon key
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
    authEnabled: true         // admin login is required when Supabase is configured
};
