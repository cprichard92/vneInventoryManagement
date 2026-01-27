# VNE Inventory Reporting (Wix)

## Overview
This repository provides a secure, minimal reference implementation for building a **weekly inventory report** for sales reps (and later buyers) using Wix. The goal is to:

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

## Getting started
### Prerequisites
- Node.js 18+

### Install
No dependencies are required beyond Node.js.

### Run tests
```bash
npm test
```

## Configuration
- **No secrets in code**. Use Wix Secrets Manager or environment variables in external services.
- **Input validation** is required for all external data sources.
- **Kill switch**: use `REPORT_CONFIG.reportEnabled` to disable sending without code edits.
- **Recipients**: store default recipients in `DEFAULT_RECIPIENTS` and extend using `buildRecipientList`.
- **API base URL**: configure `REPORT_CONFIG.apiBaseUrl` if you are pulling inventory from an external API.

## Troubleshooting
- If tests fail with a Node version error, upgrade to Node 18+.
- If report dates look off, verify `asOfDate` and ensure UTC is used consistently.
