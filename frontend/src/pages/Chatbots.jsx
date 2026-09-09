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
    <div className="dashboard-page">

      {/* ================= HEADER ================= */}

      <div className="chatbots-page-header">

        <div>
          <div className="page-eyebrow">
            AI ASSISTANTS
          </div>

          <h1>Chatbots</h1>

          <p>
            Create, configure, and manage your AI assistants.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleCreate}
        >
          <span>+</span>
          Create Chatbot
        </button>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="chatbot-error">
          <strong>Error:</strong>
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="chatbots-loading">
          <div className="loading-spinner"></div>
          <span>Loading your chatbots...</span>
        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading && !error && chatbots.length === 0 && (
        <div className="empty-chatbots">

          <div className="empty-icon">
            🤖
          </div>

          <h2>No chatbots yet</h2>

          <p>
            Create your first AI assistant and start
            building your automated customer experience.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={handleCreate}
          >
            <span>+</span>
            Create Your First Chatbot
          </button>

        </div>
      )}

      {/* ================= CHATBOT GRID ================= */}

      {!loading && chatbots.length > 0 && (
        <>
          <div className="chatbots-summary">

            <div className="summary-item">
              <span className="summary-label">
                Total Chatbots
              </span>

              <strong>
                {chatbots.length}
              </strong>
            </div>

            <div className="summary-item">
              <span className="summary-label">
                Active
              </span>

              <strong className="summary-active">
                {
                  chatbots.filter(
                    (chatbot) => chatbot.is_active
                  ).length
                }
              </strong>
            </div>

            <div className="summary-item">
              <span className="summary-label">
                Inactive
              </span>

              <strong className="summary-inactive">
                {
                  chatbots.filter(
                    (chatbot) => !chatbot.is_active
                  ).length
                }
              </strong>
            </div>

          </div>

          <div className="professional-chatbot-grid">

            {chatbots.map((chatbot) => (

              <div
                className="professional-chatbot-card"
                key={chatbot.id}
              >

                {/* Card Top */}

                <div className="chatbot-card-top">

                  <div className="chatbot-brand">

                    <div className="large-bot-avatar">
                      🤖
                    </div>

                    <div className="chatbot-title">

                      <h2>
                        {chatbot.name}
                      </h2>

                      <span>
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
                  >
                    <span className="status-dot"></span>

                    {chatbot.is_active
                      ? "Active"
                      : "Inactive"}
                  </div>

                </div>

                {/* Card Details */}

                <div className="chatbot-details">

                  <div className="chatbot-detail">

                    <span className="detail-icon">
                      ◈
                    </span>

                    <div>
                      <small>
                        Use Case
                      </small>

                      <strong>
                        {chatbot.use_case ||
                          "Not specified"}
                      </strong>
                    </div>

                  </div>

                  <div className="chatbot-detail">

                    <span className="detail-icon">
                      ◉
                    </span>

                    <div>
                      <small>
                        Website
                      </small>

                      <strong>
                        {chatbot.website_url ||
                          "Not specified"}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* System Prompt */}

                <div className="prompt-preview">

                  <div className="prompt-label">
                    SYSTEM PROMPT
                  </div>

                  <p>
                    {chatbot.system_prompt ||
                      "No system prompt configured yet."}
                  </p>

                </div>

                {/* Card Footer */}

                <div className="chatbot-card-footer">

                  <div className="chatbot-id">
                    ID: {chatbot.id.slice(0, 8)}...
                  </div>

                  <div className="chatbot-actions">

                    <button
                      type="button"
                      className="action-button"
                      onClick={() =>
                        handleToggleStatus(chatbot)
                      }
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
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="action-button primary-action"
                      onClick={() =>
                        handleConfigure(chatbot.id)
                      }
                    >
                      Configure
                    </button>

                    <button
                      type="button"
                      className="action-button danger-action"
                      disabled={
                        deletingId === chatbot.id
                      }
                      onClick={() =>
                        handleDelete(chatbot)
                      }
                    >
                      {deletingId === chatbot.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        </>
      )}

    </div>
  );
}

export default Chatbots;