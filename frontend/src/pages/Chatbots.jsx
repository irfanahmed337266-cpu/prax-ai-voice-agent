import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Chatbots() {
  const navigate = useNavigate();

  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadChatbots();
  }, []);

  async function loadChatbots() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/chatbots");
      setChatbots(response.data.items || []);
    } catch (err) {
      console.error("Failed to load chatbots:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load chatbots."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    navigate("/chatbots/create");
  }

  function handleConfigure(chatbotId) {
    navigate(`/chatbots/${chatbotId}/configure`);
  }

  function handleEdit(chatbotId) {
    navigate(`/chatbots/${chatbotId}/edit`);
  }

  async function handleToggleStatus(chatbot) {
    try {
      setError("");

      const response = await api.patch(
        `/api/chatbots/${chatbot.id}`,
        {
          is_active: !chatbot.is_active,
        }
      );

      setChatbots((current) =>
        current.map((item) =>
          item.id === chatbot.id ? response.data : item
        )
      );
    } catch (err) {
      console.error("Failed to update chatbot status:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to update chatbot status."
      );
    }
  }

  async function handleDelete(chatbot) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${chatbot.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(chatbot.id);
      setError("");

      await api.delete(`/api/chatbots/${chatbot.id}`);

      setChatbots((current) =>
        current.filter((item) => item.id !== chatbot.id)
      );
    } catch (err) {
      console.error("Failed to delete chatbot:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to delete chatbot."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      className="dashboard-page"
      style={{
        minHeight: "100%",
        padding: "32px",
        background:
          "linear-gradient(180deg, #f7f9fc 0%, #eef3f9 100%)",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        className="chatbots-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        <div>
          <div
            className="page-eyebrow"
            style={{
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              marginBottom: "8px",
            }}
          >
            AI ASSISTANTS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "800",
              color: "#0f172a",
            }}
          >
            Chatbots
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Create, configure, and manage your AI assistants.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleCreate}
          style={{
            border: "none",
            borderRadius: "12px",
            padding: "13px 20px",
            background:
              "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.22)",
          }}
        >
          <span style={{ marginRight: "7px", fontSize: "18px" }}>+</span>
          Create Chatbot
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          className="chatbot-error"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 16px",
            marginBottom: "22px",
            borderRadius: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
          }}
        >
          <strong>Error:</strong>
          <span style={{ flex: 1 }}>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            style={{
              border: "none",
              background: "transparent",
              color: "#991b1b",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading && (
        <div
          className="chatbots-loading"
          style={{
            minHeight: "280px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "14px",
            color: "#64748b",
          }}
        >
          <div
            className="loading-spinner"
            style={{
              width: "34px",
              height: "34px",
              border: "4px solid #dbeafe",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
            }}
          ></div>

          <span>Loading your chatbots...</span>
        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading && !error && chatbots.length === 0 && (
        <div
          className="empty-chatbots"
          style={{
            textAlign: "center",
            padding: "70px 30px",
            borderRadius: "20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            className="empty-icon"
            style={{
              width: "78px",
              height: "78px",
              margin: "0 auto 18px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)",
              fontSize: "36px",
            }}
          >
            🤖
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              color: "#0f172a",
            }}
          >
            No chatbots yet
          </h2>

          <p
            style={{
              maxWidth: "480px",
              margin: "0 auto 24px",
              lineHeight: "1.6",
              color: "#64748b",
            }}
          >
            Create your first AI assistant and start building your
            automated customer experience.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={handleCreate}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "13px 20px",
              background:
                "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              color: "#ffffff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            <span style={{ marginRight: "7px" }}>+</span>
            Create Your First Chatbot
          </button>
        </div>
      )}

      {/* ================= CHATBOTS ================= */}

      {!loading && chatbots.length > 0 && (
        <>
          {/* Summary */}

          <div
            className="chatbots-summary"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              className="summary-item"
              style={{
                padding: "20px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                border: "1px solid #bfdbfe",
              }}
            >
              <span
                className="summary-label"
                style={{
                  display: "block",
                  color: "#1d4ed8",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "7px",
                }}
              >
                Total Chatbots
              </span>

              <strong
                style={{
                  fontSize: "30px",
                  color: "#1e3a8a",
                }}
              >
                {chatbots.length}
              </strong>
            </div>

            <div
              className="summary-item"
              style={{
                padding: "20px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                border: "1px solid #a7f3d0",
              }}
            >
              <span
                className="summary-label"
                style={{
                  display: "block",
                  color: "#047857",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "7px",
                }}
              >
                Active
              </span>

              <strong
                className="summary-active"
                style={{
                  fontSize: "30px",
                  color: "#065f46",
                }}
              >
                {
                  chatbots.filter(
                    (chatbot) => chatbot.is_active
                  ).length
                }
              </strong>
            </div>

            <div
              className="summary-item"
              style={{
                padding: "20px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                border: "1px solid #fde68a",
              }}
            >
              <span
                className="summary-label"
                style={{
                  display: "block",
                  color: "#b45309",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "7px",
                }}
              >
                Inactive
              </span>

              <strong
                className="summary-inactive"
                style={{
                  fontSize: "30px",
                  color: "#92400e",
                }}
              >
                {
                  chatbots.filter(
                    (chatbot) => !chatbot.is_active
                  ).length
                }
              </strong>
            </div>
          </div>

          {/* Grid */}

          <div
            className="professional-chatbot-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "22px",
            }}
          >
            {chatbots.map((chatbot, index) => {
              const palette = [
                {
                  soft: "#eff6ff",
                  border: "#bfdbfe",
                  accent: "#2563eb",
                  dark: "#1e3a8a",
                },
                {
                  soft: "#f5f3ff",
                  border: "#ddd6fe",
                  accent: "#7c3aed",
                  dark: "#4c1d95",
                },
                {
                  soft: "#ecfeff",
                  border: "#a5f3fc",
                  accent: "#0891b2",
                  dark: "#164e63",
                },
                {
                  soft: "#fff7ed",
                  border: "#fed7aa",
                  accent: "#ea580c",
                  dark: "#9a3412",
                },
              ][index % 4];

              return (
                <div
                  className="professional-chatbot-card"
                  key={chatbot.id}
                  style={{
                    overflow: "hidden",
                    borderRadius: "20px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 12px 30px rgba(15, 23, 42, 0.07)",
                  }}
                >
                  {/* Colored header */}

                  <div
                    style={{
                      padding: "22px",
                      background: `linear-gradient(135deg, ${palette.soft} 0%, #ffffff 100%)`,
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    <div
                      className="chatbot-card-top"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "16px",
                      }}
                    >
                      <div
                        className="chatbot-brand"
                        style={{
                          display: "flex",
                          gap: "13px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          className="large-bot-avatar"
                          style={{
                            width: "54px",
                            height: "54px",
                            flexShrink: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "15px",
                            background: "#ffffff",
                            border: `1px solid ${palette.border}`,
                            boxShadow:
                              "0 5px 12px rgba(15, 23, 42, 0.06)",
                            fontSize: "27px",
                          }}
                        >
                          🤖
                        </div>

                        <div
                          className="chatbot-title"
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <h2
                            style={{
                              margin: "2px 0 5px",
                              color: palette.dark,
                              fontSize: "18px",
                              fontWeight: "800",
                            }}
                          >
                            {chatbot.name}
                          </h2>

                          <span
                            style={{
                              display: "block",
                              color: "#64748b",
                              fontSize: "13px",
                            }}
                          >
                            {chatbot.business_name ||
                              "No business specified"}
                          </span>
                        </div>
                      </div>

                      <div
                        className={
                          chatbot.is_active
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "7px",
                          padding: "7px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "800",
                          background: chatbot.is_active
                            ? "#dcfce7"
                            : "#f1f5f9",
                          color: chatbot.is_active
                            ? "#166534"
                            : "#475569",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          className="status-dot"
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: chatbot.is_active
                              ? "#16a34a"
                              : "#94a3b8",
                          }}
                        ></span>

                        {chatbot.is_active
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </div>
                  </div>

                  {/* Details */}

                  <div
                    className="chatbot-details"
                    style={{
                      display: "grid",
                      gap: "12px",
                      padding: "20px 22px 0",
                    }}
                  >
                    <div
                      className="chatbot-detail"
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "13px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span
                        className="detail-icon"
                        style={{
                          width: "34px",
                          height: "34px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexShrink: 0,
                          borderRadius: "10px",
                          background: palette.soft,
                          color: palette.accent,
                          fontWeight: "800",
                        }}
                      >
                        ◈
                      </span>

                      <div style={{ minWidth: 0 }}>
                        <small
                          style={{
                            display: "block",
                            color: "#94a3b8",
                            fontSize: "11px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.7px",
                            marginBottom: "4px",
                          }}
                        >
                          Use Case
                        </small>

                        <strong
                          style={{
                            display: "block",
                            color: "#334155",
                            fontSize: "13px",
                            lineHeight: "1.4",
                            wordBreak: "break-word",
                          }}
                        >
                          {chatbot.use_case ||
                            "Not specified"}
                        </strong>
                      </div>
                    </div>

                    <div
                      className="chatbot-detail"
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "13px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span
                        className="detail-icon"
                        style={{
                          width: "34px",
                          height: "34px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexShrink: 0,
                          borderRadius: "10px",
                          background: "#ecfeff",
                          color: "#0891b2",
                          fontWeight: "800",
                        }}
                      >
                        ◉
                      </span>

                      <div style={{ minWidth: 0 }}>
                        <small
                          style={{
                            display: "block",
                            color: "#94a3b8",
                            fontSize: "11px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.7px",
                            marginBottom: "4px",
                          }}
                        >
                          Website
                        </small>

                        <strong
                          style={{
                            display: "block",
                            color: "#334155",
                            fontSize: "13px",
                            lineHeight: "1.4",
                            wordBreak: "break-word",
                          }}
                        >
                          {chatbot.website_url ||
                            "Not specified"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Prompt */}

                  <div
                    className="prompt-preview"
                    style={{
                      margin: "18px 22px",
                      padding: "16px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      className="prompt-label"
                      style={{
                        color: palette.accent,
                        fontSize: "10px",
                        fontWeight: "800",
                        letterSpacing: "1.2px",
                        marginBottom: "8px",
                      }}
                    >
                      SYSTEM PROMPT
                    </div>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b",
                        fontSize: "13px",
                        lineHeight: "1.55",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {chatbot.system_prompt ||
                        "No system prompt configured yet."}
                    </p>
                  </div>

                  {/* Footer */}

                  <div
                    className="chatbot-card-footer"
                    style={{
                      padding: "16px 22px 20px",
                      borderTop: "1px solid #eef2f7",
                    }}
                  >
                    <div
                      className="chatbot-id"
                      style={{
                        marginBottom: "13px",
                        color: "#94a3b8",
                        fontSize: "11px",
                        fontFamily: "monospace",
                      }}
                    >
                      ID: {chatbot.id.slice(0, 8)}...
                    </div>

                    <div
                      className="chatbot-actions"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <button
                        type="button"
                        className="action-button"
                        onClick={() =>
                          handleToggleStatus(chatbot)
                        }
                        style={{
                          border: "1px solid #dbe3ec",
                          borderRadius: "9px",
                          padding: "9px 12px",
                          background: "#f8fafc",
                          color: "#475569",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        {chatbot.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        className="action-button"
                        onClick={() =>
                          handleEdit(chatbot.id)
                        }
                        style={{
                          border: "1px solid #dbe3ec",
                          borderRadius: "9px",
                          padding: "9px 12px",
                          background: "#ffffff",
                          color: "#334155",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="action-button primary-action"
                        onClick={() =>
                          handleConfigure(chatbot.id)
                        }
                        style={{
                          border: "none",
                          borderRadius: "9px",
                          padding: "9px 15px",
                          background:
                            "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                          color: "#ffffff",
                          fontWeight: "800",
                          fontSize: "12px",
                          cursor: "pointer",
                          boxShadow:
                            "0 5px 12px rgba(37, 99, 235, 0.18)",
                        }}
                      >
                        Configure
                      </button>

                      <button
                        type="button"
                        className="action-button danger-action"
                        disabled={deletingId === chatbot.id}
                        onClick={() =>
                          handleDelete(chatbot)
                        }
                        style={{
                          border: "1px solid #fecaca",
                          borderRadius: "9px",
                          padding: "9px 12px",
                          background: "#fff7f7",
                          color: "#dc2626",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor:
                            deletingId === chatbot.id
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            deletingId === chatbot.id
                              ? 0.65
                              : 1,
                        }}
                      >
                        {deletingId === chatbot.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 700px) {
            .chatbots-page-header {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .professional-chatbot-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Chatbots;