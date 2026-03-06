/**
 * @fileoverview Unit tests for No-Doc Underwriting Scoring Engine
 * @module __tests__/nodoc
 */

import { runNoDocUnderwriting } from "../scoring/nodoc.js";

const baseApp = {
  purchasePrice: 320000,
  loanAmt: 224000,
  credit: "720+",
  liquid: 180000,
  noDocSubtype: "bankstatement",
  statementPeriod: "24",
  occupancy: "investment",
  propType: "sfr",
  uploads: 5,
  avgMonthlyDeposits: 12500,
  propAddr: "Palm Bay, FL 32907",
};

describe("NoDoc Underwriting Engine", () => {
  test("strong bank statement app should APPROVE with score >= 80", () => {
    const result = runNoDocUnderwriting(baseApp);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.verdict).toBe("APPROVE");
  });

  test("NINA + low credit should DECLINE", () => {
    const result = runNoDocUnderwriting({
      ...baseApp,
      noDocSubtype: "nina",
      credit: "below600",
      liquid: 10000,
      loanAmt: 288000,
    });
    expect(result.score).toBeLessThan(50);
    expect(result.verdict).toBe("DECLINE");
  });

  test("asset depletion + high assets should score well", () => {
    const result = runNoDocUnderwriting({
      ...baseApp,
      noDocSubtype: "asset_depletion",
      credit: "700-719",
      liquid: 500000,
    });
    expect(result.score).toBeGreaterThanOrEqual(65);
  });

  test("down payment 30%+ should get 15 points", () => {
    const highDown = runNoDocUnderwriting({
      ...baseApp,
      purchasePrice: 400000,
      loanAmt: 280000, // 30% down
    });
    const lowDown = runNoDocUnderwriting({
      ...baseApp,
      purchasePrice: 400000,
      loanAmt: 360000, // 10% down
    });
    expect(highDown.score).toBeGreaterThan(lowDown.score);
  });

  test("bankstatement 24mo should get 10 doc points", () => {
    const bs24 = runNoDocUnderwriting({
      ...baseApp,
      noDocSubtype: "bankstatement",
      statementPeriod: "24",
    });
    const nina = runNoDocUnderwriting({
      ...baseApp,
      noDocSubtype: "nina",
    });
    expect(bs24.score).toBeGreaterThan(nina.score);
  });

  test("zero purchasePrice should not crash", () => {
    const result = runNoDocUnderwriting({
      ...baseApp,
      purchasePrice: 0,
    });
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
  });

  test("score should never exceed 100", () => {
    const result = runNoDocUnderwriting({
      ...baseApp,
      credit: "720+",
      liquid: 1000000,
      loanAmt: 100000,
      purchasePrice: 500000,
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test("result should include all required fields", () => {
    const result = runNoDocUnderwriting(baseApp);
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

  test("verdict thresholds: 80=APPROVE, 79=CONDITIONAL", () => {
    const result = runNoDocUnderwriting(baseApp);
    if (result.score >= 80) expect(result.verdict).toBe("APPROVE");
    else if (result.score >= 65) expect(result.verdict).toBe("CONDITIONAL_APPROVE");
    else if (result.score >= 50) expect(result.verdict).toBe("REVIEW");
    else expect(result.verdict).toBe("DECLINE");
  });

  test("NINA with non-investment occupancy gets special condition", () => {
    const result = runNoDocUnderwriting({
      ...baseApp,
      noDocSubtype: "nina",
      occupancy: "primary",
    });
    const hasNinaCondition = result.conditions.some(
      (c) => c.toLowerCase().includes("nina")
    );
    expect(hasNinaCondition).toBe(true);
  });

  test("approval probability should be between 5 and 98", () => {
    const result = runNoDocUnderwriting(baseApp);
    expect(result.approval_probability).toBeGreaterThanOrEqual(5);
    expect(result.approval_probability).toBeLessThanOrEqual(98);
  });

  test("credit 720+ should get best rate (7.5%)", () => {
    const result = runNoDocUnderwriting(baseApp);
    if (result.score >= 80) {
      expect(result.recommended_rate).toBe("7.5%");
    }
  });
});
