/* ==========================================================================
   Gozmar CMS — backend configuration
   Fill these in to enable the PocketBase backend.
   Until then the CMS runs in LOCAL mode (browser localStorage only).

   HOW TO FILL:
   1. Deploy PocketBase on Coolify (one-click service).
   2. In PocketBase admin (/_/), create a collection called "cms_content"
      with a JSON field called "data".
   3. Set the collection rule: list/search = "" (public), create/update = "@request.auth.id != ''".
   4. Create an admin user in the "users" collection.
   5. Copy the PocketBase URL below.
   ========================================================================== */
window.CMS_CONFIG = {
    /* ---------- PocketBase ---------- */
    pocketbaseUrl: "",        // e.g. "https://pb.gozmardynamics.com" or Coolify-generated URL
    collection: "cms_content",
    authCollection: "users",

    /* ---------- Google Analytics ---------- */
    gaMeasurementId: "",      // e.g. "G-XXXXXXXXXX" — get from https://analytics.google.com/

    /* ---------- Admin login ---------- */
    authEnabled: true         // admin login is required when PocketBase is configured
};
