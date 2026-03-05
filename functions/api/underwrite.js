// Cloudflare Pages Function — ZoneWise.AI Underwriting Proxy
// Set ANTHROPIC_API_KEY in Cloudflare Dashboard > Settings > Environment Variables
export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "API key not configured" }), { status: 503, headers: { "Content-Type": "application/json" } });

  try {
    const app = await context.request.json();
    const ltv = app.purchasePrice > 0 ? ((app.loanAmt / app.purchasePrice) * 100).toFixed(1) : 0;
    const arvLtv = app.arv > 0 ? ((app.loanAmt / app.arv) * 100).toFixed(1) : 0;

    const prompt = `You are a senior hard money loan underwriter for ZoneWise.AI. Analyze this loan application:

APPLICATION: Borrower: ${app.name} (${app.entity}), Property: ${app.propAddr}, Type: ${app.propType}, Condition: ${app.condition}, Purchase: $${app.purchasePrice?.toLocaleString()}, Loan: $${app.loanAmt?.toLocaleString()}, ARV: $${app.arv?.toLocaleString()}, Rehab: $${app.repairBudget?.toLocaleString()}, Term: ${app.term}mo, LTV: ${ltv}%, ARV-LTV: ${arvLtv}%, Experience: ${app.experience}, Credit: ${app.credit}, Liquid: $${app.liquid?.toLocaleString()}, Purpose: ${app.purpose}

Respond ONLY with JSON (no markdown): {"score":<0-100>,"verdict":"<APPROVE|CONDITIONAL_APPROVE|REVIEW|DECLINE>","verdict_summary":"<summary>","approval_probability":<0-100>,"recommended_rate":"<rate>","recommended_ltv_cap":"<ltv>","recommended_term":"<term>","strengths":["..."],"risks":["..."],"conditions":["..."],"deal_summary":"<summary>","exit_viability":"<analysis>","market_commentary":"<commentary>"}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
    });

    const data = await res.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
