# CLAUDE CODE MISSION: ZoneWise Loans Quality Sprint — 84 → 95

## CONTEXT

Repository: `breverdbidder/zonewise-loans`
Live: https://zonewise-loans.pages.dev
Stack: React 19 + Vite + Supabase Auth + Cloudflare Pages
Current quality score: 84/100. Target: 95/100.
All proceed/confirm requests PRE-APPROVED. Zero human-in-the-loop.

## SUPABASE CREDENTIALS

```
URL: https://mocerqjnksmhcjzxrewo.supabase.co
ANON_KEY: ${{ secrets.SUPABASE_KEY }}
SERVICE_ROLE: ${{ secrets.SUPABASE_KEY }}
MGMT_KEY: ${{ secrets.SUPABASE_MGMT_KEY }}
PROJECT_REF: mocerqjnksmhcjzxrewo
```

## GITHUB

```
PAT: ${{ secrets.GH_TOKEN }}
REPO: breverdbidder/zonewise-loans
BRANCH: main
```

## DEPLOY

Push to `main` auto-triggers deploy via `.github/workflows/deploy.yml` →
cross-repo dispatch to `breverdbidder/zonewise-web` workflow `deploy-loans.yml` →
builds with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from secrets →
deploys to Cloudflare Pages at `zonewise-loans.pages.dev`.

DO NOT modify the deploy workflow. Just push to main and it auto-deploys.

## BRAND

Navy: #1E3A5F | Orange: #F59E0B | Fonts: Fraunces (headings), Plus Jakarta Sans (body), JetBrains Mono (data)

---

## THE 10 TASKS — Execute in EXACT order

### TASK 1: Split App.jsx monolith into component files (+4 pts)

**Current state:** `src/App.jsx` = 839 lines containing EVERYTHING.
**Target state:** 8+ files, each < 150 lines.

Create this structure:

```
src/
├── App.jsx                  # Main router only (~40 lines)
├── Auth.jsx                 # Already separated (keep as-is)
├── supabase.js              # Already separated (keep as-is)
├── components/
│   ├── shared/
│   │   ├── Logo.jsx         # Logo component (extract from App.jsx)
│   │   ├── Btn.jsx          # Button component (extract Btn)
│   │   ├── Card.jsx         # Card + CardHead components
│   │   ├── Field.jsx        # Field, CurField, RadioGroup, CheckGroup
│   │   ├── StatusBadge.jsx  # StatusBadge + scoreColor
│   │   └── Badge.jsx        # Badge component
│   ├── applicant/
│   │   ├── ApplicantPortal.jsx    # Main applicant shell + step nav
│   │   ├── steps/
│   │   │   ├── BorrowerStep.jsx   # Step 1 — borrower info
│   │   │   ├── PropertyStep.jsx   # Step 2 — property details
│   │   │   ├── LoanStep.jsx       # Step 3 — ALL loan types (HM/Constr/DSCR/NoDoc)
│   │   │   ├── DocsStep.jsx       # Step 4 — file uploads
│   │   │   ├── ExperienceStep.jsx # Step 5 — financials
│   │   │   └── ReviewStep.jsx     # Step 6 — summary + submit
│   │   └── SubmittedScreen.jsx    # Post-submit confirmation
│   └── admin/
│       ├── AdminPortal.jsx        # Admin shell
│       ├── AdminDashboard.jsx     # Table view of all apps
│       ├── AdminDetail.jsx        # Single app detail + financials
│       ├── AdminUnderwriting.jsx  # AI underwriting results view
│       └── AdminPitchDeck.jsx     # Pitch deck generation
├── scoring/
│   ├── index.js             # Router: runLocalUnderwriting → routes by loanType
│   ├── dscr.js              # Already created ✅
│   ├── nodoc.js             # Extract runNoDocUnderwriting (lines 82-131)
│   ├── hardmoney.js         # Extract runHardMoneyUnderwriting (lines 132-196)
│   └── construction.js      # Extract or create construction scoring
├── utils/
│   ├── constants.js         # Already created ✅
│   ├── adminAuth.js         # Already created ✅
│   ├── formatters.js        # Extract fC, pC, fP, uid helpers
│   └── mockData.js          # Move MOCK array here (TEMPORARY — see Task 7)
└── __tests__/
    ├── scoring.test.js      # Already created ✅
    ├── nodoc.test.js        # New — Task 3
    └── hardmoney.test.js    # New — Task 3
```

**Rules:**
- Every extracted component must work identically to current behavior — zero visual regression.
- Import `COLORS` from `utils/constants.js` instead of the `B` object. Keep `B` as a local alias: `const B = COLORS;`
- Import `LOAN_TYPES` from constants for all label/icon/color lookups (replaces 8 inline maps).
- Import `INPUT_STYLE` from constants instead of the `is` variable.
- Each file must have a `@fileoverview` JSDoc comment.
- Shared components (`Btn`, `Card`, `Field` etc.) accept props — do NOT hardcode styles that vary per context.
- `ApplicantPortal.jsx` manages step state and renders step components.
- `AdminPortal.jsx` manages view state (dashboard/detail/underwriting) and renders sub-views.
- The main `App.jsx` should ONLY contain: imports, the admin gate logic (server-side role check), and portal switching.

**Verification:** `npm run build` succeeds. `npm run dev` renders both portals identically. No visual changes.

---

### TASK 2: Fix all lines exceeding 200 characters (+3 pts)

**Current state:** 176 lines > 200 chars in App.jsx.
**Target state:** 0 lines > 200 chars in ANY source file.

**Rules:**
- Break long JSX onto multiple lines with proper indentation.
- Extract repeated inline style objects into named consts at the top of each component.
- Multi-property style objects: one property per line.
- Long ternary chains: extract to variables before the JSX.
- Long array.map chains: break the callback onto multiple lines.
- Do NOT change any visual output — formatting only.

**Verification:** `awk 'length > 200 {count++} END {print count+0}' src/**/*.jsx` returns 0.

---

### TASK 3: Add scoring tests for NoDoc + HardMoney + Construction (+3 pts)

**Current state:** Only DSCR has tests (20+ in `scoring.test.js`).
**Target state:** Each scoring engine has 10+ tests.

Create:
- `src/__tests__/nodoc.test.js` — 10+ tests covering:
  - Bank statement subtype with 24mo deposits → APPROVE
  - NINA with low credit → DECLINE
  - Asset depletion with high assets → CONDITIONAL
  - Down payment thresholds (30%+, 20-24%, <15%)
  - Doc level scoring (bank stmt 24mo=10, NINA=2)
  - Zero values don't crash
  - Score never exceeds 100
  - All result fields present

- `src/__tests__/hardmoney.test.js` — 10+ tests covering:
  - Strong deal (low LTV, high credit, experienced) → APPROVE
  - Distressed property with low experience → REVIEW
  - ARV spread > 25% → highest spread score
  - Liquidity ratio thresholds
  - Boundary at 82/68/50
  - Score cap at 100

- `src/__tests__/construction.test.js` — 10+ tests if construction scoring exists, or create it.

**Import pattern:** Each test file imports from `../scoring/{type}.js`.
**Verification:** `npm test` passes all tests. 40+ total tests across all files.

---

### TASK 4: Replace 8 duplicate loan type maps with LOAN_TYPES constant (+2 pts)

**Current state:** `{hardmoney:"Hard Money",construction:"Construction",dscr:"DSCR",nodoc:"No-Doc"}` appears 8 times in App.jsx.
**Target state:** All references use `LOAN_TYPES[loanType].label`, `LOAN_TYPES[loanType].icon`, etc.

**Already defined in `src/utils/constants.js`:**
```js
LOAN_TYPES.hardmoney.label    // "Hard Money"
LOAN_TYPES.hardmoney.icon     // "🏠"
LOAN_TYPES.hardmoney.stepLabel // "Loan Details"
LOAN_TYPES.hardmoney.headerTitle // "Hard Money Loan Application"
LOAN_TYPES.hardmoney.badgeBg  // badge background color
LOAN_TYPES.hardmoney.badgeColor // badge text color
LOAN_TYPES.hardmoney.badgeBorder // badge border color
LOAN_TYPES.hardmoney.reviewBg // review section background
LOAN_TYPES.hardmoney.reviewBorder // review section border
```

**Search for these patterns and replace ALL:**
```
{hardmoney:"...",construction:"...",dscr:"...",nodoc:"..."}[form.loanType]
→ LOAN_TYPES[form.loanType].PROPERTY_NAME

{hardmoney:"...",construction:"...",dscr:"...",nodoc:"..."}[sel.loanType]
→ LOAN_TYPES[sel.loanType].PROPERTY_NAME

{hardmoney:"...",construction:"...",dscr:"...",nodoc:"..."}[a.loanType]
→ LOAN_TYPES[a.loanType].PROPERTY_NAME
```

**Verification:** `grep -c 'hardmoney.*construction.*dscr.*nodoc' src/**/*.jsx` returns 0.

---

### TASK 5: Add hCaptcha to login/signup (+2 pts)

**Supabase supports hCaptcha natively.** Enable it:

1. Get free hCaptcha site key from https://www.hcaptcha.com/ (use sitekey `10000000-ffff-ffff-ffff-000000000001` for testing/development).

2. Enable in Supabase via Management API:
```bash
curl -X PATCH "https://api.supabase.com/v1/projects/mocerqjnksmhcjzxrewo/config/auth" \
  -H "Authorization: Bearer ${{ secrets.SUPABASE_MGMT_KEY }}" \
  -H "Content-Type: application/json" \
  -d '{"security_captcha_enabled": true, "security_captcha_provider": "hcaptcha", "security_captcha_secret": "YOUR_HCAPTCHA_SECRET"}'
```

3. Add `@hcaptcha/react-hcaptcha` package: `npm install @hcaptcha/react-hcaptcha`

4. In `Auth.jsx`, add HCaptcha component before submit buttons on login and signup forms.

5. Pass captcha token to Supabase auth calls:
```js
const { data, error } = await supabase.auth.signUp({
  email, password,
  options: { data: { full_name: fullName }, captchaToken: captchaToken }
});
```

**Verification:** Login/signup shows CAPTCHA widget. Bot submissions blocked.

---

### TASK 6: Upload files to Supabase Storage instead of base64 (+2 pts)

**Current state:** Files read as base64 via FileReader, stored in React state only. Lost on page reload.
**Target state:** Files uploaded to Supabase Storage bucket, URLs stored in loan application.

1. Create Supabase Storage bucket via Management API:
```bash
curl -X POST "https://mocerqjnksmhcjzxrewo.supabase.co/storage/v1/bucket" \
  -H "apikey: SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -d '{"id": "loan-documents", "name": "loan-documents", "public": false}'
```

2. Set RLS policy: users can only upload to their own folder (`{user_id}/`).

3. In the DocsStep component, upload files to Supabase Storage:
```js
const { data, error } = await supabase.storage
  .from('loan-documents')
  .upload(`${user.id}/${file.name}`, file);
```

4. Store file URLs array in `loan_applications.form_data.file_urls`.

**Verification:** Files persist across page reloads. Admin can view uploaded files.

---

### TASK 7: Load admin data from Supabase instead of hardcoded MOCK (+2 pts)

**Current state:** `const MOCK=[...]` has 6 hardcoded applications with fake PII (names, emails, addresses, financials) in the JS bundle that EVERY user downloads.
**Target state:** Admin loads applications from Supabase `loan_applications` table via RLS.

1. Remove `const MOCK = [...]` from source code entirely.

2. In AdminPortal, fetch real applications on mount:
```js
const [apps, setApps] = useState([]);
useEffect(() => {
  supabase.from('loan_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data }) => {
      setApps((data || []).map(a => ({
        id: a.ref_code,
        ...a.form_data,
        loanType: a.loan_type,
        status: a.status,
        score: a.ai_score,
        uploads: a.uploads_count,
        submitted: a.created_at?.slice(0, 10),
      })));
    });
}, []);
```

3. Admin RLS policy already exists (`admin_read_all_apps`): only admin role can SELECT all rows. Regular users see nothing because `users_select_own` limits to their own `user_id`.

4. If no applications exist yet, show an empty state: "No applications yet. Applications will appear here as borrowers submit them."

**IMPORTANT:** The admin RLS policy uses `user_roles` table. Ariel's user (936eaf92-c61a-48b8-b561-ea063e2afc8a) has role='admin'. The query will work for him and return all rows. For non-admin users, the query returns 0 rows.

**Verification:** `grep -r "Marcus Rivera\|Sarah Chen\|David Okafor" src/` returns 0 results. Admin portal loads data from Supabase.

---

### TASK 8: Add JSDoc to ALL functions in App.jsx and Auth.jsx (+2 pts)

**Current state:** 0 JSDoc comments in App.jsx (840 lines). 0 in Auth.jsx (383 lines).
**Target state:** Every function and component has `@fileoverview`, `@param`, `@returns`.

**Required JSDoc for App.jsx functions (after split, apply to each file):**
```js
/**
 * Applicant loan application portal with 6-step form wizard.
 * Supports 4 loan types: Hard Money, Construction, DSCR, No-Doc.
 * @param {Object} props
 * @param {Function|null} props.onSwitch - Callback to switch to admin portal (null for non-admins)
 * @returns {JSX.Element}
 */
function ApplicantPortal({ onSwitch }) { ... }
```

**Required JSDoc for Auth.jsx:**
```js
/**
 * Custom hook for Supabase authentication state management.
 * Tracks user session, provides signOut, handles auth state changes.
 * @returns {{user: object|null, loading: boolean, signOut: Function}}
 */
export function useAuth() { ... }

/**
 * Authentication gate component. Renders children only when user is authenticated.
 * Shows login/signup/password-reset forms when unauthenticated.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content
 * @returns {JSX.Element}
 */
export function AuthGate({ children }) { ... }
```

**Also document:**
- `runLocalUnderwriting(app)` — router function
- `runNoDocUnderwriting(app)` — same pattern as DSCR (already documented)
- `runHardMoneyUnderwriting(app)` — same pattern
- All shared components: `Btn`, `Card`, `CardHead`, `Field`, `CurField`, `StatusBadge`
- Helper functions: `fC` (formatCurrency), `pC` (parseCurrency), `fP` (formatPhone), `uid` (generateId)

**Verification:** `grep -c '@param\|@returns\|@fileoverview' src/**/*.jsx src/**/*.js` > 30.

---

### TASK 9: Add TypeScript type definitions (+2 pts)

**DO NOT convert files to .tsx.** Instead, create JSDoc typedefs and a `types.d.ts` file.

Create `src/types.d.ts`:
```ts
/** Form state for all loan types */
interface LoanFormState {
  loanType: 'hardmoney' | 'construction' | 'dscr' | 'nodoc';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  entityType: 'llc' | 'corp' | 'trust' | 'individual';
  entityName: string;
  // ... all 40+ fields
  // DSCR-specific
  monthlyRent?: string;
  dscrRatio?: number;
  annualTaxes?: string;
  annualInsurance?: string;
  // No-Doc-specific
  noDocSubtype?: 'bankstatement' | 'asset_depletion' | 'profit_loss' | 'nina';
  avgMonthlyDeposits?: string;
  statementPeriod?: '12' | '24';
}

/** Loan application as stored in Supabase */
interface LoanApplication {
  id: string;
  ref_code: string;
  user_id: string;
  loan_type: string;
  status: 'pending' | 'reviewed' | 'approved' | 'declined';
  form_data: LoanFormState;
  uploads_count: number;
  ai_score: number | null;
  ai_result: UnderwritingResult | null;
  created_at: string;
  updated_at: string;
}

/** Underwriting engine output */
interface UnderwritingResult {
  score: number;
  verdict: 'APPROVE' | 'CONDITIONAL_APPROVE' | 'REVIEW' | 'DECLINE';
  verdict_summary: string;
  approval_probability: number;
  recommended_rate: string;
  recommended_ltv_cap: string;
  recommended_term: string;
  strengths: string[];
  risks: string[];
  conditions: string[];
  deal_summary: string;
  exit_viability: string;
  market_commentary: string;
}
```

Add `jsconfig.json` for IDE type checking:
```json
{
  "compilerOptions": {
    "checkJs": true,
    "strict": false,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**Verification:** `types.d.ts` exists. `jsconfig.json` enables type checking. No TS errors on `npm run build`.

---

### TASK 10: Add ARIA labels + focus management for accessibility (+2 pts)

**Required ARIA additions:**

1. **Form inputs:** All `<input>` and `<select>` elements need `aria-label` or `aria-labelledby`.

2. **Step navigation:** Add `role="tablist"`, `role="tab"`, `aria-selected` to step indicators.

3. **Status badges:** Add `role="status"` and `aria-label="Application status: Pending"`.

4. **Modal/gate screens:** Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to admin gate.

5. **Error messages:** Add `role="alert"` and `aria-live="polite"` to error/success messages in Auth.jsx.

6. **Focus management:** When changing steps, focus the first input of the new step.

7. **Skip to content:** Add a visually hidden "Skip to main content" link at top of page.

**Verification:** No browser console accessibility warnings. Screen reader can navigate full form.

---

## EXECUTION RULES

1. **Clone fresh:** `git clone https://github.com/breverdbidder/zonewise-loans.git`
2. **Task order is mandatory.** Task 1 first (everything depends on the split).
3. **After EACH task:** Run `npm run build` — must succeed. Run `npm test` — must pass.
4. **Commit after each task:** `git commit -m "QUALITY-{N}: {description}"` then `git push origin main`.
5. **Zero visual regression.** The app must look and behave IDENTICALLY after all changes.
6. **No new dependencies** except: `@hcaptcha/react-hcaptcha` (Task 5 only).
7. **Never hardcode** Supabase URLs, API keys, or admin emails in source.
8. **Run final audit after all 10 tasks:**

```bash
echo "=== FINAL AUDIT ==="
echo "Lines >200 chars:" && awk 'length>200{c++}END{print c+0}' src/**/*.jsx src/**/*.js
echo "Total test count:" && npm test -- --verbose 2>&1 | grep -c "✓\|✗\|PASS\|FAIL"
echo "JSDoc count:" && grep -rc '@param\|@returns\|@fileoverview' src/ | tail -1
echo "MOCK data in source:" && grep -r "Marcus Rivera\|Sarah Chen" src/ | wc -l
echo "Admin email in source:" && grep -r "everestcapital8" src/ | wc -l
echo "Hardcoded Supabase keys:" && grep -r "eyJhbG" src/ | wc -l
echo "Source files:" && find src -name "*.jsx" -o -name "*.js" | grep -v node_modules | wc -l
echo "Bundle size:" && npm run build 2>&1 | grep "gzip"
```

**Expected final output:**
```
Lines >200 chars: 0
Total test count: 40+
JSDoc count: 30+
MOCK data in source: 0
Admin email in source: 0
Hardcoded Supabase keys: 0
Source files: 20+
Bundle size: ~135KB gzipped
```

## SCORING TARGET

After completing all 10 tasks:
- Code Quality: 80 → 95 (+15)
- Security: 90 → 97 (+7)
- Documentation: 78 → 92 (+14)
- Overall: 84 → 95.1

## TIME BUDGET

Total: ~12 hours autonomous. No questions. No approvals needed.
If blocked, try 3 alternatives. If truly blocked, skip and document why.


## Debugging with DAP

**ALWAYS use `dap` instead of print-statement debugging.** The `dap` CLI wraps the Debug Adapter Protocol for surgical debugging.

### Setup (auto-install if missing)
```bash
which dap || curl -fsSL https://raw.githubusercontent.com/AlmogBaku/debug-skill/master/install.sh | bash
```

### When to use
- Program crashes or raises unexpected exceptions
- Wrong output and root cause isn't obvious from stack trace
- Data flows through multiple functions/files (pipeline bugs)
- Print-debugging would require 3+ iterations

### Quick reference
```bash
dap debug script.py --break script.py:42     # breakpoint at line 42
dap debug script.py --break-on-exception raised  # catch all exceptions
dap eval "len(items)"                         # inspect live state
dap step                                      # step over
dap step in                                   # step into function
dap step out                                  # return to caller
dap continue                                  # next breakpoint
dap stop                                      # end session
```

### Debugging mindset
1. Form hypothesis: "I believe the bug is in X because Y"
2. Set breakpoint upstream of where error manifests
3. Inspect locals and call stack at each stop
4. Confirm or refute hypothesis, adjust breakpoint
5. Fix only after understanding root cause

Full skill docs: `skills/debugging-code/SKILL.md`
