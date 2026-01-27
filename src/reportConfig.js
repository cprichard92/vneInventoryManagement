/**
 * Centralized configuration values for the inventory reporting flow.
 *
 * Keep variables declared here so updates only happen in one place.
 */

export const REPORT_CONFIG = Object.freeze({
  /**
   * Toggle to enable/disable report delivery without code changes.
   * In Wix, map this to a Secrets Manager or a Data collection flag.
   */
  reportEnabled: true,
  /**
   * Default reporting cadence for documentation and scheduling reference.
   */
  cadence: "weekly",
  /**
   * Default time zone for report rendering.
   */
  timeZone: "UTC",
  /**
   * Base URL for external inventory APIs if you are not using Wix Data.
   * Keep this in one place so changes do not require code edits elsewhere.
   */
  apiBaseUrl: "https://api.example.com",
});

export const DEFAULT_RECIPIENTS = Object.freeze([
  "rep@example.com",
]);
