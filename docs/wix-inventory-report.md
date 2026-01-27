# Wix Inventory Report Plan

## Goal
Send weekly, per-rep inventory reports that include:
- Inventory counts
- Item prices
- Expected stock-out dates
- Product images
- Last sold dates
- Total value
- Total cost of goods sold

## Architecture (Wix-first)
1. **Data source**
   - Store inventory and rep assignments in Wix Data collections, *or* pull from an external system.
   - Treat all inputs as untrusted and validate values before use.

2. **Backend report generation**
   - Use Velo backend modules to compute reports (see `src/inventoryReport.js` for shared logic).
   - Keep all pricing and inventory data server-side to avoid leakage.

3. **Email delivery**
   - Prefer Wix CRM Triggered Emails.
   - Use templates with minimal dynamic fields to reduce leakage risk.

4. **Scheduling**
   - Use Wix Scheduled Jobs to run weekly.
   - Store last-run timestamps to avoid duplicate sends.
   - Check a kill switch (for example `REPORT_CONFIG.reportEnabled`) before sending.

## No-site-interaction option
If you want this to run without editing the live site UI, keep all logic in **Velo backend files** and **Scheduled Jobs**. This runs entirely server-side and does not require any page code changes.

## Google Apps Script alternative
You can also run the schedule in Google Apps Script if your data already lives in Google Sheets. In that case, keep the same validation and kill-switch behavior, but Wix Scheduled Jobs are preferred when inventory lives in Wix.

## Security considerations
- **Never log inventory, prices, or email addresses**.
- Use Wix Secrets Manager for credentials.
- Validate and sanitize all fields before calculating reports.
- Send only the minimum data required to each rep.

## Performance and usage limits
- Batch items per rep to minimize compute and API calls.
- Add timeouts and bounded retries (with jitter) when calling external APIs.
- Cache static catalog metadata where possible.

## Implementation steps
1. **Model collections** (inventory, reps, assignments).
2. **Build shared calculation logic** in `src/`.
3. **Create a backend module** that:
   - Queries inventory + assignments.
   - Builds per-rep reports.
4. **Create a scheduled job** that:
   - Invokes report generation.
   - Sends Triggered Emails to reps.
   - Exits early if the kill switch is off.
5. **Extend to buyers** by reusing the same job with a different recipient list.

## Why this design
This splits responsibilities cleanly: Wix handles scheduling and email delivery while shared logic stays testable and portable.
