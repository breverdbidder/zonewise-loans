/**
 * @fileoverview Agent 2 Variants: Rental Pro Forma Models
 * @module agents/rentalProForma
 *
 * BOUT-UW-01 (simplified): 1-10 unit residential rental pro forma for DSCR loans
 * BOUT-UW-07 (adapted): Short-term rental pro forma with zoning check
 *
 * Avatars: DSCR, No-Doc
 */

/**
 * Run DSCR Rental Pro Forma (simplified multifamily)
 * @param {Object} app - DSCR loan application
 * @returns {Object} 5-year rental pro forma
 */
export function runDSCRProForma(app) {
  const purchasePrice = app.purchasePrice || 0;
  const loanAmt = app.loanAmt || 0;
  const units = app.units || 1;
  const monthlyRent = app.monthlyRent || 0;
  const rentGrowth = (app.rentGrowth || 3) / 100;
  const vacancyRate = (app.vacancyRate || 5) / 100;
  const rate = app.interestRate || 0.078;
  const amortYears = app.amortization || 30;
  const expenseGrowth = 0.025; // 2.5% annual expense growth

  // Debt service
  const monthlyRate = rate / 12;
  const n = amortYears * 12;
  const monthlyDS = app.interestOnly
    ? loanAmt * monthlyRate
    : loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const annualDS = monthlyDS * 12;

  // Base operating expenses (FL adjusted)
  const annualGrossRent = monthlyRent * 12;
  const taxRate = 0.012;
  const insuranceRate = 0.013; // FL elevated
  const baseExpenses = {
    taxes: purchasePrice * taxRate,
    insurance: purchasePrice * insuranceRate,
    management: annualGrossRent * 0.08,
    maintenance: annualGrossRent * 0.05,
    reserves: annualGrossRent * 0.03,
    utilities: units * 100 * 12,
    admin: units * 50 * 12,
  };
  const totalBaseExpenses = Object.values(baseExpenses).reduce((s, v) => s + v, 0);

  // 5-year projection
  const projection = [];
  for (let year = 1; year <= 5; year++) {
    const grossRent = annualGrossRent * Math.pow(1 + rentGrowth, year - 1);
    const vacancy = grossRent * vacancyRate;
    const otherIncome = units * 75 * 12; // pet/parking/laundry
    const effectiveGrossIncome = grossRent - vacancy + otherIncome;

    const expenses = totalBaseExpenses * Math.pow(1 + expenseGrowth, year - 1);
    const noi = effectiveGrossIncome - expenses;
    const cashFlow = noi - annualDS;
    const dscr = annualDS > 0 ? noi / annualDS : 0;
    const equity = purchasePrice - loanAmt;
    const coc = equity > 0 ? (cashFlow / equity) * 100 : 0;

    projection.push({
      year,
      grossRent: Math.round(grossRent),
      vacancy: Math.round(vacancy),
      otherIncome: Math.round(otherIncome),
      egi: Math.round(effectiveGrossIncome),
      expenses: Math.round(expenses),
      noi: Math.round(noi),
      debtService: Math.round(annualDS),
      cashFlow: Math.round(cashFlow),
      dscr: Math.round(dscr * 100) / 100,
      coc: Math.round(coc * 10) / 10,
    });
  }

  // Exit valuation at Year 5
  const exitCapRate = (app.exitCapRate || 7) / 100;
  const exitNOI = projection[4].noi;
  const exitValue = exitNOI / exitCapRate;
  const exitEquity = exitValue - loanAmt;
  const totalCashFlows = projection.reduce((s, y) => s + y.cashFlow, 0);
  const totalReturn = totalCashFlows + exitEquity;
  const equity = purchasePrice - loanAmt;
  const equityMultiple = equity > 0 ? totalReturn / equity : 0;

  // DSCR qualification
  const y1DSCR = projection[0].dscr;
  const dscrQualifies = y1DSCR >= 1.0;
  const dscrStrong = y1DSCR >= 1.25;

  return {
    agentId: "dscr-pro-forma",
    agentName: "DSCR Rental Pro Forma",
    promptRef: "BOUT-UW-01",
    loanType: "dscr",
    summary: {
      purchasePrice,
      loanAmt,
      units,
      monthlyRentPerUnit: Math.round(monthlyRent / units),
      y1NOI: projection[0].noi,
      y1DSCR: projection[0].dscr,
      y1CashFlow: projection[0].cashFlow,
      y1CoC: projection[0].coc,
      expenseRatio: Math.round((totalBaseExpenses / annualGrossRent) * 100),
      monthlyDS: Math.round(monthlyDS),
    },
    expenseBreakdown: Object.fromEntries(
      Object.entries(baseExpenses).map(([k, v]) => [k, Math.round(v)])
    ),
    projection,
    exitAnalysis: {
      exitCapRate: exitCapRate * 100,
      exitNOI: Math.round(exitNOI),
      exitValue: Math.round(exitValue),
      exitEquity: Math.round(exitEquity),
      totalCashFlows: Math.round(totalCashFlows),
      equityMultiple: Math.round(equityMultiple * 100) / 100,
    },
    dscrQualifies,
    verdict: dscrStrong ? "STRONG_DSCR" : dscrQualifies ? "QUALIFYING_DSCR" : "BELOW_DSCR",
    flags: [
      ...(!dscrQualifies ? ["DSCR_BELOW_1: Property does not cover debt service"] : []),
      ...(projection[0].cashFlow < 0 ? ["NEGATIVE_CASH_FLOW_Y1: Year 1 cash flow is negative"] : []),
      ...(projection[0].coc < 4 ? ["LOW_COC: Year 1 cash-on-cash below 4%"] : []),
    ],
  };
}

/**
 * Run Short-Term Rental Pro Forma (BOUT-UW-07)
 * CRITICAL: Checks zoning for STR eligibility first
 * @param {Object} app - DSCR/No-Doc loan application for STR property
 * @param {Object} [zoningData] - ZoneWise zoning data
 * @returns {Object} STR pro forma with LTR comparison
 */
export function runSTRProForma(app, zoningData = null) {
  // ═══ ZONING CHECK FIRST ═══
  const minStayDays = zoningData?.minStayDays || 0;
  const strPermitted = zoningData?.strPermitted !== false;
  const strRequiresPermit = zoningData?.strRequiresPermit || false;

  if (!strPermitted || minStayDays >= 30) {
    return {
      agentId: "str-pro-forma",
      agentName: "STR Pro Forma",
      promptRef: "BOUT-UW-07",
      loanType: app.loanType,
      zoningBlock: true,
      verdict: "STR_NOT_PERMITTED",
      reason: minStayDays >= 30
        ? `Zoning requires minimum ${minStayDays}-day stays — STR strategy not viable`
        : "Short-term rentals not permitted in this zoning district",
      recommendation: "Underwrite as long-term rental (DSCR) or decline if STR is the only viable strategy",
      flags: ["ZONING_BLOCKS_STR: Short-term rental not permitted at this address"],
    };
  }

  const purchasePrice = app.purchasePrice || 0;
  const loanAmt = app.loanAmt || 0;
  const furnishingCost = app.furnishingCost || 15000;
  const rate = app.interestRate || 0.078;

  // Seasonal revenue modeling (4 seasons)
  const seasons = [
    { name: "Peak (Jun-Aug)", months: 3, nightlyRate: app.peakRate || 250, occupancy: app.peakOcc || 85 },
    { name: "Shoulder (Mar-May, Sep-Oct)", months: 4, nightlyRate: app.shoulderRate || 180, occupancy: app.shoulderOcc || 65 },
    { name: "Off-Peak (Nov-Feb)", months: 4, nightlyRate: app.offPeakRate || 120, occupancy: app.offPeakOcc || 45 },
    { name: "Holiday (Dec)", months: 1, nightlyRate: app.holidayRate || 300, occupancy: app.holidayOcc || 80 },
  ];

  let annualGross = 0;
  let totalNights = 0;
  let occupiedNights = 0;
  const seasonalRevenue = seasons.map(s => {
    const nights = s.months * 30;
    const occ = s.occupancy / 100;
    const occupied = Math.round(nights * occ);
    const revenue = occupied * s.nightlyRate;
    annualGross += revenue;
    totalNights += nights;
    occupiedNights += occupied;
    return { ...s, nights, occupied, revenue: Math.round(revenue) };
  });

  const avgOccupancy = (occupiedNights / totalNights) * 100;
  const avgNightlyRate = annualGross / occupiedNights;

  // STR-specific expenses
  const cleaningFee = app.cleaningFee || 150;
  const avgStayLength = app.avgStayLength || 3.5;
  const turnovers = Math.round(occupiedNights / avgStayLength);
  const cleaningRevenue = turnovers * cleaningFee;
  const cleaningCost = turnovers * (cleaningFee * 0.9); // Cost ~90% of fee

  const platformFee = (annualGross + cleaningRevenue) * 0.03; // 3% host fee
  const managementFee = (annualGross + cleaningRevenue) * (app.managementRate || 0.20);
  const supplies = 200 * 12;
  const utilities = 400 * 12;
  const insurance = purchasePrice * 0.018; // STR insurance higher
  const taxes = purchasePrice * 0.012;
  const maintenance = annualGross * 0.05;
  const wifi = 100 * 12;

  const totalExpenses = cleaningCost + platformFee + managementFee + supplies +
    utilities + insurance + taxes + maintenance + wifi;
  const totalRevenue = annualGross + cleaningRevenue;
  const noi = totalRevenue - totalExpenses;

  // Debt service
  const monthlyRate = rate / 12;
  const n = 30 * 12;
  const monthlyDS = loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, n)) /
    (Math.pow(1 + monthlyRate, n) - 1);
  const annualDS = monthlyDS * 12;
  const cashFlow = noi - annualDS;
  const dscr = annualDS > 0 ? noi / annualDS : 0;

  // ═══ LTR COMPARISON ═══
  const ltrRent = app.ltrMonthlyRent || (purchasePrice * 0.007);
  const ltrAnnual = ltrRent * 12;
  const ltrVacancy = ltrAnnual * 0.05;
  const ltrExpenses = ltrAnnual * 0.35 + taxes + insurance;
  const ltrNOI = ltrAnnual - ltrVacancy - ltrExpenses;
  const ltrCashFlow = ltrNOI - annualDS;
  const ltrDSCR = annualDS > 0 ? ltrNOI / annualDS : 0;

  const strPremium = ltrNOI > 0 ? ((noi - ltrNOI) / ltrNOI) * 100 : 0;
  const strOnlyViable = dscr >= 1.0 && ltrDSCR < 1.0;

  return {
    agentId: "str-pro-forma",
    agentName: "STR Pro Forma",
    promptRef: "BOUT-UW-07",
    loanType: app.loanType,
    zoningBlock: false,
    strRequiresPermit,
    seasonalRevenue,
    metrics: {
      annualGross: Math.round(annualGross),
      cleaningRevenue: Math.round(cleaningRevenue),
      totalRevenue: Math.round(totalRevenue),
      totalExpenses: Math.round(totalExpenses),
      noi: Math.round(noi),
      annualDS: Math.round(annualDS),
      cashFlow: Math.round(cashFlow),
      dscr: Math.round(dscr * 100) / 100,
      avgOccupancy: Math.round(avgOccupancy),
      avgNightlyRate: Math.round(avgNightlyRate),
      turnovers,
    },
    ltrComparison: {
      ltrMonthlyRent: Math.round(ltrRent),
      ltrAnnualRent: Math.round(ltrAnnual),
      ltrNOI: Math.round(ltrNOI),
      ltrCashFlow: Math.round(ltrCashFlow),
      ltrDSCR: Math.round(ltrDSCR * 100) / 100,
      strPremium: Math.round(strPremium),
      strOnlyViable,
    },
    verdict: dscr >= 1.25 ? "STRONG_STR" : dscr >= 1.0 ? "QUALIFYING_STR" : "BELOW_DSCR",
    flags: [
      ...(strOnlyViable ? ["STR_ONLY_EXIT: DSCR only works under STR assumptions — fragile exit if regulations change"] : []),
      ...(dscr < 1.0 ? ["STR_DSCR_BELOW_1: Even STR income does not cover debt service"] : []),
      ...(strRequiresPermit ? ["PERMIT_REQUIRED: STR requires local permit — verify before closing"] : []),
      ...(avgOccupancy < 50 ? ["LOW_OCCUPANCY: Projected occupancy below 50% — verify market demand"] : []),
    ],
  };
}
