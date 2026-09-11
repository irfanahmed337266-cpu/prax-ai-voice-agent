import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const DEFAULT_FORM = {
  primary_color: "#000000",
  secondary_color: "#FFFFFF",
  logo_url: "",
  bot_name: "Assistant",
  welcome_message: "Hello! How can I help you?",
  widget_position: "bottom-right",
};

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    paddingBottom: "40px",
  },
  header: {
    marginBottom: "28px",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#64748b",
    marginBottom: "8px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },
  sectionHeader: {
    marginBottom: "22px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e2e8f0",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
  },
  sectionDescription: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  },
  helper: {
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
    resize: "vertical",
    minHeight: "110px",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
  },
  colorRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  colorPicker: {
    width: "48px",
    height: "42px",
    padding: "3px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
  },
  colorText: {
    flex: 1,
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
  },
  actionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "18px 20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    marginTop: "8px",
  },
  actionText: {
    fontSize: "13px",
    color: "#64748b",
  },
  button: {
    border: "none",
    borderRadius: "8px",
    padding: "11px 20px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    background: "#0f172a",
    color: "#ffffff",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default function Branding() {
  const [searchParams] = useSearchParams();
  const chatbotId = searchParams.get("chatbotId");

  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!chatbotId) {
      setLoading(false);
      setError("Missing chatbot ID. Open Branding from a configured chatbot.");
      return;
    }

    loadBranding();
  }, [chatbotId]);

  async function loadBranding() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        `/api/branding/chatbot/${chatbotId}`
      );

      const data = response.data || {};

      setForm({
        primary_color:
          data.primary_color || DEFAULT_FORM.primary_color,
        secondary_color:
          data.secondary_color || DEFAULT_FORM.secondary_color,
        logo_url: data.logo_url || "",
        bot_name:
          data.bot_name || DEFAULT_FORM.bot_name,
        welcome_message:
          data.welcome_message || DEFAULT_FORM.welcome_message,
        widget_position:
          data.widget_position || DEFAULT_FORM.widget_position,
      });
    } catch (err) {
      console.error("Branding load error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load branding settings. Please verify the chatbot configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
  }

  function handleColorChange(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value.toUpperCase(),
    }));

    setSuccess("");
  }

  async function saveBranding(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/api/branding", {
        chatbot_id: chatbotId,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        logo_url: form.logo_url.trim() || null,
        bot_name: form.bot_name.trim(),
        welcome_message: form.welcome_message.trim(),
        widget_position: form.widget_position,
      });

      setSuccess("Branding settings have been saved successfully.");

      await loadBranding();
    } catch (err) {
      console.error("Branding save error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to save branding settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!chatbotId) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.eyebrow}>CHATBOT CONFIGURATION</div>
          <h1 style={styles.title}>Branding</h1>
          <p style={styles.subtitle}>
            Manage your chatbot's visual identity and customer-facing
            appearance.
          </p>
        </div>

        <div className="error-box">
          Missing chatbot ID. Open Branding from a configured chatbot.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.eyebrow}>CHATBOT CONFIGURATION</div>

        <h1 style={styles.title}>Branding & Appearance</h1>

        <p style={styles.subtitle}>
          Configure the chatbot identity, visual theme, welcome experience,
          and widget placement for your customers.
        </p>
      </div>

      {loading && (
        <div className="card">
          Loading branding settings...
        </div>
      )}

      {error && (
        <div className="error-box" style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-box" style={{ marginBottom: "20px" }}>
          {success}
        </div>
      )}

      {!loading && (
        <form onSubmit={saveBranding}>
          {/* Identity */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Brand Identity</h2>
              <p style={styles.sectionDescription}>
                Define how your chatbot is presented to customers.
              </p>
            </div>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Chatbot Display Name
                </label>

                <input
                  style={styles.input}
                  name="bot_name"
                  value={form.bot_name}
                  onChange={handleChange}
                  placeholder="e.g. PRAX Assistant"
                  required
                />

                <span style={styles.helper}>
                  Name displayed in the chatbot header and customer
                  interface.
                </span>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Logo URL
                </label>

                <input
                  style={styles.input}
                  name="logo_url"
                  value={form.logo_url}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />

                <span style={styles.helper}>
                  Optional public URL for your chatbot logo.
                </span>
              </div>

              <div style={{ ...styles.field, ...styles.fullWidth }}>
                <label style={styles.label}>
                  Welcome Message
                </label>

                <textarea
                  style={styles.textarea}
                  name="welcome_message"
                  value={form.welcome_message}
                  onChange={handleChange}
                  placeholder="Hello! How can I help you today?"
                  required
                />

                <span style={styles.helper}>
                  First message customers see when they open the chatbot.
                </span>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Brand Colors</h2>
              <p style={styles.sectionDescription}>
                Configure the primary and secondary colors used by the
                chatbot interface.
              </p>
            </div>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Primary Brand Color
                </label>

                <div style={styles.colorRow}>
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) =>
                      handleColorChange(
                        "primary_color",
                        e.target.value
                      )
                    }
                    style={styles.colorPicker}
                  />

                  <input
                    style={styles.colorText}
                    name="primary_color"
                    value={form.primary_color}
                    onChange={handleChange}
                    placeholder="#000000"
                    required
                  />
                </div>

                <span style={styles.helper}>
                  Main accent color for buttons, headers, and interactive
                  elements.
                </span>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Secondary Background Color
                </label>

                <div style={styles.colorRow}>
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) =>
                      handleColorChange(
                        "secondary_color",
                        e.target.value
                      )
                    }
                    style={styles.colorPicker}
                  />

                  <input
                    style={styles.colorText}
                    name="secondary_color"
                    value={form.secondary_color}
                    onChange={handleChange}
                    placeholder="#FFFFFF"
                    required
                  />
                </div>

                <span style={styles.helper}>
                  Supporting background or contrast color used by the
                  chatbot widget.
                </span>
              </div>
            </div>
          </div>

          {/* Widget */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Widget Configuration</h2>
              <p style={styles.sectionDescription}>
                Control where the chatbot widget appears on the customer
                website.
              </p>
            </div>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Widget Position
                </label>

                <select
                  style={styles.select}
                  name="widget_position"
                  value={form.widget_position}
                  onChange={handleChange}
                >
                  <option value="bottom-right">
                    Bottom Right
                  </option>
                  <option value="bottom-left">
                    Bottom Left
                  </option>
                  <option value="top-right">
                    Top Right
                  </option>
                  <option value="top-left">
                    Top Left
                  </option>
                </select>

                <span style={styles.helper}>
                  Select the default position of the chatbot launcher.
                </span>
              </div>
            </div>
          </div>

          {/* Save */}
          <div style={styles.actionBar}>
            <div style={styles.actionText}>
              Your branding settings will apply to this chatbot deployment.
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                ...(saving ? styles.buttonDisabled : {}),
              }}
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Branding Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}