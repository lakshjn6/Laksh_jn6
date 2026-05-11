import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#07090f",
  bg2: "#0c1018",
  card: "#0f1520",
  border: "#1a2540",
  accent: "#00e5b0",
  accent2: "#6c63ff",
  text: "#dce8f5",
  muted: "#5a6d8a",
};

const styles = {
  global: `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&family=Clash+Display:wght@400;600;700&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      background: #07090f;
      color: #dce8f5;
      font-family: 'JetBrains Mono', monospace;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #07090f; }
    ::-webkit-scrollbar-thumb { background: #00e5b0; border-radius: 2px; }
    ::selection { background: rgba(0,229,176,0.25); color: #00e5b0; }

    @keyframes gridPan {
      0%   { background-position: 0 0; }
      100% { background-position: 60px 60px; }
    }
    @keyframes blobFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33%       { transform: translate(40px, -30px) scale(1.05); }
      66%       { transform: translate(-20px, 20px) scale(0.97); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .fade-in { animation: fadeUp 0.7s ease forwards; }
    .visible { opacity: 1 !important; transform: translateY(0) !important; }

    /* Responsive Utilities */
    .nav-links {
      display: flex;
      gap: 32px;
    }
    .nav-hamburger {
      display: none;
      background: transparent;
      border: none;
      color: ${COLORS.accent};
      font-size: 32px;
      line-height: 1;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Hero Split Layout */
    .hero-split {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 50px;
      width: 100%;
      margin-bottom: 40px;
    }
    .hero-text-side {
      flex: 1;
    }
    .hero-image-side {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      animation: fadeUp 0.6s ease 0.4s both;
    }
    .hero-profile-img {
      width: 100%;
      max-width: 420px;
      aspect-ratio: 4/5;
      object-fit: cover;
      border-radius: 24px;
      border: 1px solid rgba(0,229,176,0.3);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(0,229,176,0.1);
      transition: transform 0.3s ease;
    }
    .hero-profile-img:hover {
      transform: translateY(-8px);
      border-color: rgba(0,229,176,0.6);
    }

    @media (max-width: 900px) {
      .nav-links {
        display: none !important;
      }
      .nav-links.mobile-open {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 61px;
        left: 0;
        right: 0;
        background: rgba(7,9,15,0.98);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid ${COLORS.border};
        padding: 24px 5%;
        gap: 20px;
        align-items: flex-start;
      }
      .nav-hamburger {
        display: block !important;
      }
      .hero-split {
        flex-direction: column;
        gap: 40px;
        text-align: left;
      }
      .hero-image-side {
        justify-content: flex-start;
      }
    }
    @media (max-width: 600px) {
      .hero-stats {
        flex-direction: column;
        gap: 24px !important;
      }
      .hero-stats > div {
        border-right: none !important;
        margin-right: 0 !important;
        padding-right: 0 !important;
      }
    }
  `,
};

// ── tiny hook for intersection observer ──────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Animated section wrapper ─────────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Tag pill ─────────────────────────────────────────────────────────────────
function Tag({ children, accent }) {
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      letterSpacing: "0.12em",
      padding: "3px 10px",
      borderRadius: 3,
      border: `1px solid ${accent ? "rgba(0,229,176,0.35)" : "#1a2540"}`,
      background: accent ? "rgba(0,229,176,0.07)" : "transparent",
      color: accent ? COLORS.accent : COLORS.muted,
    }}>{children}</span>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ tag, title, sub }) {
  return (
    <Reveal style={{ marginBottom: 52 }}>
      <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: "0.25em", marginBottom: 10 }}>
        {tag}
      </div>
      <h2 style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "clamp(28px, 4vw, 44px)",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        color: COLORS.text,
      }}>
        {title} <span style={{ color: COLORS.muted }}>{sub}</span>
      </h2>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────
function Nav({ active }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["about", "skills", "experience", "projects", "achievements", "contact"];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: scrolled || menuOpen ? "rgba(7,9,15,0.92)" : "transparent",
      backdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
      borderBottom: scrolled || menuOpen ? `1px solid ${COLORS.border}` : "none",
      transition: "all 0.3s ease",
      padding: "0 5%",
    }}>
      <div style={{
        maxWidth: 1140, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 62, width: "100%"
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
          color: COLORS.accent,
        }}>
          {"<...Laksh_jn...>"}
        </div>

        {/* Mobile Hamburger Icon */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "×" : "="}
        </button>

        {/* Links */}
        <div className={`nav-links ${menuOpen ? "mobile-open" : ""}`}>
          {links.map(l => (
            <a key={l} href={`#${l}`}
              onClick={() => setMenuOpen(false)}
              style={{
                color: active === l ? COLORS.accent : COLORS.muted,
                textDecoration: "none", fontSize: 11, letterSpacing: "0.15em",
                transition: "color 0.2s",
                borderBottom: active === l ? `1px solid ${COLORS.accent}` : "none",
                paddingBottom: 2,
              }}
              onMouseEnter={e => e.target.style.color = COLORS.accent}
              onMouseLeave={e => e.target.style.color = active === l ? COLORS.accent : COLORS.muted}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const [typed, setTyped] = useState("");
  const full = "Backend Engineer · AI Developer · ML Enthusiast";
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTyped(full.slice(0, i));
      i++;
      if (i > full.length) clearInterval(id);
    }, 38);
    return () => clearInterval(id);
  }, []);

  const stats = [
    { num: "8.79", label: "CGPA / 10" },
    { num: "800+", label: "DSA Problems" },
    { num: "Top 1%", label: "Amazon ML 2025" },
    { num: "#1054", label: "LeetCode Global" },
  ];

  return (
    <section id="about" style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "120px 5% 60px",
      maxWidth: 1140, margin: "0 auto",
      position: "relative",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(0,229,176,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,176,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        animation: "gridPan 25s linear infinite",
      }} />
      {/* Blobs */}
      <div style={{
        position: "fixed", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,229,176,0.08) 0%, transparent 70%)",
        top: -150, left: -150, pointerEvents: "none", zIndex: 0,
        animation: "blobFloat 12s ease-in-out infinite",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* NEW SPLIT LAYOUT CONTAINER */}
        <div className="hero-split">

          {/* LEFT SIDE: Text Content */}
          <div className="hero-text-side">
            <div style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 11, color: COLORS.accent, letterSpacing: "0.2em",
                border: `1px solid rgba(0,229,176,0.3)`,
                padding: "6px 14px", borderRadius: 20, marginBottom: 28,
                background: "rgba(0,229,176,0.06)",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: COLORS.accent, display: "inline-block",
                  animation: "pulse 2s infinite",
                }} />
                It compiles; ship it
              </span>
            </div>

            <div style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
              <h1 style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(52px, 8vw, 90px)",
                fontWeight: 700, lineHeight: 1,
                letterSpacing: "-0.03em", marginBottom: 8,
              }}>
                <span style={{ color: COLORS.text }}>Lakshay</span>
              </h1>
              <h1 style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(52px, 8vw, 90px)",
                fontWeight: 700, lineHeight: 1,
                letterSpacing: "-0.03em", marginBottom: 24,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% 200%",
                animation: "gradientShift 4s ease infinite",
              }}>
                Mittal
              </h1>
            </div>

            <div style={{ animation: "fadeUp 0.6s ease 0.35s both" }}>
              <p style={{
                fontSize: 14, color: COLORS.muted, letterSpacing: "0.05em",
                marginBottom: 36, minHeight: 24,
              }}>
                {typed}<span style={{ color: COLORS.accent, animation: "pulse 1s infinite" }}>|</span>
              </p>
            </div>

            <div style={{ animation: "fadeUp 0.6s ease 0.45s both" }}>
              <p style={{
                fontSize: 14, color: COLORS.muted, lineHeight: 1.9,
                maxWidth: 500, marginBottom: 40,
              }}>
                B.Tech CSE @ <span style={{ color: COLORS.text, fontWeight: 700 }}>BIT Mesra</span> · CGPA 8.79 ·
                Director @ <span style={{ color: COLORS.text, fontWeight: 700 }}>Society for Data Science</span>.
                Building scalable backends and intelligent ML systems that solve real problems.
              </p>
            </div>

            <div style={{ animation: "fadeUp 0.6s ease 0.55s both", display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="mailto:lakshayjain0611@gmail.com" style={{
                padding: "12px 28px", background: COLORS.accent, color: "#07090f",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.18em", borderRadius: 4, textDecoration: "none",
                transition: "all 0.2s", border: "none", cursor: "pointer",
              }}
                onMouseEnter={e => { e.target.style.background = "#00ccaa"; e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.target.style.background = COLORS.accent; e.target.style.transform = "translateY(0)"; }}
              >
                GET IN TOUCH
              </a>
              <a href="https://github.com/lakshjn6" target="_blank" rel="noreferrer" style={{
                padding: "12px 28px", background: "transparent", color: COLORS.accent,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.18em", borderRadius: 4, textDecoration: "none",
                border: `1px solid ${COLORS.accent}`, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.target.style.background = "rgba(0,229,176,0.08)"; e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.transform = "translateY(0)"; }}
              >
                VIEW GITHUB
              </a>
            </div>
          </div>

          {/* RIGHT SIDE: Image */}
          <div className="hero-image-side">
            {/* MAKE SURE TO RENAME YOUR IMAGE TO profile.jpg OR UPDATE THE src BELOW */}
            <img
              src="/profile.jpg"
              alt="Lakshay Mittal"
              className="hero-profile-img"
            />
          </div>

        </div>

        {/* Stats Section (Moved below the split layout) */}
        <div className="hero-stats" style={{
          animation: "fadeUp 0.6s ease 0.65s both",
          display: "flex", gap: 0, flexWrap: "wrap",
          borderTop: `1px solid ${COLORS.border}`, paddingTop: 40,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: "1 1 140px", padding: "0 32px 0 0",
              borderRight: i < stats.length - 1 ? `1px solid ${COLORS.border}` : "none",
              marginRight: i < stats.length - 1 ? 32 : 0,
            }}>
              <div style={{
                fontSize: "clamp(24px,3vw,36px)", fontWeight: 700,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", marginBottom: 4,
              }}>{s.num}</div>
              <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────────────────────────────────────
function Skills() {
  const skills = [
    { cat: "LANGUAGES", items: ["Python", "C++", "SQL"] },
    { cat: "BACKEND & WEB", items: ["Django", "Flask", "REST APIs"] },
    { cat: "MACHINE LEARNING", items: ["Supervised Learning", "Unsupervised Learning", "Feature Engineering", "Model Evaluation"] },
    { cat: "DEEP LEARNING & NLP", items: ["BERT", "RoBERTa", "CNN", "RNN", "LSTM", "BiGRU", "Transformers"] },
    { cat: "LIBRARIES", items: ["TensorFlow", "Keras", "Scikit-learn", "NumPy", "Pandas", "NLTK", "Matplotlib"] },
    { cat: "DATABASES & DEVOPS", items: ["PostgreSQL", "MySQL", "Docker", "Git", "Power BI", "Jupyter"] },
  ];

  return (
    <section id="skills" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 5% 100px" }}>
      <SectionHeader title="Skills &" sub="Tools" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {skills.map((s, i) => (
          <Reveal key={i} delay={i * 0.07} style={{ height: "100%" }}>
            <SkillCard {...s} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SkillCard({ cat, items }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.card,
        border: `1px solid ${hovered ? "rgba(0,229,176,0.4)" : COLORS.border}`,
        borderRadius: 8, padding: "22px 24px",
        transition: "all 0.25s",
        transform: hovered ? "translateY(-4px)" : "none",
        position: "relative", overflow: "hidden",
        height: "100%",
        display: "flex", flexDirection: "column"
      }}
    >
      {hovered && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent2})`,
        }} />
      )}
      <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: "0.2em", marginBottom: 14 }}>{cat}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((item, j) => (
          <span key={j} style={{
            fontSize: 12, color: COLORS.text, padding: "4px 10px",
            background: "rgba(255,255,255,0.04)", borderRadius: 3,
            border: `1px solid ${COLORS.border}`,
          }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION
// ─────────────────────────────────────────────────────────────────────────────
function Education() {
  const edu = [
    {
      school: "Birla Institute of Technology, Mesra",
      deg: "B.Tech Computer Science & Engineering",
      period: "Sep 2023 – Apr 2027",
      score: "8.79",
      scoreLabel: "CGPA",
      courses: ["DBMS", "OOP", "Operating Systems", "Computer Networks"],
    },

  ];
  return (
    <section id="education" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 5% 100px" }}>
      <SectionHeader title="Academic" sub="Background" />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {edu.map((e, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <EduCard {...e} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function EduCard({ school, deg, period, score, scoreLabel, courses }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.card,
        border: `1px solid ${hovered ? "rgba(0,229,176,0.35)" : COLORS.border}`,
        borderRadius: 10, padding: "24px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
        transition: "all 0.25s",
        transform: hovered ? "translateX(6px)" : "none",
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{school}</div>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: courses.length ? 12 : 0 }}>{deg} · {period}</div>
        {courses.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {courses.map((c, i) => <Tag key={i} accent>{c}</Tag>)}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{
          fontSize: 32, fontWeight: 700,
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>{score}</div>
        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em" }}>{scoreLabel}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────────────────────────────────────
function Experience() {
  return (
    <section id="experience" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 5% 100px" }}>
      <SectionHeader title="Work" sub="History" />
      <Reveal>
        <div style={{
          borderLeft: `2px solid ${COLORS.accent}`, paddingLeft: 32,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", left: -7, top: 8,
            width: 12, height: 12, borderRadius: "50%",
            background: COLORS.accent,
            boxShadow: `0 0 12px ${COLORS.accent}`,
          }} />
          <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: "0.2em", marginBottom: 6 }}>
            MARCH 2025 – JULY 2025
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
            Backend & AI Development Intern
          </h3>
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.12em", marginBottom: 16 }}>
            COCOLEVIO LLC · NOIDA, UP
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {["Docker", "JIRA", "Flask", "PostgreSQL", "NLP", "HuggingFace", "Deep Learning", "ML"].map((t, i) => (
              <Tag key={i} accent>{t}</Tag>
            ))}
          </div>

          {[
            {
              title: "Risky Ticket System",
              bullets: [
                "Collected historical & live ticket data via JIRA APIs, storing structured records in PostgreSQL.",
                "Built a Decision Tree–based ML pipeline with data preprocessing to predict risky tickets before completion.",
              ],
            },
            {
              title: "AI Speaking Avatar",
              bullets: [
                "Developed an AI speaking avatar system using Wav2Lip and deep learning models for interview simulation.",
                "Applied NLP techniques for resume–job semantic matching using pretrained models and feature embeddings.",
              ],
            },
          ].map((proj, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: COLORS.accent2,
                marginBottom: 10, display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: COLORS.accent2, display: "inline-block",
                }} />
                {proj.title}
              </div>
              {proj.bullets.map((b, j) => (
                <div key={j} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  marginBottom: 8, paddingLeft: 16,
                }}>
                  <span style={{ color: COLORS.accent, marginTop: 2, flexShrink: 0 }}>▸</span>
                  <span style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.75 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
function Projects() {
  const projects = [
    {
      year: "2025 – 26",
      name: "GreatKart",
      desc: "Scalable e-commerce backend with a custom admin panel for managing products, inventory, and orders. Includes secure authentication, payment processing, and optimized DB-driven cart logic.",
      stack: ["Django", "Python", "PostgreSQL", "REST APIs"],
      link: "https://github.com/lakshjn6/IndaneConnect-Portal",
    },
    {
      year: "2024 – 25",
      name: "FinSent Explainer",
      desc: "NLP-based complaint analysis system detecting emotions, sentiments, domains, and complaints from financial text using a RoBERTa + BiGRU + CentralNet + ANN/XGB ensemble.",
      stack: ["RoBERTa", "BERT", "BiGRU", "ANN", "XGBoost", "Pandas", "NumPy"],
      link: "https://github.com/lakshjn6/FinSent-Explainer",
    },
  ];

  return (
    <section id="projects" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 5% 100px" }}>
      <SectionHeader title="Featured" sub="Work" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {projects.map((p, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <ProjectCard {...p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ year, name, desc, stack, link }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.card,
        border: `1px solid ${hovered ? "rgba(0,229,176,0.35)" : COLORS.border}`,
        borderRadius: 10, padding: 28,
        transition: "all 0.25s",
        transform: hovered ? "translateY(-6px)" : "none",
        position: "relative", overflow: "hidden",
        cursor: "pointer", height: "100%",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Top gradient bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent2})`,
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.35s ease",
      }} />
      {/* Corner decoration */}
      <div style={{
        position: "absolute", top: 16, right: 20,
        fontSize: 11, color: COLORS.muted, letterSpacing: "0.15em",
      }}>{year}</div>

      <div style={{
        fontSize: 22, fontWeight: 700, color: COLORS.text,
        marginBottom: 14, marginTop: 8,
      }}>{name}</div>

      <p style={{
        fontSize: 13, color: COLORS.muted, lineHeight: 1.8,
        marginBottom: 20, flex: 1,
      }}>{desc}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {stack.map((s, i) => (
          <span key={i} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: "0.12em", padding: "3px 8px",
            borderRadius: 3, border: `1px solid rgba(108,99,255,0.3)`,
            background: "rgba(108,99,255,0.08)", color: "#9b96ff",
          }}>{s}</span>
        ))}
      </div>

      {hovered && (
        <a href={link} target="_blank" rel="noreferrer" style={{
          marginTop: 20, fontSize: 11, color: COLORS.accent,
          letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 6,
        }}>
          VIEW PROJECT →
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function Achievements() {
  const achs = [
    { icon: "🏆", title: "Amazon ML Hackathon 2025", sub: "Top 1% · Score: 47.89" },
    { icon: "⚡", title: "LeetCode Global Rank #1054", sub: "Top 4% Worldwide · Weekly Contest" },
    { icon: "🧩", title: "800+ DSA Problems Solved", sub: "Data structures, optimization, algorithms" },
    { icon: "🎓", title: "Stanford ML Certificates", sub: "Supervised + Advanced ML via Coursera" },
    { icon: "🔬", title: "Director — SDS, BIT Mesra", sub: "Society for Data Science · Feb 2025 – Present" },
  ];
  return (
    <section id="achievements" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 5% 100px" }}>
      <SectionHeader title="Recognition &" sub="Milestones" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
        {achs.map((a, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <AchCard {...a} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function AchCard({ icon, title, sub }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.card,
        border: `1px solid ${hovered ? "rgba(108,99,255,0.4)" : COLORS.border}`,
        borderRadius: 8, padding: "20px 22px",
        display: "flex", gap: 16, alignItems: "flex-start",
        transition: "all 0.25s",
        transform: hovered ? "translateY(-3px)" : "none",
      }}
    >
      <span style={{ fontSize: 26, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>{title}</div>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.05em", lineHeight: 1.6 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────────────────────
function Contact() {
  const links = [
    { label: "EMAIL", href: "mailto:lakshayjain0611@gmail.com", icon: "✉" },
    { label: "LINKEDIN", href: "https://www.linkedin.com/in/lakshay-mittal-a4ab04311/", icon: "in" },
    { label: "GITHUB", href: "https://github.com/lakshjn6", icon: "{}" },
    { label: "LEETCODE", href: "https://leetcode.com/u/Laksh_jn6/", icon: "⌨" },
  ];
  return (
    <section id="contact" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 5% 120px" }}>
      <Reveal>
        <div style={{
          textAlign: "center",
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16, padding: "64px 40px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative corner lines */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.accent}, ${COLORS.accent2}, transparent)`,
          }} />
          <div style={{
            fontSize: 11, color: COLORS.accent, letterSpacing: "0.25em", marginBottom: 16,
          }}></div>
          <h2 style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700,
            color: COLORS.text, marginBottom: 12, letterSpacing: "-0.02em",
          }}>
            Let's <span style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Connect</span>
          </h2>
          <p style={{
            fontSize: 13, color: COLORS.muted, letterSpacing: "0.1em",
            marginBottom: 40,
          }}>
            open to internships · collaborations · research
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {links.map((l, i) => (
              <ContactLink key={i} {...l} />
            ))}
          </div>
          <div style={{ marginTop: 48, fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em" }}>
            +91 8890096093 · lakshayjain0611@gmail.com
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function ContactLink({ label, href, icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 24px",
        border: `1px solid ${hovered ? COLORS.accent : COLORS.border}`,
        borderRadius: 6, color: hovered ? COLORS.accent : COLORS.muted,
        textDecoration: "none", fontSize: 11, letterSpacing: "0.15em",
        background: hovered ? "rgba(0,229,176,0.06)" : "transparent",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <span>{icon}</span> {label}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      textAlign: "center", padding: "24px 5%",
      borderTop: `1px solid ${COLORS.border}`,
      fontSize: 11, color: COLORS.muted, letterSpacing: "0.15em",
    }}>
      © 2025 LAKSHAY MITTAL · CRAFTED WITH CODE & CAFFEINE
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const sections = ["about", "skills", "experience", "projects", "achievements", "contact"];
    const handleScroll = () => {
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{styles.global}</style>
      <Nav active={activeSection} />
      <main>
        <Hero />
        <Skills />
        <Education />
        <Experience />
        <Projects />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  );
}