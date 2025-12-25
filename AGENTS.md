# Codex instructions for this repository

## What Codex should do in GitHub reviews
- Prioritize security, correctness, and performance.
- Leave a short PR summary and only the most important line-level comments.
- When possible, provide minimal “Suggested change” patches.

## Security requirements
- No secrets in code, configs, logs, docs, examples, or tests.
- Flag any PII exposure risk. Require redaction and data minimization.
- Validate and sanitize all inputs. Treat external data as untrusted.
- Require secure defaults: TLS verification on, least-privilege access, minimal CORS, safe cookie settings.

## Performance and usage limits
- Add timeouts and bounded retries with backoff + jitter for external calls.
- Avoid unnecessary network calls and repeated work. Prefer caching and batching.
- For AI calls: enforce max tokens, max retries, max concurrency, and safe fallbacks.

## Documentation required
- Plain-language comments for non-obvious logic.
- Docstrings for public functions and modules.
- README updates for setup, configuration, run, test, and troubleshooting.
- Add a short “Why this design” note for significant changes.

## Dependency and vulnerability scanning
- Require pinned dependencies and lockfiles.
- Recommend one scanner per ecosystem:
  - Java: OWASP Dependency-Check or equivalent Gradle/Maven tooling.
  - Python: pip-audit and pinned requirements.
  - Node: npm audit and lockfile hygiene.

## Observability and privacy
- Use structured logs and request IDs.
- Never log secrets or PII. Add redaction rules where needed.
- Track latency and error rates for external calls and AI calls.

## Feature flags
- Any AI feature must be behind a feature flag and include a kill switch.
- Define a safe fallback behavior when the AI feature is disabled or rate-limited.

## Definition of done for changes
- Tests updated or added.
- Security notes documented in PR summary.
- Documentation updated.
- Lint and format pass.
