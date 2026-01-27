# VNE Inventory Reporting (Wix)

## Overview (ELI5)
Think of this as a “robot emailer” that sends your reps a weekly list of what you have in stock.
It runs in the background, grabs inventory data, calculates a few totals, and emails each rep.
You don’t need to touch your live Wix site pages to make it work.

The goal is to:

- Generate per-rep inventory counts, prices, stock-out dates, last-sold dates, images, and total value/COGS.
- Send those reports via email on a schedule.
- Keep the logic testable outside Wix while integrating with Wix services in production.

## How this maps to Wix
You *can* do this via Wix APIs using Velo:

- **Data source**: store inventory and rep assignments in Wix Data collections or pull from an external system.
- **Report generation**: use backend modules or an external service to compute the report.
- **Email delivery**: use Wix CRM Triggered Emails or an external email provider.
- **Scheduling**: use Wix Scheduled Jobs (weekly) to trigger report generation and sending.

See [`docs/wix-inventory-report.md`](docs/wix-inventory-report.md) for a detailed plan.

## Why this design
- **Security**: report logic runs server-side only, keeping inventory and pricing data out of the browser.
- **Testability**: core calculation code lives in `src/` and can be tested with Node's built-in test runner.
- **Portability**: the core logic can be used in Wix Velo or in an external server.
- **Centralized config**: update API endpoints or toggles in `src/reportConfig.js` once instead of hunting through code.

## Step-by-step setup (newbie friendly)
### Step 1: Decide where your inventory data lives
Pick one:
- **Wix Data** (recommended if you already store inventory in Wix).
- **External API** (use `REPORT_CONFIG.apiBaseUrl`).

### Step 2: Set your config values
Open `src/reportConfig.js` and update:
1. `reportEnabled` → `true` to send, `false` to stop sending.
2. `timeZone` → your timezone (or keep `UTC`).
3. `apiBaseUrl` → your external API base URL (only if not using Wix Data).

### Step 3: Set your email list
Add default recipients in `DEFAULT_RECIPIENTS` and add any new recipients using
the `buildRecipientList` helper.

### Step 4: Add your Wix Scheduled Job
Create a Scheduled Job in Wix that runs weekly. That job should:
1. Load inventory data (Wix Data or external API).
2. Call the report helpers in `src/inventoryReport.js`.
3. Send a Wix Triggered Email to each rep.
4. Exit early if `reportEnabled` is `false`.

### Step 5: Test locally (optional but recommended)
```bash
npm test
```

## If you don’t see the changes
1. Pull the latest commits from the repo (or refresh your GitHub view).
2. Confirm `README.md` was updated in the most recent commit.
3. If you still don’t see the updates, re-open this file locally and verify the “Step-by-step setup” section exists.

## Getting started
### Prerequisites
- Node.js 18+

### Install
No dependencies are required beyond Node.js.

## Configuration
- **No secrets in code**. Use Wix Secrets Manager or environment variables in external services.
- **Input validation** is required for all external data sources.
- **Kill switch**: use `REPORT_CONFIG.reportEnabled` to disable sending without code edits.
- **Recipients**: store default recipients in `DEFAULT_RECIPIENTS` and extend using `buildRecipientList`.
- **API base URL**: configure `REPORT_CONFIG.apiBaseUrl` if you are pulling inventory from an external API.

## Troubleshooting
- If tests fail with a Node version error, upgrade to Node 18+.
- If report dates look off, verify `asOfDate` and ensure UTC is used consistently.
