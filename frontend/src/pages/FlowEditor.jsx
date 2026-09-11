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

const C = {
  bg: "#f6f8fb",
  white: "#ffffff",
  border: "#e2e8f0",
  borderDark: "#cbd5e1",
  text: "#0f172a",
  text2: "#334155",
  muted: "#64748b",
  subtle: "#94a3b8",

  primary: "#111827",

  blue: "#2563eb",
  blueDark: "#1d4ed8",
  blueBg: "#eff6ff",
  blueSoft: "#dbeafe",

  green: "#15803d",
  greenDark: "#166534",
  greenBg: "#f0fdf4",
  greenSoft: "#dcfce7",

  amber: "#b45309",
  amberDark: "#92400e",
  amberBg: "#fffbeb",
  amberSoft: "#fef3c7",

  purple: "#6d28d9",
  purpleBg: "#f5f3ff",
  purpleSoft: "#ede9fe",

  red: "#b91c1c",
  redBg: "#fef2f2",
};

const styles = {
  page: {
    minHeight: "100%",
    padding: "28px",
    background: C.bg,
    boxSizing: "border-box",
  },

  shell: {
    maxWidth: "1280px",
    margin: "0 auto",
  },

  eyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: C.muted,
    marginBottom: "8px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 750,
    color: C.text,
  },

  subtitle: {
    margin: "7px 0 0",
    fontSize: "14px",
    lineHeight: 1.6,
    color: C.muted,
  },

  headerActions: {
    display: "flex",
    gap: "10px",
  },

  btn: {
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 650,
    cursor: "pointer",
  },

  btnPrimary: {
    background: C.primary,
    color: C.white,
    border: `1px solid ${C.primary}`,
  },

  btnSecondary: {
    background: C.white,
    color: C.text2,
    border: `1px solid ${C.borderDark}`,
  },

  btnDanger: {
    background: C.white,
    color: C.red,
    border: "1px solid #fecaca",
  },

  alerts: {
    display: "grid",
    gap: "10px",
    marginBottom: "20px",
  },

  alert: {
    padding: "12px 14px",
    borderRadius: "9px",
    fontSize: "13px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },

  summary: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "12px",
    padding: "17px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
  },

  summaryLabel: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: C.subtle,
    marginBottom: "8px",
  },

  summaryValue: {
    fontSize: "18px",
    fontWeight: 700,
    color: C.text,
  },

  panel: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    overflow: "hidden",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(15,23,42,0.03)",
  },

  panelHeader: {
    padding: "20px 22px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 700,
    color: C.text,
  },

  panelText: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: C.muted,
  },

  canvas: {
    padding: "40px 28px 46px",
    backgroundColor: "#fbfcfe",
    backgroundImage:
      "radial-gradient(#dbe3ed 1px, transparent 1px)",
    backgroundSize: "20px 20px",
  },

  flow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },

  /*
   * =========================================================
   * VISUAL FLOW NODES
   * =========================================================
   */

  node: {
    width: "100%",
    maxWidth: "410px",
    borderRadius: "16px",
    padding: "17px",
    boxSizing: "border-box",
    boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
    transition:
      "transform 0.15s ease, box-shadow 0.15s ease",
  },

  nodeStart: {
    background:
      "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
    border: `2px solid ${C.blue}`,
    boxShadow:
      "0 12px 30px rgba(37,99,235,0.16)",
  },

  nodeNormal: {
    background:
      "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    border: `2px solid ${C.borderDark}`,
    boxShadow:
      "0 10px 24px rgba(15,23,42,0.07)",
  },

  nodeTerminal: {
    background:
      "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
    border: `2px solid #f59e0b`,
    boxShadow:
      "0 12px 30px rgba(245,158,11,0.16)",
  },

  nodeTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  nodeLeft: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    minWidth: 0,
  },

  number: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
    flexShrink: 0,
    boxShadow:
      "inset 0 0 0 1px rgba(255,255,255,0.28)",
  },

  numberStart: {
    background: C.blue,
    color: C.white,
  },

  numberNormal: {
    background: "#e2e8f0",
    color: C.text2,
  },

  numberTerminal: {
    background: "#f59e0b",
    color: C.white,
  },

  nodeName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 750,
    color: C.text,
  },

  badges: {
    display: "flex",
    gap: "5px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  badge: {
    padding: "4px 7px",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 800,
    border: "1px solid transparent",
  },

  startBadge: {
    background: C.blueSoft,
    color: C.blueDark,
    borderColor: "#93c5fd",
  },

  endBadge: {
    background: C.amberSoft,
    color: C.amberDark,
    borderColor: "#fcd34d",
  },

  description: {
    margin: "14px 0",
    fontSize: "12px",
    lineHeight: 1.6,
    color: C.text2,
  },

  meta: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
  },

  metaBox: {
    padding: "9px 10px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.72)",
    border: `1px solid rgba(148,163,184,0.28)`,
  },

  metaLabel: {
    display: "block",
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 800,
    color: C.subtle,
    marginBottom: "3px",
  },

  metaValue: {
    fontSize: "11px",
    fontWeight: 650,
    color: C.text2,
  },

  nodeActions: {
    display: "flex",
    gap: "8px",
  },

  nodeBtn: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "7px",
    background: "rgba(255,255,255,0.85)",
    fontSize: "11px",
    fontWeight: 650,
    cursor: "pointer",
  },

  connector: {
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  line: {
    width: "2px",
    height: "28px",
    background:
      "linear-gradient(180deg, #cbd5e1, #94a3b8)",
  },

  arrow: {
    color: C.muted,
    fontSize: "18px",
    lineHeight: 1,
    fontWeight: 700,
  },

  branchGrid: {
    width: "100%",
    maxWidth: "980px",
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "28px",
    alignItems: "start",
    position: "relative",
  },

  branchColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 0,
  },

  branchLine: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  conditionLabel: {
    padding: "6px 10px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
    color: C.purple,
    border: "1px solid #c4b5fd",
    fontSize: "10px",
    fontWeight: 800,
    marginBottom: "8px",
    boxShadow:
      "0 3px 8px rgba(109,40,217,0.08)",
  },

  branchArrow: {
    color: C.muted,
    fontSize: "17px",
    marginBottom: "8px",
    fontWeight: 700,
  },

  targetNode: {
    width: "100%",
    maxWidth: "360px",
  },

  targetInfo: {
    marginTop: "8px",
    fontSize: "10px",
    color: C.subtle,
    textAlign: "center",
    fontWeight: 650,
  },

  terminalBanner: {
    marginTop: "24px",
    padding: "11px 15px",
    borderRadius: "9px",
    background: C.amberBg,
    color: C.amber,
    border: "1px solid #fde68a",
    fontSize: "11px",
    fontWeight: 650,
    textAlign: "center",
  },

  transitionsHeader: {
    display: "grid",
    gridTemplateColumns:
      "minmax(160px,1fr) 35px minmax(160px,1fr) 120px 65px 130px",
    gap: "12px",
    padding: "11px 18px",
    background: "#f8fafc",
    borderBottom: `1px solid ${C.border}`,
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    color: C.subtle,
    textTransform: "uppercase",
  },

  transitionRow: {
    display: "grid",
    gridTemplateColumns:
      "minmax(160px,1fr) 35px minmax(160px,1fr) 120px 65px 130px",
    gap: "12px",
    alignItems: "center",
    padding: "14px 18px",
    borderBottom: `1px solid ${C.border}`,
  },

  stagePill: {
    padding: "8px 10px",
    borderRadius: "8px",
    background: "#f8fafc",
    border: `1px solid ${C.border}`,
    fontSize: "11px",
    fontWeight: 650,
    color: C.text2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  transitionArrow: {
    textAlign: "center",
    fontSize: "16px",
    color: C.subtle,
  },

  condition: {
    display: "inline-flex",
    width: "fit-content",
    maxWidth: "100%",
    padding: "5px 9px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
    color: C.purple,
    border: "1px solid #ddd6fe",
    fontSize: "9px",
    fontWeight: 800,
  },

  priority: {
    display: "inline-flex",
    width: "32px",
    height: "26px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "7px",
    background: "#f1f5f9",
    color: C.text2,
    fontSize: "10px",
    fontWeight: 800,
  },

  rowActions: {
    display: "flex",
    gap: "6px",
  },

  rowBtn: {
    borderRadius: "6px",
    padding: "6px 8px",
    fontSize: "10px",
    fontWeight: 650,
    cursor: "pointer",
    background: C.white,
  },

  empty: {
    padding: "64px 24px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "13px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "23px",
    color: C.text2,
  },

  emptyTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: C.text,
  },

  emptyText: {
    maxWidth: "440px",
    margin: "8px auto 18px",
    fontSize: "13px",
    lineHeight: 1.6,
    color: C.muted,
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  modal: {
    width: "100%",
    maxWidth: "570px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: C.white,
    borderRadius: "15px",
    border: `1px solid ${C.border}`,
    boxShadow:
      "0 25px 70px rgba(15,23,42,0.25)",
  },

  modalHeader: {
    padding: "20px 22px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: C.text,
  },

  modalText: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: C.muted,
  },

  closeBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: `1px solid ${C.border}`,
    background: C.white,
    cursor: "pointer",
    fontSize: "20px",
    color: C.muted,
  },

  modalBody: {
    padding: "22px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: "16px",
  },

  formFull: {
    gridColumn: "1 / -1",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  formLabel: {
    fontSize: "12px",
    fontWeight: 650,
    color: C.text2,
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: "8px",
    border: `1px solid ${C.borderDark}`,
    background: C.white,
    color: C.text,
    fontSize: "13px",
    outline: "none",
  },

  formHint: {
    fontSize: "10px",
    color: C.subtle,
    lineHeight: 1.45,
  },

  checks: {
    display: "grid",
    gap: "9px",
  },

  check: {
    display: "flex",
    gap: "9px",
    alignItems: "flex-start",
    padding: "10px",
    borderRadius: "8px",
    background: "#f8fafc",
    border: `1px solid ${C.border}`,
  },

  checkText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  checkTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: C.text2,
  },

  checkHint: {
    fontSize: "10px",
    color: C.muted,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: `1px solid ${C.border}`,
  },
};

function FlowEditor() {
  const [searchParams] = useSearchParams();
  const chatbotId =
    searchParams.get("chatbotId");

  const [chatbot, setChatbot] =
    useState(null);

  const [stages, setStages] =
    useState([]);

  const [transitions, setTransitions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showStageModal, setShowStageModal] =
    useState(false);

  const [editingStage, setEditingStage] =
    useState(null);

  const [stageForm, setStageForm] =
    useState(EMPTY_STAGE);

  const [
    showTransitionModal,
    setShowTransitionModal,
  ] = useState(false);

  const [
    editingTransition,
    setEditingTransition,
  ] = useState(null);

  const [
    transitionForm,
    setTransitionForm,
  ] = useState(EMPTY_TRANSITION);

  const sortedStages = useMemo(
    () =>
      [...stages].sort(
        (a, b) =>
          (a.stage_order ?? 0) -
          (b.stage_order ?? 0)
      ),
    [stages]
  );

  const startStage = useMemo(
    () =>
      stages.find(
        (stage) => stage.is_start
      ),
    [stages]
  );

  const outgoingByStage = useMemo(() => {
    const map = {};

    stages.forEach((stage) => {
      map[stage.id] = transitions
        .filter(
          (transition) =>
            transition.from_stage_id ===
            stage.id
        )
        .sort(
          (a, b) =>
            (b.priority ?? 0) -
            (a.priority ?? 0)
        );
    });

    return map;
  }, [stages, transitions]);

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
        api.get(
          `/api/chatbots/${chatbotId}`
        ),
        api.get(
          `/api/admin/config/chatbots/${chatbotId}/stages`
        ),
        api.get(
          `/api/admin/config/chatbots/${chatbotId}/transitions`
        ),
      ]);

      setChatbot(chatbotResponse.data);

      const loadedStages =
        stagesResponse.data || [];

      const loadedTransitions =
        transitionsResponse.data || [];

      setStages(
        Array.isArray(loadedStages)
          ? loadedStages
          : loadedStages.items || []
      );

      setTransitions(
        Array.isArray(
          loadedTransitions
        )
          ? loadedTransitions
          : loadedTransitions.items || []
      );
    } catch (err) {
      console.error(
        "Failed to load flow:",
        err
      );

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

  function openCreateStage() {
    setEditingStage(null);

    setStageForm({
      ...EMPTY_STAGE,
      stage_order: stages.length,
      is_start: stages.length === 0,
    });

    setError("");
    setMessage("");
    setShowStageModal(true);
  }

  function openEditStage(stage) {
    setEditingStage(stage);

    setStageForm({
      name: stage.name || "",
      description:
        stage.description || "",
      stage_order:
        stage.stage_order ?? 0,
      is_start: Boolean(stage.is_start),
      is_terminal:
        Boolean(stage.is_terminal),
    });

    setError("");
    setMessage("");
    setShowStageModal(true);
  }

  function closeStageModal() {
    if (saving) return;

    setShowStageModal(false);
    setEditingStage(null);
    setStageForm(EMPTY_STAGE);
  }

  function handleStageChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setStageForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function saveStage(event) {
    event.preventDefault();

    if (!stageForm.name.trim()) {
      setError(
        "Stage name is required."
      );
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
          stageForm.description.trim() ||
          null,
        stage_order: Number(
          stageForm.stage_order
        ),
        is_start: Boolean(
          stageForm.is_start
        ),
        is_terminal:
          Boolean(
            stageForm.is_terminal
          ),
      };

      if (editingStage) {
        await api.patch(
          `/api/admin/config/stages/${editingStage.id}`,
          payload
        );

        setMessage(
          "Stage updated successfully."
        );
      } else {
        await api.post(
          `/api/admin/config/chatbots/${chatbotId}/stages`,
          payload
        );

        setMessage(
          "Stage created successfully."
        );
      }

      await loadData();
      closeStageModal();
    } catch (err) {
      console.error(
        "Failed to save stage:",
        err
      );

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
    if (
      !window.confirm(
        `Delete the "${stage.name}" stage?`
      )
    ) {
      return;
    }

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

  function openCreateTransition() {
    if (stages.length < 2) {
      setError(
        "Create at least two stages before adding a transition."
      );
      return;
    }

    setEditingTransition(null);

    setTransitionForm({
      ...EMPTY_TRANSITION,
      from_stage_id:
        sortedStages[0]?.id || "",
      to_stage_id:
        sortedStages[1]?.id || "",
    });

    setError("");
    setMessage("");
    setShowTransitionModal(true);
  }

  function openEditTransition(
    transition
  ) {
    setEditingTransition(
      transition
    );

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
    setTransitionForm(
      EMPTY_TRANSITION
    );
  }

  function handleTransitionChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setTransitionForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveTransition(
    event
  ) {
    event.preventDefault();

    if (
      !transitionForm.from_stage_id ||
      !transitionForm.to_stage_id
    ) {
      setError(
        "Please select both stages."
      );
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
      transitionForm.condition.trim() ||
      null;

    const priority = Number(
      transitionForm.priority
    );

    const duplicate =
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

    if (duplicate) {
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
          {
            chatbot_id: chatbotId,
            from_stage_id:
              transitionForm.from_stage_id,
            to_stage_id:
              transitionForm.to_stage_id,
            condition,
            priority,
          }
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

  async function deleteTransition(
    transition
  ) {
    if (
      !window.confirm(
        "Delete this transition?"
      )
    ) {
      return;
    }

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
      )?.name ||
      "Unknown Stage"
    );
  }

  if (!chatbotId) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              ⚠
            </div>

            <h3 style={styles.emptyTitle}>
              No chatbot selected
            </h3>

            <p style={styles.emptyText}>
              Open Flow Builder from a configured
              chatbot.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.empty}>
            Loading Flow Builder...
          </div>
        </div>
      </div>
    );
  }

  const startOutgoing =
    startStage
      ? outgoingByStage[
          startStage.id
        ] || []
      : [];

  const targetStages = startOutgoing
    .map((transition) =>
      stages.find(
        (stage) =>
          stage.id ===
          transition.to_stage_id
      )
    )
    .filter(Boolean);

  const uniqueTargets =
    Array.from(
      new Map(
        targetStages.map(
          (stage) => [
            stage.id,
            stage,
          ]
        )
      ).values()
    );

  const remainingStages =
    sortedStages.filter(
      (stage) =>
        stage.id !==
        startStage?.id &&
        !uniqueTargets.some(
          (target) =>
            target.id === stage.id
        )
    );

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              CHATBOT CONFIGURATION
            </div>

            <h1 style={styles.title}>
              Flow Builder
            </h1>

            <p style={styles.subtitle}>
              Design and manage the
              conversation journey for{" "}
              <strong>
                {chatbot?.name ||
                  "your chatbot"}
              </strong>
            </p>
          </div>

          <div
            style={
              styles.headerActions
            }
          >
            <button
              type="button"
              style={{
                ...styles.btn,
                ...styles.btnSecondary,
              }}
              onClick={loadData}
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
              }}
              onClick={
                openCreateStage
              }
            >
              + Add Stage
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {(error || message) && (
          <div style={styles.alerts}>
            {error && (
              <div
                style={{
                  ...styles.alert,
                  background:
                    C.redBg,
                  border:
                    "1px solid #fecaca",
                  color: C.red,
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  ...styles.alert,
                  background:
                    C.greenBg,
                  border:
                    "1px solid #bbf7d0",
                  color: C.green,
                }}
              >
                {message}
              </div>
            )}
          </div>
        )}

        {/* SUMMARY */}
        <div
          style={
            styles.summaryGrid
          }
        >
          <div style={styles.summary}>
            <div
              style={
                styles.summaryLabel
              }
            >
              TOTAL STAGES
            </div>

            <div
              style={
                styles.summaryValue
              }
            >
              {stages.length}
            </div>
          </div>

          <div style={styles.summary}>
            <div
              style={
                styles.summaryLabel
              }
            >
              TRANSITIONS
            </div>

            <div
              style={
                styles.summaryValue
              }
            >
              {transitions.length}
            </div>
          </div>

          <div style={styles.summary}>
            <div
              style={
                styles.summaryLabel
              }
            >
              START STAGE
            </div>

            <div
              style={
                styles.summaryValue
              }
            >
              {startStage?.name ||
                "Not configured"}
            </div>
          </div>

          <div style={styles.summary}>
            <div
              style={
                styles.summaryLabel
              }
            >
              CHATBOT STATUS
            </div>

            <div
              style={{
                ...styles.summaryValue,
                fontSize: "12px",
                display:
                  "inline-flex",
                padding:
                  "6px 10px",
                borderRadius:
                  "999px",
                background:
                  chatbot?.is_active
                    ? C.greenBg
                    : C.redBg,
                color:
                  chatbot?.is_active
                    ? C.green
                    : C.red,
              }}
            >
              {chatbot?.is_active
                ? "Active"
                : "Inactive"}
            </div>
          </div>
        </div>

        {/* VISUAL FLOW */}
        <section style={styles.panel}>
          <div
            style={
              styles.panelHeader
            }
          >
            <div>
              <h2
                style={
                  styles.panelTitle
                }
              >
                Visual Conversation Flow
              </h2>

              <p
                style={
                  styles.panelText
                }
              >
                Follow the actual routing path
                from the start stage through
                conditional branches.
              </p>
            </div>

            <button
              type="button"
              style={{
                ...styles.btn,
                ...styles.btnSecondary,
              }}
              onClick={
                openCreateTransition
              }
            >
              + Add Transition
            </button>
          </div>

          {sortedStages.length === 0 ? (
            <div
              style={
                styles.empty
              }
            >
              <div
                style={
                  styles.emptyIcon
                }
              >
                ◎
              </div>

              <h3
                style={
                  styles.emptyTitle
                }
              >
                No stages configured
              </h3>

              <p
                style={
                  styles.emptyText
                }
              >
                Create the first conversation
                stage to start building the
                chatbot journey.
              </p>

              <button
                type="button"
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary,
                }}
                onClick={
                  openCreateStage
                }
              >
                + Create First Stage
              </button>
            </div>
          ) : !startStage ? (
            <div
              style={
                styles.empty
              }
            >
              <div
                style={
                  styles.emptyIcon
                }
              >
                ⚠
              </div>

              <h3
                style={
                  styles.emptyTitle
                }
              >
                Start stage not configured
              </h3>

              <p
                style={
                  styles.emptyText
                }
              >
                Edit one stage and mark it as
                the Start Stage to define the
                conversation entry point.
              </p>
            </div>
          ) : (
            <div style={styles.canvas}>
              <div style={styles.flow}>
                {/* START NODE */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: "410px",
                  }}
                >
                  <StageNode
                    stage={startStage}
                    index={sortedStages.findIndex(
                      (stage) =>
                        stage.id ===
                        startStage.id
                    )}
                    outgoing={
                      startOutgoing
                    }
                    onEdit={
                      openEditStage
                    }
                    onDelete={
                      deleteStage
                    }
                  />
                </div>

                {/* CONNECTION FROM START */}
                {startOutgoing.length >
                  0 && (
                  <>
                    <div
                      style={
                        styles.connector
                      }
                    >
                      <div
                        style={
                          styles.line
                        }
                      />

                      <div
                        style={
                          styles.arrow
                        }
                      >
                        ↓
                      </div>
                    </div>

                    {/* BRANCHES */}
                    <div
                      style={
                        styles.branchGrid
                      }
                    >
                      {startOutgoing.map(
                        (
                          transition
                        ) => {
                          const target =
                            stages.find(
                              (
                                stage
                              ) =>
                                stage.id ===
                                transition.to_stage_id
                            );

                          if (!target)
                            return null;

                          const targetIndex =
                            sortedStages.findIndex(
                              (
                                stage
                              ) =>
                                stage.id ===
                                target.id
                            );

                          return (
                            <div
                              key={
                                transition.id
                              }
                              style={
                                styles.branchColumn
                              }
                            >
                              <div
                                style={
                                  styles.conditionLabel
                                }
                              >
                                {transition.condition ||
                                  "ANY"}
                              </div>

                              <div
                                style={
                                  styles.branchLine
                                }
                              >
                                <div
                                  style={
                                    styles.line
                                  }
                                />

                                <div
                                  style={
                                    styles.branchArrow
                                  }
                                >
                                  ↓
                                </div>
                              </div>

                              <div
                                style={
                                  styles.targetNode
                                }
                              >
                                <StageNode
                                  stage={
                                    target
                                  }
                                  index={
                                    targetIndex
                                  }
                                  outgoing={
                                    outgoingByStage[
                                      target
                                        .id
                                    ] || []
                                  }
                                  onEdit={
                                    openEditStage
                                  }
                                  onDelete={
                                    deleteStage
                                  }
                                />
                              </div>

                              <div
                                style={
                                  styles.targetInfo
                                }
                              >
                                Priority{" "}
                                {transition.priority ??
                                  0}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}

                {/* UNCONNECTED / ADDITIONAL STAGES */}
                {remainingStages.length >
                  0 && (
                  <>
                    <div
                      style={{
                        ...styles.connector,
                        marginTop:
                          "28px",
                      }}
                    >
                      <div
                        style={
                          styles.line
                        }
                      />

                      <div
                        style={
                          styles.arrow
                        }
                      >
                        ↓
                      </div>
                    </div>

                    <div
                      style={{
                        width:
                          "100%",
                        maxWidth:
                          "980px",
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(3,minmax(0,1fr))",
                        gap: "16px",
                      }}
                    >
                      {remainingStages.map(
                        (
                          stage
                        ) => (
                          <StageNode
                            key={
                              stage.id
                            }
                            stage={
                              stage
                            }
                            index={sortedStages.findIndex(
                              (
                                item
                              ) =>
                                item.id ===
                                stage.id
                            )}
                            outgoing={
                              outgoingByStage[
                                stage.id
                              ] || []
                            }
                            onEdit={
                              openEditStage
                            }
                            onDelete={
                              deleteStage
                            }
                          />
                        )
                      )}
                    </div>
                  </>
                )}

                {sortedStages.some(
                  (stage) =>
                    stage.is_terminal
                ) && (
                  <div
                    style={
                      styles.terminalBanner
                    }
                  >
                    Terminal stages mark the
                    end of the chatbot
                    conversation.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* TRANSITION MANAGEMENT */}
        <section style={styles.panel}>
          <div
            style={
              styles.panelHeader
            }
          >
            <div>
              <h2
                style={
                  styles.panelTitle
                }
              >
                Stage Transitions
              </h2>

              <p
                style={
                  styles.panelText
                }
              >
                Manage routing conditions and
                priority rules.
              </p>
            </div>
          </div>

          {transitions.length === 0 ? (
            <div
              style={
                styles.empty
              }
            >
              <p
                style={{
                  color:
                    C.muted,
                  fontSize:
                    "13px",
                }}
              >
                No transitions configured yet.
              </p>
            </div>
          ) : (
            <>
              <div
                style={
                  styles.transitionsHeader
                }
              >
                <span>FROM</span>
                <span></span>
                <span>TO</span>
                <span>CONDITION</span>
                <span>PRIORITY</span>
                <span>ACTIONS</span>
              </div>

              {transitions.map(
                (transition) => (
                  <div
                    key={
                      transition.id
                    }
                    style={
                      styles.transitionRow
                    }
                  >
                    <div
                      style={
                        styles.stagePill
                      }
                    >
                      {getStageName(
                        transition.from_stage_id
                      )}
                    </div>

                    <div
                      style={
                        styles.transitionArrow
                      }
                    >
                      →
                    </div>

                    <div
                      style={
                        styles.stagePill
                      }
                    >
                      {getStageName(
                        transition.to_stage_id
                      )}
                    </div>

                    <span
                      style={
                        styles.condition
                      }
                    >
                      {transition.condition ||
                        "Unconditional"}
                    </span>

                    <span
                      style={
                        styles.priority
                      }
                    >
                      {transition.priority ??
                        0}
                    </span>

                    <div
                      style={
                        styles.rowActions
                      }
                    >
                      <button
                        type="button"
                        style={{
                          ...styles.rowBtn,
                          border:
                            `1px solid ${C.borderDark}`,
                          color:
                            C.text2,
                        }}
                        onClick={() =>
                          openEditTransition(
                            transition
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        style={{
                          ...styles.rowBtn,
                          border:
                            "1px solid #fecaca",
                          color:
                            C.red,
                        }}
                        onClick={() =>
                          deleteTransition(
                            transition
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </section>

        {/* STAGE MODAL */}
        {showStageModal && (
          <div
            style={
              styles.modalBackdrop
            }
          >
            <div style={styles.modal}>
              <div
                style={
                  styles.modalHeader
                }
              >
                <div>
                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    {editingStage
                      ? "Edit Conversation Stage"
                      : "Create Conversation Stage"}
                  </h2>

                  <p
                    style={
                      styles.modalText
                    }
                  >
                    Configure stage identity and
                    conversation behavior.
                  </p>
                </div>

                <button
                  type="button"
                  style={
                    styles.closeBtn
                  }
                  onClick={
                    closeStageModal
                  }
                >
                  ×
                </button>
              </div>

              <div
                style={
                  styles.modalBody
                }
              >
                <form
                  onSubmit={saveStage}
                >
                  <div
                    style={
                      styles.formGrid
                    }
                  >
                    <div
                      style={{
                        ...styles.formGroup,
                        ...styles.formFull,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Stage Name
                      </label>

                      <input
                        style={
                          styles.formInput
                        }
                        name="name"
                        value={
                          stageForm.name
                        }
                        onChange={
                          handleStageChange
                        }
                        placeholder="e.g. Qualification"
                        required
                      />
                    </div>

                    <div
                      style={{
                        ...styles.formGroup,
                        ...styles.formFull,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Stage Description
                      </label>

                      <textarea
                        style={{
                          ...styles.formInput,
                          resize:
                            "vertical",
                          minHeight:
                            "100px",
                          fontFamily:
                            "inherit",
                        }}
                        name="description"
                        value={
                          stageForm.description
                        }
                        onChange={
                          handleStageChange
                        }
                        placeholder="Describe the purpose of this stage..."
                        rows={4}
                      />
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Stage Order
                      </label>

                      <input
                        style={
                          styles.formInput
                        }
                        type="number"
                        name="stage_order"
                        value={
                          stageForm.stage_order
                        }
                        onChange={
                          handleStageChange
                        }
                        min="0"
                      />

                      <span
                        style={
                          styles.formHint
                        }
                      >
                        Controls the stage
                        ordering.
                      </span>
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Conversation Role
                      </label>

                      <div
                        style={
                          styles.checks
                        }
                      >
                        <label
                          style={
                            styles.check
                          }
                        >
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

                          <span
                            style={
                              styles.checkText
                            }
                          >
                            <span
                              style={
                                styles.checkTitle
                              }
                            >
                              Start Stage
                            </span>

                            <span
                              style={
                                styles.checkHint
                              }
                            >
                              Entry point
                              for new
                              conversations.
                            </span>
                          </span>
                        </label>

                        <label
                          style={
                            styles.check
                          }
                        >
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

                          <span
                            style={
                              styles.checkText
                            }
                          >
                            <span
                              style={
                                styles.checkTitle
                              }
                            >
                              Terminal Stage
                            </span>

                            <span
                              style={
                                styles.checkHint
                              }
                            >
                              Ends the
                              conversation.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div
                    style={
                      styles.modalActions
                    }
                  >
                    <button
                      type="button"
                      style={{
                        ...styles.btn,
                        ...styles.btnSecondary,
                      }}
                      onClick={
                        closeStageModal
                      }
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      style={{
                        ...styles.btn,
                        ...styles.btnPrimary,
                      }}
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
          </div>
        )}

        {/* TRANSITION MODAL */}
        {showTransitionModal && (
          <div
            style={
              styles.modalBackdrop
            }
          >
            <div style={styles.modal}>
              <div
                style={
                  styles.modalHeader
                }
              >
                <div>
                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    {editingTransition
                      ? "Edit Stage Transition"
                      : "Create Stage Transition"}
                  </h2>

                  <p
                    style={
                      styles.modalText
                    }
                  >
                    Define how the chatbot moves
                    from one stage to another.
                  </p>
                </div>

                <button
                  type="button"
                  style={
                    styles.closeBtn
                  }
                  onClick={
                    closeTransitionModal
                  }
                >
                  ×
                </button>
              </div>

              <div
                style={
                  styles.modalBody
                }
              >
                <form
                  onSubmit={
                    saveTransition
                  }
                >
                  <div
                    style={
                      styles.formGrid
                    }
                  >
                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        From Stage
                      </label>

                      <select
                        style={
                          styles.formInput
                        }
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
                              key={
                                stage.id
                              }
                              value={
                                stage.id
                              }
                            >
                              {stage.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        To Stage
                      </label>

                      <select
                        style={
                          styles.formInput
                        }
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
                              key={
                                stage.id
                              }
                              value={
                                stage.id
                              }
                            >
                              {stage.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      style={{
                        ...styles.formGroup,
                        ...styles.formFull,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Matching Condition
                      </label>

                      <input
                        style={
                          styles.formInput
                        }
                        name="condition"
                        value={
                          transitionForm.condition
                        }
                        onChange={
                          handleTransitionChange
                        }
                        placeholder="e.g. order, support, pricing"
                      />

                      <span
                        style={
                          styles.formHint
                        }
                      >
                        Leave empty for an
                        unconditional transition.
                      </span>
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Priority
                      </label>

                      <input
                        style={
                          styles.formInput
                        }
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

                      <span
                        style={
                          styles.formHint
                        }
                      >
                        Higher values are evaluated
                        first.
                      </span>
                    </div>
                  </div>

                  <div
                    style={
                      styles.modalActions
                    }
                  >
                    <button
                      type="button"
                      style={{
                        ...styles.btn,
                        ...styles.btnSecondary,
                      }}
                      onClick={
                        closeTransitionModal
                      }
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      style={{
                        ...styles.btn,
                        ...styles.btnPrimary,
                      }}
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
          </div>
        )}
      </div>
    </div>
  );
}

function StageNode({
  stage,
  index,
  outgoing,
  onEdit,
  onDelete,
}) {
  const nodeStyle = stage.is_start
    ? styles.nodeStart
    : stage.is_terminal
    ? styles.nodeTerminal
    : styles.nodeNormal;

  const numberStyle = stage.is_start
    ? styles.numberStart
    : stage.is_terminal
    ? styles.numberTerminal
    : styles.numberNormal;

  return (
    <div
      style={{
        ...styles.node,
        ...nodeStyle,
      }}
    >
      <div style={styles.nodeTop}>
        <div style={styles.nodeLeft}>
          <div
            style={{
              ...styles.number,
              ...numberStyle,
            }}
          >
            {index + 1}
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <h3 style={styles.nodeName}>
              {stage.name}
            </h3>
          </div>
        </div>

        <div style={styles.badges}>
          {stage.is_start && (
            <span
              style={{
                ...styles.badge,
                ...styles.startBadge,
              }}
            >
              START
            </span>
          )}

          {stage.is_terminal && (
            <span
              style={{
                ...styles.badge,
                ...styles.endBadge,
              }}
            >
              END
            </span>
          )}
        </div>
      </div>

      <p style={styles.description}>
        {stage.description ||
          "No stage description provided."}
      </p>

      <div style={styles.meta}>
        <div style={styles.metaBox}>
          <span
            style={styles.metaLabel}
          >
            Order
          </span>

          <span
            style={styles.metaValue}
          >
            {stage.stage_order ??
              0}
          </span>
        </div>

        <div style={styles.metaBox}>
          <span
            style={styles.metaLabel}
          >
            Outgoing
          </span>

          <span
            style={styles.metaValue}
          >
            {outgoing.length}
          </span>
        </div>
      </div>

      <div style={styles.nodeActions}>
        <button
          type="button"
          style={{
            ...styles.nodeBtn,
            border:
              `1px solid ${C.borderDark}`,
            color: C.text2,
          }}
          onClick={() =>
            onEdit(stage)
          }
        >
          Edit Stage
        </button>

        <button
          type="button"
          style={{
            ...styles.nodeBtn,
            border:
              "1px solid #fecaca",
            color: C.red,
          }}
          onClick={() =>
            onDelete(stage)
          }
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default FlowEditor;