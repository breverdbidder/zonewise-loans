export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'API key not configured' });

  try {
    const app = req.body;
    const ltv = app.purchasePrice > 0 ? ((app.loanAmt / app.purchasePrice) * 100).toFixed(1) : 0;
    const arvLtv = app.arv > 0 ? ((app.loanAmt / app.arv) * 100).toFixed(1) : 0;

    const prompt = `You are a senior hard money loan underwriter for ZoneWise.AI. Analyze this loan application:
APPLICATION: Borrower: ${app.name} (${app.entity}), Property: ${app.propAddr}, Type: ${app.propType}, Condition: ${app.condition}, Purchase: $${app.purchasePrice?.toLocaleString()}, Loan: $${app.loanAmt?.toLocaleString()}, ARV: $${app.arv?.toLocaleString()}, Rehab: $${app.repairBudget?.toLocaleString()}, Term: ${app.term}mo, LTV: ${ltv}%, Experience: ${app.experience}, Credit: ${app.credit}, Liquid: $${app.liquid?.toLocaleString()}, Purpose: ${app.purpose}
Respond ONLY with JSON: {"score":<0-100>,"verdict":"<APPROVE|CONDITIONAL_APPROVE|REVIEW|DECLINE>","verdict_summary":"<summary>","approval_probability":<0-100>,"recommended_rate":"<rate>","recommended_ltv_cap":"<ltv>","recommended_term":"<term>","strengths":["..."],"risks":["..."],"conditions":["..."],"deal_summary":"<summary>","exit_viability":"<analysis>","market_commentary":"<commentary>"}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
    });
    const data = await response.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
