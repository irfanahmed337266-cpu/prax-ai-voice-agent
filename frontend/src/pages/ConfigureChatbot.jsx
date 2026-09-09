import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ConfigureChatbot() {
  const navigate = useNavigate();
  const { chatbotId } = useParams();

  const [chatbot, setChatbot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChatbot();
  }, [chatbotId]);

  async function loadChatbot() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/api/chatbots/${chatbotId}`);

      setChatbot(response.data);
    } catch (err) {
      console.error("Failed to load chatbot:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load chatbot."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-eyebrow">AI ASSISTANTS</div>
        <h1>Configure Chatbot</h1>

        <div className="chatbots-loading">
          <div className="loading-spinner"></div>
          <span>Loading chatbot...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="page-eyebrow">AI ASSISTANTS</div>
        <h1>Configure Chatbot</h1>

        <div className="chatbot-error">
          <strong>Error:</strong>
          <span>{error}</span>

          <button type="button" onClick={() => navigate("/chatbots")}>
            Back to Chatbots
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="configure-header">
        <div>
          <div className="page-eyebrow">AI ASSISTANTS</div>

          <h1>Configure Chatbot</h1>

          <p>
            Configure every part of your AI assistant from one workspace.
          </p>
        </div>

        <div className="configure-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/chatbots")}
          >
            ← Back to Chatbots
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(`/chatbots/${chatbotId}/edit`)}
          >
            ✎ Edit Information
          </button>
        </div>
      </div>

      <div className="configure-bot-banner">
        <div className="configure-bot-avatar">🤖</div>

        <div className="configure-bot-details">
          <h2>{chatbot?.name || "Unnamed Chatbot"}</h2>

          <p>
            {chatbot?.business_name || "Business not specified"}
          </p>
        </div>

        <div
          className={
            chatbot?.is_active
              ? "configure-status active"
              : "configure-status inactive"
          }
        >
          <span></span>

          {chatbot?.is_active ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="configure-grid">
        <button
          type="button"
          className="configure-card"
          onClick={() => navigate(`/ai-provider?chatbotId=${chatbotId}`)}
        >
          <div className="configure-card-icon">⚡</div>

          <div>
            <h3>AI Provider</h3>

            <p>
              Configure your AI model, provider, API credentials, and runtime.
            </p>
          </div>

          <span className="configure-card-arrow">→</span>
        </button>

        <button
          type="button"
          className="configure-card"
          onClick={() => navigate(`/chatbots/${chatbotId}/edit`)}
        >
          <div className="configure-card-icon">📝</div>

          <div>
            <h3>System Prompt</h3>

            <p>
              Define your chatbot's role, personality, instructions, and behavior.
            </p>
          </div>

          <span className="configure-card-arrow">→</span>
        </button>

        <button
          type="button"
          className="configure-card"
          onClick={() => navigate(`/flow?chatbotId=${chatbotId}`)}
        >
          <div className="configure-card-icon">🔀</div>

          <div>
            <h3>Flow & Stages</h3>

            <p>
              Build conversation stages and control how the chatbot moves between them.
            </p>
          </div>

          <span className="configure-card-arrow">→</span>
        </button>

        <button
          type="button"
          className="configure-card"
          onClick={() => navigate("/knowledge")}
        >
          <div className="configure-card-icon">📚</div>

          <div>
            <h3>Knowledge Base</h3>

            <p>
              Upload documents and manage the knowledge used by your chatbot.
            </p>
          </div>

          <span className="configure-card-arrow">→</span>
        </button>

        <button
          type="button"
          className="configure-card"
          onClick={() => navigate("/handoff")}
        >
          <div className="configure-card-icon">♙</div>

          <div>
            <h3>Human Handoff</h3>

            <p>
              Configure when conversations should be transferred to a human.
            </p>
          </div>

          <span className="configure-card-arrow">→</span>
        </button>

        <button
          type="button"
          className="configure-card"
          onClick={() => navigate("/branding")}
        >
          <div className="configure-card-icon">✦</div>

          <div>
            <h3>Branding</h3>

            <p>
              Customize the chatbot's colors, identity, and customer-facing appearance.
            </p>
          </div>

          <span className="configure-card-arrow">→</span>
        </button>
      </div>

      <div className="configure-bottom-grid">
        <button
          type="button"
          className="configure-bottom-card"
          onClick={() => navigate(`/preview?chatbotId=${chatbotId}`)}
        >
          <div className="configure-bottom-icon">◉</div>

          <div>
            <h3>Chat Preview</h3>

            <p>
              Test your chatbot before deploying it to customers.
            </p>
          </div>

          <span>Open Preview →</span>
        </button>

        <button
          type="button"
          className="configure-bottom-card"
          onClick={() => navigate("/deploy")}
        >
          <div className="configure-bottom-icon">↗</div>

          <div>
            <h3>Deploy</h3>

            <p>
              Get your embed code and deployment configuration.
            </p>
          </div>

          <span>Open Deployment →</span>
        </button>
      </div>
    </div>
  );
}

export default ConfigureChatbot;