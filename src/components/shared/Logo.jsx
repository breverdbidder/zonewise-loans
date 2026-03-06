/**
 * @fileoverview ZoneWise.AI brand logo component
 * @module components/shared/Logo
 */
import { COLORS } from "../../utils/constants.js";
const B = COLORS;

/**
 * ZoneWise.AI logo with gradient icon
 * @param {Object} props
 * @param {"sm"|"md"} [props.size="md"] - Logo size
 * @returns {JSX.Element}
 */
export const Logo = ({ size = "md" }) => (
  <div style={{
    display: "flex", alignItems: "center",
    gap: size === "sm" ? 10 : 14,
  }}>
    <div style={{
      width: size === "sm" ? 36 : 44,
      height: size === "sm" ? 36 : 44,
      background: `linear-gradient(135deg,${B.orange},${B.orangeLight})`,
      borderRadius: size === "sm" ? 8 : 11,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Fraunces',Georgia,serif",
      fontWeight: 900,
      fontSize: size === "sm" ? 17 : 21,
      color: B.navyDeep,
      boxShadow: "0 4px 16px rgba(245,158,11,0.25)",
    }}>Z</div>
    <div>
      <div style={{
        fontFamily: "'Fraunces',Georgia,serif",
        fontWeight: 800,
        fontSize: size === "sm" ? 17 : 20,
        color: "#fff",
        letterSpacing: -0.5,
      }}>ZoneWise<span style={{ color: B.orangeLight }}>.AI</span></div>
      <div style={{
        fontSize: size === "sm" ? 9 : 10,
        color: B.orangeLight,
        fontWeight: 500,
        letterSpacing: 2,
        textTransform: "uppercase",
        marginTop: -2,
      }}>Lending Intelligence</div>
    </div>
  </div>
);
