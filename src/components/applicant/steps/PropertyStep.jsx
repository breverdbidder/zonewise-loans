/**
 * @fileoverview Step 2: Property Details
 * @module components/applicant/steps/PropertyStep
 */
import { COLORS, INPUT_STYLE, US_STATES } from "../../../utils/constants.js";
import { Card, CardHead } from "../../shared/Card.jsx";
import { Btn } from "../../shared/Btn.jsx";
import { Field, Grid } from "../../shared/Field.jsx";
const B = COLORS;
const is = INPUT_STYLE;

/**
 * Subject property details form step
 * @param {Object} props
 * @param {Object} props.form - Form state
 * @param {Function} props.u - Update function
 * @param {Function} props.setStep - Step navigation
 * @returns {JSX.Element}
 */
export function PropertyStep({ form, u, setStep }) {
  return (
    <div>
      <Card>
        <CardHead
          title="Subject Property"
          sub="The asset securing the loan"
        />
        <div style={{ padding: "8px 24px 24px" }}>
          <Field label="Property Address" required>
            <input
              style={is} value={form.propAddr}
              onChange={(e) => u("propAddr", e.target.value)}
              placeholder="456 Ocean Blvd"
            />
          </Field>
          <Grid cols={3}>
            <Field label="City" required>
              <input
                style={is} value={form.propCity}
                onChange={(e) => u("propCity", e.target.value)}
              />
            </Field>
            <Field label="State" required>
              <select
                style={is} value={form.propState}
                onChange={(e) => u("propState", e.target.value)}
              >
                {US_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="ZIP" required>
              <input
                style={is} value={form.propZip}
                onChange={(e) => u("propZip", e.target.value)}
                maxLength={10}
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="Property Type" required>
              <select
                style={is} value={form.propType}
                onChange={(e) => u("propType", e.target.value)}
              >
                <option value="sfr">Single Family</option>
                <option value="condo">Condo/Townhome</option>
                <option value="duplex">Duplex</option>
                <option value="triplex">Triplex</option>
                <option value="fourplex">Fourplex</option>
              </select>
            </Field>
            <Field label="Occupancy" required>
              <select
                style={is} value={form.occupancy}
                onChange={(e) => u("occupancy", e.target.value)}
              >
                <option value="investment">Investment (NOO)</option>
                <option value="primary">Primary</option>
                <option value="second">Second Home</option>
                <option value="vacant">Vacant</option>
              </select>
            </Field>
          </Grid>
          <Grid cols={3}>
            <Field label="Beds">
              <input
                style={is} type="number" value={form.beds}
                onChange={(e) => u("beds", e.target.value)}
              />
            </Field>
            <Field label="Baths">
              <input
                style={is} type="number" value={form.baths}
                onChange={(e) => u("baths", e.target.value)}
                step="0.5"
              />
            </Field>
            <Field label="Sq Ft">
              <input
                style={is} type="number" value={form.sqft}
                onChange={(e) => u("sqft", e.target.value)}
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="Year Built">
              <input
                style={is} type="number" value={form.yearBuilt}
                onChange={(e) => u("yearBuilt", e.target.value)}
              />
            </Field>
            <Field label="Condition">
              <select
                style={is} value={form.condition}
                onChange={(e) => u("condition", e.target.value)}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="distressed">Distressed</option>
              </select>
            </Field>
          </Grid>
        </div>
      </Card>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 20,
      }}>
        <Btn variant="back" onClick={() => setStep(1)}>&larr; Back</Btn>
        <Btn onClick={() => setStep(3)}>Continue &rarr; Loan Details</Btn>
      </div>
    </div>
  );
}
