/**
 * @fileoverview Underwriting scoring router and AI wrapper
 * @module scoring
 */
import { runDSCRUnderwriting } from "./dscr.js";
import { runNoDocUnderwriting } from "./nodoc.js";
import { runHardMoneyUnderwriting } from "./hardmoney.js";
import { runConstructionUnderwriting } from "./construction.js";

/**
 * Route underwriting to the correct engine by loan type
 * @param {Object} app - Loan application with loanType field
 * @returns {Object} Underwriting result
 */
export function runLocalUnderwriting(app) {
  if (app.loanType === "dscr") return runDSCRUnderwriting(app);
  if (app.loanType === "nodoc") return runNoDocUnderwriting(app);
  if (app.loanType === "construction") return runConstructionUnderwriting(app);
  return runHardMoneyUnderwriting(app);
}

/**
 * Run AI underwriting via Cloudflare Function, fallback to local
 * @param {Object} app - Loan application data
 * @returns {Promise<Object>} Underwriting result
 */
export async function runAIUnderwriting(app) {
  try {
    const res = await fetch("/api/underwrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(app),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.score) return data;
    }
  } catch (e) {
    // Fallback to local
  }
  return runLocalUnderwriting(app);
}

export {
  runDSCRUnderwriting,
  runNoDocUnderwriting,
  runHardMoneyUnderwriting,
  runConstructionUnderwriting,
};
