import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const DEFAULT_FORM = {
  deploymentName: "PRAX Production",
  environment: "production",
  domain: "",
  position: "bottom-right",
};

const styles = {
  page: {
    maxWidth: "1150px",
    margin: "0 auto",
    paddingBottom: "48px",
  },

  eyebrow: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#64748b",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    lineHeight: 1.2,
    fontWeight: 700,
    color: "#0f172a",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  header: {
    marginBottom: "28px",
  },

  statusCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px 20px",
    marginBottom: "20px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  statusLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 0 4px #dcfce7",
  },

  statusTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
  },

  statusText: {
    margin: "3px 0 0",
    fontSize: "12px",
    color: "#64748b",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },

  badgeReady: {
    background: "#fef3c7",
    color: "#92400e",
  },

  badgeLive: {
    background: "#dcfce7",
    color: "#166534",
  },

  badgeInactive: {
    background: "#e2e8f0",
    color: "#475569",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(320px, 0.8fr)",
    gap: "20px",
    alignItems: "start",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  sectionHeader: {
    marginBottom: "20px",
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
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.5,
  },

  fieldGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  full: {
    gridColumn: "1 / -1",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  },

  helper: {
    fontSize: "12px",
    lineHeight: 1.5,
    color: "#94a3b8",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
  },

  codeBox: {
    background: "#0f172a",
    borderRadius: "10px",
    overflow: "hidden",
  },

  codeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom:
      "1px solid rgba(255,255,255,0.1)",
  },

  codeHeaderText: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#94a3b8",
    textTransform: "uppercase",
  },

  copyButton: {
    border:
      "1px solid rgba(255,255,255,0.16)",
    borderRadius: "6px",
    padding: "6px 10px",
    background:
      "rgba(255,255,255,0.06)",
    color: "#e2e8f0",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  code: {
    margin: 0,
    padding: "18px",
    color: "#e2e8f0",
    fontSize: "12px",
    lineHeight: 1.7,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  infoBox: {
    padding: "14px",
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    borderRadius: "10px",
    marginTop: "16px",
  },

  infoTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 700,
    color: "#1e3a8a",
  },

  infoText: {
    margin: "5px 0 0",
    fontSize: "12px",
    lineHeight: 1.6,
    color: "#475569",
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
  },

  actionText: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.5,
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexShrink: 0,
  },

  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "11px 20px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "11px 20px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  dangerButton: {
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "11px 20px",
    background: "#ffffff",
    color: "#b91c1c",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  previewBox: {
    minHeight: "270px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
    padding: "16px",
    display: "flex",
    transition: "all 0.2s ease",
  },

  previewWidget: {
    width: "270px",
    minHeight: "190px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    boxShadow:
      "0 12px 30px rgba(15,23,42,0.12)",
    overflow: "hidden",
  },

  previewHeader: {
    padding: "13px 15px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 700,
  },

  previewBody: {
    padding: "16px",
  },

  previewMessage: {
    maxWidth: "88%",
    padding: "10px 12px",
    background: "#f1f5f9",
    borderRadius: "10px",
    color: "#334155",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  previewLauncher: {
    marginTop: "12px",
    marginLeft: "auto",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#0f172a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "16px",
  },

  value: {
    display: "inline-block",
    marginTop: "4px",
    padding: "5px 8px",
    borderRadius: "6px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    wordBreak: "break-word",
  },

  error: {
    marginBottom: "20px",
    padding: "12px 14px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
  },

  success: {
    marginBottom: "20px",
    padding: "12px 14px",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "13px",
  },

  loading: {
    padding: "30px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },
};

export default function Deploy() {
  const [searchParams] = useSearchParams();
  const chatbotId = searchParams.get("chatbotId");

  const [form, setForm] = useState(DEFAULT_FORM);

  const [deployment, setDeployment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [rotating, setRotating] =
    useState(false);

  const [deploymentKey, setDeploymentKey] =
    useState("");

  const [snippet, setSnippet] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!chatbotId) {
      setLoading(false);
      setError(
        "Missing chatbot ID. Open Deploy from a configured chatbot."
      );
      return;
    }

    loadDeployments();
  }, [chatbotId]);

  async function loadDeployments() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/deployments/chatbot/${chatbotId}`
      );

      const deployments =
        response.data || [];

      if (deployments.length > 0) {
        const activeDeployment =
          deployments.find(
            (item) => item.is_active
          ) || deployments[0];

        setDeployment(
          activeDeployment
        );

        setForm((current) => ({
          ...current,
          deploymentName:
            activeDeployment.name ||
            current.deploymentName,
          domain:
            activeDeployment
              .allowed_domains?.[0] || "",
        }));
      } else {
        setDeployment(null);
        setDeploymentKey("");
        setSnippet("");
      }
    } catch (err) {
      console.error(
        "Deployment load error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load deployment configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  const allowedDomains =
    useMemo(() => {
      const domain =
        form.domain
          .trim()
          .toLowerCase();

      if (!domain) {
        return [];
      }

      return [domain];
    }, [form.domain]);

  async function saveConfiguration() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!deployment) {
        const response =
          await api.post(
            "/api/deployments",
            {
              chatbot_id:
                chatbotId,
              name:
                form.deploymentName.trim(),
              allowed_domains:
                allowedDomains,
            }
          );

        const created =
          response.data;

        setDeployment(created);

        if (
          created.deployment_key
        ) {
          setDeploymentKey(
            created.deployment_key
          );

          await loadSnippet(
            created.deployment_key
          );
        }

        setSuccess(
          "Deployment configuration created successfully."
        );
      } else {
        const response =
          await api.patch(
            `/api/deployments/${deployment.id}`,
            {
              name:
                form.deploymentName.trim(),
              allowed_domains:
                allowedDomains,
              is_active:
                deployment.is_active,
            }
          );

        setDeployment(
          response.data
        );

        if (deploymentKey) {
          await loadSnippet(
            deploymentKey
          );
        }

        setSuccess(
          "Deployment configuration updated successfully."
        );
      }
    } catch (err) {
      console.error(
        "Deployment save error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to save deployment configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  async function activateDeployment() {
    if (!deployment) {
      await saveConfiguration();
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await api.patch(
          `/api/deployments/${deployment.id}`,
          {
            name:
              form.deploymentName.trim(),
            allowed_domains:
              allowedDomains,
            is_active: true,
          }
        );

      setDeployment(
        response.data
      );

      setSuccess(
        "Deployment is now active and ready for use."
      );

      if (deploymentKey) {
        await loadSnippet(
          deploymentKey
        );
      }
    } catch (err) {
      console.error(
        "Deployment activation error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to activate deployment."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateDeployment() {
    if (!deployment) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await api.patch(
          `/api/deployments/${deployment.id}`,
          {
            name:
              form.deploymentName.trim(),
            allowed_domains:
              allowedDomains,
            is_active: false,
          }
        );

      setDeployment(
        response.data
      );

      setSuccess(
        "Deployment has been deactivated."
      );
    } catch (err) {
      console.error(
        "Deployment deactivation error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to deactivate deployment."
      );
    } finally {
      setSaving(false);
    }
  }

  async function rotateDeploymentKey() {
    if (!deployment) {
      return;
    }

    try {
      setRotating(true);
      setError("");
      setSuccess("");
      setCopied(false);

      const response =
        await api.post(
          `/api/deployments/${deployment.id}/rotate-key`
        );

      const rotated =
        response.data;

      setDeployment(rotated);

      if (
        rotated.deployment_key
      ) {
        setDeploymentKey(
          rotated.deployment_key
        );

        await loadSnippet(
          rotated.deployment_key
        );
      }

      setSuccess(
        "Deployment key rotated successfully. Use the new installation code."
      );
    } catch (err) {
      console.error(
        "Deployment key rotation error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to rotate deployment key."
      );
    } finally {
      setRotating(false);
    }
  }

  async function loadSnippet(key) {
    if (!key) {
      return;
    }

    try {
      const response =
        await api.get(
          "/api/deployments/public/embed-snippet",
          {
            params: {
              deployment_key:
                key,
            },
          }
        );

      setSnippet(
        response.data?.snippet ||
          ""
      );
    } catch (err) {
      console.error(
        "Embed snippet error:",
        err
      );

      setSnippet("");
    }
  }

  async function copyEmbedCode() {
    if (!snippet) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        snippet
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );

      setError(
        "Unable to copy the installation code."
      );
    }
  }

  const isLive = Boolean(
    deployment?.is_active
  );

  const previewAlignment = {
    top: form.position.startsWith(
      "top"
    )
      ? "flex-start"
      : "flex-end",

    left: form.position.endsWith(
      "left"
    )
      ? "flex-start"
      : "flex-end",
  };

  if (!chatbotId) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.eyebrow}>
            DEPLOYMENT
          </div>

          <h1 style={styles.title}>
            Deploy Chatbot
          </h1>

          <p style={styles.subtitle}>
            Configure deployment settings
            and publish your chatbot.
          </p>
        </div>

        <div style={styles.error}>
          Missing chatbot ID. Open Deploy
          from a configured chatbot.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.eyebrow}>
          DEPLOYMENT
        </div>

        <h1 style={styles.title}>
          Deploy Chatbot
        </h1>

        <p style={styles.subtitle}>
          Configure deployment settings,
          generate your installation code,
          and publish your chatbot to a
          customer website.
        </p>
      </div>

      {loading ? (
        <div style={styles.card}>
          <div style={styles.loading}>
            Loading deployment
            configuration...
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.success}>
              {success}
            </div>
          )}

          {/* STATUS */}
          <div style={styles.statusCard}>
            <div style={styles.statusLeft}>
              <div
                style={
                  styles.statusDot
                }
              />

              <div>
                <h3
                  style={
                    styles.statusTitle
                  }
                >
                  {isLive
                    ? "Deployment Active"
                    : deployment
                    ? "Deployment Inactive"
                    : "Ready for Deployment"}
                </h3>

                <p
                  style={
                    styles.statusText
                  }
                >
                  {isLive
                    ? "This deployment is active and can be used by the customer website."
                    : deployment
                    ? "The deployment exists but is currently inactive."
                    : "No deployment has been created for this chatbot yet."}
                </p>
              </div>
            </div>

            <span
              style={{
                ...styles.badge,
                ...(isLive
                  ? styles.badgeLive
                  : deployment
                  ? styles.badgeInactive
                  : styles.badgeReady),
              }}
            >
              {isLive
                ? "LIVE"
                : deployment
                ? "INACTIVE"
                : "READY"}
            </span>
          </div>

          <div style={styles.grid}>
            <div>
              {/* CONFIGURATION */}
              <div style={styles.card}>
                <div
                  style={
                    styles.sectionHeader
                  }
                >
                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    Deployment
                    Configuration
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Define how this chatbot
                    should be published and
                    accessed.
                  </p>
                </div>

                <div
                  style={
                    styles.fieldGrid
                  }
                >
                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      Deployment Name
                    </label>

                    <input
                      style={styles.input}
                      name="deploymentName"
                      value={
                        form.deploymentName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="PRAX Production"
                    />

                    <span
                      style={
                        styles.helper
                      }
                    >
                      Internal name used
                      to identify this
                      deployment.
                    </span>
                  </div>

                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      Environment
                    </label>

                    <select
                      style={styles.select}
                      name="environment"
                      value={
                        form.environment
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option value="development">
                        Development
                      </option>

                      <option value="staging">
                        Staging
                      </option>

                      <option value="production">
                        Production
                      </option>
                    </select>

                    <span
                      style={
                        styles.helper
                      }
                    >
                      Deployment environment
                      used by your team.
                    </span>
                  </div>

                  <div
                    style={{
                      ...styles.field,
                      ...styles.full,
                    }}
                  >
                    <label
                      style={styles.label}
                    >
                      Allowed Website
                      Domain
                    </label>

                    <input
                      style={styles.input}
                      name="domain"
                      value={form.domain}
                      onChange={
                        handleChange
                      }
                      placeholder="https://example.com"
                    />

                    <span
                      style={
                        styles.helper
                      }
                    >
                      Leave empty to allow
                      all domains. Add the
                      customer website URL
                      to restrict access.
                    </span>
                  </div>

                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      Widget Position
                    </label>

                    <select
                      style={styles.select}
                      value={
                        form.position
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (current) => ({
                            ...current,
                            position:
                              event.target
                                .value,
                          })
                        )
                      }
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

                    <span
                      style={
                        styles.helper
                      }
                    >
                      Preferred launcher
                      position for the
                      embedded widget.
                    </span>
                  </div>

                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      Chatbot ID
                    </label>

                    <span
                      style={
                        styles.value
                      }
                    >
                      {chatbotId}
                    </span>

                    <span
                      style={
                        styles.helper
                      }
                    >
                      Unique identifier
                      for this chatbot.
                    </span>
                  </div>
                </div>
              </div>

              {/* INSTALLATION */}
              <div style={styles.card}>
                <div
                  style={
                    styles.sectionHeader
                  }
                >
                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    Installation Code
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Use the generated
                    snippet to install
                    the chatbot on a
                    customer website.
                  </p>
                </div>

                {snippet ? (
                  <div
                    style={
                      styles.codeBox
                    }
                  >
                    <div
                      style={
                        styles.codeHeader
                      }
                    >
                      <span
                        style={
                          styles.codeHeaderText
                        }
                      >
                        JavaScript Embed
                      </span>

                      <button
                        type="button"
                        style={
                          styles.copyButton
                        }
                        onClick={
                          copyEmbedCode
                        }
                      >
                        {copied
                          ? "Copied"
                          : "Copy Code"}
                      </button>
                    </div>

                    <pre
                      style={styles.code}
                    >
                      {snippet}
                    </pre>
                  </div>
                ) : (
                  <div
                    style={
                      styles.infoBox
                    }
                  >
                    <h4
                      style={
                        styles.infoTitle
                      }
                    >
                      Installation code
                      unavailable
                    </h4>

                    <p
                      style={
                        styles.infoText
                      }
                    >
                      Rotate the deployment
                      key below to generate
                      a new secure
                      installation code.
                    </p>
                  </div>
                )}

                <div
                  style={
                    styles.infoBox
                  }
                >
                  <h4
                    style={
                      styles.infoTitle
                    }
                  >
                    Installation
                    instructions
                  </h4>

                  <p
                    style={
                      styles.infoText
                    }
                  >
                    Copy the generated
                    script and place it
                    before the closing
                    &lt;/body&gt; tag on
                    the customer website.
                    The script uses the
                    deployment key and
                    does not expose AI
                    provider credentials.
                  </p>
                </div>
              </div>

              {/* DEPLOYMENT KEY */}
              {deployment && (
                <div style={styles.card}>
                  <div
                    style={
                      styles.sectionHeader
                    }
                  >
                    <h2
                      style={
                        styles.sectionTitle
                      }
                    >
                      Deployment Key
                    </h2>

                    <p
                      style={
                        styles.sectionDescription
                      }
                    >
                      Manage the secure key
                      used by the public
                      chatbot deployment.
                    </p>
                  </div>

                  {deploymentKey ? (
                    <div
                      style={
                        styles.field
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Current Deployment
                        Key
                      </label>

                      <span
                        style={{
                          ...styles.value,
                          fontSize: "12px",
                          padding:
                            "9px 10px",
                        }}
                      >
                        {deploymentKey}
                      </span>

                      <span
                        style={
                          styles.helper
                        }
                      >
                        This key is shown
                        only when it has just
                        been generated or
                        rotated. Store it
                        securely.
                      </span>
                    </div>
                  ) : (
                    <div
                      style={
                        styles.infoBox
                      }
                    >
                      <h4
                        style={
                          styles.infoTitle
                        }
                      >
                        Deployment key is
                        hidden
                      </h4>

                      <p
                        style={
                          styles.infoText
                        }
                      >
                        For security, the
                        existing plaintext
                        key is not stored
                        or displayed after
                        generation. Rotate
                        the key below to
                        generate a new key
                        and installation
                        code.
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop:
                        "16px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      style={
                        styles.secondaryButton
                      }
                      onClick={
                        rotateDeploymentKey
                      }
                      disabled={rotating}
                    >
                      {rotating
                        ? "Rotating Key..."
                        : "Rotate Deployment Key"}
                    </button>

                    {deploymentKey && (
                      <button
                        type="button"
                        style={
                          styles.copyButton
                        }
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              deploymentKey
                            );

                            setCopied(
                              true
                            );

                            setTimeout(
                              () =>
                                setCopied(
                                  false
                                ),
                              2000
                            );
                          } catch (
                            err
                          ) {
                            console.error(
                              "Key copy failed:",
                              err
                            );
                          }
                        }}
                      >
                        {copied
                          ? "Copied"
                          : "Copy Key"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div
                style={
                  styles.actionBar
                }
              >
                <div
                  style={
                    styles.actionText
                  }
                >
                  {isLive
                    ? "This deployment is currently active."
                    : "Save the configuration first, then activate the deployment."}
                </div>

                <div
                  style={
                    styles.actions
                  }
                >
                  <button
                    type="button"
                    style={
                      styles.secondaryButton
                    }
                    onClick={
                      saveConfiguration
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Configuration"}
                  </button>

                  {!isLive ? (
                    <button
                      type="button"
                      style={
                        styles.primaryButton
                      }
                      onClick={
                        activateDeployment
                      }
                      disabled={saving}
                    >
                      {saving
                        ? "Activating..."
                        : "Deploy Chatbot"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={
                        styles.dangerButton
                      }
                      onClick={
                        deactivateDeployment
                      }
                      disabled={saving}
                    >
                      {saving
                        ? "Updating..."
                        : "Deactivate"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* PREVIEW */}
              <div style={styles.card}>
                <div
                  style={
                    styles.sectionHeader
                  }
                >
                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    Widget Preview
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Approximate
                    customer-facing widget
                    position.
                  </p>
                </div>

                <div
                  style={{
                    ...styles.previewBox,
                    alignItems:
                      previewAlignment.top,
                    justifyContent:
                      previewAlignment.left,
                  }}
                >
                  <div
                    style={
                      styles.previewWidget
                    }
                  >
                    <div
                      style={
                        styles.previewHeader
                      }
                    >
                      PRAX Assistant
                    </div>

                    <div
                      style={
                        styles.previewBody
                      }
                    >
                      <div
                        style={
                          styles.previewMessage
                        }
                      >
                        Hello! How can I
                        help you today?
                      </div>

                      <div
                        style={
                          styles.previewLauncher
                        }
                      >
                        P
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUMMARY */}
              <div style={styles.card}>
                <div
                  style={
                    styles.sectionHeader
                  }
                >
                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    Deployment Summary
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Current deployment
                    information.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div
                      style={
                        styles.label
                      }
                    >
                      Deployment Name
                    </div>

                    <span
                      style={
                        styles.value
                      }
                    >
                      {form.deploymentName ||
                        "Unnamed deployment"}
                    </span>
                  </div>

                  <div>
                    <div
                      style={
                        styles.label
                      }
                    >
                      Environment
                    </div>

                    <span
                      style={
                        styles.value
                      }
                    >
                      {form.environment}
                    </span>
                  </div>

                  <div>
                    <div
                      style={
                        styles.label
                      }
                    >
                      Domain
                    </div>

                    <span
                      style={
                        styles.value
                      }
                    >
                      {form.domain ||
                        "All domains"}
                    </span>
                  </div>

                  <div>
                    <div
                      style={
                        styles.label
                      }
                    >
                      Widget Position
                    </div>

                    <span
                      style={
                        styles.value
                      }
                    >
                      {form.position}
                    </span>
                  </div>

                  <div>
                    <div
                      style={
                        styles.label
                      }
                    >
                      Deployment ID
                    </div>

                    <span
                      style={
                        styles.value
                      }
                    >
                      {deployment?.id ||
                        "Not created"}
                    </span>
                  </div>

                  <div>
                    <div
                      style={
                        styles.label
                      }
                    >
                      Key Prefix
                    </div>

                    <span
                      style={
                        styles.value
                      }
                    >
                      {deployment?.key_prefix ||
                        "Not generated"}
                    </span>
                  </div>

                  <div>
                    <div
                      style={
                        styles.label
                      }
                    >
                      Status
                    </div>

                    <span
                      style={{
                        ...styles.value,
                        color: isLive
                          ? "#166534"
                          : "#92400e",
                        background: isLive
                          ? "#dcfce7"
                          : "#fef3c7",
                      }}
                    >
                      {isLive
                        ? "Active"
                        : deployment
                        ? "Inactive"
                        : "Not deployed"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}