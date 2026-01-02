# Integrity Rating Standard (IRS)

<img width="845" height="1016" alt="Capture d’écran 2026-01-02 à 16 52 07" src="https://github.com/user-attachments/assets/575366b2-7503-4a72-9c5c-910bc48e1ef9" />

Integrity Rating Standard ($IRS) is a community-driven safety standard and verification framework for Pump.fun launches on Solana. It provides transparent, open-source checks and a public dashboard that outputs a risk score and rating for a token launch.

IMPORTANT LEGAL & USAGE DISCLAIMERS (MUST BE READ):
- Not affiliated with the IRS (Internal Revenue Service) or any government entity.
- This is not legal advice and not financial advice.
- No guarantees of profit, loss prevention, or that a launch is "scam-proof".
- The system provides risk signals and checklists only; it does not enforce any action on Pump.fun or other platforms.

Quick summary
- Project: Integrity Rating Standard (ticker: $IRS)
- Target: Solana SPL tokens (focused on Pump.fun launches)
- Output: explainable, signed JSON reports containing a score (0–100), rating (PASS/WARN/FAIL), checklist and evidence.

How scoring works (high level)
- Deterministic TypeScript Rules Engine (`@irs/rules`) inspects a `TokenSnapshot` and a `RuleConfig`.
- Rules include: mint authority, freeze authority, supply mutability, holder concentration (top1/top5/top10), known-risk lists, optional heuristics.
- Each rule returns a checklist item with `ruleId`, `status`, `title`, `explanation`, and `evidence` — enabling explainability and auditability.

Roadmap
- v0.1 (MVP) — deterministic rules engine, worker indexer, signed reports, public dashboard, basic admin console. (current)
- v0.2 — clustering heuristics, enhanced on-chain metadata parsing, rate-limiting, admin audit logs, pagination for indexer snapshots.
- v0.3 — automated alerting, community-curated known-risk list UI, richer analytics (time-series snapshots), deployment templates.
- v1.x — optional distributed attestation registry, on-chain anchoring, identity-sybil detection, integrations with exchanges and listing sites.

Tokenomics (example / informational only)
- Token: IRS (example token design for governance & curation)
- Total supply: 1,000,000 IRS
- Allocation:
	- 40% Community & Incentives (400,000)
	- 20% Treasury / Grants (200,000)
	- 15% Team (vesting 2 years) (150,000)
	- 10% Early contributors / advisors (vesting 1 year) (100,000)
	- 10% Liquidity (100,000)
	- 5% Reserve (50,000)

Notes on tokenomics
- The IRS project does not provide investment advice. The example above is a suggested allocation only and must be adapted by projects building around the standard.

How to run locally (developer quickstart)
1) Install dependencies (root):
```bash
pnpm install
```

2) Start local Postgres for dev (infra):
```bash
docker-compose -f infra/docker-compose.yml up -d
```

3) Copy environment example and edit `.env`:
```bash
cp infra/.env.example .env
# Edit .env to set DATABASE_URL and SIGNER_SECRET_BASE64
```

4) Apply Prisma migrations and generate client (from packages/db):
```bash
cd packages/db
pnpm install
pnpm prisma:generate
pnpm migrate
```

5) Start the web app (apps/web):
```bash
cd apps/web
pnpm install
pnpm dev
```

6) Run the worker for a mint (apps/worker):
```bash
cd apps/worker
pnpm install
export MINT=YourMintAddressHere
export SIGNER_SECRET_BASE64=<base64-secret>
pnpm run dev
```

API examples
- Get latest report for a mint (replace MINT):
```bash
curl -s http://localhost:3000/api/report/MINT | jq
```

Verify report signature (Node example)
```ts
import { verifyMessage } from '@irs/crypto'

const report = /* JSON fetched from API */
const payload = new TextEncoder().encode(JSON.stringify({ id: report.id, mint: report.mint, score: report.score }))
const signatureBase64 = report.signature
const publicKeyBytes = /* decode base58 report.signerPubkey to Uint8Array */
const ok = verifyMessage(payload, signatureBase64, publicKeyBytes)
console.log('signature valid', ok)
```

Client-side verification
- The dashboard includes an in-browser verifier to check the base64 signature using the `signerPubkey` included in the report. This enables trustless verification: any user can independently verify a report was signed by the configured operator key.

Admin & Config
- Configs are versioned (`RuleConfig.version`). Admins may publish new configs but cannot alter historical reports. The DB model enforces immutability by storing reports as append-only entries.

Security & Responsible Disclosure
- Input validation: Zod schemas validate all incoming data and config payloads.
- Rate limiting: public API endpoints should be protected behind rate limits and/or CDN/edge rules in production.
- Secrets: use environment variables (`.env`) or a secrets manager. Do not commit `.env` to the repo.
- To report security issues, open a private issue or use the repository's security contact.

Contributing
- See `docs/` for the rules specification and threat model.
- Run tests locally: `pnpm test`.
- Submit pull requests for code changes; include tests and update docs.

License
- MIT

Files of interest
- `packages/rules/src/index.ts` — deterministic rules engine
- `packages/crypto/src/index.ts` — signing & verification helpers
- `apps/worker/src/index.ts` — indexer / report generator
- `apps/web/pages/report/[mint].tsx` — report viewer with verification UI

Again: IMPORTANT DISCLAIMERS (MUST APPEAR IN UI & DOCS)
- Not affiliated with the IRS (Internal Revenue Service) or any government entity.
- Not legal advice and not financial advice.
- No guarantees of profit, loss prevention, or that any launch is "scam-proof".
- This tool provides risk signals and checklists only; it does not e

<img width="1344" height="768" alt="Gemini_Generated_Image_gxdkfdgxdkfdgxdk" src="https://github.com/user-attachments/assets/e71fba3d-ca46-4eb5-8bcb-3847f0409440" />
nforce actions on Pump.fun.
