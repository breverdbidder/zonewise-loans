/**
 * @fileoverview Form field components: Field, CurField, RadioGroup, CheckGroup, Sep, Grid
 * @module components/shared/Field
 *
 * BUG FIX (Mar 6 2026): CurField was reformatting via fC() on every keystroke,
 * causing cursor jumps and focus loss on mobile. Now formats on blur only.
 * Added React.memo to CurField/RadioGroup/CheckGroup to prevent re-renders.
 */
import { useCallback, memo } from "react";
import { COLORS, INPUT_STYLE } from "../../utils/constants.js";
import { fC } from "../../utils/formatters.js";
const B = COLORS;

/**
 * Form field wrapper with label and optional hint
 */
export const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{
      display: "block", fontSize: 12, fontWeight: 600,
      color: B.slate700, marginBottom: 5, letterSpacing: 0.2,
    }}>
      {label}
      {required && <span style={{ color: B.red }}> *</span>}
    </label>
    {children}
    {hint && (
      <div style={{ fontSize: 11, color: B.slate400, marginTop: 3 }}>
        {hint}
      </div>
    )}
  </div>
);

/**
 * Currency input field with $ prefix.
 * FIX: Formats on BLUR only (not every keystroke) to prevent cursor jumps.
 * Wrapped in React.memo to prevent re-mount on parent state changes.
 */
export const CurField = memo(({ label, required, hint, value, onChange }) => {
  const handleChange = useCallback((e) => {
    const raw = e.target.value.replace(/[^0-9,]/g, "");
    onChange(raw);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    if (value) onChange(fC(value));
  }, [value, onChange]);

  return (
    <Field label={label} required={required} hint={hint}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 13, top: "50%",
          transform: "translateY(-50%)",
          color: B.slate400, fontWeight: 600, fontSize: 13,
        }}>$</span>
        <input
          style={{ ...INPUT_STYLE, paddingLeft: 24 }}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={label}
        />
      </div>
    </Field>
  );
});

/**
 * Radio button group rendered as styled cards
 */
export const RadioGroup = memo(({ name, value, options, onChange }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: `repeat(${options.length},1fr)`,
    gap: 8,
  }}>
    {options.map(([v, l]) => (
      <label key={v} style={{ cursor: "pointer" }}>
        <input
          type="radio" name={name}
          checked={value === v}
          onChange={() => onChange(v)}
          style={{ display: "none" }}
        />
        <div style={{
          padding: "10px", borderRadius: 8, fontSize: 13,
          fontWeight: value === v ? 600 : 500,
          border: `1.5px solid ${value === v ? B.navy : B.slate200}`,
          background: value === v ? "rgba(30,58,95,0.04)" : "#fff",
          color: value === v ? B.navy : B.slate700,
          textAlign: "center", transition: "all 0.2s",
        }}>{l}</div>
      </label>
    ))}
  </div>
));

/**
 * Checkbox group rendered as styled cards
 */
export const CheckGroup = memo(({ values, options, onChange }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: `repeat(${Math.min(options.length, 4)},1fr)`,
    gap: 8,
  }}>
    {options.map(([v, l]) => (
      <label key={v} style={{ cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={values.includes(v)}
          onChange={(e) => onChange(
            e.target.checked
              ? [...values, v]
              : values.filter((x) => x !== v)
          )}
          style={{ display: "none" }}
        />
        <div style={{
          padding: "10px", borderRadius: 8, fontSize: 13,
          fontWeight: values.includes(v) ? 600 : 500,
          border: `1.5px solid ${values.includes(v) ? B.navy : B.slate200}`,
          background: values.includes(v) ? "rgba(30,58,95,0.04)" : "#fff",
          color: values.includes(v) ? B.navy : B.slate700,
          textAlign: "center",
        }}>{l}</div>
      </label>
    ))}
  </div>
));

/** Horizontal separator line */
export const Sep = () => (
  <div style={{ borderTop: `1px solid ${B.slate200}`, margin: "16px 0" }} />
);

/** Grid layout helper */
export const Grid = ({ cols = 2, children }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: `repeat(${cols},1fr)`,
    gap: 14,
  }}>{children}</div>
);
