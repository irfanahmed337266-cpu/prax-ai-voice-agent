import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const C = {
  bg: "#f5f7fb",
  white: "#ffffff",

  text: "#0f172a",
  text2: "#334155",
  muted: "#64748b",
  subtle: "#94a3b8",

  border: "#e2e8f0",
  borderDark: "#cbd5e1",

  blue: "#2563eb",
  blueDark: "#1d4ed8",
  blueBg: "#eff6ff",
  blueSoft: "#dbeafe",

  violet: "#7c3aed",
  violetBg: "#f5f3ff",
  violetSoft: "#ede9fe",

  cyan: "#0891b2",
  cyanBg: "#ecfeff",
  cyanSoft: "#cffafe",

  green: "#15803d",
  greenBg: "#f0fdf4",
  greenSoft: "#dcfce7",

  amber: "#b45309",
  amberBg: "#fffbeb",
  amberSoft: "#fef3c7",

  rose: "#be123c",
  roseBg: "#fff1f2",
  roseSoft: "#ffe4e6",

  orange: "#c2410c",
  orangeBg: "#fff7ed",
  orangeSoft: "#ffedd5",

  dark: "#111827",
};

const styles = {
  page: {
    minHeight: "100%",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #f5f7fb 45%, #eef2f7 100%)",
    padding: "28px",
    boxSizing: "border-box",
  },

  shell: {
    maxWidth: "1380px",
    margin: "0 auto",
  },

  /* =========================================================
     HEADER
  ========================================================= */

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: C.blueBg,
    color: C.blueDark,
    border: "1px solid #bfdbfe",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: "11px",
  },

  eyebrowDot: {
    width: "7px",
    height: "7px",
    borderRadius: "999px",
    background: C.blue,
  },

  title: {
    margin: 0,
    fontSize: "31px",
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: C.text,
  },

  subtitle: {
    margin: "8px 0 0",
    color: C.muted,
    fontSize: "14px",
    lineHeight: 1.65,
    maxWidth: "700px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    flexShrink: 0,
  },

  btn: {
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  btnPrimary: {
    background: C.dark,
    border: `1px solid ${C.dark}`,
    color: C.white,
    boxShadow:
      "0 7px 16px rgba(17,24,39,0.14)",
  },

  btnSecondary: {
    background: C.white,
    border: `1px solid ${C.borderDark}`,
    color: C.text2,
  },

  /* =========================================================
     HERO
  ========================================================= */

  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "20px",
    border: "1px solid #dbeafe",
    background:
      "linear-gradient(135deg, #eff6ff 0%, #eef2ff 48%, #f5f3ff 100%)",
    boxShadow:
      "0 10px 28px rgba(37,99,235,0.08)",
  },

  heroGlowOne: {
    position: "absolute",
    width: "170px",
    height: "170px",
    right: "-55px",
    top: "-70px",
    borderRadius: "999px",
    background:
      "rgba(99,102,241,0.10)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "130px",
    height: "130px",
    right: "170px",
    bottom: "-95px",
    borderRadius: "999px",
    background:
      "rgba(59,130,246,0.08)",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: C.text,
  },

  heroText: {
    margin: "6px 0 0",
    fontSize: "12px",
    lineHeight: 1.55,
    color: C.text2,
    maxWidth: "650px",
  },

  heroBadge: {
    flexShrink: 0,
    padding: "10px 13px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(147,197,253,0.45)",
    color: C.blueDark,
    fontSize: "11px",
    fontWeight: 800,
  },

  /* =========================================================
     KPI CARDS
  ========================================================= */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0,1fr))",
    gap: "14px",
    marginBottom: "20px",
  },

  statCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: "142px",
    padding: "18px",
    borderRadius: "15px",
    border: `1px solid ${C.border}`,
    background: C.white,
    boxShadow:
      "0 5px 16px rgba(15,23,42,0.045)",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  statIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    fontWeight: 800,
  },

  statLabel: {
    marginTop: "17px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: C.subtle,
  },

  statValue: {
    marginTop: "5px",
    fontSize: "27px",
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: C.text,
  },

  statHint: {
    marginTop: "9px",
    fontSize: "10px",
    color: C.muted,
  },

  /* =========================================================
     MAIN GRID
  ========================================================= */

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0,1.45fr) minmax(330px,0.85fr)",
    gap: "20px",
    alignItems: "start",
    marginBottom: "20px",
  },

  panel: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow:
      "0 5px 16px rgba(15,23,42,0.04)",
  },

  panelHeader: {
    padding: "18px 20px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
    color: C.text,
  },

  panelSubtitle: {
    margin: "5px 0 0",
    fontSize: "11px",
    lineHeight: 1.5,
    color: C.muted,
  },

  /* =========================================================
     CHATBOT OVERVIEW
  ========================================================= */

  botList: {
    display: "grid",
  },

  botRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "16px 20px",
    borderBottom: `1px solid ${C.border}`,
  },

  botIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
  },

  botAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background:
      "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: C.white,
    fontWeight: 800,
    fontSize: "14px",
    boxShadow:
      "0 6px 14px rgba(79,70,229,0.20)",
  },

  botInfo: {
    minWidth: 0,
  },

  botName: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 750,
    color: C.text,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  botMeta: {
    marginTop: "4px",
    fontSize: "10px",
    color: C.muted,
  },

  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 800,
    flexShrink: 0,
  },

  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "999px",
  },

  botActions: {
    display: "flex",
    gap: "7px",
    marginTop: "10px",
  },

  smallBtn: {
    borderRadius: "7px",
    padding: "7px 9px",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
    background: C.white,
  },

  /* =========================================================
     HEALTH
  ========================================================= */

  healthBody: {
    padding: "18px 20px",
  },

  healthScore: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    padding: "14px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
    border: "1px solid #bbf7d0",
    marginBottom: "15px",
  },

  healthScoreLeft: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  healthCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "999px",
    background: C.green,
    color: C.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 800,
  },

  healthTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 800,
    color: C.greenDark,
  },

  healthDescription: {
    margin: "4px 0 0",
    fontSize: "10px",
    lineHeight: 1.45,
    color: C.muted,
  },

  healthRows: {
    display: "grid",
    gap: "9px",
  },

  healthRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0",
    borderBottom: `1px solid ${C.border}`,
  },

  healthLabel: {
    fontSize: "11px",
    fontWeight: 650,
    color: C.text2,
  },

  healthValue: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10px",
    fontWeight: 750,
    color: C.green,
  },

  /* =========================================================
     QUICK CONFIGURATION
  ========================================================= */

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0,1fr))",
    gap: "12px",
    padding: "18px",
  },

  quickCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: "128px",
    padding: "16px",
    borderRadius: "13px",
    border: `1px solid ${C.border}`,
    cursor: "pointer",
    transition:
      "transform .15s ease, box-shadow .15s ease",
  },

  quickIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 800,
    marginBottom: "13px",
  },

  quickTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 800,
    color: C.text,
  },

  quickText: {
    margin: "5px 0 0",
    fontSize: "10px",
    lineHeight: 1.5,
    color: C.muted,
  },

  quickArrow: {
    position: "absolute",
    right: "14px",
    bottom: "13px",
    fontSize: "13px",
    fontWeight: 800,
  },

  /* =========================================================
     EMPTY / LOADING / ERROR
  ========================================================= */

  empty: {
    padding: "44px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    background: C.blueBg,
    border: "1px solid #bfdbfe",
    color: C.blue,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 13px",
    fontSize: "20px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
    color: C.text,
  },

  emptyText: {
    maxWidth: "430px",
    margin: "7px auto 0",
    fontSize: "11px",
    lineHeight: 1.6,
    color: C.muted,
  },

  error: {
    marginBottom: "18px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "12px",
  },

  /* =========================================================
     FOOTER
  ========================================================= */

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    padding: "15px 18px",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.72)",
    border: `1px solid ${C.border}`,
    color: C.muted,
    fontSize: "10px",
  },

  footerStrong: {
    color: C.text2,
    fontWeight: 750,
  },
};

const quickItems = [
  {
    title: "Chatbots",
    text: "Create and manage configurable business chatbots.",
    icon: "◉",
    background:
      "linear-gradient(135deg,#eff6ff,#dbeafe)",
    iconBackground: "#2563eb",
    color: "#1d4ed8",
    route: "/chatbots",
  },
  {
    title: "Knowledge Base",
    text: "Manage documents, content and retrieval knowledge.",
    icon: "◆",
    background:
      "linear-gradient(135deg,#f5f3ff,#ede9fe)",
    iconBackground: "#7c3aed",
    color: "#6d28d9",
    route: "/knowledge-base",
  },
  {
    title: "AI Provider",
    text: "Configure BYOK AI providers and model settings.",
    icon: "✦",
    background:
      "linear-gradient(135deg,#ecfeff,#cffafe)",
    iconBackground: "#0891b2",
    color: "#0e7490",
    route: "/ai-provider",
  },
  {
    title: "Deploy",
    text: "Publish your chatbot and manage installation.",
    icon: "↗",
    background:
      "linear-gradient(135deg,#fff7ed,#ffedd5)",
    iconBackground: "#c2410c",
    color: "#c2410c",
    route: "/deploy",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [chatbots, setChatbots] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/chatbots"
      );

      const data =
        response.data || [];

      setChatbots(
        Array.isArray(data)
          ? data
          : data.items || []
      );
    } catch (err) {
      console.error(
        "Failed to load dashboard:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const active = chatbots.filter(
      (bot) => bot.is_active
    ).length;

    const inactive =
      chatbots.length - active;

    return {
      total: chatbots.length,
      active,
      inactive,
      health:
        chatbots.length === 0
          ? 0
          : Math.round(
              (active /
                chatbots.length) *
                100
            ),
    };
  }, [chatbots]);

  function getInitials(name) {
    if (!name) return "AI";

    const words = name
      .trim()
      .split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  }

  function openChatbot(bot) {
    navigate(
      `/preview?chatbotId=${bot.id}`
    );
  }

  function configureChatbot(bot) {
    navigate(
      `/chatbot/${bot.id}`
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              <span
                style={styles.eyebrowDot}
              />
              PRAX AI PLATFORM
            </div>

            <h1 style={styles.title}>
              Dashboard
            </h1>

            <p style={styles.subtitle}>
              Manage your AI chatbot
              infrastructure, knowledge,
              providers and deployments from
              one workspace.
            </p>
          </div>

          <div
            style={
              styles.headerActions
            }
          >
            <button
              type="button"
              style={{
                ...styles.btn,
                ...styles.btnSecondary,
              }}
              onClick={
                loadDashboard
              }
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
              }}
              onClick={() =>
                navigate("/chatbots")
              }
            >
              + Create Chatbot
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* =====================================================
            HERO
        ===================================================== */}
        <section style={styles.hero}>
          <div
            style={styles.heroGlowOne}
          />

          <div
            style={styles.heroGlowTwo}
          />

          <div
            style={styles.heroContent}
          >
            <div>
              <h2
                style={styles.heroTitle}
              >
                Your AI workspace is ready
              </h2>

              <p
                style={styles.heroText}
              >
                Configure chatbot behavior,
                connect your own AI provider,
                add business knowledge, create
                conversation flows and deploy
                production-ready widgets.
              </p>
            </div>

            <div
              style={
                styles.heroBadge
              }
            >
              {stats.active} active{" "}
              chatbot
              {stats.active === 1
                ? ""
                : "s"}
            </div>
          </div>
        </section>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}
        <div
          style={styles.statsGrid}
        >
          <StatCard
            icon="◉"
            label="TOTAL CHATBOTS"
            value={stats.total}
            hint="Configured in this workspace"
            iconBg={C.blueSoft}
            iconColor={C.blue}
          />

          <StatCard
            icon="✓"
            label="ACTIVE BOTS"
            value={stats.active}
            hint="Currently enabled"
            iconBg={C.greenSoft}
            iconColor={C.green}
          />

          <StatCard
            icon="◌"
            label="INACTIVE"
            value={stats.inactive}
            hint="Available for configuration"
            iconBg={C.amberSoft}
            iconColor={C.amber}
          />

          <StatCard
            icon="✦"
            label="PLATFORM HEALTH"
            value={`${stats.health}%`}
            hint="Based on active chatbot status"
            iconBg={C.violetSoft}
            iconColor={C.violet}
          />
        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}
        <div
          style={styles.mainGrid}
        >
          {/* CHATBOTS */}
          <section style={styles.panel}>
            <div
              style={
                styles.panelHeader
              }
            >
              <div>
                <h2
                  style={
                    styles.panelTitle
                  }
                >
                  Chatbot Overview
                </h2>

                <p
                  style={
                    styles.panelSubtitle
                  }
                >
                  Your configured AI
                  assistants and their current
                  availability.
                </p>
              </div>

              <button
                type="button"
                style={{
                  ...styles.smallBtn,
                  border:
                    `1px solid ${C.borderDark}`,
                  color: C.text2,
                }}
                onClick={() =>
                  navigate("/chatbots")
                }
              >
                View All
              </button>
            </div>

            {loading ? (
              <div style={styles.empty}>
                <div
                  style={
                    styles.emptyIcon
                  }
                >
                  …
                </div>

                <h3
                  style={
                    styles.emptyTitle
                  }
                >
                  Loading chatbots
                </h3>

                <p
                  style={
                    styles.emptyText
                  }
                >
                  Fetching your configured
                  chatbot workspace.
                </p>
              </div>
            ) : chatbots.length === 0 ? (
              <div style={styles.empty}>
                <div
                  style={
                    styles.emptyIcon
                  }
                >
                  ◉
                </div>

                <h3
                  style={
                    styles.emptyTitle
                  }
                >
                  No chatbots yet
                </h3>

                <p
                  style={
                    styles.emptyText
                  }
                >
                  Create your first chatbot to
                  start configuring stages,
                  knowledge, AI providers and
                  deployment.
                </p>

                <button
                  type="button"
                  style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    marginTop: "16px",
                  }}
                  onClick={() =>
                    navigate("/chatbots")
                  }
                >
                  Create First Chatbot
                </button>
              </div>
            ) : (
              <div
                style={
                  styles.botList
                }
              >
                {chatbots
                  .slice(0, 6)
                  .map((bot) => (
                    <div
                      key={bot.id}
                      style={
                        styles.botRow
                      }
                    >
                      <div
                        style={
                          styles.botIdentity
                        }
                      >
                        <div
                          style={
                            styles.botAvatar
                          }
                        >
                          {getInitials(
                            bot.name
                          )}
                        </div>

                        <div
                          style={
                            styles.botInfo
                          }
                        >
                          <h3
                            style={
                              styles.botName
                            }
                          >
                            {bot.name ||
                              "Unnamed Chatbot"}
                          </h3>

                          <div
                            style={
                              styles.botMeta
                            }
                          >
                            {bot.business ||
                              "Business chatbot"}
                          </div>

                          <div
                            style={
                              styles.botActions
                            }
                          >
                            <button
                              type="button"
                              style={{
                                ...styles.smallBtn,
                                border:
                                  `1px solid ${C.borderDark}`,
                                color:
                                  C.text2,
                              }}
                              onClick={() =>
                                openChatbot(
                                  bot
                                )
                              }
                            >
                              Preview
                            </button>

                            <button
                              type="button"
                              style={{
                                ...styles.smallBtn,
                                border:
                                  "1px solid #bfdbfe",
                                background:
                                  C.blueBg,
                                color:
                                  C.blueDark,
                              }}
                              onClick={() =>
                                configureChatbot(
                                  bot
                                )
                              }
                            >
                              Configure
                            </button>
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          ...styles.statusPill,
                          background:
                            bot.is_active
                              ? C.greenBg
                              : "#f8fafc",
                          color:
                            bot.is_active
                              ? C.green
                              : C.muted,
                          border:
                            bot.is_active
                              ? "1px solid #bbf7d0"
                              : `1px solid ${C.border}`,
                        }}
                      >
                        <span
                          style={{
                            ...styles.statusDot,
                            background:
                              bot.is_active
                                ? C.green
                                : C.subtle,
                          }}
                        />

                        {bot.is_active
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* HEALTH */}
          <section style={styles.panel}>
            <div
              style={
                styles.panelHeader
              }
            >
              <div>
                <h2
                  style={
                    styles.panelTitle
                  }
                >
                  Platform Health
                </h2>

                <p
                  style={
                    styles.panelSubtitle
                  }
                >
                  Quick workspace status.
                </p>
              </div>
            </div>

            <div style={styles.healthBody}>
              <div
                style={
                  styles.healthScore
                }
              >
                <div
                  style={
                    styles.healthScoreLeft
                  }
                >
                  <div
                    style={
                      styles.healthCircle
                    }
                  >
                    {stats.health}%
                  </div>

                  <div>
                    <h3
                      style={
                        styles.healthTitle
                      }
                    >
                      Workspace Ready
                    </h3>

                    <p
                      style={
                        styles.healthDescription
                      }
                    >
                      Active chatbot
                      configuration status.
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={
                  styles.healthRows
                }
              >
                <HealthRow
                  label="Chatbot Engine"
                  value="Operational"
                />

                <HealthRow
                  label="Knowledge Base"
                  value="Available"
                />

                <HealthRow
                  label="AI Provider"
                  value="Configured"
                />

                <HealthRow
                  label="Deployment"
                  value="Available"
                />
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            QUICK CONFIGURATION
        ===================================================== */}
        <section style={styles.panel}>
          <div
            style={
              styles.panelHeader
            }
          >
            <div>
              <h2
                style={
                  styles.panelTitle
                }
              >
                Quick Configuration
              </h2>

              <p
                style={
                  styles.panelSubtitle
                }
              >
                Jump directly to the core PRAX
                platform modules.
              </p>
            </div>
          </div>

          <div
            style={
              styles.quickGrid
            }
          >
            {quickItems.map((item) => (
              <QuickCard
                key={item.title}
                item={item}
                onClick={() =>
                  navigate(item.route)
                }
              />
            ))}
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div style={styles.footer}>
          <div>
            <span
              style={
                styles.footerStrong
              }
            >
              PRAX Configurable Chatbot
              Platform
            </span>{" "}
            · AI-powered business
            automation workspace
          </div>

          <div>
            {stats.total} chatbot
            {stats.total === 1
              ? ""
              : "s"} configured
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  icon,
  label,
  value,
  hint,
  iconBg,
  iconColor,
}) {
  return (
    <div
      style={
        styles.statCard
      }
    >
      <div
        style={
          styles.statTop
        }
      >
        <div
          style={{
            ...styles.statIcon,
            background: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={
          styles.statLabel
        }
      >
        {label}
      </div>

      <div
        style={
          styles.statValue
        }
      >
        {value}
      </div>

      <div
        style={
          styles.statHint
        }
      >
        {hint}
      </div>
    </div>
  );
}

/* =============================================================
   HEALTH ROW
============================================================= */

function HealthRow({
  label,
  value,
}) {
  return (
    <div
      style={
        styles.healthRow
      }
    >
      <span
        style={
          styles.healthLabel
        }
      >
        {label}
      </span>

      <span
        style={
          styles.healthValue
        }
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "999px",
            background: C.green,
          }}
        />

        {value}
      </span>
    </div>
  );
}

/* =============================================================
   QUICK CARD
============================================================= */

function QuickCard({
  item,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.quickCard,
        background: item.background,
        textAlign: "left",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          "translateY(-2px)";
        event.currentTarget.style.boxShadow =
          "0 10px 22px rgba(15,23,42,0.08)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "translateY(0)";
        event.currentTarget.style.boxShadow =
          "none";
      }}
    >
      <div
        style={{
          ...styles.quickIcon,
          background: item.iconBackground,
          color: C.white,
        }}
      >
        {item.icon}
      </div>

      <h3
        style={
          styles.quickTitle
        }
      >
        {item.title}
      </h3>

      <p
        style={
          styles.quickText
        }
      >
        {item.text}
      </p>

      <span
        style={{
          ...styles.quickArrow,
          color: item.color,
        }}
      >
        →
      </span>
    </button>
  );
}

export default Dashboard;
