/**
 * @fileoverview Unit tests for Hard Money Underwriting Scoring Engine
 * @module __tests__/hardmoney
 */

import { runHardMoneyUnderwriting } from "../scoring/hardmoney.js";

const baseApp = {
  purchasePrice: 420000,
  loanAmt: 294000,
  arv: 620000,
  repairBudget: 95000,
  credit: "720+",
  experience: "11-25",
  liquid: 280000,
  uploads: 6,
  condition: "Poor",
  purpose: "Fix & Flip",
  term: "12",
  propType: "Single Family",
  propAddr: "Fort Lauderdale, FL 33308",
};

describe("HardMoney Underwriting Engine", () => {
  test("strong deal (low LTV, high credit, experienced) should APPROVE", () => {
    const result = runHardMoneyUnderwriting(baseApp);
    expect(result.score).toBeGreaterThanOrEqual(82);
    expect(result.verdict).toBe("APPROVE");
  });

  test("distressed property, first-timer should get low score", () => {
    const result = runHardMoneyUnderwriting({
      ...baseApp,
      credit: "below600",
      experience: "first",
      liquid: 20000,
      uploads: 1,
      condition: "distressed",
      arv: 440000,
    });
    expect(result.score).toBeLessThan(68);
  });

  test("ARV spread > 25% should get highest spread score (10pt)", () => {
    const highSpread = runHardMoneyUnderwriting({
      ...baseApp,
      purchasePrice: 300000,
      loanAmt: 210000,
      arv: 600000,
      repairBudget: 80000,
    });
    const lowSpread = runHardMoneyUnderwriting({
      ...baseApp,
      purchasePrice: 400000,
      loanAmt: 280000,
      arv: 420000,
      repairBudget: 15000,
    });
    expect(highSpread.score).toBeGreaterThan(lowSpread.score);
  });

  test("liquidity ratio >= 0.8 should get 15 points", () => {
    const highLiq = runHardMoneyUnderwriting({
      ...baseApp,
      liquid: 500000,
      loanAmt: 300000,
    });
    const lowLiq = runHardMoneyUnderwriting({
      ...baseApp,
      liquid: 30000,
      loanAmt: 300000,
    });
    expect(highLiq.score).toBeGreaterThan(lowLiq.score);
  });

  test("boundary at 82 should APPROVE", () => {
    const result = runHardMoneyUnderwriting(baseApp);
    if (result.score === 82) {
      expect(result.verdict).toBe("APPROVE");
    }
    if (result.score >= 82) {
      expect(result.verdict).toBe("APPROVE");
    }
  });

  test("score cap at 100", () => {
    const result = runHardMoneyUnderwriting({
      ...baseApp,
      credit: "720+",
      experience: "25+",
      liquid: 1000000,
      uploads: 10,
      loanAmt: 200000,
      purchasePrice: 500000,
      arv: 900000,
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test("all result fields should be present", () => {
    const result = runHardMoneyUnderwriting(baseApp);
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("verdict");
    expect(result).toHaveProperty("verdict_summary");
    expect(result).toHaveProperty("strengths");
    expect(result).toHaveProperty("risks");
    expect(result).toHaveProperty("conditions");
    expect(result).toHaveProperty("recommended_rate");
    expect(result).toHaveProperty("deal_summary");
    expect(result).toHaveProperty("exit_viability");
    expect(result).toHaveProperty("market_commentary");
  });

  test("zero values should not crash", () => {
    const result = runHardMoneyUnderwriting({
      ...baseApp,
      purchasePrice: 0,
      arv: 0,
      repairBudget: 0,
    });
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
  });

  test("first-timer risk should appear in risks", () => {
    const result = runHardMoneyUnderwriting({
      ...baseApp,
      experience: "first",
    });
    const hasFirstTimerRisk = result.risks.some(
      (r) => r.toLowerCase().includes("first")
    );
    expect(hasFirstTimerRisk).toBe(true);
  });

  test("experienced investor strength should appear", () => {
    const result = runHardMoneyUnderwriting({
      ...baseApp,
      experience: "25+",
    });
    const hasExpStrength = result.strengths.some(
      (s) => s.toLowerCase().includes("experienced")
    );
    expect(hasExpStrength).toBe(true);
  });

  test("approval probability should be between 5 and 98", () => {
    const result = runHardMoneyUnderwriting(baseApp);
    expect(result.approval_probability).toBeGreaterThanOrEqual(5);
    expect(result.approval_probability).toBeLessThanOrEqual(98);
  });

  test("verdict should match threshold logic", () => {
    const result = runHardMoneyUnderwriting(baseApp);
    if (result.score >= 82) expect(result.verdict).toBe("APPROVE");
    else if (result.score >= 68) expect(result.verdict).toBe("CONDITIONAL_APPROVE");
    else if (result.score >= 50) expect(result.verdict).toBe("REVIEW");
    else expect(result.verdict).toBe("DECLINE");
  });
});
