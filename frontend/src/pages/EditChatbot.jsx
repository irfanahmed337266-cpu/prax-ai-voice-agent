import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditChatbot() {
  const navigate = useNavigate();
  const { chatbotId } = useParams();

  const [form, setForm] = useState({
    name: "",
    business_name: "",
    use_case: "",
    website_url: "",
    system_prompt: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadChatbot();
  }, [chatbotId]);

  async function loadChatbot() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get(`/api/chatbots/${chatbotId}`);

      const chatbot = response.data;

      setForm({
        name: chatbot.name || "",
        business_name: chatbot.business_name || "",
        use_case: chatbot.use_case || "",
        website_url: chatbot.website_url || "",
        system_prompt: chatbot.system_prompt || "",
        is_active: chatbot.is_active ?? true,
      });
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

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Chatbot name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        business_name: form.business_name.trim() || null,
        use_case: form.use_case.trim() || null,
        website_url: form.website_url.trim() || null,
        system_prompt: form.system_prompt.trim() || null,
        is_active: form.is_active,
      };

      await api.patch(`/api/chatbots/${chatbotId}`, payload);

      setSuccess("Chatbot updated successfully.");

      setTimeout(() => {
        navigate("/chatbots");
      }, 800);
    } catch (err) {
      console.error("Failed to update chatbot:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to update chatbot."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-eyebrow">AI ASSISTANTS</div>
        <h1>Edit Chatbot</h1>

        <div className="chatbots-loading">
          <div className="loading-spinner"></div>
          <span>Loading chatbot...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="edit-chatbot-header">
        <div>
          <div className="page-eyebrow">AI ASSISTANTS</div>
          <h1>Edit Chatbot</h1>
          <p>Update your chatbot configuration and settings.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/chatbots")}
          disabled={saving}
        >
          ← Back to Chatbots
        </button>
      </div>

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

      {success && (
        <div className="chatbot-success">
          <span className="success-icon">✓</span>
          <span>{success}</span>
        </div>
      )}

      <div className="edit-chatbot-layout">
        <form
          className="edit-chatbot-card"
          onSubmit={handleSubmit}
        >
          <div className="edit-card-header">
            <div className="edit-bot-icon">🤖</div>

            <div>
              <h2>Chatbot Information</h2>
              <p>Basic information about your AI assistant.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field full-width">
              <label htmlFor="name">
                Chatbot Name <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. PRAX Customer Support Bot"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="business_name">
                Business Name
              </label>

              <input
                id="business_name"
                type="text"
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                placeholder="e.g. PRAX"
              />
            </div>

            <div className="form-field">
              <label htmlFor="use_case">
                Use Case
              </label>

              <input
                id="use_case"
                type="text"
                name="use_case"
                value={form.use_case}
                onChange={handleChange}
                placeholder="e.g. Customer Support"
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="website_url">
                Website URL
              </label>

              <input
                id="website_url"
                type="url"
                name="website_url"
                value={form.website_url}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="system_prompt">
                System Prompt
              </label>

              <textarea
                id="system_prompt"
                name="system_prompt"
                value={form.system_prompt}
                onChange={handleChange}
                placeholder="Define how your AI assistant should behave..."
                rows={8}
              />

              <small>
                This prompt controls the chatbot's core behavior and
                personality.
              </small>
            </div>
          </div>

          <div className="status-section">
            <div>
              <strong>Chatbot Status</strong>
              <p>
                Control whether this chatbot is available to users.
              </p>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />

              <span className="toggle-slider"></span>

              <span className="toggle-label">
                {form.is_active ? "Active" : "Inactive"}
              </span>
            </label>
          </div>

          <div className="edit-form-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/chatbots")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="button-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  ✓
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        <aside className="edit-chatbot-sidebar">
          <div className="preview-card">
            <div className="preview-card-header">
              <span className="preview-label">LIVE PREVIEW</span>

              <span
                className={
                  form.is_active
                    ? "preview-status active"
                    : "preview-status inactive"
                }
              >
                <span></span>
                {form.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="preview-bot">
              <div className="preview-avatar">🤖</div>

              <h3>
                {form.name || "Your Chatbot"}
              </h3>

              <p>
                {form.business_name ||
                  "Your business"}
              </p>
            </div>

            <div className="preview-divider"></div>

            <div className="preview-info">
              <div>
                <span>Use Case</span>
                <strong>
                  {form.use_case || "Not specified"}
                </strong>
              </div>

              <div>
                <span>Website</span>
                <strong>
                  {form.website_url || "Not specified"}
                </strong>
              </div>
            </div>
          </div>

          <div className="edit-info-card">
            <div className="info-icon">💡</div>

            <div>
              <strong>Configuration Tip</strong>

              <p>
                Keep your system prompt clear and specific. It should
                explain your chatbot's role, tone, and responsibilities.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default EditChatbot;