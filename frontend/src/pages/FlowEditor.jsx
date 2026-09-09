import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const EMPTY_STAGE = {
  name: "",
  description: "",
  stage_order: 0,
  is_start: false,
  is_terminal: false,
};

const EMPTY_TRANSITION = {
  from_stage_id: "",
  to_stage_id: "",
  condition: "",
  priority: 0,
};

function FlowEditor() {
  const [searchParams] = useSearchParams();
  const chatbotId = searchParams.get("chatbotId");

  const [chatbot, setChatbot] = useState(null);
  const [stages, setStages] = useState([]);
  const [transitions, setTransitions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showStageModal, setShowStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [stageForm, setStageForm] = useState(EMPTY_STAGE);

  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [editingTransition, setEditingTransition] = useState(null);
  const [transitionForm, setTransitionForm] =
    useState(EMPTY_TRANSITION);

  const sortedStages = useMemo(() => {
    return [...stages].sort(
      (a, b) =>
        (a.stage_order ?? 0) - (b.stage_order ?? 0)
    );
  }, [stages]);

  async function loadData() {
    if (!chatbotId) {
      setError("No chatbot selected.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        chatbotResponse,
        stagesResponse,
        transitionsResponse,
      ] = await Promise.all([
        api.get(`/api/chatbots/${chatbotId}`),
        api.get(
          `/api/admin/config/chatbots/${chatbotId}/stages`
        ),
        api.get(
          `/api/admin/config/chatbots/${chatbotId}/transitions`
        ),
      ]);

      setChatbot(chatbotResponse.data);

      const loadedStages = stagesResponse.data || [];
      const loadedTransitions =
        transitionsResponse.data || [];

      setStages(
        Array.isArray(loadedStages)
          ? loadedStages
          : loadedStages.items || []
      );

      setTransitions(
        Array.isArray(loadedTransitions)
          ? loadedTransitions
          : loadedTransitions.items || []
      );
    } catch (err) {
      console.error("Failed to load flow:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load Flow Builder data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [chatbotId]);

  // =========================================================
  // STAGES
  // =========================================================

  function openCreateStage() {
    setEditingStage(null);

    setStageForm({
      ...EMPTY_STAGE,
      stage_order: stages.length,
      is_start: stages.length === 0,
    });

    setMessage("");
    setError("");
    setShowStageModal(true);
  }

  function openEditStage(stage) {
    setEditingStage(stage);

    setStageForm({
      name: stage.name || "",
      description: stage.description || "",
      stage_order: stage.stage_order ?? 0,
      is_start: Boolean(stage.is_start),
      is_terminal: Boolean(stage.is_terminal),
    });

    setMessage("");
    setError("");
    setShowStageModal(true);
  }

  function closeStageModal() {
    if (saving) return;

    setShowStageModal(false);
    setEditingStage(null);
    setStageForm(EMPTY_STAGE);
  }

  function handleStageChange(event) {
    const { name, value, type, checked } = event.target;

    setStageForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  }

  async function saveStage(event) {
    event.preventDefault();

    if (!stageForm.name.trim()) {
      setError("Stage name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        chatbot_id: chatbotId,
        name: stageForm.name.trim(),
        description:
          stageForm.description.trim() || null,
        stage_order: Number(stageForm.stage_order),
        is_start: Boolean(stageForm.is_start),
        is_terminal: Boolean(stageForm.is_terminal),
      };

      if (editingStage) {
        await api.patch(
          `/api/admin/config/stages/${editingStage.id}`,
          payload
        );

        setMessage("Stage updated successfully.");
      } else {
        await api.post(
          `/api/admin/config/chatbots/${chatbotId}/stages`,
          payload
        );

        setMessage("Stage created successfully.");
      }

      await loadData();
      closeStageModal();
    } catch (err) {
      console.error("Failed to save stage:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to save stage."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStage(stage) {
    const confirmed = window.confirm(
      `Delete the "${stage.name}" stage?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/api/admin/config/stages/${stage.id}`
      );

      setMessage(
        `Stage "${stage.name}" deleted successfully.`
      );

      await loadData();
    } catch (err) {
      console.error(
        "Failed to delete stage:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to delete stage."
      );
    }
  }

  // =========================================================
  // TRANSITIONS
  // =========================================================

  function openCreateTransitionModal() {
    if (stages.length < 2) {
      setError(
        "Create at least two stages before adding a transition."
      );
      return;
    }

    setEditingTransition(null);

    setTransitionForm({
      ...EMPTY_TRANSITION,
      from_stage_id: stages[0]?.id || "",
      to_stage_id: stages[1]?.id || "",
    });

    setError("");
    setMessage("");
    setShowTransitionModal(true);
  }

  function openEditTransition(transition) {
    setEditingTransition(transition);

    setTransitionForm({
      from_stage_id:
        transition.from_stage_id || "",
      to_stage_id:
        transition.to_stage_id || "",
      condition:
        transition.condition || "",
      priority:
        transition.priority ?? 0,
    });

    setError("");
    setMessage("");
    setShowTransitionModal(true);
  }

  function closeTransitionModal() {
    if (saving) return;

    setShowTransitionModal(false);
    setEditingTransition(null);
    setTransitionForm(EMPTY_TRANSITION);
  }

  function handleTransitionChange(event) {
    const { name, value } = event.target;

    setTransitionForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveTransition(event) {
    event.preventDefault();

    if (
      !transitionForm.from_stage_id ||
      !transitionForm.to_stage_id
    ) {
      setError("Please select both stages.");
      return;
    }

    if (
      transitionForm.from_stage_id ===
      transitionForm.to_stage_id
    ) {
      setError(
        "A stage cannot transition to itself."
      );
      return;
    }

    const condition =
      transitionForm.condition.trim() || null;

    const priority = Number(
      transitionForm.priority
    );

    const duplicateTransition =
      transitions.some(
        (transition) => {
          if (
            editingTransition &&
            transition.id ===
              editingTransition.id
          ) {
            return false;
          }

          return (
            transition.from_stage_id ===
              transitionForm.from_stage_id &&
            transition.to_stage_id ===
              transitionForm.to_stage_id
          );
        }
      );

    if (duplicateTransition) {
      setError(
        `This transition already exists: ${getStageName(
          transitionForm.from_stage_id
        )} → ${getStageName(
          transitionForm.to_stage_id
        )}`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        chatbot_id: chatbotId,
        from_stage_id:
          transitionForm.from_stage_id,
        to_stage_id:
          transitionForm.to_stage_id,
        condition,
        priority,
      };

      if (editingTransition) {
        await api.patch(
          `/api/admin/config/transitions/${editingTransition.id}`,
          {
            from_stage_id:
              transitionForm.from_stage_id,
            to_stage_id:
              transitionForm.to_stage_id,
            condition,
            priority,
          }
        );

        setMessage(
          "Transition updated successfully."
        );
      } else {
        await api.post(
          `/api/admin/config/chatbots/${chatbotId}/transitions`,
          payload
        );

        setMessage(
          "Transition created successfully."
        );
      }

      await loadData();
      closeTransitionModal();
    } catch (err) {
      console.error(
        "Failed to save transition:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to save transition."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransition(transition) {
    const confirmed = window.confirm(
      "Delete this transition?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/api/admin/config/transitions/${transition.id}`
      );

      setMessage(
        "Transition deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Failed to delete transition:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to delete transition."
      );
    }
  }

  function getStageName(stageId) {
    return (
      stages.find(
        (stage) => stage.id === stageId
      )?.name || "Unknown Stage"
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flow-page">
        <div className="page-loading">
          Loading Flow Builder...
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flow-page">
      <div className="flow-header">
        <div>
          <div className="page-eyebrow">
            CHATBOT CONFIGURATION
          </div>

          <h1>Flow Builder</h1>

          <p>
            Design the conversation journey for{" "}
            <strong>
              {chatbot?.name || "your chatbot"}
            </strong>
          </p>
        </div>

        <div className="flow-header-actions">
          <button
            className="secondary-button"
            onClick={loadData}
          >
            ↻ Refresh
          </button>

          <button
            className="primary-button"
            onClick={openCreateStage}
          >
            + Add Stage
          </button>
        </div>
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

      <div className="flow-summary">
        <div className="flow-summary-card">
          <span className="flow-summary-label">
            STAGES
          </span>
          <strong>{stages.length}</strong>
        </div>

        <div className="flow-summary-card">
          <span className="flow-summary-label">
            TRANSITIONS
          </span>
          <strong>
            {transitions.length}
          </strong>
        </div>

        <div className="flow-summary-card">
          <span className="flow-summary-label">
            START STAGE
          </span>
          <strong>
            {stages.find(
              (stage) => stage.is_start
            )?.name || "Not configured"}
          </strong>
        </div>

        <div className="flow-summary-card">
          <span className="flow-summary-label">
            STATUS
          </span>
          <strong>
            {chatbot?.is_active
              ? "Active"
              : "Inactive"}
          </strong>
        </div>
      </div>

      {/* =====================================================
          STAGES
          ===================================================== */}

      <section className="flow-builder-panel">
        <div className="flow-panel-header">
          <div>
            <h2>Conversation Flow</h2>

            <p>
              Configure the stages your chatbot
              moves through during a conversation.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={
              openCreateTransitionModal
            }
          >
            + Add Transition
          </button>
        </div>

        {sortedStages.length === 0 ? (
          <div className="flow-empty">
            <div className="flow-empty-icon">
              ◎
            </div>

            <h3>No stages configured</h3>

            <p>
              Create your first conversation
              stage to start building the chatbot
              flow.
            </p>

            <button
              className="primary-button"
              onClick={openCreateStage}
            >
              + Create First Stage
            </button>
          </div>
        ) : (
          <div className="flow-canvas">
            {sortedStages.map(
              (stage, index) => (
                <div
                  className="flow-stage-wrapper"
                  key={stage.id}
                >
                  <div
                    className={`flow-stage-card ${
                      stage.is_start
                        ? "flow-stage-start"
                        : ""
                    } ${
                      stage.is_terminal
                        ? "flow-stage-terminal"
                        : ""
                    }`}
                  >
                    <div className="flow-stage-top">
                      <div className="flow-stage-number">
                        {index + 1}
                      </div>

                      <div className="flow-stage-badges">
                        {stage.is_start && (
                          <span className="flow-badge flow-badge-start">
                            START
                          </span>
                        )}

                        {stage.is_terminal && (
                          <span className="flow-badge flow-badge-terminal">
                            END
                          </span>
                        )}
                      </div>
                    </div>

                    <h3>{stage.name}</h3>

                    <p>
                      {stage.description ||
                        "No stage description provided."}
                    </p>

                    <div className="flow-stage-meta">
                      <span>
                        Order{" "}
                        {stage.stage_order}
                      </span>

                      <span>
                        {transitions.filter(
                          (transition) =>
                            transition.from_stage_id ===
                            stage.id
                        ).length}{" "}
                        outgoing
                      </span>
                    </div>

                    <div className="flow-stage-actions">
                      <button
                        className="flow-action-edit"
                        onClick={() =>
                          openEditStage(stage)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="flow-action-delete"
                        onClick={() =>
                          deleteStage(stage)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {index <
                    sortedStages.length - 1 && (
                    <div className="flow-arrow">
                      ↓
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          TRANSITIONS
          ===================================================== */}

      <section className="flow-transitions-panel">
        <div className="flow-panel-header">
          <div>
            <h2>Stage Transitions</h2>

            <p>
              Define which stages can follow one
              another using conditions and priority.
            </p>
          </div>
        </div>

        {transitions.length === 0 ? (
          <div className="flow-transition-empty">
            No transitions configured yet.
          </div>
        ) : (
          <div className="transition-list">
            {transitions.map(
              (transition) => (
                <div
                  className="transition-row"
                  key={transition.id}
                >
                  <div className="transition-stage">
                    <span>
                      {getStageName(
                        transition.from_stage_id
                      )}
                    </span>
                  </div>

                  <div className="transition-arrow">
                    →
                  </div>

                  <div className="transition-stage">
                    <span>
                      {getStageName(
                        transition.to_stage_id
                      )}
                    </span>
                  </div>

                  <div className="transition-condition">
                    <small>
                      Condition
                    </small>

                    <span>
                      {transition.condition ||
                        "Unconditional"}
                    </span>
                  </div>

                  <div className="transition-priority">
                    <small>
                      Priority
                    </small>

                    <span>
                      {transition.priority ?? 0}
                    </span>
                  </div>

                  <button
                    className="flow-action-edit"
                    onClick={() =>
                      openEditTransition(
                        transition
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="transition-delete"
                    onClick={() =>
                      deleteTransition(
                        transition
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

      {/* =====================================================
          STAGE MODAL
          ===================================================== */}

      {showStageModal && (
        <div className="flow-modal-backdrop">
          <div className="flow-modal">
            <div className="flow-modal-header">
              <div>
                <h2>
                  {editingStage
                    ? "Edit Stage"
                    : "Create Stage"}
                </h2>

                <p>
                  Configure this conversation
                  stage.
                </p>
              </div>

              <button
                className="flow-modal-close"
                onClick={closeStageModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveStage}>
              <div className="form-group">
                <label>Stage Name</label>

                <input
                  name="name"
                  value={stageForm.name}
                  onChange={handleStageChange}
                  placeholder="e.g. Qualification"
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={
                    stageForm.description
                  }
                  onChange={handleStageChange}
                  placeholder="Describe what happens during this stage..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Stage Order</label>

                <input
                  type="number"
                  name="stage_order"
                  value={
                    stageForm.stage_order
                  }
                  onChange={handleStageChange}
                  min="0"
                />
              </div>

              <div className="flow-checkboxes">
                <label className="flow-checkbox">
                  <input
                    type="checkbox"
                    name="is_start"
                    checked={
                      stageForm.is_start
                    }
                    onChange={
                      handleStageChange
                    }
                  />

                  <span>
                    <strong>
                      Start Stage
                    </strong>

                    <small>
                      Begin new conversations
                      here.
                    </small>
                  </span>
                </label>

                <label className="flow-checkbox">
                  <input
                    type="checkbox"
                    name="is_terminal"
                    checked={
                      stageForm.is_terminal
                    }
                    onChange={
                      handleStageChange
                    }
                  />

                  <span>
                    <strong>
                      Terminal Stage
                    </strong>

                    <small>
                      End the conversation
                      here.
                    </small>
                  </span>
                </label>
              </div>

              <div className="flow-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeStageModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingStage
                    ? "Save Changes"
                    : "Create Stage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          TRANSITION MODAL
          ===================================================== */}

      {showTransitionModal && (
        <div className="flow-modal-backdrop">
          <div className="flow-modal">
            <div className="flow-modal-header">
              <div>
                <h2>
                  {editingTransition
                    ? "Edit Transition"
                    : "Add Transition"}
                </h2>

                <p>
                  Connect stages using a
                  keyword, phrase, and priority.
                </p>
              </div>

              <button
                className="flow-modal-close"
                onClick={
                  closeTransitionModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveTransition}
            >
              <div className="form-group">
                <label>From Stage</label>

                <select
                  name="from_stage_id"
                  value={
                    transitionForm.from_stage_id
                  }
                  onChange={
                    handleTransitionChange
                  }
                  required
                >
                  <option value="">
                    Select starting stage
                  </option>

                  {sortedStages.map(
                    (stage) => (
                      <option
                        key={stage.id}
                        value={stage.id}
                      >
                        {stage.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="transition-select-arrow">
                ↓
              </div>

              <div className="form-group">
                <label>
                  To Stage
                </label>

                <select
                  name="to_stage_id"
                  value={
                    transitionForm.to_stage_id
                  }
                  onChange={
                    handleTransitionChange
                  }
                  required
                >
                  <option value="">
                    Select destination stage
                  </option>

                  {sortedStages.map(
                    (stage) => (
                      <option
                        key={stage.id}
                        value={stage.id}
                      >
                        {stage.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Condition
                </label>

                <input
                  name="condition"
                  value={
                    transitionForm.condition
                  }
                  onChange={
                    handleTransitionChange
                  }
                  placeholder="e.g. order, support, pricing"
                  maxLength={500}
                />

                <small>
                  Leave empty for an unconditional
                  transition. Otherwise the chatbot
                  matches this keyword or phrase
                  against the user's message.
                </small>
              </div>

              <div className="form-group">
                <label>
                  Priority
                </label>

                <input
                  type="number"
                  name="priority"
                  value={
                    transitionForm.priority
                  }
                  onChange={
                    handleTransitionChange
                  }
                  min="0"
                  max="100000"
                />

                <small>
                  Higher priority transitions
                  are checked first.
                </small>
              </div>

              <div className="flow-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeTransitionModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTransition
                    ? "Save Changes"
                    : "Create Transition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlowEditor;