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
    name: "Customer Requests Human",
    condition: "Customer requests human",
    priority: 1,
    is_active: true,
  });

  // =========================================================
  // SAFE API ERROR HANDLER
  // =========================================================

  function getApiErrorMessage(err, fallback) {
    const detail = err?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object") {
            const message =
              item.msg ||
              item.message ||
              "Validation error";

            const location = Array.isArray(item.loc)
              ? item.loc.join(" → ")
              : "";

            return location
              ? `${location}: ${message}`
              : message;
          }

          return String(item);
        })
        .join(" | ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (
      detail &&
      typeof detail === "object"
    ) {
      return (
        detail.msg ||
        detail.message ||
        JSON.stringify(detail)
      );
    }

    if (err?.message) {
      return err.message;
    }

    return fallback;
  }

  // =========================================================
  // LOAD RULES
  // =========================================================

  useEffect(() => {
    if (!chatbotId) {
      setLoading(false);
      setError(
        "Missing chatbotId. Open Human Handoff from a configured voice agent."
      );
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

      setRules(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD HANDOFF RULES ERROR:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Failed to load human handoff rules."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

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

  // =========================================================
  // CREATE RULE
  // =========================================================

  async function createRule(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!chatbotId) {
      setError(
        "Missing chatbotId. Please open Human Handoff from the voice agent."
      );
      return;
    }

    const name = form.name.trim();
    const condition = form.condition.trim();
    const priority = Number(form.priority);

    if (!name) {
      setError("Rule name is required.");
      return;
    }

    if (!condition) {
      setError("Trigger condition is required.");
      return;
    }

    if (
      !Number.isInteger(priority) ||
      priority < 1
    ) {
      setError(
        "Priority must be a whole number starting from 1."
      );
      return;
    }

    if (priority > 100) {
      setError(
        "Priority cannot be greater than 100."
      );
      return;
    }

    try {
      setSaving(true);

      // EXACT payload required by HandoffRuleCreateRequest
      const payload = {
        chatbot_id: chatbotId,
        name: name,
        condition: condition,
        priority: priority,
        is_active: Boolean(form.is_active),
      };

      console.log(
        "CREATE HANDOFF RULE PAYLOAD:",
        payload
      );

      await api.post(
        "/api/handoff/rules",
        payload
      );

      setSuccess(
        "Escalation rule created successfully."
      );

      setForm({
        name: "",
        condition: "Customer requests human",
        priority: activeRules + 1,
        is_active: true,
      });

      await loadRules();
    } catch (err) {
      console.error(
        "CREATE HANDOFF RULE ERROR:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Failed to create escalation rule."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // DELETE RULE
  // =========================================================

  async function deleteRule(ruleId) {
    if (!ruleId) {
      setError("Invalid handoff rule ID.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/api/handoff/rules/${ruleId}`
      );

      setSuccess(
        "Escalation rule deleted successfully."
      );

      await loadRules();
    } catch (err) {
      console.error(
        "DELETE HANDOFF RULE ERROR:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Failed to delete escalation rule."
        )
      );
    }
  }

  const activeRules = rules.filter(
    (rule) => rule?.is_active
  ).length;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard-page handoff-page">
      <style>{`
        .handoff-page {
          padding-bottom: 48px;
        }

        .handoff-hero {
          margin-bottom: 28px;
        }

        .handoff-eyebrow {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          margin-bottom: 10px;
        }

        .handoff-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .handoff-title {
          margin: 0;
          font-size: 34px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .handoff-subtitle {
          margin: 8px 0 0;
          max-width: 720px;
          color: #64748b;
          line-height: 1.6;
        }

        .handoff-agent-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 14px;
          border: 1px solid #dbe4ee;
          border-radius: 12px;
          background: #ffffff;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }

        .handoff-agent-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        .handoff-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .handoff-stat {
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
        }

        .handoff-stat-label {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .handoff-stat-value {
          margin-top: 9px;
          color: #0f172a;
          font-size: 20px;
          font-weight: 800;
        }

        .handoff-stat-value.online {
          color: #16a34a;
        }

        .handoff-stat-value.ready {
          color: #2563eb;
        }

        .handoff-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 20px;
          align-items: start;
        }

        .handoff-card {
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #ffffff;
          overflow: hidden;
        }

        .handoff-card-header {
          padding: 20px 22px;
          border-bottom: 1px solid #e2e8f0;
        }

        .handoff-card-header h2 {
          margin: 0;
          color: #0f172a;
          font-size: 17px;
          font-weight: 800;
        }

        .handoff-card-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        .handoff-card-body {
          padding: 22px;
        }

        .handoff-form {
          display: grid;
          gap: 18px;
        }

        .handoff-field {
          display: grid;
          gap: 7px;
        }

        .handoff-field label {
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .handoff-field input,
        .handoff-field select {
          width: 100%;
          box-sizing: border-box;
          min-height: 44px;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #ffffff;
          color: #0f172a;
          font-size: 14px;
          outline: none;
        }

        .handoff-field input:focus,
        .handoff-field select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        .handoff-form-row {
          display: grid;
          grid-template-columns: 1fr 140px;
          gap: 14px;
        }

        .handoff-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .handoff-toggle-copy strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
        }

        .handoff-toggle-copy span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 11px;
        }

        .handoff-toggle input {
          width: 18px;
          height: 18px;
          accent-color: #2563eb;
        }

        .handoff-create-button {
          min-height: 46px;
          border: 0;
          border-radius: 11px;
          background: #0f172a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .handoff-create-button:hover {
          background: #1e293b;
        }

        .handoff-create-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .handoff-takeover {
          display: grid;
          gap: 12px;
        }

        .handoff-takeover-item {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .handoff-takeover-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #dbeafe;
          color: #2563eb;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .handoff-takeover-copy strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
        }

        .handoff-takeover-copy span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 11px;
        }

        .handoff-status {
          margin-top: 18px;
          padding: 15px;
          border-radius: 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .handoff-status-title {
          color: #166534;
          font-size: 12px;
          font-weight: 800;
        }

        .handoff-status-text {
          margin-top: 4px;
          color: #15803d;
          font-size: 11px;
        }

        .handoff-rules-card {
          margin-top: 20px;
        }

        .handoff-rules-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .handoff-rule-count {
          padding: 6px 10px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
        }

        .handoff-empty {
          padding: 42px 24px;
          text-align: center;
        }

        .handoff-empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 20px;
        }

        .handoff-empty h3 {
          margin: 0;
          color: #0f172a;
          font-size: 15px;
        }

        .handoff-empty p {
          max-width: 470px;
          margin: 7px auto 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .handoff-rule {
          display: grid;
          grid-template-columns: 70px minmax(0, 1fr) auto;
          gap: 16px;
          align-items: center;
          padding: 18px 22px;
          border-bottom: 1px solid #e2e8f0;
        }

        .handoff-rule:last-child {
          border-bottom: 0;
        }

        .handoff-priority {
          text-align: center;
        }

        .handoff-priority-number {
          display: block;
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
        }

        .handoff-priority-label {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .handoff-rule-name {
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
        }

        .handoff-rule-condition {
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
        }

        .handoff-rule-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .handoff-pill {
          display: inline-flex;
          padding: 4px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          font-weight: 700;
        }

        .handoff-pill.active {
          background: #dcfce7;
          color: #15803d;
        }

        .handoff-pill.inactive {
          background: #fef2f2;
          color: #dc2626;
        }

        .handoff-delete {
          min-height: 36px;
          padding: 0 12px;
          border: 1px solid #fecaca;
          border-radius: 9px;
          background: #ffffff;
          color: #dc2626;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .handoff-delete:hover {
          background: #fef2f2;
        }

        .handoff-message {
          margin-top: 14px;
          padding: 13px 14px;
          border: 1px dashed #cbd5e1;
          border-radius: 11px;
          background: #ffffff;
          color: #475569;
          font-size: 11px;
          line-height: 1.55;
        }

        .handoff-message strong {
          display: block;
          margin-bottom: 4px;
          color: #334155;
          font-size: 11px;
        }

        .handoff-error {
          margin-bottom: 18px;
          padding: 13px 15px;
          border: 1px solid #fecaca;
          border-radius: 11px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 12px;
          line-height: 1.5;
          word-break: break-word;
        }

        .handoff-success {
          margin-bottom: 18px;
          padding: 13px 15px;
          border: 1px solid #bbf7d0;
          border-radius: 11px;
          background: #f0fdf4;
          color: #166534;
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .handoff-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .handoff-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .handoff-title {
            font-size: 28px;
          }

          .handoff-stats {
            grid-template-columns: 1fr;
          }

          .handoff-form-row {
            grid-template-columns: 1fr;
          }

          .handoff-rule {
            grid-template-columns: 50px minmax(0, 1fr);
          }

          .handoff-delete {
            grid-column: 2;
            justify-self: start;
          }
        }
      `}</style>

      <div className="handoff-hero">
        <div className="handoff-eyebrow">
          PRAX AI VOICE PLATFORM
        </div>

        <div className="handoff-title-row">
          <div>
            <h1 className="handoff-title">
              Human Handoff
            </h1>

            <p className="handoff-subtitle">
              Control when AI conversations are
              transferred to your support team for
              human assistance.
            </p>
          </div>

          <div className="handoff-agent-badge">
            <span className="handoff-agent-dot" />
            PRAX Voice Agent
          </div>
        </div>
      </div>

      {!chatbotId && (
        <div className="handoff-error">
          Missing chatbotId. Open Human Handoff from
          a configured voice agent.
        </div>
      )}

      {success && (
        <div className="handoff-success">
          {success}
        </div>
      )}

      {error && (
        <div className="handoff-error">
          {error}
        </div>
      )}

      {loading && chatbotId ? (
        <div className="card">
          Loading human handoff configuration...
        </div>
      ) : (
        chatbotId && (
          <>
            <div className="handoff-stats">
              <div className="handoff-stat">
                <div className="handoff-stat-label">
                  Handoff Status
                </div>

                <div className="handoff-stat-value online">
                  Enabled
                </div>
              </div>

              <div className="handoff-stat">
                <div className="handoff-stat-label">
                  Automatic Escalation
                </div>

                <div className="handoff-stat-value ready">
                  Active
                </div>
              </div>

              <div className="handoff-stat">
                <div className="handoff-stat-label">
                  Human Takeover
                </div>

                <div className="handoff-stat-value ready">
                  Ready
                </div>
              </div>

              <div className="handoff-stat">
                <div className="handoff-stat-label">
                  Active Rules
                </div>

                <div className="handoff-stat-value">
                  {activeRules} / 5
                </div>
              </div>
            </div>

            <div className="handoff-main-grid">
              <section className="handoff-card">
                <div className="handoff-card-header">
                  <h2>
                    Create Escalation Rule
                  </h2>

                  <p>
                    Define when PRAX should transfer
                    a conversation to a human agent.
                  </p>
                </div>

                <div className="handoff-card-body">
                  <form
                    className="handoff-form"
                    onSubmit={createRule}
                  >
                    <div className="handoff-field">
                      <label>
                        Rule Name
                      </label>

                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Customer Requests Human"
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="handoff-form-row">
                      <div className="handoff-field">
                        <label>
                          Trigger Condition
                        </label>

                        <select
                          name="condition"
                          value={form.condition}
                          onChange={(event) => {
                            const value =
                              event.target.value;

                            const names = {
                              "Customer requests human":
                                "Customer Requests Human",

                              "Customer frustration":
                                "Customer Frustration",

                              "AI cannot resolve request":
                                "AI Cannot Resolve",

                              "Sensitive request":
                                "Sensitive Request",

                              "Maximum attempts reached":
                                "Maximum Attempts Reached",
                            };

                            setForm((current) => ({
                              ...current,
                              condition: value,
                              name:
                                names[value] ||
                                current.name,
                            }));
                          }}
                        >
                          <option value="Customer requests human">
                            Customer requests human
                          </option>

                          <option value="Customer frustration">
                            Customer frustration
                          </option>

                          <option value="AI cannot resolve request">
                            AI cannot resolve request
                          </option>

                          <option value="Sensitive request">
                            Sensitive request
                          </option>

                          <option value="Maximum attempts reached">
                            Maximum attempts reached
                          </option>
                        </select>
                      </div>

                      <div className="handoff-field">
                        <label>
                          Priority
                        </label>

                        <input
                          type="number"
                          name="priority"
                          value={form.priority}
                          onChange={handleChange}
                          min="1"
                          max="100"
                          step="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="handoff-toggle">
                      <div className="handoff-toggle-copy">
                        <strong>
                          Activate this rule
                        </strong>

                        <span>
                          Allow this rule to trigger
                          escalation.
                        </span>
                      </div>

                      <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleChange}
                      />
                    </div>

                    <button
                      className="handoff-create-button"
                      type="submit"
                      disabled={saving}
                    >
                      {saving
                        ? "Creating Rule..."
                        : "Create Escalation Rule"}
                    </button>
                  </form>
                </div>
              </section>

              <section className="handoff-card">
                <div className="handoff-card-header">
                  <h2>
                    Human Takeover
                  </h2>

                  <p>
                    Conversation behavior after an
                    escalation is triggered.
                  </p>
                </div>

                <div className="handoff-card-body">
                  <div className="handoff-takeover">
                    <div className="handoff-takeover-item">
                      <div className="handoff-takeover-icon">
                        ↗
                      </div>

                      <div className="handoff-takeover-copy">
                        <strong>
                          Automatic Escalation
                        </strong>

                        <span>
                          Transfer qualifying
                          conversations automatically.
                        </span>
                      </div>
                    </div>

                    <div className="handoff-takeover-item">
                      <div className="handoff-takeover-icon">
                        ■
                      </div>

                      <div className="handoff-takeover-copy">
                        <strong>
                          Stop AI Response
                        </strong>

                        <span>
                          AI stops responding once a
                          human takes over.
                        </span>
                      </div>
                    </div>

                    <div className="handoff-takeover-item">
                      <div className="handoff-takeover-icon">
                        ◉
                      </div>

                      <div className="handoff-takeover-copy">
                        <strong>
                          Preserve Conversation
                        </strong>

                        <span>
                          Human agents receive the
                          existing conversation context.
                        </span>
                      </div>
                    </div>

                    <div className="handoff-takeover-item">
                      <div className="handoff-takeover-icon">
                        !
                      </div>

                      <div className="handoff-takeover-copy">
                        <strong>
                          Agent Notification
                        </strong>

                        <span>
                          Escalation events are marked
                          for human attention.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="handoff-status">
                    <div className="handoff-status-title">
                      ● Human takeover ready
                    </div>

                    <div className="handoff-status-text">
                      PRAX will preserve the conversation
                      context when an escalation rule
                      matches.
                    </div>
                  </div>

                  <div className="handoff-message">
                    <strong>
                      Recommended handoff message
                    </strong>

                    I’ll connect you with a human
                    support agent who can assist you
                    further. Please stay with us.
                  </div>
                </div>
              </section>
            </div>

            <section className="handoff-card handoff-rules-card">
              <div className="handoff-card-header">
                <div className="handoff-rules-header">
                  <div>
                    <h2>
                      Escalation Rules
                    </h2>

                    <p>
                      Rules are evaluated according
                      to their priority.
                    </p>
                  </div>

                  <div className="handoff-rule-count">
                    {rules.length}{" "}
                    {rules.length === 1
                      ? "Rule"
                      : "Rules"}
                  </div>
                </div>
              </div>

              {rules.length === 0 ? (
                <div className="handoff-empty">
                  <div className="handoff-empty-icon">
                    ♙
                  </div>

                  <h3>
                    No escalation rules yet
                  </h3>

                  <p>
                    Create your first rule above to
                    determine when PRAX should transfer
                    a voice conversation to a human
                    agent.
                  </p>
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    className="handoff-rule"
                    key={rule.id}
                  >
                    <div className="handoff-priority">
                      <span className="handoff-priority-number">
                        {rule.priority}
                      </span>

                      <span className="handoff-priority-label">
                        Priority
                      </span>
                    </div>

                    <div>
                      <div className="handoff-rule-name">
                        {rule.name ||
                          "Unnamed Rule"}
                      </div>

                      <div className="handoff-rule-condition">
                        Trigger:{" "}
                        {rule.condition ||
                          "Unconditional escalation"}
                      </div>

                      <div className="handoff-rule-meta">
                        <span
                          className={`handoff-pill ${
                            rule.is_active
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {rule.is_active
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>

                        <span className="handoff-pill">
                          HUMAN TAKEOVER
                        </span>
                      </div>
                    </div>

                    <button
                      className="handoff-delete"
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
            </section>

            <div
              className="card"
              style={{ marginTop: "20px" }}
            >
              <strong>
                PRAX Voice Handoff Runtime
              </strong>

              <div
                style={{
                  marginTop: "6px",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Gemini-powered conversation
                escalation and human takeover
                controls are ready.
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}