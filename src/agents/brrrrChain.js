/**
 * @fileoverview Agent 6: BRRRR Chain Model (BOUT-RET-08)
 * @module agents/brrrrChain
 *
 * Dual-purpose: borrower view (portfolio scaling) +
 * lender view (repeat borrower LTV, customer lifetime value).
 *
 * Avatars: Hard Money
 */

/**
 * Run BRRRR Model — single deal + repeat chain
 * @param {Object} app - Hard Money loan application
 * @returns {Object} BRRRR analysis with chain projection
 */
export function runBRRRRModel(app) {
  const purchasePrice = app.purchasePrice || 0;
  const repairBudget = app.repairBudget || 0;
  const arv = app.arv || 0;
  const loanAmt = app.loanAmt || 0;
  const rate = app.interestRate || 0.095;
  const rehabMonths = app.rehabTimeline || 4;
  const seasoningMonths = 6; // typical seasoning requirement

  // ═══ PHASE 1: BUY + REHAB ═══
  const closingCosts = purchasePrice * 0.03;
  const loanPoints = loanAmt * 0.02;
  const cashToClose = purchasePrice - loanAmt + closingCosts + loanPoints;
  const holdingCosts = (loanAmt * rate / 12 + purchasePrice * 0.015 / 12 + 350) * rehabMonths;
  const totalCashInvested = cashToClose + repairBudget + holdingCosts;

  // ═══ PHASE 2: RENT ═══
  const monthlyRent = app.monthlyRent || app.projectedMonthlyRent || (arv * 0.008);
  const monthlyExpenses = monthlyRent * 0.40;
  const monthlyNOI = monthlyRent - monthlyExpenses;
  const annualNOI = monthlyNOI * 12;

  // Holding during seasoning (still on hard money)
  const seasoningHoldCost = (loanAmt * rate / 12) * seasoningMonths;
  const rentalIncomeDuringSeasoning = monthlyNOI * seasoningMonths;
  const netSeasoningCost = seasoningHoldCost - rentalIncomeDuringSeasoning;

  // ═══ PHASE 3: REFINANCE ═══
  const refiLTV = 0.75;
  const refiRate = 0.075;
  const refiAmort = 30;
  const newLoan = arv * refiLTV;
  const refiClosing = newLoan * 0.025;
  const cashOutGross = newLoan - loanAmt;
  const cashOutNet = cashOutGross - refiClosing;

  // New mortgage payment
  const refiMonthlyRate = refiRate / 12;
  const refiN = refiAmort * 12;
  const refiPayment = newLoan * (refiMonthlyRate * Math.pow(1 + refiMonthlyRate, refiN)) /
    (Math.pow(1 + refiMonthlyRate, refiN) - 1);

  // Post-refi cash flow
  const postRefiCashFlow = monthlyNOI - refiPayment;
  const postRefiDSCR = refiPayment > 0 ? monthlyNOI / refiPayment : 0;
  const netCashRemaining = totalCashInvested - cashOutNet + netSeasoningCost;
  const cocOnRemaining = netCashRemaining > 0 ? (postRefiCashFlow * 12 / netCashRemaining) * 100 : 0;

  // All-in or money-out?
  const allCashBack = cashOutNet >= totalCashInvested;
  const equityRecovered = totalCashInvested > 0 ? (cashOutNet / totalCashInvested) * 100 : 0;

  // ═══ PHASE 4: REPEAT — Chain Projection ═══
  const startingCapital = app.liquid || app.startingCapital || 100000;
  const chain = [];
  let availableCapital = startingCapital;
  let totalPortfolioValue = 0;
  let totalMonthlyIncome = 0;
  let dealNum = 0;

  while (dealNum < 10) {
    const dealCashNeeded = cashToClose + repairBudget + holdingCosts + netSeasoningCost;

    if (availableCapital < dealCashNeeded) break;

    dealNum++;

    // Execute deal
    availableCapital -= dealCashNeeded;
    // After refi, get cash back
    availableCapital += cashOutNet;
    totalPortfolioValue += arv;
    totalMonthlyIncome += postRefiCashFlow;

    chain.push({
      deal: dealNum,
      cashBefore: Math.round(availableCapital + dealCashNeeded - cashOutNet),
      cashNeeded: Math.round(dealCashNeeded),
      cashBack: Math.round(cashOutNet),
      cashAfter: Math.round(availableCapital),
      portfolioValue: Math.round(totalPortfolioValue),
      monthlyIncome: Math.round(totalMonthlyIncome),
    });

    // If no cash recovered, chain breaks
    if (cashOutNet <= 0) break;
  }

  // ═══ LENDER VIEW ═══
  const customerLTV = {
    deal1Rate: rate,
    deal2Rate: rate - 0.005, // 0.5% discount on repeat
    deal3Rate: rate - 0.01,  // 1% discount on deal 3+
    estimatedDeals: Math.min(dealNum, 5),
    estimatedRevenue: Math.round(loanAmt * rate * (rehabMonths + seasoningMonths) / 12 * Math.min(dealNum, 5)),
    repeatBorrowerRisk: "LOWER", // proven track record
  };

  return {
    agentId: "brrrr-chain",
    agentName: "BRRRR Chain Model",
    promptRef: "BOUT-RET-08",
    loanType: "hardmoney",
    singleDeal: {
      totalCashInvested: Math.round(totalCashInvested),
      cashToClose: Math.round(cashToClose),
      repairBudget,
      holdingCosts: Math.round(holdingCosts),
      seasoningCost: Math.round(netSeasoningCost),
      arv,
      newLoan: Math.round(newLoan),
      cashOutGross: Math.round(cashOutGross),
      refiClosing: Math.round(refiClosing),
      cashOutNet: Math.round(cashOutNet),
      netCashRemaining: Math.round(Math.max(0, netCashRemaining)),
      allCashBack,
      equityRecovered: Math.round(equityRecovered),
      refiPayment: Math.round(refiPayment),
      monthlyRent: Math.round(monthlyRent),
      postRefiCashFlow: Math.round(postRefiCashFlow),
      postRefiDSCR: Math.round(postRefiDSCR * 100) / 100,
      cocOnRemaining: Math.round(cocOnRemaining * 10) / 10,
    },
    chain,
    chainCapacity: dealNum,
    startingCapital,
    lenderView: customerLTV,
    verdict: allCashBack ? "INFINITE_VELOCITY" : cashOutNet > 0 ? "PARTIAL_RECOVERY" : "CAPITAL_TRAPPED",
    flags: [
      ...(cashOutNet <= 0 ? ["NO_CASH_OUT: Refi does not return capital — BRRRR chain breaks at deal 1"] : []),
      ...(postRefiDSCR < 1.0 ? ["NEGATIVE_CASH_FLOW: Post-refi cash flow is negative"] : []),
      ...(!allCashBack ? [`PARTIAL_RECOVERY: Only ${Math.round(equityRecovered)}% of capital recovered at refi`] : []),
      ...(dealNum <= 1 ? ["CHAIN_BREAKS: Insufficient capital velocity for repeat deals"] : []),
    ],
  };
}
