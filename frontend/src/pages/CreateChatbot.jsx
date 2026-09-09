import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateChatbot() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    business_name: "",
    use_case: "",
    website_url: "",
    system_prompt: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setLoading(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        business_name: form.business_name.trim() || null,
        use_case: form.use_case.trim() || null,
        website_url: form.website_url.trim() || null,
        system_prompt: form.system_prompt.trim() || null,
        is_active: form.is_active,
      };

      await api.post("/api/chatbots", payload);

      navigate("/chatbots");
    } catch (err) {
      console.error("Failed to create chatbot:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to create chatbot."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <h1>Create Chatbot</h1>
      <p>Create a new configurable PRAX AI chatbot.</p>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "700px",
          marginTop: "24px",
        }}
      >
        {error && (
          <div
            style={{
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "18px" }}>
          <label>
            <strong>Chatbot Name *</strong>
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. PRAX Customer Support Bot"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label>
            <strong>Business Name</strong>
          </label>

          <input
            type="text"
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            placeholder="e.g. PRAX"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label>
            <strong>Use Case</strong>
          </label>

          <input
            type="text"
            name="use_case"
            value={form.use_case}
            onChange={handleChange}
            placeholder="e.g. Customer Support"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label>
            <strong>Website URL</strong>
          </label>

          <input
            type="url"
            name="website_url"
            value={form.website_url}
            onChange={handleChange}
            placeholder="https://example.com"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label>
            <strong>System Prompt</strong>
          </label>

          <textarea
            name="system_prompt"
            value={form.system_prompt}
            onChange={handleChange}
            placeholder="You are a helpful AI assistant..."
            rows={6}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />{" "}
            <strong>Active</strong>
          </label>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Chatbot"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/chatbots")}
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateChatbot;