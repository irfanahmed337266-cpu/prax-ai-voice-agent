import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ACTIVE_CHATBOT_ID =
  "74b2abcd-021d-4c97-acf7-5dfed0f21663";

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
      console.error("Failed to load voice agents:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load voice agents."
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

  function handlePlayground() {
    navigate("/preview");
  }

  function handleDeploy(chatbotId) {
    navigate(`/deploy?chatbotId=${chatbotId}`);
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
      console.error("Failed to update voice agent:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to update voice agent."
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
      console.error("Failed to delete voice agent:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to delete voice agent."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = chatbots.filter(
    (chatbot) => chatbot.is_active
  ).length;

  const inactiveCount = chatbots.filter(
    (chatbot) => !chatbot.is_active
  ).length;

  return (
    <div className="voice-agents-page">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="voice-agents-header">
        <div>
          <div className="voice-page-eyebrow">
            PRAX AI VOICE PLATFORM
          </div>

          <h1>Voice Agents</h1>

          <p>
            Manage and configure your AI voice agents.
          </p>
        </div>

        <button
          type="button"
          className="voice-create-button"
          onClick={handleCreate}
        >
          <span>＋</span>
          Create Voice Agent
        </button>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="voice-error">
          <div>
            <strong>Something went wrong</strong>
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="voice-agents-loading">
          <div className="voice-loading-spinner" />

          <strong>Loading voice agents...</strong>

          <span>
            Connecting to your PRAX voice workspace.
          </span>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ====================================================== */}

      {!loading && !error && chatbots.length === 0 && (
        <div className="voice-empty-state">
          <div className="voice-empty-icon">
            🎙
          </div>

          <div className="voice-empty-content">
            <div className="voice-page-eyebrow">
              VOICE WORKSPACE
            </div>

            <h2>No voice agents yet</h2>

            <p>
              Create your first PRAX AI voice agent and
              start handling natural customer conversations.
            </p>

            <button
              type="button"
              className="voice-create-button"
              onClick={handleCreate}
            >
              <span>＋</span>
              Create Your First Voice Agent
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      {!loading && chatbots.length > 0 && (
        <>
          {/* =================================================
              STATS
          ================================================== */}

          <div className="voice-agent-stats">
            <div className="voice-agent-stat">
              <div className="voice-agent-stat-icon">
                ◉
              </div>

              <div>
                <span>Total Agents</span>
                <strong>{chatbots.length}</strong>
              </div>
            </div>

            <div className="voice-agent-stat">
              <div className="voice-agent-stat-icon green">
                ✓
              </div>

              <div>
                <span>Active</span>
                <strong>{activeCount}</strong>
              </div>
            </div>

            <div className="voice-agent-stat">
              <div className="voice-agent-stat-icon purple">
                ◌
              </div>

              <div>
                <span>Inactive</span>
                <strong>{inactiveCount}</strong>
              </div>
            </div>

            <div className="voice-agent-stat">
              <div className="voice-agent-stat-icon cyan">
                🎙
              </div>

              <div>
                <span>Voice Runtime</span>
                <strong>Gemini</strong>
              </div>
            </div>
          </div>

          {/* =================================================
              AGENT CARDS
          ================================================== */}

          <div className="voice-agents-grid">
            {chatbots.map((chatbot) => {
              const isPrimary =
                chatbot.id === ACTIVE_CHATBOT_ID;

              return (
                <div
                  className={`voice-agent-card ${
                    isPrimary
                      ? "voice-agent-card-primary"
                      : ""
                  }`}
                  key={chatbot.id}
                >
                  {/* TOP GRADIENT */}

                  <div className="voice-agent-card-glow" />

                  <div className="voice-agent-card-header">
                    <div className="voice-agent-identity">
                      <div className="voice-agent-avatar">
                        <span>◉</span>

                        <div className="voice-avatar-ring" />
                      </div>

                      <div>
                        <div className="voice-agent-label">
                          {isPrimary
                            ? "ACTIVE VOICE AGENT"
                            : "VOICE AGENT"}
                        </div>

                        <h2>
                          {chatbot.name}
                        </h2>

                        <p>
                          {chatbot.business_name ||
                            "PRAX Voice Workspace"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`voice-status ${
                        chatbot.is_active
                          ? "online"
                          : "offline"
                      }`}
                    >
                      <span />
                      {chatbot.is_active
                        ? "Live"
                        : "Offline"}
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="voice-agent-description">
                    {chatbot.use_case ||
                      "AI-powered customer voice assistant"}
                  </div>

                  {/* CAPABILITIES */}

                  <div className="voice-capability-grid">
                    <div className="voice-capability">
                      <span className="capability-symbol">
                        🎙
                      </span>

                      <div>
                        <small>VOICE</small>
                        <strong>Enabled</strong>
                      </div>
                    </div>

                    <div className="voice-capability">
                      <span className="capability-symbol">
                        ✦
                      </span>

                      <div>
                        <small>AI MODEL</small>
                        <strong>
                          Gemini 2.5 Flash
                        </strong>
                      </div>
                    </div>

                    <div className="voice-capability">
                      <span className="capability-symbol">
                        🌐
                      </span>

                      <div>
                        <small>LANGUAGES</small>
                        <strong>
                          Urdu + English
                        </strong>
                      </div>
                    </div>

                    <div className="voice-capability">
                      <span className="capability-symbol">
                        ◌
                      </span>

                      <div>
                        <small>DETECTION</small>
                        <strong>
                          Auto Language
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* PROMPT */}

                  <div className="voice-prompt">
                    <div className="voice-prompt-heading">
                      <span>SYSTEM BEHAVIOR</span>
                      <b>AI</b>
                    </div>

                    <p>
                      {chatbot.system_prompt ||
                        "Voice agent behavior has not been configured yet."}
                    </p>
                  </div>

                  {/* METADATA */}

                  <div className="voice-agent-meta">
                    <div>
                      <span>AGENT ID</span>
                      <strong>
                        {chatbot.id.slice(0, 8)}...
                      </strong>
                    </div>

                    <div>
                      <span>RUNTIME</span>
                      <strong>PRAX Gemini</strong>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="voice-agent-actions">
                    <button
                      type="button"
                      className="voice-action-secondary"
                      onClick={() =>
                        handleToggleStatus(chatbot)
                      }
                    >
                      {chatbot.is_active
                        ? "Pause Agent"
                        : "Activate Agent"}
                    </button>

                    <button
                      type="button"
                      className="voice-action-secondary"
                      onClick={() =>
                        handleEdit(chatbot.id)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="voice-action-primary"
                      onClick={() =>
                        handleConfigure(chatbot.id)
                      }
                    >
                      Configure
                    </button>
                  </div>

                  {/* QUICK LINKS */}

                  <div className="voice-agent-links">
                    <button
                      type="button"
                      onClick={handlePlayground}
                    >
                      <span>🎙</span>
                      Open Playground
                      <b>→</b>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeploy(chatbot.id)
                      }
                    >
                      <span>↗</span>
                      Deploy Voice Agent
                      <b>→</b>
                    </button>
                  </div>

                  {/* DELETE */}

                  <button
                    type="button"
                    className="voice-delete-button"
                    disabled={
                      deletingId === chatbot.id
                    }
                    onClick={() =>
                      handleDelete(chatbot)
                    }
                  >
                    {deletingId === chatbot.id
                      ? "Deleting..."
                      : "Delete voice agent"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* =================================================
              BOTTOM PLATFORM PANEL
          ================================================== */}

          <div className="voice-platform-panel">
            <div className="voice-platform-icon">
              ✦
            </div>

            <div className="voice-platform-text">
              <div>
                <span>PRAX VOICE RUNTIME</span>
                <strong>Gemini voice services operational</strong>
              </div>

              <p>
                Speech recognition, AI reasoning, automatic
                language detection and voice responses are
                connected to your PRAX voice agents.
              </p>
            </div>

            <div className="voice-platform-status">
              <span />
              System Online
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          PAGE STYLES
      ====================================================== */}

      <style>
        {`
          .voice-agents-page {
            min-height: 100%;
            padding: 34px;
            color: #e8ecf7;
            background:
              radial-gradient(
                circle at 82% 5%,
                rgba(124, 92, 255, 0.12),
                transparent 28%
              ),
              radial-gradient(
                circle at 15% 35%,
                rgba(0, 210, 255, 0.06),
                transparent 25%
              ),
              linear-gradient(
                180deg,
                #0d1321 0%,
                #101728 100%
              );
          }

          .voice-agents-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 24px;
            margin-bottom: 30px;
          }

          .voice-page-eyebrow {
            margin-bottom: 9px;
            color: #8b7cff;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 1.8px;
          }

          .voice-agents-header h1 {
            margin: 0;
            color: #f7f8fc;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.7px;
          }

          .voice-agents-header p {
            margin: 8px 0 0;
            color: #8994a9;
            font-size: 14px;
          }

          .voice-create-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid rgba(143, 124, 255, 0.55);
            border-radius: 12px;
            padding: 12px 17px;
            background:
              linear-gradient(
                135deg,
                #715cff 0%,
                #4d43d9 100%
              );
            color: white;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            box-shadow:
              0 12px 28px rgba(91, 74, 255, 0.24);
            transition:
              transform 0.18s ease,
              box-shadow 0.18s ease;
          }

          .voice-create-button:hover {
            transform: translateY(-1px);
            box-shadow:
              0 16px 34px rgba(91, 74, 255, 0.34);
          }

          .voice-create-button span {
            font-size: 18px;
            line-height: 1;
          }

          .voice-error {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
            margin-bottom: 24px;
            padding: 14px 16px;
            border: 1px solid rgba(248, 113, 113, 0.25);
            border-radius: 13px;
            background: rgba(127, 29, 29, 0.18);
            color: #fecaca;
          }

          .voice-error div {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .voice-error strong {
            font-size: 12px;
          }

          .voice-error span {
            color: #fca5a5;
            font-size: 12px;
          }

          .voice-error button {
            border: none;
            background: transparent;
            color: #fca5a5;
            font-size: 21px;
            cursor: pointer;
          }

          .voice-agents-loading {
            min-height: 360px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 9px;
            color: #8d98ad;
          }

          .voice-agents-loading strong {
            color: #dce2ef;
            font-size: 14px;
          }

          .voice-agents-loading span {
            font-size: 12px;
          }

          .voice-loading-spinner {
            width: 34px;
            height: 34px;
            margin-bottom: 8px;
            border: 3px solid rgba(139, 124, 255, 0.18);
            border-top-color: #8b7cff;
            border-radius: 50%;
            animation: voiceAgentSpin 0.8s linear infinite;
          }

          @keyframes voiceAgentSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .voice-empty-state {
            display: flex;
            align-items: center;
            gap: 26px;
            min-height: 320px;
            padding: 45px;
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 22px;
            background:
              linear-gradient(
                135deg,
                rgba(28, 36, 57, 0.9),
                rgba(17, 24, 39, 0.9)
              );
          }

          .voice-empty-icon {
            width: 90px;
            height: 90px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            border: 1px solid rgba(139, 124, 255, 0.35);
            border-radius: 24px;
            background:
              radial-gradient(
                circle,
                rgba(139, 124, 255, 0.2),
                rgba(38, 31, 73, 0.4)
              );
            font-size: 38px;
          }

          .voice-empty-content h2 {
            margin: 0;
            color: #f3f5fb;
            font-size: 24px;
          }

          .voice-empty-content p {
            max-width: 550px;
            margin: 9px 0 20px;
            color: #8994a9;
            font-size: 14px;
            line-height: 1.65;
          }

          .voice-agent-stats {
            display: grid;
            grid-template-columns:
              repeat(4, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 24px;
          }

          .voice-agent-stat {
            display: flex;
            align-items: center;
            gap: 13px;
            min-height: 82px;
            padding: 15px 17px;
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            background:
              linear-gradient(
                135deg,
                rgba(28, 36, 57, 0.92),
                rgba(18, 25, 42, 0.9)
              );
            box-shadow:
              inset 0 1px rgba(255,255,255,0.025);
          }

          .voice-agent-stat-icon {
            width: 42px;
            height: 42px;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid rgba(139, 124, 255, 0.24);
            border-radius: 12px;
            background: rgba(113, 92, 255, 0.1);
            color: #9b90ff;
            font-size: 17px;
          }

          .voice-agent-stat-icon.green {
            border-color: rgba(52, 211, 153, 0.2);
            background: rgba(16, 185, 129, 0.08);
            color: #5ee7b0;
          }

          .voice-agent-stat-icon.purple {
            border-color: rgba(168, 85, 247, 0.2);
            background: rgba(168, 85, 247, 0.08);
            color: #c084fc;
          }

          .voice-agent-stat-icon.cyan {
            border-color: rgba(34, 211, 238, 0.2);
            background: rgba(34, 211, 238, 0.08);
            color: #67e8f9;
          }

          .voice-agent-stat span {
            display: block;
            margin-bottom: 4px;
            color: #78849a;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.7px;
            text-transform: uppercase;
          }

          .voice-agent-stat strong {
            color: #f0f3fa;
            font-size: 22px;
            font-weight: 800;
          }

          .voice-agents-grid {
            display: grid;
            grid-template-columns:
              repeat(auto-fit, minmax(390px, 1fr));
            gap: 20px;
          }

          .voice-agent-card {
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(148, 163, 184, 0.12);
            border-radius: 21px;
            background:
              linear-gradient(
                145deg,
                rgba(26, 34, 54, 0.98),
                rgba(14, 20, 34, 0.98)
              );
            box-shadow:
              0 20px 45px rgba(0, 0, 0, 0.22);
            transition:
              transform 0.2s ease,
              border-color 0.2s ease;
          }

          .voice-agent-card:hover {
            transform: translateY(-2px);
            border-color: rgba(139, 124, 255, 0.25);
          }

          .voice-agent-card-primary {
            border-color: rgba(124, 108, 255, 0.3);
            box-shadow:
              0 20px 55px rgba(52, 40, 130, 0.18);
          }

          .voice-agent-card-glow {
            position: absolute;
            top: -100px;
            right: -70px;
            width: 230px;
            height: 190px;
            border-radius: 50%;
            background:
              radial-gradient(
                circle,
                rgba(124, 108, 255, 0.14),
                transparent 68%
              );
            pointer-events: none;
          }

          .voice-agent-card-header {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 15px;
            padding: 23px 23px 18px;
          }

          .voice-agent-identity {
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 0;
          }

          .voice-agent-avatar {
            position: relative;
            width: 58px;
            height: 58px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            border: 1px solid rgba(139, 124, 255, 0.35);
            border-radius: 17px;
            background:
              radial-gradient(
                circle at 35% 30%,
                rgba(142, 126, 255, 0.32),
                rgba(53, 45, 108, 0.3)
              );
            color: #b9b1ff;
            font-size: 25px;
            box-shadow:
              inset 0 1px rgba(255,255,255,0.06);
          }

          .voice-avatar-ring {
            position: absolute;
            inset: 5px;
            border: 1px solid rgba(139, 124, 255, 0.13);
            border-radius: 13px;
          }

          .voice-agent-label {
            margin-bottom: 4px;
            color: #897fff;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 1.3px;
          }

          .voice-agent-identity h2 {
            overflow: hidden;
            margin: 0;
            color: #f4f6fb;
            font-size: 18px;
            font-weight: 800;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .voice-agent-identity p {
            overflow: hidden;
            margin: 4px 0 0;
            color: #7f8ba0;
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .voice-status {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            flex-shrink: 0;
            padding: 6px 9px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 900;
          }

          .voice-status span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }

          .voice-status.online {
            border: 1px solid rgba(52, 211, 153, 0.2);
            background: rgba(16, 185, 129, 0.09);
            color: #6ee7b7;
          }

          .voice-status.online span {
            background: #34d399;
            box-shadow: 0 0 9px rgba(52, 211, 153, 0.65);
          }

          .voice-status.offline {
            border: 1px solid rgba(148, 163, 184, 0.16);
            background: rgba(148, 163, 184, 0.07);
            color: #94a3b8;
          }

          .voice-status.offline span {
            background: #64748b;
          }

          .voice-agent-description {
            margin: 0 23px 17px;
            padding-bottom: 17px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.08);
            color: #9aa5b8;
            font-size: 12px;
            line-height: 1.5;
          }

          .voice-capability-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 9px;
            padding: 0 23px;
          }

          .voice-capability {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            padding: 11px;
            border: 1px solid rgba(148, 163, 184, 0.08);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.018);
          }

          .capability-symbol {
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            border-radius: 9px;
            background: rgba(124, 108, 255, 0.09);
            color: #a39aff;
            font-size: 13px;
          }

          .voice-capability small {
            display: block;
            margin-bottom: 3px;
            color: #69758a;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.7px;
          }

          .voice-capability strong {
            display: block;
            overflow: hidden;
            color: #d9deea;
            font-size: 11px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .voice-prompt {
            margin: 17px 23px;
            padding: 14px;
            border: 1px solid rgba(148, 163, 184, 0.08);
            border-radius: 13px;
            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,0.025),
                rgba(255,255,255,0.012)
              );
          }

          .voice-prompt-heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .voice-prompt-heading span {
            color: #847aff;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 1px;
          }

          .voice-prompt-heading b {
            padding: 3px 6px;
            border-radius: 5px;
            background: rgba(124, 108, 255, 0.1);
            color: #9d94ff;
            font-size: 8px;
          }

          .voice-prompt p {
            display: -webkit-box;
            overflow: hidden;
            margin: 0;
            color: #8490a4;
            font-size: 11px;
            line-height: 1.55;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
          }

          .voice-agent-meta {
            display: flex;
            justify-content: space-between;
            gap: 14px;
            margin: 0 23px;
            padding: 0 0 17px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.08);
          }

          .voice-agent-meta div {
            min-width: 0;
          }

          .voice-agent-meta span {
            display: block;
            margin-bottom: 4px;
            color: #657186;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.8px;
          }

          .voice-agent-meta strong {
            display: block;
            overflow: hidden;
            color: #aeb7c8;
            font-family: monospace;
            font-size: 10px;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .voice-agent-actions {
            display: flex;
            gap: 8px;
            padding: 17px 23px 10px;
          }

          .voice-action-secondary,
          .voice-action-primary {
            flex: 1;
            border-radius: 9px;
            padding: 9px 8px;
            font-size: 10px;
            font-weight: 800;
            cursor: pointer;
            transition:
              background 0.15s ease,
              border-color 0.15s ease;
          }

          .voice-action-secondary {
            border: 1px solid rgba(148, 163, 184, 0.13);
            background: rgba(255,255,255,0.025);
            color: #aeb7c8;
          }

          .voice-action-secondary:hover {
            border-color: rgba(148, 163, 184, 0.25);
            background: rgba(255,255,255,0.045);
          }

          .voice-action-primary {
            border: 1px solid rgba(124, 108, 255, 0.35);
            background:
              linear-gradient(
                135deg,
                rgba(112, 92, 255, 0.9),
                rgba(75, 63, 196, 0.9)
              );
            color: white;
            box-shadow:
              0 7px 18px rgba(82, 68, 220, 0.18);
          }

          .voice-agent-links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 0 23px 16px;
          }

          .voice-agent-links button {
            display: flex;
            align-items: center;
            gap: 7px;
            border: 1px solid rgba(148, 163, 184, 0.08);
            border-radius: 9px;
            padding: 9px 10px;
            background: rgba(255,255,255,0.015);
            color: #8e9aad;
            font-size: 9px;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
          }

          .voice-agent-links button:hover {
            border-color: rgba(124, 108, 255, 0.22);
            color: #b8b1ff;
          }

          .voice-agent-links button span {
            color: #9288ff;
          }

          .voice-agent-links button b {
            margin-left: auto;
            color: #69758a;
          }

          .voice-delete-button {
            width: 100%;
            border: none;
            border-top: 1px solid rgba(148, 163, 184, 0.07);
            padding: 11px 23px 13px;
            background: transparent;
            color: #687386;
            font-size: 9px;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
          }

          .voice-delete-button:hover {
            color: #f87171;
          }

          .voice-platform-panel {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 22px;
            padding: 18px 20px;
            border: 1px solid rgba(52, 211, 153, 0.13);
            border-radius: 16px;
            background:
              linear-gradient(
                135deg,
                rgba(16, 185, 129, 0.055),
                rgba(18, 25, 42, 0.8)
              );
          }

          .voice-platform-icon {
            width: 42px;
            height: 42px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            border: 1px solid rgba(52, 211, 153, 0.18);
            border-radius: 12px;
            background: rgba(16, 185, 129, 0.08);
            color: #62e5ae;
            font-size: 17px;
          }

          .voice-platform-text {
            flex: 1;
            min-width: 0;
          }

          .voice-platform-text > div {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 3px;
          }

          .voice-platform-text span {
            color: #56dca5;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 1px;
          }

          .voice-platform-text strong {
            color: #dbe5e1;
            font-size: 12px;
          }

          .voice-platform-text p {
            margin: 0;
            color: #73858a;
            font-size: 10px;
            line-height: 1.45;
          }

          .voice-platform-status {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            flex-shrink: 0;
            padding: 7px 10px;
            border: 1px solid rgba(52, 211, 153, 0.16);
            border-radius: 999px;
            background: rgba(16, 185, 129, 0.07);
            color: #67e8b5;
            font-size: 9px;
            font-weight: 900;
          }

          .voice-platform-status span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #34d399;
            box-shadow:
              0 0 9px rgba(52, 211, 153, 0.7);
          }

          @media (max-width: 950px) {
            .voice-agent-stats {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 700px) {
            .voice-agents-page {
              padding: 22px 16px;
            }

            .voice-agents-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .voice-create-button {
              width: 100%;
              justify-content: center;
            }

            .voice-agent-stats {
              grid-template-columns: 1fr;
            }

            .voice-agents-grid {
              grid-template-columns: 1fr;
            }

            .voice-empty-state {
              flex-direction: column;
              align-items: flex-start;
              padding: 30px;
            }

            .voice-platform-panel {
              align-items: flex-start;
              flex-wrap: wrap;
            }

            .voice-platform-status {
              margin-left: 57px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Chatbots;