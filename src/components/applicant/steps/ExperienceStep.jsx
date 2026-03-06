/**
 * @fileoverview Step 5: Investor Experience & Financials
 * @module components/applicant/steps/ExperienceStep
 */
import { COLORS, INPUT_STYLE } from "../../../utils/constants.js";
import { Card, CardHead } from "../../shared/Card.jsx";
import { Btn } from "../../shared/Btn.jsx";
import { Field, CurField, RadioGroup, Grid } from "../../shared/Field.jsx";
const B = COLORS;
const is = INPUT_STYLE;

/**
 * Experience and financial information step
 * @param {Object} props
 * @param {Object} props.form - Form state
 * @param {Function} props.u - Update function
 * @param {Function} props.setStep - Step navigation
 * @returns {JSX.Element}
 */
export function ExperienceStep({ form, u, setStep }) {
  return (
    <div>
      <Card>
        <CardHead
          title="Investor Experience & Financials"
          sub="Track record and financial position"
        />
        <div style={{ padding: "8px 24px 24px" }}>
          <Grid>
            <Field label="Experience" required>
              <select
                style={is} value={form.experience}
                onChange={(e) => u("experience", e.target.value)}
              >
                <option value="first">First-Time</option>
                <option value="1-3">1&#x2013;3 Deals</option>
                <option value="4-10">4&#x2013;10 Deals</option>
                <option value="11-25">11&#x2013;25 Deals</option>
                <option value="25+">25+ Deals</option>
              </select>
            </Field>
            <Field label="Properties Owned">
              <input
                style={is} type="number"
                value={form.propsOwned}
                onChange={(e) => u("propsOwned", e.target.value)}
                min="0"
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="Credit Score" required hint="No hard pull">
              <select
                style={is} value={form.creditScore}
                onChange={(e) => u("creditScore", e.target.value)}
              >
                <option value="720+">720+ (Excellent)</option>
                <option value="680-719">680&#x2013;719</option>
                <option value="640-679">640&#x2013;679</option>
                <option value="600-639">600&#x2013;639</option>
                <option value="below600">Below 600</option>
              </select>
            </Field>
            <CurField
              label="Liquid Assets" required
              hint="Cash, stocks, crypto"
              value={form.liquid}
              onChange={(v) => u("liquid", v)}
            />
          </Grid>
          <Grid>
            <Field label="BK / Foreclosure">
              <select
                style={is} value={form.bkHist}
                onChange={(e) => u("bkHist", e.target.value)}
              >
                <option value="none">None</option>
                <option value="bk7">BK Ch.7</option>
                <option value="bk13">BK Ch.13</option>
                <option value="fc">Foreclosure</option>
              </select>
            </Field>
            <Field label="Existing Liens">
              <select
                style={is} value={form.liens}
                onChange={(e) => u("liens", e.target.value)}
              >
                <option value="none">None</option>
                <option value="1st">First Mortgage</option>
                <option value="multi">Multiple</option>
                <option value="tax">Tax Liens</option>
              </select>
            </Field>
          </Grid>
          <Field label="GC Status">
            <RadioGroup
              name="gc" value={form.gc}
              options={[
                ["yes", "Has GC"],
                ["self", "Self (Licensed)"],
                ["no", "TBD"],
              ]}
              onChange={(v) => u("gc", v)}
            />
          </Field>
          <Field label="Additional Notes">
            <textarea
              style={{ ...is, minHeight: 70, resize: "vertical" }}
              value={form.addNotes}
              onChange={(e) => u("addNotes", e.target.value)}
              placeholder="Timeline urgency, referral source..."
            />
          </Field>
        </div>
      </Card>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 20,
      }}>
        <Btn variant="back" onClick={() => setStep(4)}>&larr; Back</Btn>
        <Btn variant="orange" onClick={() => setStep(6)}>
          Review &amp; Submit &rarr;
        </Btn>
      </div>
    </div>
  );
}
