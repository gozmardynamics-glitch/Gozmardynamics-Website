/* ==========================================================================
   Gozmar CMS — backend configuration
   Fill these in to enable the PocketBase backend.
   Until then the CMS runs in LOCAL mode (browser localStorage only).

   For full step-by-step setup instructions, see DEPLOYMENT.md

   QUICK START:
   1. Deploy PocketBase on Coolify (one-click service)
   2. Open the PocketBase admin UI at <your-pocketbase-url>/_/
   3. Create a collection called "cms_content" with a JSON field called "data"
   4. Set API rules: list/view = "" (public), create/update/delete = "@request.auth.id != ''"
   5. Create a user in the "users" collection (this is your CMS login)
   6. Copy the PocketBase URL below (without /_/ at the end)
   ========================================================================== */
window.CMS_CONFIG = {
    /* ---------- PocketBase ---------- */
    pocketbaseUrl: "",        // Your PocketBase URL, e.g. "https://pb.gozmardynamics.com"
                              // NO trailing slash, NO /_/ — just the base URL
    collection: "cms_content", // The collection name (created in PocketBase admin UI)
    authCollection: "users",   // The auth collection (default: "users")

    /* ---------- Google Analytics ---------- */
    gaMeasurementId: "",      // Your GA4 measurement ID, e.g. "G-XXXXXXXXXX"
                              // Get it from https://analytics.google.com/
                              // Leave empty to disable analytics

    /* ---------- Admin login ---------- */
    authEnabled: true         // When true + pocketbaseUrl is set, admin login is required
};
