/**
 * @fileoverview Agent 3: Returns Engine — Debt Comparison + Cash-Out Refi
 * @module agents/returnsEngine
 *
 * BOUT-RET-04: Compare our loan vs bank/agency/bridge/DSCR
 * BOUT-RET-05: Model post-rehab refi exit strategy
 *
 * Avatars: ALL (Hard Money, DSCR, Construction, No-Doc)
 */

/**
 * Calculate monthly payment (P&I or IO)
 */
function monthlyPayment(principal, annualRate, amortYears, isIO = false) {
  if (!principal || !annualRate) return 0;
  if (isIO) return principal * annualRate / 12;
  const r = annualRate / 12;
  const n = amortYears * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Run Debt Comparison — our terms vs 3 alternatives
 * @param {Object} app - Loan application
 * @param {Object} ourTerms - Terms from scoring engine
 * @returns {Object} Comparison result
 */
export function runDebtComparison(app, ourTerms = {}) {
  const purchasePrice = app.purchasePrice || 0;
  const loanAmt = app.loanAmt || 0;
  const holdMonths = app.holdPeriod ? app.holdPeriod * 12 : (app.loanType === "hardmoney" ? 8 : 60);

  const scenarios = [
    {
      name: "ZoneWise Hard Money",
      type: "our_product",
      loanAmt,
      rate: ourTerms.rate || 0.095,
      ioPeriod: holdMonths,
      amortization: 0,
      term: ourTerms.term || 12,
      origination: loanAmt * 0.02,
      closingCosts: 3500,
      closingTimeline: 10, // days
      prepayPenalty: 0,
      docsRequired: "Minimal (ID, purchase contract, SOW)",
    },
    {
      name: "Bank Conventional",
      type: "bank",
      loanAmt: purchasePrice * 0.75,
      rate: 0.072,
      ioPeriod: 0,
      amortization: 30,
      term: 360,
      origination: purchasePrice * 0.75 * 0.01,
      closingCosts: 5500,
      closingTimeline: 45,
      prepayPenalty: 0,
      docsRequired: "Full (tax returns, W2s, bank statements, appraisal, inspection)",
    },
    {
      name: "Agency (Fannie/Freddie)",
      type: "agency",
      loanAmt: purchasePrice * 0.80,
      rate: 0.068,
      ioPeriod: 0,
      amortization: 30,
      term: 360,
      origination: purchasePrice * 0.80 * 0.015,
      closingCosts: 8000,
      closingTimeline: 75,
      prepayPenalty: purchasePrice * 0.80 * 0.01,
      docsRequired: "Full + agency requirements (DSCR, reserves, experience letter)",
    },
    {
      name: "DSCR Loan",
      type: "dscr_alt",
      loanAmt: purchasePrice * 0.75,
      rate: 0.078,
      ioPeriod: 0,
      amortization: 30,
      term: 360,
      origination: purchasePrice * 0.75 * 0.02,
      closingCosts: 5000,
      closingTimeline: 30,
      prepayPenalty: purchasePrice * 0.75 * 0.03, // 3-yr step-down
      docsRequired: "Property income docs (rent roll, leases, no personal income)",
    },
  ];

  const results = scenarios.map(s => {
    const mp = monthlyPayment(s.loanAmt, s.rate, s.amortization, s.ioPeriod > 0);
    const totalInterest = mp * holdMonths - (s.ioPeriod > 0 ? 0 :
      (s.loanAmt - s.loanAmt)); // simplified
    const totalCostOfCapital = s.origination + s.closingCosts +
      (mp * holdMonths) + (holdMonths <= s.term ? 0 : s.prepayPenalty);
    const equity = purchasePrice - s.loanAmt + s.origination + s.closingCosts;

    // Opportunity cost of delayed closing
    const holdingCostPerDay = (purchasePrice * 0.015 / 365) + 50; // taxes+insurance+utils per day
    const delayPenalty = Math.max(0, s.closingTimeline - 10) * holdingCostPerDay;

    return {
      ...s,
      monthlyPayment: Math.round(mp),
      annualDebtService: Math.round(mp * 12),
      totalPayments: Math.round(mp * holdMonths),
      equity: Math.round(equity),
      totalCostOfCapital: Math.round(totalCostOfCapital),
      delayPenalty: Math.round(delayPenalty),
      adjustedCost: Math.round(totalCostOfCapital + delayPenalty),
    };
  });

  // Rank by adjusted cost
  const ranked = [...results].sort((a, b) => a.adjustedCost - b.adjustedCost);
  ranked.forEach((r, i) => r.rank = i + 1);

  // Find our product rank
  const ourRank = ranked.findIndex(r => r.type === "our_product") + 1;

  return {
    agentId: "debt-comparison",
    agentName: "Debt Comparison Model",
    promptRef: "BOUT-RET-04",
    loanType: app.loanType,
    scenarios: results,
    ranking: ranked.map(r => ({ name: r.name, rank: r.rank, adjustedCost: r.adjustedCost })),
    ourRank,
    cheapestOption: ranked[0].name,
    bestForSpeed: "ZoneWise Hard Money",
    verdict: ourRank <= 2 ? "COMPETITIVE" : "HIGHER_COST_JUSTIFIED",
    narrative: ourRank === 1
      ? "Our terms are the most cost-effective option including closing timeline savings."
      : `Our rate is higher than ${ranked[0].name}, but `
        + `${ranked[0].closingTimeline - 10} extra days to close costs the borrower `
        + `$${Math.round(ranked.find(r => r.type !== "our_product")?.delayPenalty || 0)} `
        + `in holding costs, narrowing the gap.`,
  };
}

/**
 * Run Cash-Out Refi Exit Strategy Analysis (BOUT-RET-05)
 * @param {Object} app - Loan application
 * @returns {Object} Refi exit analysis
 */
export function runCashOutRefi(app) {
  const arv = app.arv || app.completedValue || app.purchasePrice || 0;
  const currentLoan = app.loanAmt || 0;
  const repairBudget = app.repairBudget || 0;
  const totalInvested = (app.purchasePrice || 0) + repairBudget;

  // Post-stabilization refi scenarios
  const refiScenarios = [
    { name: "Conventional 70% LTV", ltv: 0.70, rate: 0.072, amort: 30, closingPct: 0.025 },
    { name: "Conventional 75% LTV", ltv: 0.75, rate: 0.075, amort: 30, closingPct: 0.025 },
    { name: "DSCR 75% LTV", ltv: 0.75, rate: 0.078, amort: 30, closingPct: 0.03 },
    { name: "DSCR 80% LTV", ltv: 0.80, rate: 0.082, amort: 30, closingPct: 0.03 },
  ];

  const results = refiScenarios.map(s => {
    const newLoan = arv * s.ltv;
    const closingCosts = newLoan * s.closingPct;
    const cashOut = newLoan - currentLoan - closingCosts;
    const mp = monthlyPayment(newLoan, s.rate, s.amort);
    const totalEquityIn = totalInvested - currentLoan;
    const equityRecovered = cashOut > 0 ? (cashOut / totalEquityIn) * 100 : 0;

    // Can they pay off our hard money loan?
    const paysOffHardMoney = cashOut + currentLoan >= currentLoan;

    // Post-refi DSCR (if rental)
    const monthlyRent = app.monthlyRent || app.projectedMonthlyRent || 0;
    const monthlyExpenses = monthlyRent * 0.40;
    const monthlyNOI = monthlyRent - monthlyExpenses;
    const postRefiDSCR = mp > 0 ? monthlyNOI / mp : 0;

    // Breakeven hold months post-refi
    const monthlySavings = (currentLoan * (app.interestRate || 0.095) / 12) - mp;
    const breakevenMonths = closingCosts > 0 && monthlySavings > 0
      ? Math.ceil(closingCosts / monthlySavings) : 999;

    return {
      ...s,
      newLoan: Math.round(newLoan),
      closingCosts: Math.round(closingCosts),
      cashOut: Math.round(cashOut),
      cashOutPositive: cashOut > 0,
      monthlyPayment: Math.round(mp),
      annualDS: Math.round(mp * 12),
      equityRecovered: Math.round(equityRecovered),
      paysOffHardMoney,
      postRefiDSCR: Math.round(postRefiDSCR * 100) / 100,
      breakevenMonths,
    };
  });

  // Best scenario for borrower
  const viableScenarios = results.filter(r => r.cashOutPositive && r.paysOffHardMoney);
  const bestScenario = viableScenarios.length > 0
    ? viableScenarios.reduce((best, r) => r.cashOut > best.cashOut ? r : best)
    : null;

  const exitViable = viableScenarios.length > 0;

  return {
    agentId: "cash-out-refi",
    agentName: "Cash-Out Refi Exit Analysis",
    promptRef: "BOUT-RET-05",
    loanType: app.loanType,
    currentPosition: {
      arv,
      currentLoan,
      totalInvested: Math.round(totalInvested),
      currentEquity: Math.round(arv - currentLoan),
    },
    refiScenarios: results,
    bestScenario: bestScenario ? {
      name: bestScenario.name,
      cashOut: bestScenario.cashOut,
      newPayment: bestScenario.monthlyPayment,
      equityRecovered: bestScenario.equityRecovered,
    } : null,
    exitViable,
    viableCount: viableScenarios.length,
    verdict: exitViable ? "EXIT_VIABLE" : "EXIT_AT_RISK",
    flags: [
      ...(!exitViable ? ["NO_VIABLE_REFI: No refi scenario produces positive cash-out — exit strategy at risk"] : []),
      ...(bestScenario && bestScenario.equityRecovered < 80 ? ["EQUITY_TRAPPED: Borrower recovers less than 80% of equity at refi"] : []),
      ...(bestScenario && bestScenario.postRefiDSCR < 1.0 ? ["POST_REFI_DSCR_LOW: Property won't cover new debt service"] : []),
    ],
  };
}
