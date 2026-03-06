/**
 * @fileoverview Admin Beta Tester Management Panel
 * @module components/admin/BetaPanel
 *
 * Embedded in AdminDashboard. Allows admin to:
 * - View beta testers list
 * - Log bug reports from testers
 * - Generate fix notifications (SMS/email)
 * - Send weekly digests
 * - Track communication history
 */
import { useState, useCallback } from "react";
import { COLORS } from "../../utils/constants.js";
import {
  generateBugFixNotification,
  generateFeatureNotification,
  generateWeeklyDigest,
} from "../../utils/betaComms.js";

const B = COLORS;

const cardStyle = {
  background: "#fff",
  border: `1px solid ${B.slate200}`,
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
};

const inputStyle = {
  width: "100%",
  padding: "10px 13px",
  border: `1.5px solid ${B.slate200}`,
  borderRadius: 8,
  fontSize: 13,
  color: B.slate800,
  background: "#fff",
  outline: "none",
  fontFamily: "'Plus Jakarta Sans',sans-serif",
};

const btnStyle = (primary = false) => ({
  padding: "10px 20px",
  borderRadius: 8,
  border: primary ? "none" : `1px solid ${B.slate200}`,
  background: primary
    ? `linear-gradient(135deg,${B.orange},${B.orangeLight})`
    : "#fff",
  color: primary ? B.navyDeep : B.slate600,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans',sans-serif",
});

/**
 * Beta Tester Management Panel
 * @returns {JSX.Element}
 */
export function BetaPanel() {
  const [activeTab, setActiveTab] = useState("bugfix");
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(false);

  // Bug fix form
  const [bugForm, setBugForm] = useState({
    testerName: "",
    testerNumber: "",
    bugTitle: "",
    bugDescription: "",
    rootCauses: "",
    fixes: "",
    testSteps: "",
    appUrl: "",
  });

  // Feature form
  const [featureForm, setFeatureForm] = useState({
    testerName: "",
    featureTitle: "",
    featureDescription: "",
    whatToTest: "",
    appUrl: "",
  });

  // Digest form
  const [digestForm, setDigestForm] = useState({
    testerName: "",
    bugsFixed: "",
    featuresShipped: "",
    highlights: "",
    upNext: "",
    totalBetaTesters: "1",
  });

  const updateBug = useCallback((k, v) => setBugForm(p => ({ ...p, [k]: v })), []);
  const updateFeature = useCallback((k, v) => setFeatureForm(p => ({ ...p, [k]: v })), []);
  const updateDigest = useCallback((k, v) => setDigestForm(p => ({ ...p, [k]: v })), []);

  const splitLines = (s) => s.split("\n").map(l => l.trim()).filter(Boolean);

  const handleGenerate = () => {
    let result;
    if (activeTab === "bugfix") {
      result = generateBugFixNotification({
        testerName: bugForm.testerName || "there",
        testerNumber: parseInt(bugForm.testerNumber) || 0,
        bugTitle: bugForm.bugTitle,
        bugDescription: bugForm.bugDescription,
        rootCauses: splitLines(bugForm.rootCauses),
        fixes: splitLines(bugForm.fixes),
        testSteps: splitLines(bugForm.testSteps).map(s => {
          const [step, expected] = s.split("→").map(x => x.trim());
          return { step, expected };
        }),
        appUrl: bugForm.appUrl,
      });
    } else if (activeTab === "feature") {
      result = generateFeatureNotification({
        testerName: featureForm.testerName || "there",
        featureTitle: featureForm.featureTitle,
        featureDescription: featureForm.featureDescription,
        whatToTest: splitLines(featureForm.whatToTest),
        appUrl: featureForm.appUrl,
      });
    } else {
      result = generateWeeklyDigest({
        testerName: digestForm.testerName || "there",
        bugsFixed: parseInt(digestForm.bugsFixed) || 0,
        featuresShipped: parseInt(digestForm.featuresShipped) || 0,
        highlights: splitLines(digestForm.highlights),
        upNext: splitLines(digestForm.upNext),
        totalBetaTesters: parseInt(digestForm.totalBetaTesters) || 1,
      });
    }
    setGenerated(result);
    setCopied(false);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const FormField = ({ label, value, onChange, multiline = false, hint = "" }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: B.slate700, marginBottom: 4,
      }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: B.slate400 }}> — {hint}</span>}
      </label>
      {multiline ? (
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          style={inputStyle}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 24 }}>📣</span>
        <div>
          <h2 style={{
            fontFamily: "'Fraunces',Georgia,serif",
            fontSize: 20, fontWeight: 700, color: B.navy, margin: 0,
          }}>
            Beta Tester Communications
          </h2>
          <p style={{ fontSize: 12, color: B.slate400, margin: 0 }}>
            Generate professional notifications for your beta testers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 20,
      }}>
        {[
          { id: "bugfix", label: "🐛 Bug Fix", desc: "Notify tester their bug is fixed" },
          { id: "feature", label: "🚀 New Feature", desc: "Request testing on new feature" },
          { id: "digest", label: "📊 Weekly Digest", desc: "Summary of the week" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setGenerated(null); }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: `2px solid ${activeTab === t.id ? B.navy : B.slate200}`,
              background: activeTab === t.id ? `${B.navy}08` : "#fff",
              color: activeTab === t.id ? B.navy : B.slate600,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700 }}>{t.label}</div>
            <div style={{ fontSize: 10, color: B.slate400, marginTop: 2 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* LEFT: Form */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: B.navy,
            marginBottom: 16, marginTop: 0,
          }}>
            {activeTab === "bugfix" ? "Bug Fix Details" :
             activeTab === "feature" ? "Feature Details" : "Weekly Stats"}
          </h3>

          {activeTab === "bugfix" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FormField label="Tester Name" value={bugForm.testerName}
                onChange={v => updateBug("testerName", v)} />
              <FormField label="Tester #" value={bugForm.testerNumber}
                onChange={v => updateBug("testerNumber", v)} hint="e.g. 1" />
            </div>
            <FormField label="Bug Title" value={bugForm.bugTitle}
              onChange={v => updateBug("bugTitle", v)} hint="Short description" />
            <FormField label="What They Experienced" value={bugForm.bugDescription}
              onChange={v => updateBug("bugDescription", v)} multiline />
            <FormField label="Root Causes" value={bugForm.rootCauses}
              onChange={v => updateBug("rootCauses", v)} multiline
              hint="One per line, simplified for non-devs" />
            <FormField label="What We Fixed" value={bugForm.fixes}
              onChange={v => updateBug("fixes", v)} multiline
              hint="One per line, user-friendly" />
            <FormField label="Test Steps" value={bugForm.testSteps}
              onChange={v => updateBug("testSteps", v)} multiline
              hint="One per line. Use → for expected result" />
            <FormField label="App URL" value={bugForm.appUrl}
              onChange={v => updateBug("appUrl", v)} hint="Optional" />
          </>}

          {activeTab === "feature" && <>
            <FormField label="Tester Name" value={featureForm.testerName}
              onChange={v => updateFeature("testerName", v)} />
            <FormField label="Feature Title" value={featureForm.featureTitle}
              onChange={v => updateFeature("featureTitle", v)} />
            <FormField label="Description" value={featureForm.featureDescription}
              onChange={v => updateFeature("featureDescription", v)} multiline />
            <FormField label="What to Test" value={featureForm.whatToTest}
              onChange={v => updateFeature("whatToTest", v)} multiline hint="One per line" />
            <FormField label="App URL" value={featureForm.appUrl}
              onChange={v => updateFeature("appUrl", v)} />
          </>}

          {activeTab === "digest" && <>
            <FormField label="Tester Name" value={digestForm.testerName}
              onChange={v => updateDigest("testerName", v)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <FormField label="Bugs Fixed" value={digestForm.bugsFixed}
                onChange={v => updateDigest("bugsFixed", v)} />
              <FormField label="Features Shipped" value={digestForm.featuresShipped}
                onChange={v => updateDigest("featuresShipped", v)} />
              <FormField label="Total Testers" value={digestForm.totalBetaTesters}
                onChange={v => updateDigest("totalBetaTesters", v)} />
            </div>
            <FormField label="Key Changes" value={digestForm.highlights}
              onChange={v => updateDigest("highlights", v)} multiline hint="One per line" />
            <FormField label="Coming Next Week" value={digestForm.upNext}
              onChange={v => updateDigest("upNext", v)} multiline hint="One per line" />
          </>}

          <button onClick={handleGenerate} style={btnStyle(true)}>
            Generate Message
          </button>
        </div>

        {/* RIGHT: Preview */}
        <div style={cardStyle}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 12,
          }}>
            <h3 style={{
              fontSize: 14, fontWeight: 700, color: B.navy, margin: 0,
            }}>
              {generated ? "📱 Preview" : "Preview will appear here"}
            </h3>
            {generated && (
              <button
                onClick={() => handleCopy(generated.sms)}
                style={{
                  ...btnStyle(copied),
                  padding: "6px 14px",
                  fontSize: 12,
                }}
              >
                {copied ? "✅ Copied!" : "📋 Copy SMS"}
              </button>
            )}
          </div>

          {generated ? (
            <div style={{
              background: B.slate50,
              border: `1px solid ${B.slate200}`,
              borderRadius: 10,
              padding: 16,
              maxHeight: 500,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              fontSize: 13,
              lineHeight: 1.6,
              color: B.slate800,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>
              {generated.sms}
            </div>
          ) : (
            <div style={{
              background: B.slate50,
              borderRadius: 10,
              padding: 40,
              textAlign: "center",
              color: B.slate400,
              fontSize: 13,
            }}>
              Fill out the form and click "Generate Message" to preview
            </div>
          )}

          {generated && (
            <div style={{
              marginTop: 12,
              padding: 10,
              background: `${B.orange}10`,
              borderRadius: 8,
              fontSize: 11,
              color: B.slate600,
            }}>
              <strong style={{ color: B.navy }}>Email subject:</strong>{" "}
              {generated.email.subject}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
