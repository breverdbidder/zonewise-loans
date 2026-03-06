# ZoneWise.AI — Loan Application & Underwriting Platform

Multi-portal platform for real estate loan applications with AI-powered underwriting, supporting 4 loan products: Hard Money, Construction, DSCR, and No-Doc loans.

**Live:** [zonewise-loans.pages.dev](https://zonewise-loans.pages.dev)

## Loan Products

| Product | Use Case | Key Feature |
|---------|----------|-------------|
| **Hard Money** | Fix & flip, bridge, investment | ARV-based underwriting, rehab budget analysis |
| **Construction** | Ground-up builds, major renovation | Draw schedule, permit tracking, GC contract status |
| **DSCR** | Rental income investors | Live DSCR calculator (Rent ÷ PITIA), no W-2 required |
| **No-Doc** | Self-employed, bank statement, assets | 4 subtypes: Bank Statement, Asset Depletion, P&L, NINA |

## Architecture

```
zonewise-loans/
├── src/
│   ├── App.jsx              # Main application (dual-portal)
│   ├── Auth.jsx             # Supabase Auth (login/signup/reset)
│   ├── supabase.js          # Supabase client configuration
│   ├── scoring/
│   │   └── dscr.js          # DSCR underwriting engine (100-point matrix)
│   ├── utils/
│   │   ├── constants.js     # Colors, loan types, scoring thresholds
│   │   └── adminAuth.js     # Server-side admin role verification
│   └── __tests__/
│       └── scoring.test.js  # 20+ unit tests for scoring engines
├── functions/api/
│   └── underwrite.js        # Cloudflare Pages Function (AI proxy)
├── .env.example             # Required environment variables
└── .github/workflows/
    └── deploy.yml           # Auto-deploy on push
```

## Security

| Layer | Implementation |
|-------|---------------|
| Authentication | Supabase Auth (bcrypt, HaveIBeenPwned, token rotation) |
| Authorization | Server-side `user_roles` table (no client-side whitelist) |
| Data Access | Row Level Security — users see only their own applications |
| Admin Gate | 3-layer: Supabase role check → hidden UI → password re-auth |
| Transport | TLS 1.3 via Cloudflare (HSTS) |
| Passwords | bcrypt hash, change notifications enabled |

## Setup

```bash
git clone https://github.com/breverdbidder/zonewise-loans.git
cd zonewise-loans
cp .env.example .env  # Fill in your keys
npm install
npm run dev           # http://localhost:5173
npm test              # Run scoring engine tests
```

## Underwriting Engines (100-Point Scoring Matrix)

| Engine | Key Factors | Thresholds |
|--------|-------------|------------|
| Hard Money | LTV (25), Credit (20), Experience (20), Liquidity (15) | ≥82 APPROVE |
| Construction | LTC, permits, plans, GC contract, completed value | ≥82 APPROVE |
| DSCR | DSCR Ratio (30), Credit (20), LTV (20), Reserves (15) | ≥82 APPROVE |
| No-Doc | Credit (25), LTV (20), Assets (20), Down% (15) | ≥80 APPROVE |

## Tech Stack

React 19 + Vite · Supabase Auth & PostgreSQL · Claude Sonnet AI · Cloudflare Pages · GitHub Actions CI/CD

## License

Proprietary — Everest Capital USA / ZoneWise.AI
