import { Link } from "react-router-dom";
import { founderAssets, iconAssets } from "../assets";
import { usePageSeo } from "../hooks/usePageSeo";

const founders = [
  {
    key: "dharmendra",
    name: "Dharmendra Tiwari",
    role: "Co-Founder",
    summary: [
      "Professional Ayurvedic Therapist",
      "10+ years experience"
    ],
    image: founderAssets.dharmendra
  },
  {
    key: "pinku",
    name: "Pinku",
    role: "CEO (Operations)",
    summary: [
      "Nursing Expert",
      "5+ years experience"
    ],
    image: founderAssets.pinku
  }
];

export default function KnowFounders() {
  usePageSeo({
    title: "Know The Founders | Sathi Homecare",
    description: "Meet the founding team behind Sathi Homecare, from ayurvedic therapy expertise to nursing operations."
  });

  return (
    <div style={pageStyle} className="page-padding">
      <section style={heroStyle} className="compact-mobile-card">
        <div style={heroCopy}>
          <p style={eyebrow}>Know The Founders</p>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginTop: "12px" }}>
            <div style={brandLogoShell}>
              <img src={iconAssets.careHeart} alt="Sathi Homecare logo" style={brandLogoImage} />
            </div>
            <h1 style={{ ...title, margin: 0 }}>The leadership team building a trusted homecare experience</h1>
          </div>
          <p style={subtitle}>
            Sathi Homecare is being built for families who need dependable support, clear coordination, and a premium service experience from discovery to care delivery.
          </p>
          <div style={heroMetrics}>
            <Metric label="Founding roles" value="2" />
            <Metric label="Therapy experience" value="10+ yrs" />
            <Metric label="Nursing operations" value="5+ yrs" />
          </div>
          <Link to="/" style={homeLink} className="full-mobile-button">Back to Home</Link>
        </div>
        <div style={heroPanel}>
          <img src={iconAssets.careHeart} alt="Care icon" width="64" height="64" />
          <h2 style={{ margin: "20px 0 0", fontSize: "28px", lineHeight: 1.2 }}>Premium care, real operators, and startup-level execution.</h2>
          <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,0.82)", lineHeight: 1.8 }}>
            The team combines ayurvedic expertise and nursing operations to make care delivery dependable in the real world.
          </p>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeader} className="founders-header-grid">
          <div>
            <p style={eyebrowSecondary}>Founding team</p>
            <h2 style={sectionTitle}>Profiles with a cleaner launch-ready presentation</h2>
          </div>
        </div>

        <div style={gridStyle} className="founders-grid">
          {founders.map((founder) => (
            <article
              key={founder.key}
              style={cardStyle}
              className="compact-mobile-card"
            >
              <div style={imageWrap}>
                <img src={founder.image} alt={`${founder.name} portrait placeholder`} loading="lazy" style={imageStyle} />
              </div>
              <div style={cardBody}>
                <p style={cardEyebrow}>{founder.role}</p>
                <h3 style={cardTitle}>{founder.name}</h3>
                <div style={summaryList}>
                  {founder.summary.map((line) => (
                    <p key={line} style={summaryItem}>{line}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={missionStyle} className="compact-mobile-card">
        <p style={eyebrowSecondary}>Launch outlook</p>
        <h2 style={missionTitle}>Care that feels premium to families and operationally manageable for the team</h2>
        <p style={missionText}>
          The launch goal is simple: verified services, secure booking and payment flows, stronger admin visibility, and a brand presentation that builds trust before the first call happens.
        </p>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricCard}>
      <strong style={{ fontSize: "24px", color: "#ffffff" }}>{value}</strong>
      <span style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.5 }}>{label}</span>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 100%)",
  padding: "32px 24px 60px",
  fontFamily: "'Poppins', 'Segoe UI', sans-serif",
  color: "#102542"
};

const heroStyle = {
  maxWidth: "1240px",
  margin: "0 auto",
  borderRadius: "32px",
  padding: "32px",
  background: "linear-gradient(135deg, #082f49 0%, #0f766e 58%, #0f172a 100%)",
  color: "#ffffff",
  boxShadow: "0 24px 60px rgba(4, 20, 38, 0.16)",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
  gap: "22px"
};

const heroCopy = {
  display: "grid",
  alignContent: "start"
};

const heroPanel = {
  borderRadius: "26px",
  padding: "24px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(12px)"
};

const eyebrow = {
  margin: 0,
  color: "#99f6e4",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const eyebrowSecondary = {
  margin: 0,
  color: "#0f766e",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const title = {
  fontSize: "clamp(2.2rem, 4vw, 4rem)",
  lineHeight: 1.08
};

const subtitle = {
  margin: "14px 0 0",
  maxWidth: "760px",
  lineHeight: 1.8,
  color: "rgba(255,255,255,0.84)"
};

const heroMetrics = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "14px",
  marginTop: "24px"
};

const metricCard = {
  borderRadius: "20px",
  padding: "18px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  display: "grid",
  gap: "8px"
};

const homeLink = {
  marginTop: "24px",
  display: "inline-flex",
  textDecoration: "none",
  background: "#ffffff",
  color: "#102542",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: 700,
  justifyContent: "center"
};

const sectionStyle = {
  maxWidth: "1240px",
  margin: "0 auto",
  paddingTop: "32px"
};

const sectionHeader = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "20px",
  alignItems: "end"
};

const sectionTitle = {
  margin: "10px 0 0",
  fontSize: "clamp(1.9rem, 3vw, 2.8rem)"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "22px",
  marginTop: "24px"
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
  border: "1px solid rgba(148, 163, 184, 0.16)"
};

const imageWrap = {
  padding: "14px",
  background: "linear-gradient(145deg, #eff6ff, #ecfdf5)"
};

const imageStyle = {
  width: "80%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  objectPosition: "top center",
  borderRadius: "22px",
  display: "block",
  margin: "0 auto"
};

const cardBody = {
  padding: "22px"
};

const cardEyebrow = {
  margin: 0,
  color: "#0f766e",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "12px"
};

const cardTitle = {
  margin: "10px 0 0",
  fontSize: "24px",
  lineHeight: 1.12
};

const summaryList = {
  display: "grid",
  gap: "8px",
  marginTop: "16px"
};

const summaryItem = {
  margin: 0,
  color: "#334155",
  lineHeight: 1.7,
  fontWeight: 500
};

const missionStyle = {
  maxWidth: "1240px",
  margin: "30px auto 0",
  borderRadius: "28px",
  background: "#ffffff",
  padding: "28px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const missionTitle = {
  margin: "10px 0 0",
  fontSize: "clamp(1.8rem, 3vw, 2.6rem)"
};

const missionText = {
  margin: "12px 0 0",
  color: "#475569",
  lineHeight: 1.8,
  maxWidth: "840px"
};

const brandLogoShell = {
  width: "60px",
  height: "60px",
  borderRadius: "18px",
  overflow: "hidden",
  background: "#ffffff",
  boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
  flexShrink: 0
};

const brandLogoImage = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  transform: "scale(0.94)"
};
