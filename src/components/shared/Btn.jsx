/**
 * @fileoverview Reusable button component with variant styles
 * @module components/shared/Btn
 */
import { COLORS } from "../../utils/constants.js";
const B = COLORS;

const variants = {
  primary: {
    background: `linear-gradient(135deg,${B.navy},${B.navyMid})`,
    color: "#fff",
    border: "none",
    boxShadow: "0 2px 8px rgba(30,58,95,0.25)",
  },
  orange: {
    background: `linear-gradient(135deg,${B.orange},${B.orangeLight})`,
    color: B.navyDeep,
    border: "none",
    boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
  },
  back: {
    background: "none",
    color: B.slate400,
    border: `1px solid ${B.slate200}`,
  },
  ghost: {
    background: "none",
    color: B.slate400,
    border: "1px solid rgba(255,255,255,0.15)",
  },
  success: {
    background: `linear-gradient(135deg,${B.green},#059669)`,
    color: "#fff",
    border: "none",
    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
  },
  danger: {
    background: `linear-gradient(135deg,${B.red},#dc2626)`,
    color: "#fff",
    border: "none",
    boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
  },
};

/**
 * Button component with multiple visual variants
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {"primary"|"orange"|"back"|"ghost"|"success"|"danger"} [props.variant="primary"]
 * @param {Function} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {Object} [props.style] - Additional styles
 * @returns {JSX.Element}
 */
export const Btn = ({
  children, variant = "primary", onClick, disabled, style: sx,
}) => {
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 22px", borderRadius: 8,
        fontSize: 13, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        transition: "all 0.2s",
        opacity: disabled ? 0.5 : 1,
        ...v, ...sx,
      }}
    >{children}</button>
  );
};
