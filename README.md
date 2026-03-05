# ZoneWise.AI — Loan Application & Underwriting Platform

Dual-portal platform for hard money residential loan applications with AI-powered underwriting analysis and auto-generated pitch decks.

## Deploy in One Click

### Vercel (Recommended — Fastest)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/breverdbidder/zonewise-loans)

### Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create
2. Connect GitHub → Select `zonewise-loans`
3. Build command: `npm run build` | Output: `dist`
4. Deploy

## Enable Live Claude AI Underwriting

After deploying, add your Anthropic API key as an environment variable:

- **Vercel**: Settings → Environment Variables → `ANTHROPIC_API_KEY`
- **Cloudflare**: Settings → Environment Variables → `ANTHROPIC_API_KEY`

Without the API key, the platform uses a sophisticated algorithmic underwriting engine as fallback.

## Features

| Portal | Features |
|--------|----------|
| **Applicant** | 6-step application, file upload (plans/renderings), review & submit |
| **Admin** | Dashboard, application review, AI underwriting, auto pitch deck, approve/decline |

## Tech Stack
- React + Vite
- Claude Sonnet (AI Underwriting)
- Cloudflare Pages Functions / Vercel Serverless
- ZoneWise.AI Brand (Navy #1E3A5F / Orange #F59E0B)

## Architecture
```
zonewise-loans/
├── src/App.jsx          # Full dual-portal React app
├── functions/api/       # Cloudflare Pages Functions
│   └── underwrite.js    # Claude AI proxy
├── api/                 # Vercel Serverless Functions
│   └── underwrite.js    # Claude AI proxy
└── .github/workflows/   # CI/CD
    └── deploy.yml       # Auto-deploy to Cloudflare Pages
```

Built by ZoneWise.AI — Everest Capital USA
