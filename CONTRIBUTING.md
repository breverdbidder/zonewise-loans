# Contributing to ZoneWise.AI Loans

## Development Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/breverdbidder/zonewise-loans.git
   cd zonewise-loans
   cp .env.example .env
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests before pushing:
   ```bash
   npm test
   ```

## Code Standards

- All scoring functions must have JSDoc with `@param` and `@returns`
- New loan types require: form fields, scoring engine, admin detail view, and tests
- Constants go in `src/utils/constants.js` — no magic numbers in components
- Admin authorization is server-side only via `user_roles` table

## File Structure

| Directory | Purpose |
|-----------|---------|
| `src/scoring/` | Underwriting scoring engines (one per loan type) |
| `src/utils/` | Shared constants, helpers, admin auth |
| `src/__tests__/` | Jest test suites |
| `functions/api/` | Cloudflare Pages Functions |

## Security Rules

- NEVER hardcode API keys, admin emails, or secrets in source
- NEVER commit `.env` files
- Admin access must be checked server-side via Supabase RLS
- All user data access must go through RLS-protected queries
