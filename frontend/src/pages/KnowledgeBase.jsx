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

  const selectedKnowledgeBase = useMemo(
    () =>
      knowledgeBases.find(
        (item) => item.id === selectedKnowledgeBaseId
      ),
    [knowledgeBases, selectedKnowledgeBaseId]
  );

  async function loadKnowledgeBases() {
    if (!chatbotId) {
      setError("No voice agent selected.");
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

        setSelectedKnowledgeBaseId(
          existingSelected?.id || items[0].id
        );
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
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setKnowledgeBaseForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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
      setError("Knowledge base name is required.");
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
        `Document ingested successfully. ${
          result.chunk_count || 0
        } chunks and ${
          result.embedding_count || 0
        } embeddings created.`
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

  const pageStyle = {
    minHeight: "100%",
    padding: "32px",
    background:
      "radial-gradient(circle at 82% 0%, rgba(124,58,237,0.16), transparent 28%), radial-gradient(circle at 12% 28%, rgba(37,99,235,0.08), transparent 25%), linear-gradient(180deg, #080d18 0%, #0b1220 52%, #0a101c 100%)",
    color: "#f8fafc",
    boxSizing: "border-box",
  };

  const panelStyle = {
    background:
      "linear-gradient(145deg, rgba(20,29,48,0.97), rgba(12,19,32,0.98))",
    border:
      "1px solid rgba(148,163,184,0.12)",
    borderRadius: "18px",
    boxShadow:
      "0 18px 45px rgba(0,0,0,0.24)",
  };

  const buttonPrimary = {
    border: "none",
    borderRadius: "11px",
    padding: "11px 17px",
    background:
      "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 9px 25px rgba(124,58,237,0.25)",
    fontSize: "13px",
  };

  const buttonSecondary = {
    border:
      "1px solid rgba(148,163,184,0.18)",
    borderRadius: "10px",
    padding: "10px 14px",
    background:
      "rgba(30,41,59,0.68)",
    color: "#cbd5e1",
    fontWeight: "750",
    cursor: "pointer",
    fontSize: "12px",
  };

  const statCards = [
    {
      icon: "◈",
      label: "Knowledge Bases",
      value: knowledgeBases.length,
      caption: "Voice AI sources",
      accent: "#a78bfa",
    },
    {
      icon: "▤",
      label: "Documents",
      value: stats.document_count,
      caption: "Knowledge documents",
      accent: "#38bdf8",
    },
    {
      icon: "◇",
      label: "Indexed Chunks",
      value: stats.chunk_count,
      caption: "Semantic retrieval units",
      accent: "#34d399",
    },
    {
      icon: "●",
      label: "AI Access",
      value:
        selectedKnowledgeBase?.is_active
          ? "ON"
          : "OFF",
      caption: "Gemini runtime",
      accent:
        selectedKnowledgeBase?.is_active
          ? "#34d399"
          : "#94a3b8",
    },
  ];

  if (loading) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...panelStyle,
            minHeight: "460px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "17px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              border:
                "3px solid rgba(139,92,246,0.18)",
              borderTopColor: "#8b5cf6",
              borderRadius: "50%",
              animation:
                "voiceKnowledgeSpin 0.8s linear infinite",
            }}
          />

          <div
            style={{
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Loading Voice AI Knowledge Center...
          </div>
        </div>

        <style>
          {`
            @keyframes voiceKnowledgeSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!chatbotId) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            maxWidth: "760px",
            margin: "60px auto",
            ...panelStyle,
            padding: "45px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "76px",
              height: "76px",
              margin: "0 auto 20px",
              borderRadius: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.13))",
              border:
                "1px solid rgba(139,92,246,0.2)",
              fontSize: "34px",
            }}
          >
            ◈
          </div>

          <div
            style={{
              color: "#a78bfa",
              fontSize: "10px",
              fontWeight: "900",
              letterSpacing: "2px",
              marginBottom: "9px",
            }}
          >
            PRAX AI VOICE PLATFORM
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "30px",
              letterSpacing: "-0.7px",
            }}
          >
            Voice AI Knowledge Center
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            No voice agent is selected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* PAGE HEADER */}
      <div
        className="voice-kb-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              color: "#a78bfa",
              fontSize: "10px",
              fontWeight: "900",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            PRAX AI VOICE PLATFORM
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "850",
              letterSpacing: "-0.8px",
            }}
          >
            Voice AI Knowledge Center
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#94a3b8",
              fontSize: "14px",
              maxWidth: "650px",
            }}
          >
            Manage the trusted knowledge your Gemini
            voice agent uses to answer callers naturally
            and accurately.
          </p>
        </div>

        <button
          type="button"
          style={buttonPrimary}
          onClick={openCreateKnowledgeBase}
        >
          + Create Knowledge Base
        </button>
      </div>

      {/* ACTIVE AGENT STRIP */}
      <section
        style={{
          ...panelStyle,
          padding: "19px 21px",
          marginBottom: "18px",
        }}
      >
        <div
          className="voice-kb-agent-strip"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #7c3aed, #2563eb)",
                boxShadow:
                  "0 10px 28px rgba(124,58,237,0.22)",
                fontSize: "23px",
              }}
            >
              ◉
            </div>

            <div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "9px",
                  fontWeight: "900",
                  letterSpacing: "1.5px",
                  marginBottom: "4px",
                }}
              >
                ACTIVE VOICE AGENT
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  flexWrap: "wrap",
                }}
              >
                <strong
                  style={{
                    fontSize: "18px",
                    color: "#f8fafc",
                  }}
                >
                  PRAX Voice Agent
                </strong>

                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background:
                      "rgba(52,211,153,0.1)",
                    border:
                      "1px solid rgba(52,211,153,0.16)",
                    color: "#86efac",
                    fontSize: "9px",
                    fontWeight: "900",
                  }}
                >
                  LIVE
                </span>
              </div>

              <div
                style={{
                  marginTop: "4px",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Test Business · Gemini 2.5 Flash · Urdu +
                English
              </div>
            </div>
          </div>

          {knowledgeBases.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
              }}
            >
              <select
                value={selectedKnowledgeBaseId}
                onChange={(event) =>
                  setSelectedKnowledgeBaseId(
                    event.target.value
                  )
                }
                style={{
                  minWidth: "245px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border:
                    "1px solid rgba(148,163,184,0.17)",
                  background: "#0c1422",
                  color: "#e2e8f0",
                  outline: "none",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {knowledgeBases.map(
                  (knowledgeBase) => (
                    <option
                      key={knowledgeBase.id}
                      value={knowledgeBase.id}
                    >
                      {knowledgeBase.name}
                      {!knowledgeBase.is_active
                        ? " · Inactive"
                        : ""}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                style={buttonSecondary}
                onClick={toggleKnowledgeBase}
              >
                {selectedKnowledgeBase?.is_active
                  ? "Pause"
                  : "Activate"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* STATUS */}
      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "13px 16px",
            borderRadius: "12px",
            background:
              "rgba(127,29,29,0.25)",
            border:
              "1px solid rgba(248,113,113,0.23)",
            color: "#fca5a5",
            fontSize: "13px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {message && (
        <div
          style={{
            marginBottom: "18px",
            padding: "13px 16px",
            borderRadius: "12px",
            background:
              "rgba(6,78,59,0.24)",
            border:
              "1px solid rgba(52,211,153,0.2)",
            color: "#86efac",
            fontSize: "13px",
          }}
        >
          ✓ {message}
        </div>
      )}

      {/* EMPTY STATE */}
      {knowledgeBases.length === 0 ? (
        <section
          style={{
            ...panelStyle,
            padding: "75px 30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "82px",
              height: "82px",
              margin: "0 auto 22px",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.12))",
              border:
                "1px solid rgba(139,92,246,0.2)",
              fontSize: "35px",
            }}
          >
            ◈
          </div>

          <div
            style={{
              color: "#a78bfa",
              fontSize: "10px",
              fontWeight: "900",
              letterSpacing: "1.6px",
              marginBottom: "8px",
            }}
          >
            VOICE AI KNOWLEDGE
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "24px",
              letterSpacing: "-0.4px",
            }}
          >
            Build your agent's knowledge layer
          </h2>

          <p
            style={{
              maxWidth: "550px",
              margin: "0 auto 25px",
              color: "#94a3b8",
              lineHeight: "1.65",
              fontSize: "13px",
            }}
          >
            Add FAQs, product information, policies,
            business details and trusted support content
            that your Gemini voice agent can retrieve
            during spoken conversations.
          </p>

          <button
            type="button"
            style={buttonPrimary}
            onClick={openCreateKnowledgeBase}
          >
            + Create Knowledge Base
          </button>
        </section>
      ) : (
        <>
          {/* STATS */}
          <div
            className="voice-kb-stats"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "14px",
              marginBottom: "18px",
            }}
          >
            {statCards.map((item) => (
              <div
                key={item.label}
                style={{
                  ...panelStyle,
                  padding: "17px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: "-22px",
                    top: "-28px",
                    width: "82px",
                    height: "82px",
                    borderRadius: "50%",
                    background:
                      `${item.accent}08`,
                    filter: "blur(2px)",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "10px",
                      fontWeight: "800",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      width: "33px",
                      height: "33px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        `${item.accent}12`,
                      border:
                        `1px solid ${item.accent}20`,
                      color: item.accent,
                      fontSize: "14px",
                    }}
                  >
                    {item.icon}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    fontSize:
                      typeof item.value === "string"
                        ? "24px"
                        : "28px",
                    fontWeight: "850",
                    position: "relative",
                  }}
                >
                  {item.value}
                </div>

                <div
                  style={{
                    marginTop: "3px",
                    color: "#475569",
                    fontSize: "10px",
                    position: "relative",
                  }}
                >
                  {item.caption}
                </div>
              </div>
            ))}
          </div>

          {/* KNOWLEDGE SOURCE */}
          {selectedKnowledgeBase && (
            <section
              style={{
                ...panelStyle,
                padding: "21px",
                marginBottom: "18px",
              }}
            >
              <div
                className="voice-kb-source"
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#a78bfa",
                      fontSize: "9px",
                      fontWeight: "900",
                      letterSpacing: "1.6px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background:
                          selectedKnowledgeBase.is_active
                            ? "#34d399"
                            : "#64748b",
                        boxShadow:
                          selectedKnowledgeBase.is_active
                            ? "0 0 9px rgba(52,211,153,0.65)"
                            : "none",
                      }}
                    />
                    ACTIVE KNOWLEDGE SOURCE
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "21px",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {selectedKnowledgeBase.name}
                  </h2>

                  <p
                    style={{
                      margin: "7px 0 0",
                      color: "#64748b",
                      fontSize: "12px",
                      lineHeight: "1.55",
                      maxWidth: "700px",
                    }}
                  >
                    {selectedKnowledgeBase.description ||
                      "No description provided. Add trusted content for the voice AI runtime."}
                  </p>
                </div>

                <span
                  style={{
                    padding: "7px 11px",
                    borderRadius: "999px",
                    background:
                      selectedKnowledgeBase.is_active
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(148,163,184,0.08)",
                    border:
                      selectedKnowledgeBase.is_active
                        ? "1px solid rgba(52,211,153,0.15)"
                        : "1px solid rgba(148,163,184,0.12)",
                    color:
                      selectedKnowledgeBase.is_active
                        ? "#86efac"
                        : "#94a3b8",
                    fontSize: "9px",
                    fontWeight: "900",
                    whiteSpace: "nowrap",
                  }}
                >
                  ●{" "}
                  {selectedKnowledgeBase.is_active
                    ? "AI ACCESS ENABLED"
                    : "PAUSED"}
                </span>
              </div>
            </section>
          )}

          {/* DOCUMENTS */}
          <section
            style={{
              ...panelStyle,
              overflow: "hidden",
            }}
          >
            <div
              className="voice-kb-doc-header"
              style={{
                padding: "20px 21px",
                borderBottom:
                  "1px solid rgba(148,163,184,0.09)",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#38bdf8",
                    fontSize: "9px",
                    fontWeight: "900",
                    letterSpacing: "1.7px",
                    marginBottom: "6px",
                  }}
                >
                  KNOWLEDGE SOURCES
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Voice AI Documents
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#475569",
                    fontSize: "12px",
                  }}
                >
                  Content indexed and available to the
                  Gemini voice runtime.
                </p>
              </div>

              <button
                type="button"
                style={buttonPrimary}
                onClick={openDocumentForm}
              >
                + Add Document
              </button>
            </div>

            {documents.length === 0 ? (
              <div
                style={{
                  padding: "58px 25px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "62px",
                    height: "62px",
                    margin:
                      "0 auto 16px",
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "rgba(56,189,248,0.08)",
                    border:
                      "1px solid rgba(56,189,248,0.12)",
                    fontSize: "26px",
                  }}
                >
                  ▤
                </div>

                <h3
                  style={{
                    margin: "0 0 7px",
                    fontSize: "17px",
                  }}
                >
                  No knowledge sources yet
                </h3>

                <p
                  style={{
                    maxWidth: "430px",
                    margin:
                      "0 auto 20px",
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: "1.55",
                  }}
                >
                  Add an FAQ, policy, product guide,
                  support script or business document
                  for your voice agent.
                </p>

                <button
                  type="button"
                  style={buttonSecondary}
                  onClick={openDocumentForm}
                >
                  Add First Document
                </button>
              </div>
            ) : (
              <div>
                {documents.map(
                  (document, index) => (
                    <div
                      key={document.id}
                      className="voice-kb-document-row"
                      style={{
                        padding:
                          "15px 21px",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap: "18px",
                        borderBottom:
                          index ===
                          documents.length - 1
                            ? "none"
                            : "1px solid rgba(148,163,184,0.07)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "13px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "43px",
                            height: "43px",
                            flexShrink: 0,
                            borderRadius:
                              "12px",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              "linear-gradient(135deg, rgba(56,189,248,0.11), rgba(37,99,235,0.07))",
                            border:
                              "1px solid rgba(56,189,248,0.13)",
                            color: "#38bdf8",
                            fontSize:
                              "18px",
                          }}
                        >
                          ▤
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "#e2e8f0",
                              fontSize:
                                "13px",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {document.name}
                          </strong>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "8px",
                              color:
                                "#475569",
                              fontSize:
                                "10px",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#38bdf8",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {document.source_type ||
                                "text"}
                            </span>

                            <span>•</span>

                            <span>
                              Indexed for AI
                            </span>

                            <span>•</span>

                            <span>
                              Gemini Retrieval
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteDocument(
                            document
                          )
                        }
                        style={{
                          border:
                            "1px solid rgba(248,113,113,0.16)",
                          borderRadius:
                            "9px",
                          padding:
                            "8px 12px",
                          background:
                            "rgba(127,29,29,0.1)",
                          color:
                            "#fca5a5",
                          fontWeight:
                            "700",
                          fontSize:
                            "11px",
                          cursor:
                            "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* RUNTIME */}
          <section
            style={{
              marginTop: "18px",
              padding: "17px 19px",
              borderRadius: "15px",
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.075), rgba(59,130,246,0.045))",
              border:
                "1px solid rgba(52,211,153,0.12)",
            }}
          >
            <div
              className="voice-kb-runtime"
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "#34d399",
                    boxShadow:
                      "0 0 12px rgba(52,211,153,0.65)",
                  }}
                />

                <div>
                  <strong
                    style={{
                      color: "#d1fae5",
                      fontSize: "12px",
                    }}
                  >
                    PRAX VOICE AI RUNTIME
                  </strong>

                  <div
                    style={{
                      marginTop: "3px",
                      color: "#475569",
                      fontSize: "11px",
                    }}
                  >
                    Knowledge retrieval is operational
                    for the Gemini voice agent.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#64748b",
                  fontSize: "10px",
                  fontWeight: "800",
                }}
              >
                <span>GEMINI</span>
                <span
                  style={{
                    color: "#34d399",
                  }}
                >
                  CONNECTED
                </span>
                <span>·</span>
                <span>RAG READY</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* CREATE KNOWLEDGE BASE MODAL */}
      {showCreateKnowledgeBase && (
        <div style={modalBackdrop}>
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              ...panelStyle,
              padding: "25px",
              border:
                "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div
              style={modalHeader}
            >
              <div>
                <div
                  style={{
                    color: "#a78bfa",
                    fontSize: "9px",
                    fontWeight: "900",
                    letterSpacing: "1.7px",
                  }}
                >
                  VOICE AI KNOWLEDGE
                </div>

                <h2
                  style={{
                    margin:
                      "6px 0 5px",
                    fontSize: "21px",
                  }}
                >
                  Create Knowledge Base
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Create a trusted knowledge source for
                  your voice agent.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeCreateKnowledgeBase
                }
                style={closeButton}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                createKnowledgeBase
              }
            >
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Knowledge Base Name
                </label>

                <input
                  name="name"
                  value={
                    knowledgeBaseForm.name
                  }
                  onChange={
                    handleKnowledgeBaseChange
                  }
                  placeholder="e.g. Customer Support Knowledge"
                  maxLength={200}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>
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
                  placeholder="What should the voice agent know from this source?"
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />
              </div>

              <label
                style={{
                  display: "flex",
                  gap: "11px",
                  alignItems:
                    "flex-start",
                  padding: "14px",
                  borderRadius: "11px",
                  background:
                    "rgba(15,23,42,0.68)",
                  border:
                    "1px solid rgba(148,163,184,0.11)",
                  marginBottom: "22px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    knowledgeBaseForm.is_active
                  }
                  onChange={
                    handleKnowledgeBaseChange
                  }
                  style={{
                    marginTop: "3px",
                  }}
                />

                <span>
                  <strong
                    style={{
                      display:
                        "block",
                      color:
                        "#e2e8f0",
                      fontSize:
                        "12px",
                    }}
                  >
                    Enable for Voice AI
                  </strong>

                  <small
                    style={{
                      display:
                        "block",
                      marginTop:
                        "3px",
                      color:
                        "#64748b",
                      lineHeight:
                        "1.4",
                    }}
                  >
                    Allow Gemini to retrieve this knowledge
                    during voice conversations.
                  </small>
                </span>
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  style={buttonSecondary}
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
                  style={{
                    ...buttonPrimary,
                    opacity:
                      savingKnowledgeBase
                        ? 0.7
                        : 1,
                  }}
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

      {/* ADD DOCUMENT MODAL */}
      {showDocumentForm && (
        <div style={modalBackdrop}>
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              ...panelStyle,
              padding: "25px",
              border:
                "1px solid rgba(56,189,248,0.18)",
            }}
          >
            <div style={modalHeader}>
              <div>
                <div
                  style={{
                    color: "#38bdf8",
                    fontSize: "9px",
                    fontWeight: "900",
                    letterSpacing: "1.7px",
                  }}
                >
                  KNOWLEDGE SOURCE
                </div>

                <h2
                  style={{
                    margin:
                      "6px 0 5px",
                    fontSize: "21px",
                  }}
                >
                  Add Voice Knowledge
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Add content Gemini can retrieve during
                  voice conversations.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeDocumentForm
                }
                style={closeButton}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={ingestDocument}
            >
              <div style={fieldStyle}>
                <label style={labelStyle}>
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
                  placeholder="e.g. Customer Support FAQ"
                  maxLength={500}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Knowledge Content
                </label>

                <textarea
                  name="content"
                  value={
                    documentForm.content
                  }
                  onChange={
                    handleDocumentChange
                  }
                  placeholder="Paste FAQs, product details, policies, business information, opening hours, support instructions, etc."
                  rows={13}
                  required
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: "1.55",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  background:
                    "rgba(124,58,237,0.07)",
                  border:
                    "1px solid rgba(124,58,237,0.12)",
                  color: "#64748b",
                  fontSize: "10px",
                  lineHeight: "1.45",
                }}
              >
                ◈ Content will be chunked, embedded and
                indexed for semantic retrieval by the PRAX
                Gemini voice runtime.
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  style={buttonSecondary}
                  onClick={
                    closeDocumentForm
                  }
                  disabled={ingesting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...buttonPrimary,
                    opacity:
                      ingesting ? 0.7 : 1,
                  }}
                  disabled={ingesting}
                >
                  {ingesting
                    ? "Indexing..."
                    : "Ingest & Index"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          @media (max-width: 950px) {
            .voice-kb-stats {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 700px) {
            .voice-kb-header {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .voice-kb-doc-header {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .voice-kb-source {
              flex-direction: column !important;
            }
          }

          @media (max-width: 520px) {
            .voice-kb-stats {
              grid-template-columns: 1fr !important;
            }

            .voice-kb-document-row {
              align-items: flex-start !important;
            }
          }
        `}
      </style>
    </div>
  );
}

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "rgba(2,6,23,0.8)",
  backdropFilter: "blur(9px)",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "23px",
  gap: "20px",
};

const closeButton = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  fontSize: "25px",
  lineHeight: 1,
  cursor: "pointer",
};

const fieldStyle = {
  marginBottom: "17px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#cbd5e1",
  fontSize: "11px",
  fontWeight: "800",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: "10px",
  border:
    "1px solid rgba(148,163,184,0.16)",
  background: "#0b1422",
  color: "#e2e8f0",
  outline: "none",
  fontSize: "12px",
  fontFamily: "inherit",
};

export default KnowledgeBase;