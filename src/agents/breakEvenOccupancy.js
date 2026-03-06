/**
 * @fileoverview Agent 5: Break-Even Occupancy Calculator (BOUT-SCR-04)
 * @module agents/breakEvenOccupancy
 *
 * Calculates three break-even levels: OpEx only, OpEx+Debt,
 * OpEx+Debt+Target CoC. Adjusts for FL insurance costs.
 * If break-even > 85%, auto-flags HIGH RISK.
 *
 * Avatars: DSCR, No-Doc
 */

const FL_INSURANCE_MULTIPLIER = 3.2; // FL insurance ~3.2x national avg

/**
 * Run Break-Even Occupancy Analysis
 * @param {Object} app - Loan application data
 * @returns {Object} Break-even analysis result
 */
export function runBreakEvenOccupancy(app) {
  const purchasePrice = app.purchasePrice || 0;
  const loanAmt = app.loanAmt || 0;
  const monthlyRent = app.monthlyRent || 0;
  const units = app.units || 1;
  const grossPotentialRent = monthlyRent * 12;

  // Operating expenses with FL adjustments
  const taxRate = app.taxRate || 0.012; // 1.2% of purchase price
  const taxes = purchasePrice * taxRate;
  const nationalInsurance = purchasePrice * 0.004; // national avg
  const insurance = nationalInsurance * FL_INSURANCE_MULTIPLIER;
  const management = grossPotentialRent * (app.managementRate || 0.08);
  const maintenance = grossPotentialRent * 0.05;
  const reserves = grossPotentialRent * 0.03;
  const utilities = units * 150 * 12; // $150/unit/month landlord utilities
  const misc = grossPotentialRent * 0.02;

  const totalOpex = taxes + insurance + management + maintenance + reserves + utilities + misc;
  const expenseRatio = grossPotentialRent > 0 ? (totalOpex / grossPotentialRent) * 100 : 0;

  // Debt service
  const rate = app.interestRate || 0.095;
  const monthlyRate = rate / 12;
  const amortYears = app.amortization || 30;
  let monthlyDS;
  if (app.interestOnly) {
    monthlyDS = loanAmt * monthlyRate;
  } else {
    const n = amortYears * 12;
    monthlyDS = loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }
  const annualDS = monthlyDS * 12;

  // Break-even calculations
  const beOpex = grossPotentialRent > 0
    ? (totalOpex / grossPotentialRent) * 100 : 100;

  const beDebt = grossPotentialRent > 0
    ? ((totalOpex + annualDS) / grossPotentialRent) * 100 : 100;

  const targetCoC = app.targetCoC || 8; // 8% target
  const equity = purchasePrice - loanAmt;
  const targetCashFlow = equity * (targetCoC / 100);
  const beTarget = grossPotentialRent > 0
    ? ((totalOpex + annualDS + targetCashFlow) / grossPotentialRent) * 100 : 100;

  // Current occupancy comparison
  const currentOccupancy = app.currentOccupancy || 95;
  const marginOfSafety = currentOccupancy - beDebt;

  // DSCR at current occupancy
  const effectiveRent = grossPotentialRent * (currentOccupancy / 100);
  const noiAtOccupancy = effectiveRent - totalOpex;
  const dscr = annualDS > 0 ? noiAtOccupancy / annualDS : 0;

  const highRisk = beDebt > 85;

  return {
    agentId: "break-even-occupancy",
    agentName: "Break-Even Occupancy Calculator",
    promptRef: "BOUT-SCR-04",
    loanType: app.loanType,
    metrics: {
      grossPotentialRent: Math.round(grossPotentialRent),
      totalOpex: Math.round(totalOpex),
      expenseRatio: Math.round(expenseRatio * 10) / 10,
      annualDebtService: Math.round(annualDS),
      equity: Math.round(equity),
      dscr: Math.round(dscr * 100) / 100,
      breakEvenOpex: Math.round(beOpex * 10) / 10,
      breakEvenDebt: Math.round(beDebt * 10) / 10,
      breakEvenTarget: Math.round(beTarget * 10) / 10,
      currentOccupancy,
      marginOfSafety: Math.round(marginOfSafety * 10) / 10,
      insuranceCost: Math.round(insurance),
      taxCost: Math.round(taxes),
    },
    expenseBreakdown: {
      taxes: Math.round(taxes),
      insurance: Math.round(insurance),
      management: Math.round(management),
      maintenance: Math.round(maintenance),
      reserves: Math.round(reserves),
      utilities: Math.round(utilities),
      misc: Math.round(misc),
    },
    highRisk,
    verdict: highRisk ? "HIGH_RISK" : marginOfSafety > 15 ? "COMFORTABLE" : "TIGHT",
    flags: [
      ...(highRisk ? ["BREAK_EVEN_ABOVE_85: Occupancy break-even exceeds 85% — high risk"] : []),
      ...(marginOfSafety < 5 ? ["THIN_MARGIN: Less than 5% margin of safety"] : []),
      ...(dscr < 1.0 ? ["DSCR_BELOW_1: Property does not cover debt at current occupancy"] : []),
      ...(insurance > grossPotentialRent * 0.15 ? ["HIGH_FL_INSURANCE: FL insurance exceeds 15% of gross rent"] : []),
      ...(expenseRatio > 55 ? ["HIGH_EXPENSE_RATIO: Total expenses exceed 55% of gross rent"] : []),
    ],
  };
}
