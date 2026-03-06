/**
 * @fileoverview Agent 1: Deal Screener (BOUT-SCR-01)
 * @module agents/dealScreener
 *
 * Auto-triggered on every loan application submission.
 * Calculates going-in cap rate, cash-on-cash Y1, levered IRR,
 * unlevered IRR, equity multiple, and pass/fail gate.
 *
 * Feeds directly into Synthesis Agent for APPROVE/REVIEW/DECLINE.
 *
 * Avatars: Hard Money, DSCR, Construction
 */

const THRESHOLDS = {
  MIN_IRR: 12,        // Minimum levered IRR to pass
  MIN_COC: 6,         // Minimum cash-on-cash Y1 %
  MIN_CAP: 5,         // Minimum going-in cap rate %
  MIN_EQUITY_MULT: 1.3, // Minimum equity multiple
};

/**
 * Calculate annual debt service
 * @param {number} loanAmt - Loan principal
 * @param {number} rate - Annual interest rate (decimal)
 * @param {number} amortYears - Amortization period in years (0 = IO)
 * @param {number} ioPeriodMonths - Interest-only period in months
 * @returns {{ annual: number, monthly: number }}
 */
function calcDebtService(loanAmt, rate, amortYears = 0, ioPeriodMonths = 0) {
  if (!loanAmt || !rate) return { annual: 0, monthly: 0 };
  const monthlyRate = rate / 12;
  let monthly;
  if (amortYears <= 0 || ioPeriodMonths > 0) {
    monthly = loanAmt * monthlyRate; // IO
  } else {
    const n = amortYears * 12;
    monthly = loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }
  return { annual: monthly * 12, monthly };
}

/**
 * Estimate levered IRR using simplified DCF
 * @param {number} equity - Initial equity investment
 * @param {number[]} cashFlows - Annual cash flows (after debt service)
 * @param {number} terminalValue - Sale proceeds minus loan payoff
 * @returns {number} IRR as percentage
 */
function estimateIRR(equity, cashFlows, terminalValue) {
  if (!equity || equity <= 0) return 0;
  const flows = [-equity, ...cashFlows];
  flows[flows.length - 1] += terminalValue;

  let lo = -0.5, hi = 2.0;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    let npv = 0;
    for (let i = 0; i < flows.length; i++) {
      npv += flows[i] / Math.pow(1 + mid, i);
    }
    if (npv > 0) lo = mid;
    else hi = mid;
    if (Math.abs(hi - lo) < 0.0001) break;
  }
  return ((lo + hi) / 2) * 100;
}

/**
 * Run the 5-Minute Deal Screener
 * @param {Object} app - Loan application data
 * @param {string} app.loanType - hardmoney | dscr | construction | nodoc
 * @param {number} app.purchasePrice - Purchase price
 * @param {number} app.loanAmt - Loan amount requested
 * @param {number} [app.arv] - After repair value
 * @param {number} [app.repairBudget] - Renovation budget
 * @param {number} [app.monthlyRent] - Monthly rental income (DSCR)
 * @param {number} [app.noi] - Net operating income (if known)
 * @param {number} [app.holdPeriod] - Hold period in years (default 1 for flip, 5 for rental)
 * @param {number} [app.exitCapRate] - Exit cap rate (default 7%)
 * @param {number} [app.rentGrowth] - Annual rent growth rate (default 3%)
 * @param {number} [app.interestRate] - Loan interest rate (decimal, default from scoring)
 * @returns {Object} Screening result with metrics and pass/fail
 */
export function runDealScreener(app) {
  const isFlip = app.loanType === "hardmoney";
  const isConstruction = app.loanType === "construction";
  const holdPeriod = app.holdPeriod || (isFlip ? 1 : 5);
  const exitCapRate = (app.exitCapRate || 7) / 100;
  const rentGrowth = (app.rentGrowth || 3) / 100;

  // Estimate NOI
  let yearOneNOI;
  if (app.noi) {
    yearOneNOI = app.noi;
  } else if (app.monthlyRent) {
    const grossRent = app.monthlyRent * 12;
    const vacancy = grossRent * 0.05;
    const opex = grossRent * 0.35; // 35% expense ratio default
    yearOneNOI = grossRent - vacancy - opex;
  } else if (isFlip) {
    // Flip: NOI = projected profit / hold period
    const profit = (app.arv || 0) - (app.purchasePrice || 0) - (app.repairBudget || 0);
    yearOneNOI = profit > 0 ? profit : 0;
  } else {
    yearOneNOI = 0;
  }

  // Core metrics
  const totalCost = (app.purchasePrice || 0) + (app.repairBudget || 0);
  const goingInCap = app.purchasePrice > 0 ? (yearOneNOI / app.purchasePrice) * 100 : 0;
  const equity = totalCost - (app.loanAmt || 0);
  const rate = app.interestRate || 0.095; // default 9.5%
  const ds = calcDebtService(app.loanAmt, rate);

  // Cash-on-cash Y1
  const cashFlowY1 = isFlip ? 0 : yearOneNOI - ds.annual;
  const cocY1 = equity > 0 ? (cashFlowY1 / equity) * 100 : 0;

  // Multi-year cash flows for IRR
  const cashFlows = [];
  for (let y = 1; y <= holdPeriod; y++) {
    const noiY = isFlip ? 0 : yearOneNOI * Math.pow(1 + rentGrowth, y - 1);
    cashFlows.push(noiY - ds.annual);
  }

  // Terminal value
  let terminalValue;
  if (isFlip || isConstruction) {
    const salePrice = app.arv || app.completedValue || app.purchasePrice;
    const sellingCosts = salePrice * 0.06; // 6% closing
    terminalValue = salePrice - sellingCosts - (app.loanAmt || 0);
  } else {
    const terminalNOI = yearOneNOI * Math.pow(1 + rentGrowth, holdPeriod);
    const salePrice = terminalNOI / exitCapRate;
    const sellingCosts = salePrice * 0.03;
    terminalValue = salePrice - sellingCosts - (app.loanAmt || 0);
  }

  // IRR
  const leveredIRR = estimateIRR(equity, cashFlows, terminalValue);

  // Unlevered IRR (no debt)
  const unlevCashFlows = [];
  for (let y = 1; y <= holdPeriod; y++) {
    const noiY = isFlip ? 0 : yearOneNOI * Math.pow(1 + rentGrowth, y - 1);
    unlevCashFlows.push(noiY);
  }
  const unlevTerminal = isFlip
    ? (app.arv || app.purchasePrice) * 0.94
    : (yearOneNOI * Math.pow(1 + rentGrowth, holdPeriod)) / exitCapRate * 0.97;
  const unleveredIRR = estimateIRR(totalCost, unlevCashFlows, unlevTerminal);

  // Equity multiple
  const totalDistributions = cashFlows.reduce((s, c) => s + c, 0) + terminalValue + equity;
  const equityMultiple = equity > 0 ? totalDistributions / equity : 0;

  // LTV check
  const ltv = app.purchasePrice > 0 ? (app.loanAmt / app.purchasePrice) * 100 : 0;
  const arvLtv = (app.arv || app.completedValue || 0) > 0
    ? (app.loanAmt / (app.arv || app.completedValue)) * 100 : 0;

  // Pass/fail gate
  const gates = [
    { metric: "Levered IRR", value: leveredIRR, threshold: THRESHOLDS.MIN_IRR, pass: leveredIRR >= THRESHOLDS.MIN_IRR },
    { metric: "Cash-on-Cash Y1", value: cocY1, threshold: THRESHOLDS.MIN_COC, pass: isFlip || cocY1 >= THRESHOLDS.MIN_COC },
    { metric: "Going-in Cap", value: goingInCap, threshold: THRESHOLDS.MIN_CAP, pass: isFlip || goingInCap >= THRESHOLDS.MIN_CAP },
    { metric: "Equity Multiple", value: equityMultiple, threshold: THRESHOLDS.MIN_EQUITY_MULT, pass: equityMultiple >= THRESHOLDS.MIN_EQUITY_MULT },
    { metric: "LTV", value: ltv, threshold: 80, pass: ltv <= 80 },
  ];

  const passCount = gates.filter(g => g.pass).length;
  const overallPass = passCount >= 4; // Allow 1 fail

  return {
    agentId: "deal-screener",
    agentName: "Deal Screener",
    promptRef: "BOUT-SCR-01",
    loanType: app.loanType,
    metrics: {
      goingInCap: Math.round(goingInCap * 100) / 100,
      cashOnCashY1: Math.round(cocY1 * 100) / 100,
      leveredIRR: Math.round(leveredIRR * 100) / 100,
      unleveredIRR: Math.round(unleveredIRR * 100) / 100,
      equityMultiple: Math.round(equityMultiple * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      arvLtv: Math.round(arvLtv * 100) / 100,
      yearOneNOI: Math.round(yearOneNOI),
      equity: Math.round(equity),
      annualDebtService: Math.round(ds.annual),
    },
    gates,
    passCount,
    totalGates: gates.length,
    overallPass,
    verdict: overallPass ? "PASS" : "FAIL",
    flags: [
      ...(ltv > 75 ? ["HIGH_LTV: LTV exceeds 75%"] : []),
      ...(leveredIRR < 8 ? ["LOW_IRR: Levered IRR below 8% — thin deal"] : []),
      ...(equity < 0 ? ["NEGATIVE_EQUITY: Loan exceeds total cost"] : []),
      ...(isFlip && !app.arv ? ["MISSING_ARV: No after-repair value provided"] : []),
    ],
  };
}
