import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const ACTIVE_CHATBOT_ID =
  "74b2abcd-021d-4c97-acf7-5dfed0f21663";

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
  bg: "#0b1020",
  panel: "#11182b",
  panel2: "#151e34",
  panel3: "#0d1426",
  border: "#26324d",
  borderSoft: "#1d2942",
  text: "#f8fafc",
  text2: "#cbd5e1",
  muted: "#8492ad",
  subtle: "#64748b",

  violet: "#8b5cf6",
  violet2: "#7c3aed",
  violetBg: "rgba(139,92,246,0.13)",

  cyan: "#22d3ee",
  cyanBg: "rgba(34,211,238,0.11)",

  green: "#22c55e",
  greenBg: "rgba(34,197,94,0.12)",

  amber: "#f59e0b",
  amberBg: "rgba(245,158,11,0.12)",

  red: "#f87171",
  redBg: "rgba(248,113,113,0.10)",
};

const styles = {
  page: {
    minHeight: "100%",
    padding: "28px",
    boxSizing: "border-box",
    color: C.text,
    background:
      "radial-gradient(circle at 15% 0%, rgba(124,58,237,0.12), transparent 28%), radial-gradient(circle at 90% 15%, rgba(34,211,238,0.06), transparent 24%), #0b1020",
  },

  shell: {
    maxWidth: "1380px",
    margin: "0 auto",
  },

  eyebrow: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.18em",
    color: C.violet,
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
    fontWeight: 800,
    letterSpacing: "-0.025em",
    color: C.text,
  },

  subtitle: {
    margin: "7px 0 0",
    fontSize: "13px",
    lineHeight: 1.6,
    color: C.muted,
  },

  titleRow: { display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap", },

  headerAgent: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 11px",
    borderRadius: "8px",
    background: C.panel2,
    border: `1px solid ${C.border}`,
    fontSize: "11px",
    color: C.text2,
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: C.green,
    boxShadow: "0 0 10px rgba(34,197,94,0.7)",
  },

  headerActions: {
    display: "flex",
    gap: "9px",
  },

  btn: {
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .15s ease",
  },

  btnPrimary: {
    background:
      "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    color: "#fff",
    border: "1px solid rgba(167,139,250,.45)",
    boxShadow: "0 8px 22px rgba(124,58,237,.20)",
  },

  btnSecondary: {
    background: C.panel2,
    color: C.text2,
    border: `1px solid ${C.border}`,
  },

  alerts: {
    display: "grid",
    gap: "9px",
    marginBottom: "18px",
  },

  alert: {
    padding: "11px 14px",
    borderRadius: "9px",
    fontSize: "12px",
    background: C.panel2,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",
    gap: "12px",
    marginBottom: "18px",
  },

  summary: {
    position: "relative",
    overflow: "hidden",
    padding: "16px",
    borderRadius: "12px",
    background:
      "linear-gradient(145deg, #121b30, #0e1628)",
    border: `1px solid ${C.border}`,
    boxShadow: "0 10px 30px rgba(0,0,0,.16)",
  },

  summaryAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "3px",
    height: "100%",
    background:
      "linear-gradient(180deg,#8b5cf6,#22d3ee)",
  },

  summaryLabel: {
    marginLeft: "5px",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.11em",
    color: C.subtle,
    marginBottom: "9px",
  },

  summaryValue: {
    marginLeft: "5px",
    fontSize: "19px",
    fontWeight: 800,
    color: C.text,
  },

  summaryHint: {
    marginLeft: "5px",
    marginTop: "5px",
    fontSize: "10px",
    color: C.muted,
  },

  panel: {
    background:
      "linear-gradient(145deg, rgba(18,27,48,.98), rgba(13,20,38,.98))",
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    overflow: "hidden",
    marginBottom: "18px",
    boxShadow: "0 16px 45px rgba(0,0,0,.18)",
  },

  panelHeader: {
    padding: "18px 20px",
    borderBottom: `1px solid ${C.borderSoft}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 750,
    color: C.text,
  },

  panelText: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: C.muted,
  },

  canvas: {
    padding: "42px 28px 48px",
    backgroundColor: "#0b1222",
    backgroundImage:
      "radial-gradient(rgba(148,163,184,.13) 1px, transparent 1px)",
    backgroundSize: "22px 22px",
  },

  flow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },

  node: {
    width: "100%",
    maxWidth: "430px",
    borderRadius: "14px",
    padding: "17px",
    boxSizing: "border-box",
    background:
      "linear-gradient(145deg,#18223a,#111a2e)",
    border: `1px solid ${C.border}`,
    boxShadow:
      "0 15px 35px rgba(0,0,0,.25)",
  },

  nodeStart: {
    border:
      "1px solid rgba(139,92,246,.72)",
    boxShadow:
      "0 15px 40px rgba(124,58,237,.18)",
    background:
      "linear-gradient(145deg,rgba(91,55,170,.23),#121a30)",
  },

  nodeTerminal: {
    border:
      "1px solid rgba(245,158,11,.65)",
    boxShadow:
      "0 15px 35px rgba(245,158,11,.10)",
    background:
      "linear-gradient(145deg,rgba(120,74,7,.18),#151b2c)",
  },

  nodeTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  nodeLeft: {
    display: "flex",
    gap: "11px",
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
    fontSize: "11px",
    fontWeight: 800,
    flexShrink: 0,
  },

  numberStart: {
    background:
      "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    color: "#fff",
  },

  numberNormal: {
    background: "#202b43",
    color: C.text2,
  },

  numberTerminal: {
    background:
      "linear-gradient(135deg,#f59e0b,#d97706)",
    color: "#fff",
  },

  nodeName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 750,
    color: C.text,
  },

  nodeType: {
    marginTop: "3px",
    fontSize: "9px",
    color: C.muted,
    letterSpacing: ".04em",
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
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: ".06em",
  },

  startBadge: {
    background: C.violetBg,
    color: "#c4b5fd",
    border: "1px solid rgba(139,92,246,.35)",
  },

  endBadge: {
    background: C.amberBg,
    color: "#fbbf24",
    border: "1px solid rgba(245,158,11,.35)",
  },

  description: {
    margin: "14px 0",
    fontSize: "11px",
    lineHeight: 1.65,
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
    background: "rgba(8,14,29,.55)",
    border: `1px solid ${C.borderSoft}`,
  },

  metaLabel: {
    display: "block",
    fontSize: "8px",
    textTransform: "uppercase",
    letterSpacing: ".08em",
    fontWeight: 800,
    color: C.subtle,
    marginBottom: "4px",
  },

  metaValue: {
    fontSize: "10px",
    fontWeight: 700,
    color: C.text2,
  },

  nodeActions: {
    display: "flex",
    gap: "7px",
  },

  nodeBtn: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "7px",
    background: "rgba(17,24,39,.7)",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
    color: C.text2,
  },

  connector: {
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  line: {
    width: "1px",
    height: "28px",
    background:
      "linear-gradient(180deg,#475569,#27344e)",
  },

  arrow: {
    color: C.violet,
    fontSize: "15px",
    lineHeight: 1,
    fontWeight: 800,
  },

  branchGrid: {
    width: "100%",
    maxWidth: "980px",
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: "28px",
    alignItems: "start",
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
    background: C.cyanBg,
    color: C.cyan,
    border:
      "1px solid rgba(34,211,238,.25)",
    fontSize: "9px",
    fontWeight: 800,
    marginBottom: "8px",
  },

  branchArrow: {
    color: C.cyan,
    fontSize: "15px",
    marginBottom: "8px",
    fontWeight: 800,
  },

  targetNode: {
    width: "100%",
    maxWidth: "360px",
  },

  targetInfo: {
    marginTop: "8px",
    fontSize: "9px",
    color: C.subtle,
    textAlign: "center",
    fontWeight: 700,
  },

  terminalBanner: {
    marginTop: "24px",
    padding: "10px 14px",
    borderRadius: "9px",
    background: C.amberBg,
    color: "#fbbf24",
    border:
      "1px solid rgba(245,158,11,.25)",
    fontSize: "10px",
    fontWeight: 700,
    textAlign: "center",
  },

  transitionsHeader: {
    display: "grid",
    gridTemplateColumns:
      "minmax(150px,1fr) 30px minmax(150px,1fr) 150px 65px 130px",
    gap: "10px",
    padding: "10px 18px",
    background: "rgba(9,15,29,.65)",
    borderBottom: `1px solid ${C.borderSoft}`,
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: ".08em",
    color: C.subtle,
  },

  transitionRow: {
    display: "grid",
    gridTemplateColumns:
      "minmax(150px,1fr) 30px minmax(150px,1fr) 150px 65px 130px",
    gap: "10px",
    alignItems: "center",
    padding: "13px 18px",
    borderBottom: `1px solid ${C.borderSoft}`,
  },

  stagePill: {
    padding: "8px 10px",
    borderRadius: "8px",
    background: "#111a2d",
    border: `1px solid ${C.border}`,
    fontSize: "10px",
    fontWeight: 650,
    color: C.text2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  transitionArrow: {
    textAlign: "center",
    fontSize: "15px",
    color: C.violet,
    fontWeight: 800,
  },

  condition: {
    display: "inline-flex",
    width: "fit-content",
    maxWidth: "100%",
    padding: "5px 8px",
    borderRadius: "999px",
    background: C.violetBg,
    color: "#c4b5fd",
    border:
      "1px solid rgba(139,92,246,.25)",
    fontSize: "8px",
    fontWeight: 800,
  },

  priority: {
    display: "inline-flex",
    width: "32px",
    height: "25px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "7px",
    background: "#1b263d",
    color: C.text2,
    fontSize: "9px",
    fontWeight: 800,
  },

  rowActions: {
    display: "flex",
    gap: "6px",
  },

  rowBtn: {
    borderRadius: "6px",
    padding: "6px 8px",
    fontSize: "9px",
    fontWeight: 700,
    cursor: "pointer",
    background: "#121b30",
  },

  empty: {
    padding: "64px 24px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,rgba(139,92,246,.18),rgba(34,211,238,.08))",
    border:
      "1px solid rgba(139,92,246,.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "21px",
    color: C.violet,
  },

  emptyTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 750,
    color: C.text,
  },

  emptyText: {
    maxWidth: "440px",
    margin: "8px auto 18px",
    fontSize: "12px",
    lineHeight: 1.6,
    color: C.muted,
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(2,6,23,.78)",
    backdropFilter: "blur(7px)",
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
    background:
      "linear-gradient(145deg,#151f35,#0e1628)",
    borderRadius: "15px",
    border: `1px solid ${C.border}`,
    boxShadow:
      "0 30px 90px rgba(0,0,0,.55)",
  },

  modalHeader: {
    padding: "19px 21px",
    borderBottom: `1px solid ${C.borderSoft}`,
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 750,
    color: C.text,
  },

  modalText: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: C.muted,
  },

  closeBtn: {
    width: "31px",
    height: "31px",
    borderRadius: "8px",
    border: `1px solid ${C.border}`,
    background: "#111a2d",
    cursor: "pointer",
    fontSize: "19px",
    color: C.muted,
  },

  modalBody: {
    padding: "21px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: "15px",
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
    fontSize: "10px",
    fontWeight: 700,
    color: C.text2,
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 11px",
    borderRadius: "8px",
    border: `1px solid ${C.border}`,
    background: "#0c1425",
    color: C.text,
    fontSize: "12px",
    outline: "none",
  },

  formHint: {
    fontSize: "9px",
    color: C.subtle,
    lineHeight: 1.45,
  },

  checks: {
    display: "grid",
    gap: "8px",
  },

  check: {
    display: "flex",
    gap: "9px",
    alignItems: "flex-start",
    padding: "9px",
    borderRadius: "8px",
    background: "#0e1729",
    border: `1px solid ${C.borderSoft}`,
  },

  checkText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  checkTitle: {
    fontSize: "10px",
    fontWeight: 700,
    color: C.text2,
  },

  checkHint: {
    fontSize: "9px",
    color: C.muted,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
    marginTop: "19px",
    paddingTop: "17px",
    borderTop: `1px solid ${C.borderSoft}`,
  },

  runtimeBar: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: "9px",
    background:
      "linear-gradient(90deg,rgba(34,197,94,.08),rgba(34,211,238,.04))",
    border:
      "1px solid rgba(34,197,94,.16)",
  },

  runtimeTitle: {
    fontSize: "10px",
    fontWeight: 800,
    color: C.text2,
  },

  runtimeText: {
    marginTop: "3px",
    fontSize: "9px",
    color: C.muted,
  },

  runtimeStatus: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: C.greenBg,
    color: "#4ade80",
    fontSize: "8px",
    fontWeight: 800,
  },
};

function FlowEditor() {
  const [searchParams] = useSearchParams();

  const chatbotId =
    searchParams.get("chatbotId") ||
    ACTIVE_CHATBOT_ID;

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

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [showStageModal, setShowStageModal] =
    useState(false);

  const [editingStage, setEditingStage] =
    useState(null);

  const [stageForm, setStageForm] =
    useState(EMPTY_STAGE);

  const [showTransitionModal, setShowTransitionModal] =
    useState(false);

  const [editingTransition, setEditingTransition] =
    useState(null);

  const [transitionForm, setTransitionForm] =
    useState(EMPTY_TRANSITION);

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
      setError(
        "No voice agent selected."
      );
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

      setChatbot(
        chatbotResponse.data
      );

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
        "Failed to load voice flow:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load Conversation Flow."
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
      is_start: Boolean(
        stage.is_start
      ),
      is_terminal: Boolean(
        stage.is_terminal
      ),
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
        is_terminal: Boolean(
          stageForm.is_terminal
        ),
      };

      if (editingStage) {
        await api.patch(
          `/api/admin/config/stages/${editingStage.id}`,
          payload
        );

        setMessage(
          "Voice stage updated successfully."
        );
      } else {
        await api.post(
          `/api/admin/config/chatbots/${chatbotId}/stages`,
          payload
        );

        setMessage(
          "Voice stage created successfully."
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
          "Failed to save voice stage."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStage(stage) {
    if (
      !window.confirm(
        `Delete the "${stage.name}" voice stage?`
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
        `Voice stage "${stage.name}" deleted successfully.`
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
          "Failed to delete voice stage."
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
        "Please select both voice stages."
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
        )} â†’ ${getStageName(
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
          "Voice transition updated successfully."
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
          "Voice transition created successfully."
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
          "Failed to save voice transition."
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
        "Delete this voice transition?"
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
        "Voice transition deleted successfully."
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
          "Failed to delete voice transition."
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

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              â—Œ
            </div>

            <h3 style={styles.emptyTitle}>
              Loading Voice Flow
            </h3>

            <p style={styles.emptyText}>
              Connecting to the PRAX voice
              conversation runtime...
            </p>
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
              PRAX AI VOICE PLATFORM
            </div>

            <div style={styles.titleRow}><h1 style={styles.title}>Conversation Flow</h1><div style={styles.headerAgent}><span style={styles.liveDot} /><span>Active Voice Agent:</span><strong>{chatbot?.name || "PRAX Voice Agent"}</strong></div></div><p style={styles.subtitle}>
              Design how your voice agent
              moves through a spoken
              conversation.
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
              â†» Refresh
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
              + Add Voice Stage
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
                    "1px solid rgba(248,113,113,.22)",
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
                    "1px solid rgba(34,197,94,.22)",
                  color: "#4ade80",
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
          <SummaryCard
            label="VOICE STAGES"
            value={stages.length}
            hint="Conversation states"
          />

          <SummaryCard
            label="ROUTING RULES"
            value={transitions.length}
            hint="Stage transitions"
          />

          <SummaryCard
            label="ENTRY STAGE"
            value={
              startStage?.name ||
              "Not configured"
            }
            hint="Voice session entry point"
          />

          <SummaryCard
            label="AGENT STATUS"
            value={
              chatbot?.is_active
                ? "ACTIVE"
                : "INACTIVE"
            }
            hint="PRAX voice runtime"
            green={
              chatbot?.is_active
            }
          />
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
                Voice Conversation Map
              </h2>

              <p
                style={
                  styles.panelText
                }
              >
                Visualize the spoken journey
                from session start through
                conditional routing.
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
              + Add Routing Rule
            </button>
          </div>

          {sortedStages.length === 0 ? (
            <div style={styles.empty}>
              <div
                style={
                  styles.emptyIcon
                }
              >
                â—‡
              </div>

              <h3
                style={
                  styles.emptyTitle
                }
              >
                No voice stages configured
              </h3>

              <p
                style={
                  styles.emptyText
                }
              >
                Create your first voice
                conversation stage to define
                how the agent should guide the
                caller.
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
            <div style={styles.empty}>
              <div
                style={
                  styles.emptyIcon
                }
              >
                !
              </div>

              <h3
                style={
                  styles.emptyTitle
                }
              >
                Entry stage not configured
              </h3>

              <p
                style={
                  styles.emptyText
                }
              >
                Mark one voice stage as the
                Start Stage to define where
                every new voice conversation
                begins.
              </p>
            </div>
          ) : (
            <div style={styles.canvas}>
              <div style={styles.flow}>
                {/* START */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: "430px",
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

                {/* CONNECTION */}
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
                        â†“
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
                                  "ANY RESPONSE"}
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
                                  â†“
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
                                Routing priority{" "}
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

                {/* REMAINING */}
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
                        â†“
                      </div>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        maxWidth:
                          "980px",
                        display: "grid",
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
                    â— Terminal stages end the
                    active voice conversation.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* RUNTIME */}
        <div
          style={styles.runtimeBar}
        >
          <div>
            <div
              style={
                styles.runtimeTitle
              }
            >
              PRAX Voice Conversation Runtime
            </div>

            <div
              style={
                styles.runtimeText
              }
            >
              Gemini-powered routing and
              conversation state management
            </div>
          </div>

          <div
            style={
              styles.runtimeStatus
            }
          >
            <span
              style={{
                ...styles.liveDot,
                width: "6px",
                height: "6px",
              }}
            />
            SYSTEM OPERATIONAL
          </div>
        </div>

        {/* TRANSITIONS */}
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
                Voice Routing Rules
              </h2>

              <p
                style={
                  styles.panelText
                }
              >
                Control how the voice agent
                moves between conversation
                stages.
              </p>
            </div>
          </div>

          {transitions.length === 0 ? (
            <div style={styles.empty}>
              <p
                style={{
                  color: C.muted,
                  fontSize: "12px",
                }}
              >
                No routing rules configured
                yet.
              </p>
            </div>
          ) : (
            <>
              <div
                style={
                  styles.transitionsHeader
                }
              >
                <span>FROM STAGE</span>
                <span />
                <span>TO STAGE</span>
                <span>VOICE CONDITION</span>
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
                      â†’
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
                            `1px solid ${C.border}`,
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
                            "1px solid rgba(248,113,113,.22)",
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
                      ? "Edit Voice Stage"
                      : "Create Voice Stage"}
                  </h2>

                  <p
                    style={
                      styles.modalText
                    }
                  >
                    Define a conversational state
                    for the voice agent.
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
                  Ã—
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
                        Voice Stage Name
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
                        placeholder="e.g. Collect Customer Details"
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
                        Stage Behavior
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
                        placeholder="Describe what the voice agent should accomplish in this stage..."
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
                        Controls display and
                        execution ordering.
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
                              Voice Entry Stage
                            </span>

                            <span
                              style={
                                styles.checkHint
                              }
                            >
                              Starting point for
                              new voice sessions.
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
                              End Conversation
                            </span>

                            <span
                              style={
                                styles.checkHint
                              }
                            >
                              Ends the active
                              voice interaction.
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
                        : "Create Voice Stage"}
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
                      ? "Edit Voice Routing Rule"
                      : "Create Voice Routing Rule"}
                  </h2>

                  <p
                    style={
                      styles.modalText
                    }
                  >
                    Define when the voice agent
                    should move between stages.
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
                  Ã—
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
                        From Voice Stage
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
                        To Voice Stage
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
                        Spoken Response Condition
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
                        The condition used by the
                        PRAX runtime to route the
                        conversation.
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
                        Routing Priority
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
                        : "Create Routing Rule"}
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

function SummaryCard({
  label,
  value,
  hint,
  green = false,
}) {
  return (
    <div style={styles.summary}>
      <div
        style={styles.summaryAccent}
      />

      <div
        style={styles.summaryLabel}
      >
        {label}
      </div>

      <div
        style={{
          ...styles.summaryValue,
          color: green
            ? "#4ade80"
            : C.text,
          fontSize:
            typeof value === "string" &&
            value.length > 14
              ? "13px"
              : styles.summaryValue
                  .fontSize,
        }}
      >
        {value}
      </div>

      <div
        style={styles.summaryHint}
      >
        {hint}
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
    : {};

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
            <h3
              style={styles.nodeName}
            >
              {stage.name}
            </h3>

            <div
              style={
                styles.nodeType
              }
            >
              VOICE CONVERSATION STATE
            </div>
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
          "No stage behavior description provided."}
      </p>

      <div style={styles.meta}>
        <div style={styles.metaBox}>
          <span
            style={styles.metaLabel}
          >
            Stage Order
          </span>

          <span
            style={styles.metaValue}
          >
            {stage.stage_order ?? 0}
          </span>
        </div>

        <div style={styles.metaBox}>
          <span
            style={styles.metaLabel}
          >
            Outgoing Routes
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
              `1px solid ${C.border}`,
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
              "1px solid rgba(248,113,113,.22)",
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
