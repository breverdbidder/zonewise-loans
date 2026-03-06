/**
 * @fileoverview Unit tests for Construction Underwriting Scoring Engine
 * @module __tests__/construction
 */

import { runConstructionUnderwriting } from "../scoring/construction.js";

const baseApp = {
  lotValue: 180000,
  loanAmt: 720000,
  totalBudget: 675000,
  hardCosts: 580000,
  softCosts: 95000,
  completedValue: 1100000,
  arv: 1100000,
  credit: "720+",
  experience: "11-25",
  liquid: 450000,
  uploads: 9,
  permitStatus: "approved",
  plansStatus: "complete",
  gcContract: "signed",
  constructionType: "ground_up",
  term: "18",
  propType: "Single Family",
  propAddr: "Satellite Beach, FL 32937",
};

describe("Construction Underwriting Engine", () => {
  test("permitted ground-up + experienced should APPROVE", () => {
    const result = runConstructionUnderwriting(baseApp);
    expect(result.score).toBeGreaterThanOrEqual(82);
    expect(result.verdict).toBe("APPROVE");
  });

  test("no permits + first-timer should get low score", () => {
    const result = runConstructionUnderwriting({
      ...baseApp,
      permitStatus: "not_applied",
      plansStatus: "none",
      gcContract: "none",
      experience: "first",
      credit: "below600",
      liquid: 20000,
      uploads: 1,
    });
    expect(result.score).toBeLessThan(50);
    expect(result.verdict).toBe("DECLINE");
  });

  test("score boundaries: 82=APPROVE, 68=CONDITIONAL, 50=REVIEW", () => {
    const result = runConstructionUnderwriting(baseApp);
    if (result.score >= 82) expect(result.verdict).toBe("APPROVE");
    else if (result.score >= 68) expect(result.verdict).toBe("CONDITIONAL_APPROVE");
    else if (result.score >= 50) expect(result.verdict).toBe("REVIEW");
    else expect(result.verdict).toBe("DECLINE");
  });

  test("LTC scoring: low LTC should score higher", () => {
    const lowLtc = runConstructionUnderwriting({
      ...baseApp,
      loanAmt: 500000,
      totalBudget: 900000,
      lotValue: 200000,
    });
    const highLtc = runConstructionUnderwriting({
      ...baseApp,
      loanAmt: 900000,
      totalBudget: 700000,
      lotValue: 200000,
    });
    expect(lowLtc.score).toBeGreaterThan(highLtc.score);
  });

  test("score cap at 100", () => {
    const result = runConstructionUnderwriting({
      ...baseApp,
      credit: "720+",
      experience: "25+",
      liquid: 2000000,
      uploads: 12,
      loanAmt: 300000,
      totalBudget: 800000,
      lotValue: 200000,
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test("all result fields should be present", () => {
    const result = runConstructionUnderwriting(baseApp);
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

  test("permits approved should appear in strengths", () => {
    const result = runConstructionUnderwriting(baseApp);
    const hasPermitStrength = result.strengths.some(
      (s) => s.toLowerCase().includes("permit")
    );
    expect(hasPermitStrength).toBe(true);
  });

  test("first-timer should get condition about GC", () => {
    const result = runConstructionUnderwriting({
      ...baseApp,
      experience: "first",
    });
    const hasGCCondition = result.conditions.some(
      (c) => c.toLowerCase().includes("construction manager") ||
             c.toLowerCase().includes("gc")
    );
    expect(hasGCCondition).toBe(true);
  });

  test("zero values should not crash", () => {
    const result = runConstructionUnderwriting({
      ...baseApp,
      lotValue: 0,
      totalBudget: 0,
      completedValue: 0,
      arv: 0,
    });
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
  });

  test("approval probability should be between 5 and 98", () => {
    const result = runConstructionUnderwriting(baseApp);
    expect(result.approval_probability).toBeGreaterThanOrEqual(5);
    expect(result.approval_probability).toBeLessThanOrEqual(98);
  });

  test("no permits should add condition about permits", () => {
    const result = runConstructionUnderwriting({
      ...baseApp,
      permitStatus: "not_applied",
    });
    const hasPermitCondition = result.conditions.some(
      (c) => c.toLowerCase().includes("permit")
    );
    expect(hasPermitCondition).toBe(true);
  });

  test("incomplete plans should add condition", () => {
    const result = runConstructionUnderwriting({
      ...baseApp,
      plansStatus: "preliminary",
    });
    const hasPlansCondition = result.conditions.some(
      (c) => c.toLowerCase().includes("plan")
    );
    expect(hasPlansCondition).toBe(true);
  });
});
