import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const PROVIDERS = [
{
value: "gemini",
label: "Google Gemini",
description: "Google's Gemini models for fast and capable AI responses.",
},
{
value: "openai",
label: "OpenAI",
description: "OpenAI models for general-purpose AI conversations.",
},
{
value: "anthropic",
label: "Anthropic",
description: "Claude models focused on helpful and reliable responses.",
},
];

function AIProvider() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const chatbotId = searchParams.get("chatbotId");

const [providerId, setProviderId] = useState(null);
const [provider, setProvider] = useState("gemini");
const [model, setModel] = useState("gemini-2.5-flash");
const [apiKey, setApiKey] = useState("");

const [hasApiKey, setHasApiKey] = useState(false);
const [isActive, setIsActive] = useState(true);

const [loading, setLoading] = useState(false);
const [loadingProvider, setLoadingProvider] = useState(false);
const [saving, setSaving] = useState(false);
const [testing, setTesting] = useState(false);
const [generating, setGenerating] = useState(false);

const [message, setMessage] = useState("");
const [error, setError] = useState("");

const [testResult, setTestResult] = useState(null);

const [systemPrompt, setSystemPrompt] = useState(
"You are a helpful business assistant."
);

const [testMessage, setTestMessage] = useState(
"Hello! Please introduce yourself and explain what you can help me with."
);

const selectedProvider = PROVIDERS.find(
(item) => item.value === provider
);

useEffect(() => {
if (!chatbotId) {
setError(
"No chatbot was selected. Open AI Provider from a chatbot's Configure page."
);
return;
}


loadProvider();


}, [chatbotId]);

async function loadProvider() {
  try {
    setLoadingProvider(true);
    setError("");
    setMessage("");

    const response = await api.get(
      `/api/ai-providers/chatbot/${chatbotId}`
    );

    const providers = response.data || [];

    if (!providers.length) {
      setProviderId(null);
      setProvider("gemini");
      setModel("gemini-2.5-flash");
      setHasApiKey(false);
      setIsActive(true);
      setApiKey("");
      return;
    }

    const savedProvider = providers[0];

    setProviderId(savedProvider.id);
    setProvider(savedProvider.provider);
    setModel(savedProvider.model);
    setHasApiKey(savedProvider.has_api_key);
    setIsActive(savedProvider.is_active);
    setApiKey("");
  } catch (err) {
    console.error("Failed to load AI provider:", err);

    setError(
      err.response?.data?.detail ||
        err.message ||
        "Failed to load AI provider."
    );
  } finally {
    setLoadingProvider(false);
  }
}


function handleProviderChange(value) {
setProvider(value);


if (value === "gemini") {
  setModel("gemini-2.5-flash");
} else if (value === "openai") {
  setModel("gpt-4o-mini");
} else if (value === "anthropic") {
  setModel("claude-3-5-sonnet-latest");
}

setTestResult(null);
setMessage("");
setError("");


}

async function handleSave() {
  try {
    setSaving(true);
    setError("");
    setMessage("");
    setTestResult(null);

    if (!chatbotId) {
      throw new Error("Chatbot ID is missing.");
    }

    if (!model.trim()) {
      throw new Error("Please enter an AI model.");
    }

    if (!providerId && !apiKey.trim()) {
      throw new Error("Please enter the API key.");
    }

    if (providerId) {
      const payload = {
        provider,
        model: model.trim(),
        is_active: isActive,
      };

      if (apiKey.trim()) {
        payload.api_key = apiKey.trim();
      }

      const response = await api.patch(
        `/api/ai-providers/${providerId}`,
        payload
      );

      setProviderId(response.data.id);
      setProvider(response.data.provider);
      setModel(response.data.model);
      setHasApiKey(response.data.has_api_key);
      setApiKey("");

      setMessage("AI provider updated successfully.");
    } else {
      const payload = {
        chatbot_id: chatbotId,
        provider,
        model: model.trim(),
        api_key: apiKey.trim(),
      };

      const response = await api.post(
        "/api/ai-providers",
        payload
      );

      setProviderId(response.data.id);
      setProvider(response.data.provider);
      setModel(response.data.model);
      setHasApiKey(response.data.has_api_key);
      setIsActive(response.data.is_active);
      setApiKey("");

      setMessage("AI provider connected successfully.");
    }
  } catch (err) {
    console.error("Failed to save AI provider:", err);

    setError(
      err.response?.data?.detail ||
        err.message ||
        "Failed to save AI provider."
    );
  } finally {
    setSaving(false);
  }
}

async function handleTestConnection() {
if (!providerId) {
setError("Save the AI provider first, then test the connection.");
return;
}

try {
  setTesting(true);
  setError("");
  setMessage("");
  setTestResult(null);

  const response = await api.post(
    `/api/ai-providers/${providerId}/test`
  );

  setTestResult(response.data);

  setMessage(
    response.data?.message ||
      response.data?.detail ||
      "AI provider connection test completed."
  );
} catch (err) {
  console.error("AI provider connection test failed:", err);

  setError(
    err.response?.data?.detail ||
      err.message ||
      "AI provider connection test failed."
  );
} finally {
  setTesting(false);
}


}

async function handleGenerate() {
if (!providerId) {
setError("Save the AI provider before generating a test response.");
return;
}


if (!testMessage.trim()) {
  setError("Please enter a test message.");
  return;
}

try {
  setGenerating(true);
  setError("");
  setMessage("");
  setTestResult(null);

  const response = await api.post(
    `/api/ai-providers/${providerId}/generate`,
    {
      system_prompt:
        systemPrompt.trim() ||
        "You are a helpful business assistant.",
      user_message: testMessage.trim(),
    }
  );

  setTestResult(response.data);

  setMessage("Test response generated successfully.");
} catch (err) {
  console.error("Failed to generate AI response:", err);

  setError(
    err.response?.data?.detail ||
      err.message ||
      "Failed to generate AI response."
  );
} finally {
  setGenerating(false);
}


}

async function handleDelete() {
if (!providerId) {
return;
}


const confirmed = window.confirm(
  "Delete this AI provider configuration? This cannot be undone."
);

if (!confirmed) {
  return;
}

try {
  setLoading(true);
  setError("");
  setMessage("");

  await api.delete(`/api/ai-providers/${providerId}`);

  setProviderId(null);
  setHasApiKey(false);
  setApiKey("");
  setMessage("AI provider deleted successfully.");
} catch (err) {
  console.error("Failed to delete AI provider:", err);

  setError(
    err.response?.data?.detail ||
      err.message ||
      "Failed to delete AI provider."
  );
} finally {
  setLoading(false);
}


}

function handleBack() {
if (chatbotId) {
navigate(`/chatbots/${chatbotId}/configure`);
} else {
navigate("/chatbots");
}
}

if (loadingProvider) {
return ( <div className="dashboard-page"> <div className="page-eyebrow">AI CONFIGURATION</div> <h1>AI Provider</h1>


    <div className="chatbots-loading">
      <div className="loading-spinner"></div>
      <span>Loading AI provider...</span>
    </div>
  </div>
);


}

return ( <div className="dashboard-page"> <div className="ai-provider-header"> <div> <div className="page-eyebrow">AI CONFIGURATION</div>


      <h1>AI Provider</h1>

      <p>
        Connect an AI provider and configure the model used by your
        chatbot.
      </p>
    </div>

    <div className="ai-provider-header-actions">
      <button
        type="button"
        className="secondary-button"
        onClick={handleBack}
      >
        ← Back
      </button>
    </div>
  </div>

  {!chatbotId && (
    <div className="chatbot-error">
      <strong>Chatbot not selected</strong>
      <span>
        Open this page from a chatbot's Configure page so the provider
        can be connected to the correct chatbot.
      </span>

      <button
        type="button"
        onClick={() => navigate("/chatbots")}
      >
        Back to Chatbots
      </button>
    </div>
  )}

  {chatbotId && (
    <>
      <div className="ai-provider-status-card">
        <div className="ai-provider-status-left">
          <div className="ai-provider-main-icon">⚡</div>

          <div>
            <div className="page-eyebrow">RUNTIME PROVIDER</div>

            <h2>
              {selectedProvider?.label || "AI Provider"}
            </h2>

            <p>
              {selectedProvider?.description ||
                "Configure the AI model for this chatbot."}
            </p>
          </div>
        </div>

        <div
          className={
            isActive
              ? "configure-status active"
              : "configure-status inactive"
          }
        >
          <span></span>

          {isActive ? "Active" : "Inactive"}
        </div>
      </div>

      {message && (
        <div className="ai-provider-success">
          <strong>Success</strong>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="chatbot-error">
          <strong>Error</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="ai-provider-layout">
        <section className="ai-provider-panel">
          <div className="section-heading">
            <div>
              <div className="page-eyebrow">01</div>
              <h2>Provider Configuration</h2>
            </div>

            {providerId && (
              <span className="provider-connected-badge">
                ● Connected
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="provider">
              AI Provider
            </label>

            <select
              id="provider"
              value={provider}
              onChange={(event) =>
                handleProviderChange(event.target.value)
              }
            >
              {PROVIDERS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="model">
              Model
            </label>

            <input
              id="model"
              type="text"
              value={model}
              onChange={(event) =>
                setModel(event.target.value)
              }
              placeholder="Enter model name"
              maxLength={150}
            />

            <small>
              Enter the exact model identifier supported by your
              selected provider.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="api-key">
              API Key
            </label>

            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(event) =>
                setApiKey(event.target.value)
              }
              placeholder={
                hasApiKey
                  ? "API key is already configured — enter a new key to replace it"
                  : "Enter provider API key"
              }
              maxLength={1000}
              autoComplete="new-password"
            />

            <small>
              {hasApiKey
                ? "A key is securely stored. The existing key is never displayed."
                : "Your API key is sent to the backend and is not displayed after saving."}
            </small>
          </div>

          <div className="ai-provider-toggle-row">
            <div>
              <strong>Provider Active</strong>

              <p>
                Allow this provider to be used by the chatbot runtime.
              </p>
            </div>

            <button
              type="button"
              className={
                isActive
                  ? "provider-toggle active"
                  : "provider-toggle"
              }
              onClick={() => setIsActive((current) => !current)}
              aria-pressed={isActive}
            >
              <span></span>
            </button>
          </div>

          <div className="ai-provider-actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : providerId
                ? "Save Changes"
                : "Connect Provider"}
            </button>

            {providerId && (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  {testing
                    ? "Testing..."
                    : "Test Connection"}
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </section>

        <section className="ai-provider-panel">
          <div className="section-heading">
            <div>
              <div className="page-eyebrow">02</div>
              <h2>Test AI Response</h2>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="system-prompt">
              System Prompt
            </label>

            <textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(event) =>
                setSystemPrompt(event.target.value)
              }
              rows={6}
              maxLength={20000}
              placeholder="You are a helpful business assistant."
            />
          </div>

          <div className="form-group">
            <label htmlFor="test-message">
              Test Message
            </label>

            <textarea
              id="test-message"
              value={testMessage}
              onChange={(event) =>
                setTestMessage(event.target.value)
              }
              rows={5}
              maxLength={20000}
              placeholder="Enter a message to test your AI provider."
            />
          </div>

          <button
            type="button"
            className="primary-button full-width-button"
            onClick={handleGenerate}
            disabled={generating || !providerId}
          >
            {generating
              ? "Generating..."
              : "Generate Test Response"}
          </button>

          {!providerId && (
            <p className="provider-test-hint">
              Connect and save the provider first.
            </p>
          )}

          {testResult && (
            <div className="ai-test-result">
              <div className="ai-test-result-header">
                <div>
                  <div className="page-eyebrow">
                    RESPONSE
                  </div>

                  <h3>
                    {testResult.provider ||
                      provider}
                  </h3>
                </div>

                <span>
                  {testResult.model || model}
                </span>
              </div>

              {testResult.content && (
                <div className="ai-test-content">
                  {testResult.content}
                </div>
              )}

              {typeof testResult.input_tokens ===
                "number" && (
                <div className="token-grid">
                  <div>
                    <span>Input</span>
                    <strong>
                      {testResult.input_tokens}
                    </strong>
                  </div>

                  <div>
                    <span>Output</span>
                    <strong>
                      {testResult.output_tokens}
                    </strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      {testResult.total_tokens}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="ai-provider-security-note">
        <div>🔐</div>

        <div>
          <strong>BYOK security</strong>

          <p>
            API credentials are managed by the backend. The frontend
            only receives a boolean indicating whether a key exists;
            the actual stored secret is never returned by the API.
          </p>
        </div>
      </div>
    </>
  )}
</div>


);
}

export default AIProvider;