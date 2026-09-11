import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function HumanHandoff() {
  const [searchParams] = useSearchParams();
  const chatbotId = searchParams.get("chatbotId");

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "Human Support Request",
    condition: "human",
    priority: 10,
    is_active: true,
  });

  useEffect(() => {
    if (!chatbotId) {
      setLoading(false);
      setError("Missing chatbotId.");
      return;
    }

    loadRules();
  }, [chatbotId]);

  async function loadRules() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/handoff/rules/chatbot/${chatbotId}`
      );

      setRules(response.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to load human handoff rules."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : name === "priority"
            ? Number(value)
            : value,
    }));
  }

  async function createRule(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/api/handoff/rules", {
        chatbot_id: chatbotId,
        name: form.name.trim(),
        condition: form.condition.trim() || null,
        priority: Number(form.priority),
        is_active: form.is_active,
      });

      setSuccess("Human handoff rule created successfully.");

      setForm({
        name: "",
        condition: "",
        priority: 10,
        is_active: true,
      });

      await loadRules();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to create human handoff rule."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRule(ruleId) {
    try {
      setError("");
      setSuccess("");

      await api.delete(`/api/handoff/rules/${ruleId}`);

      setSuccess("Human handoff rule deleted successfully.");

      await loadRules();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete human handoff rule."
      );
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-eyebrow">
        CHATBOT CONFIGURATION
      </div>

      <h1>Human Handoff</h1>

      <p>
        Configure when conversations should be transferred
        from the AI assistant to a human.
      </p>

      {!chatbotId && (
        <div className="error-box">
          Missing chatbotId. Open Human Handoff from a
          configured chatbot.
        </div>
      )}

      {loading && chatbotId && (
        <div className="card">
          Loading handoff rules...
        </div>
      )}

      {success && (
        <div className="success-box">
          {success}
        </div>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!loading && chatbotId && (
        <>
          <div className="card">
            <h2>Create Handoff Rule</h2>

            <form onSubmit={createRule}>
              <div>
                <label>Rule Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Human Support Request"
                  required
                />
              </div>

              <div>
                <label>Condition</label>
                <input
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  placeholder="human"
                />
              </div>

              <div>
                <label>Priority</label>
                <input
                  type="number"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div>
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  {" "}Active
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Creating..."
                  : "Create Handoff Rule"}
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Handoff Rules</h2>

            {rules.length === 0 ? (
              <p>
                No human handoff rules have been configured
                for this chatbot yet.
              </p>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    padding: "16px",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <strong>
                    {rule.name || "Unnamed Rule"}
                  </strong>

                  <div>
                    Condition:{" "}
                    {rule.condition || "Unconditional"}
                  </div>

                  <div>
                    Priority: {rule.priority}
                  </div>

                  <div>
                    Active:{" "}
                    {rule.is_active ? "Yes" : "No"}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteRule(rule.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}