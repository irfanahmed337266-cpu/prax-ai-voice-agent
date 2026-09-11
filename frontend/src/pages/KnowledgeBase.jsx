import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const EMPTY_KB = {
  name: "",
  description: "",
  is_active: true,
};

const EMPTY_DOCUMENT = {
  name: "",
  content: "",
};

function KnowledgeBase() {
  const [searchParams] = useSearchParams();
  const chatbotId = searchParams.get("chatbotId");

  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] =
    useState("");

  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    document_count: 0,
    chunk_count: 0,
  });

  const [knowledgeBaseForm, setKnowledgeBaseForm] =
    useState(EMPTY_KB);

  const [documentForm, setDocumentForm] =
    useState(EMPTY_DOCUMENT);

  const [loading, setLoading] = useState(true);
  const [savingKnowledgeBase, setSavingKnowledgeBase] =
    useState(false);
  const [ingesting, setIngesting] = useState(false);

  const [showCreateKnowledgeBase, setShowCreateKnowledgeBase] =
    useState(false);
  const [showDocumentForm, setShowDocumentForm] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedKnowledgeBase = useMemo(() => {
    return knowledgeBases.find(
      (item) => item.id === selectedKnowledgeBaseId
    );
  }, [knowledgeBases, selectedKnowledgeBaseId]);

  async function loadKnowledgeBases() {
    if (!chatbotId) {
      setError("No chatbot selected.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/knowledge-bases/chatbot/${chatbotId}`
      );

      const items = Array.isArray(response.data)
        ? response.data
        : [];

      setKnowledgeBases(items);

      if (items.length > 0) {
        const existingSelected = items.find(
          (item) => item.id === selectedKnowledgeBaseId
        );

        const nextId =
          existingSelected?.id || items[0].id;

        setSelectedKnowledgeBaseId(nextId);
      } else {
        setSelectedKnowledgeBaseId("");
        setDocuments([]);
        setStats({
          document_count: 0,
          chunk_count: 0,
        });
      }
    } catch (err) {
      console.error(
        "Failed to load knowledge bases:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load knowledge bases."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadKnowledgeBaseDetails(
    knowledgeBaseId
  ) {
    if (!knowledgeBaseId) {
      setDocuments([]);
      setStats({
        document_count: 0,
        chunk_count: 0,
      });
      return;
    }

    try {
      setError("");

      const [
        knowledgeBaseResponse,
        documentsResponse,
      ] = await Promise.all([
        api.get(
          `/api/knowledge-bases/${knowledgeBaseId}`
        ),
        api.get(
          `/api/documents/knowledge-base/${knowledgeBaseId}`
        ),
      ]);

      const knowledgeBase =
        knowledgeBaseResponse.data || {};

      setStats({
        document_count:
          knowledgeBase.document_count || 0,
        chunk_count:
          knowledgeBase.chunk_count || 0,
      });

      setDocuments(
        Array.isArray(documentsResponse.data)
          ? documentsResponse.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load knowledge base details:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load knowledge base details."
      );
    }
  }

  useEffect(() => {
    loadKnowledgeBases();
  }, [chatbotId]);

  useEffect(() => {
    loadKnowledgeBaseDetails(
      selectedKnowledgeBaseId
    );
  }, [selectedKnowledgeBaseId]);

  function handleKnowledgeBaseChange(event) {
    const { name, value, type, checked } =
      event.target;

    setKnowledgeBaseForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  }

  function handleDocumentChange(event) {
    const { name, value } = event.target;

    setDocumentForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreateKnowledgeBase() {
    setKnowledgeBaseForm(EMPTY_KB);
    setMessage("");
    setError("");
    setShowCreateKnowledgeBase(true);
  }

  function closeCreateKnowledgeBase() {
    if (savingKnowledgeBase) return;

    setShowCreateKnowledgeBase(false);
    setKnowledgeBaseForm(EMPTY_KB);
  }

  async function createKnowledgeBase(event) {
    event.preventDefault();

    if (!knowledgeBaseForm.name.trim()) {
      setError(
        "Knowledge base name is required."
      );
      return;
    }

    try {
      setSavingKnowledgeBase(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/api/knowledge-bases",
        {
          chatbot_id: chatbotId,
          name: knowledgeBaseForm.name.trim(),
          description:
            knowledgeBaseForm.description.trim() ||
            null,
          is_active:
            Boolean(
              knowledgeBaseForm.is_active
            ),
        }
      );

      const created = response.data;

      setMessage(
        "Knowledge base created successfully."
      );

      setShowCreateKnowledgeBase(false);
      setKnowledgeBaseForm(EMPTY_KB);

      await loadKnowledgeBases();

      if (created?.id) {
        setSelectedKnowledgeBaseId(
          created.id
        );
      }
    } catch (err) {
      console.error(
        "Failed to create knowledge base:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to create knowledge base."
      );
    } finally {
      setSavingKnowledgeBase(false);
    }
  }

  function openDocumentForm() {
    if (!selectedKnowledgeBaseId) {
      setError(
        "Select a knowledge base first."
      );
      return;
    }

    setDocumentForm(EMPTY_DOCUMENT);
    setError("");
    setMessage("");
    setShowDocumentForm(true);
  }

  function closeDocumentForm() {
    if (ingesting) return;

    setShowDocumentForm(false);
    setDocumentForm(EMPTY_DOCUMENT);
  }

  async function ingestDocument(event) {
    event.preventDefault();

    if (!selectedKnowledgeBaseId) {
      setError(
        "Select a knowledge base first."
      );
      return;
    }

    if (!documentForm.name.trim()) {
      setError(
        "Document name is required."
      );
      return;
    }

    if (!documentForm.content.trim()) {
      setError(
        "Document content is required."
      );
      return;
    }

    try {
      setIngesting(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/api/documents/ingest",
        {
          knowledge_base_id:
            selectedKnowledgeBaseId,
          name: documentForm.name.trim(),
          source_type: "text",
          content:
            documentForm.content.trim(),
          source_url: null,
          mime_type: "text/plain",
          metadata: {},
        }
      );

      const result = response.data || {};

      setMessage(
        `Document ingested successfully. ${result.chunk_count || 0} chunks and ${result.embedding_count || 0} embeddings created.`
      );

      setShowDocumentForm(false);
      setDocumentForm(EMPTY_DOCUMENT);

      await loadKnowledgeBaseDetails(
        selectedKnowledgeBaseId
      );
    } catch (err) {
      console.error(
        "Failed to ingest document:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to ingest document."
      );
    } finally {
      setIngesting(false);
    }
  }

  async function deleteDocument(document) {
    const confirmed = window.confirm(
      `Delete "${document.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/api/documents/${document.id}`
      );

      setMessage(
        "Document deleted successfully."
      );

      await loadKnowledgeBaseDetails(
        selectedKnowledgeBaseId
      );
    } catch (err) {
      console.error(
        "Failed to delete document:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to delete document."
      );
    }
  }

  async function toggleKnowledgeBase() {
    if (!selectedKnowledgeBase) return;

    try {
      setError("");
      setMessage("");

      const response = await api.patch(
        `/api/knowledge-bases/${selectedKnowledgeBase.id}`,
        {
          is_active:
            !selectedKnowledgeBase.is_active,
        }
      );

      setMessage(
        response.data?.is_active
          ? "Knowledge base activated."
          : "Knowledge base deactivated."
      );

      await loadKnowledgeBases();
    } catch (err) {
      console.error(
        "Failed to update knowledge base:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to update knowledge base."
      );
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-eyebrow">
          PRAX MODULE
        </div>

        <h1>Knowledge Base</h1>

        <div className="page-loading">
          Loading knowledge base...
        </div>
      </div>
    );
  }

  if (!chatbotId) {
    return (
      <div className="dashboard-page">
        <div className="page-eyebrow">
          PRAX MODULE
        </div>

        <h1>Knowledge Base</h1>

        <p>
          No chatbot selected. Open Knowledge Base
          from a configured chatbot.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="configure-header">
        <div>
          <div className="page-eyebrow">
            CHATBOT CONFIGURATION
          </div>

          <h1>Knowledge Base</h1>

          <p>
            Manage the documents and knowledge
            used by your chatbot.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateKnowledgeBase}
        >
          + Create Knowledge Base
        </button>
      </div>

      {error && (
        <div className="flow-alert flow-alert-error">
          {error}
        </div>
      )}

      {message && (
        <div className="flow-alert flow-alert-success">
          {message}
        </div>
      )}

      {knowledgeBases.length === 0 ? (
        <section className="dashboard-card">
          <h2>No Knowledge Base Yet</h2>

          <p>
            Create a knowledge base for this
            chatbot before adding documents.
          </p>

          <button
            className="primary-button"
            onClick={openCreateKnowledgeBase}
          >
            + Create Knowledge Base
          </button>
        </section>
      ) : (
        <>
          <section className="dashboard-card">
            <div className="section-header">
              <div>
                <h2>Knowledge Base</h2>

                <p>
                  Select the knowledge source used
                  by this chatbot.
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={
                  toggleKnowledgeBase
                }
              >
                {selectedKnowledgeBase?.is_active
                  ? "Deactivate"
                  : "Activate"}
              </button>
            </div>

            <div className="form-group">
              <label>
                Active Knowledge Base
              </label>

              <select
                value={
                  selectedKnowledgeBaseId
                }
                onChange={(event) =>
                  setSelectedKnowledgeBaseId(
                    event.target.value
                  )
                }
              >
                {knowledgeBases.map(
                  (knowledgeBase) => (
                    <option
                      key={
                        knowledgeBase.id
                      }
                      value={
                        knowledgeBase.id
                      }
                    >
                      {knowledgeBase.name}
                      {!knowledgeBase.is_active
                        ? " (Inactive)"
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            {selectedKnowledgeBase && (
              <div>
                <h3>
                  {selectedKnowledgeBase.name}
                </h3>

                <p>
                  {selectedKnowledgeBase.description ||
                    "No description provided."}
                </p>

                <p>
                  Status:{" "}
                  <strong>
                    {selectedKnowledgeBase.is_active
                      ? "Active"
                      : "Inactive"}
                  </strong>
                </p>
              </div>
            )}
          </section>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">
                Documents
              </div>

              <div className="stat-value">
                {stats.document_count}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                Chunks
              </div>

              <div className="stat-value">
                {stats.chunk_count}
              </div>
            </div>
          </div>

          <section className="dashboard-card">
            <div className="section-header">
              <div>
                <h2>Documents</h2>

                <p>
                  Add text sources to this knowledge
                  base.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={openDocumentForm}
              >
                + Add Document
              </button>
            </div>

            {documents.length === 0 ? (
              <p>
                No documents have been added yet.
              </p>
            ) : (
              <div className="chatbot-list">
                {documents.map(
                  (document) => (
                    <div
                      className="dashboard-chatbot"
                      key={document.id}
                    >
                      <div className="bot-avatar">
                        📄
                      </div>

                      <div className="bot-info">
                        <h3>
                          {document.name}
                        </h3>

                        <p>
                          {document.source_type}
                        </p>
                      </div>

                      <button
                        className="small-outline-button"
                        onClick={() =>
                          deleteDocument(
                            document
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}

      {showCreateKnowledgeBase && (
        <div className="flow-modal-backdrop">
          <div className="flow-modal">
            <div className="flow-modal-header">
              <div>
                <h2>
                  Create Knowledge Base
                </h2>

                <p>
                  Create a reusable knowledge source
                  for this chatbot.
                </p>
              </div>

              <button
                className="flow-modal-close"
                onClick={
                  closeCreateKnowledgeBase
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={createKnowledgeBase}
            >
              <div className="form-group">
                <label>
                  Name
                </label>

                <input
                  name="name"
                  value={
                    knowledgeBaseForm.name
                  }
                  onChange={
                    handleKnowledgeBaseChange
                  }
                  placeholder="e.g. Product Knowledge"
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    knowledgeBaseForm.description
                  }
                  onChange={
                    handleKnowledgeBaseChange
                  }
                  placeholder="Describe what this knowledge base contains..."
                  rows={4}
                />
              </div>

              <div className="flow-checkboxes">
                <label className="flow-checkbox">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={
                      knowledgeBaseForm.is_active
                    }
                    onChange={
                      handleKnowledgeBaseChange
                    }
                  />

                  <span>
                    <strong>
                      Active
                    </strong>

                    <small>
                      Allow the chatbot to use
                      this knowledge base.
                    </small>
                  </span>
                </label>
              </div>

              <div className="flow-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeCreateKnowledgeBase
                  }
                  disabled={
                    savingKnowledgeBase
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    savingKnowledgeBase
                  }
                >
                  {savingKnowledgeBase
                    ? "Creating..."
                    : "Create Knowledge Base"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocumentForm && (
        <div className="flow-modal-backdrop">
          <div className="flow-modal">
            <div className="flow-modal-header">
              <div>
                <h2>
                  Add Document
                </h2>

                <p>
                  Add text that will be chunked and
                  embedded for semantic search.
                </p>
              </div>

              <button
                className="flow-modal-close"
                onClick={
                  closeDocumentForm
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={ingestDocument}
            >
              <div className="form-group">
                <label>
                  Document Name
                </label>

                <input
                  name="name"
                  value={
                    documentForm.name
                  }
                  onChange={
                    handleDocumentChange
                  }
                  placeholder="e.g. Product FAQ"
                  maxLength={500}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Content
                </label>

                <textarea
                  name="content"
                  value={
                    documentForm.content
                  }
                  onChange={
                    handleDocumentChange
                  }
                  placeholder="Paste your business information, FAQ, policies, product details, etc."
                  rows={12}
                  required
                />
              </div>

              <div className="flow-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeDocumentForm
                  }
                  disabled={ingesting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={ingesting}
                >
                  {ingesting
                    ? "Ingesting..."
                    : "Ingest Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeBase;