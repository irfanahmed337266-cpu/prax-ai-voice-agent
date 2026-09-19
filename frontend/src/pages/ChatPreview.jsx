import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const DEFAULT_CHATBOT_ID =
  "74b2abcd-021d-4c97-acf7-5dfed0f21663";

export default function ChatPreview() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedChatbotId =
    searchParams.get("chatbotId") ||
    DEFAULT_CHATBOT_ID;

  const [chatbots, setChatbots] = useState([]);
  const [chatbotLoading, setChatbotLoading] =
    useState(true);

  const [conversationId, setConversationId] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [initializing, setInitializing] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [error, setError] =
    useState("");

  const [voiceState, setVoiceState] =
    useState("ready");

  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  const audioUrlRef =
    useRef(null);

  // =====================================================
  // LOAD CHATBOTS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadChatbots() {
      try {
        setChatbotLoading(true);
        setError("");

        const response =
          await api.get("/api/chatbots");

        const data = response.data;

        const items =
          Array.isArray(data)
            ? data
            : data?.chatbots ||
              data?.items ||
              [];

        if (!cancelled) {
          setChatbots(items);

          if (
            !selectedChatbotId &&
            items.length > 0
          ) {
            const firstId =
              items[0].id ||
              items[0].chatbot_id;

            if (firstId) {
              setSearchParams({
                chatbotId: firstId,
              });
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              "Failed to load voice agents."
          );
        }
      } finally {
        if (!cancelled) {
          setChatbotLoading(false);
        }
      }
    }

    loadChatbots();

    return () => {
      cancelled = true;
    };
  }, [
    selectedChatbotId,
    setSearchParams,
  ]);

  // =====================================================
  // CREATE CONVERSATION
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function createConversation() {
      if (!selectedChatbotId) {
        setConversationId("");
        setMessages([]);
        setInitializing(false);
        return;
      }

      try {
        setInitializing(true);
        setError("");
        setConversationId("");
        setMessages([]);
        setVoiceState("ready");

        const response =
          await api.post(
            "/api/conversations",
            {
              chatbot_id:
                selectedChatbotId,
            },
          );

        if (!cancelled) {
          setConversationId(
            response.data.id
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              "Failed to create conversation."
          );
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    createConversation();

    return () => {
      cancelled = true;
    };
  }, [selectedChatbotId]);

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current?.stream
      ) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(
          audioUrlRef.current
        );
      }
    };
  }, []);

  // =====================================================
  // CHATBOT CHANGE
  // =====================================================

  function handleChatbotChange(
    event
  ) {
    const chatbotId =
      event.target.value;

    setSearchParams(
      chatbotId
        ? { chatbotId }
        : {}
    );

    setConversationId("");
    setMessages([]);
    setError("");
    setVoiceState("ready");
  }

  // =====================================================
  // TEXT CHAT
  // =====================================================

  async function sendMessage(event) {
    event.preventDefault();

    const userMessage =
      input.trim();

    if (
      !userMessage ||
      !conversationId ||
      loading
    ) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);
    setVoiceState("processing");
    setError("");

    try {
      const response =
        await api.post(
          "/api/chat",
          {
            chatbot_id:
              selectedChatbotId,
            conversation_id:
              conversationId,
            user_message:
              userMessage,
          }
        );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            response.data.response,
        },
      ]);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to send message."
      );
    } finally {
      setLoading(false);
      setVoiceState("ready");
    }
  }

  // =====================================================
  // START RECORDING
  // =====================================================

  async function startRecording() {
    if (
      chatbotLoading ||
      initializing ||
      !conversationId ||
      loading ||
      recording
    ) {
      return;
    }

    try {
      setError("");
      setVoiceState("listening");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Microphone recording is not supported by this browser."
        );
      }

      let stream;

      try {
        stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );
      } catch (firstError) {
        const devices =
          await navigator.mediaDevices.enumerateDevices();

        const audioInputs =
          devices.filter(
            (device) =>
              device.kind ===
              "audioinput"
          );

        if (!audioInputs.length) {
          throw firstError;
        }

        stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: {
                deviceId: {
                  exact:
                    audioInputs[0]
                      .deviceId,
                },
              },
            }
          );
      }

      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const supportedMimeType =
        mimeTypes.find((type) =>
          MediaRecorder.isTypeSupported(
            type
          )
        );

      const recorder =
        supportedMimeType
          ? new MediaRecorder(
              stream,
              {
                mimeType:
                  supportedMimeType,
              }
            )
          : new MediaRecorder(
              stream
            );

      audioChunksRef.current = [];

      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            audioChunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop =
        async () => {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          const audioBlob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  supportedMimeType ||
                  "audio/webm",
              }
            );

          if (
            audioBlob.size === 0
          ) {
            setRecording(false);
            setVoiceState("ready");
            setError(
              "No audio was recorded."
            );
            return;
          }

          setRecording(false);
          setVoiceState("processing");

          await sendVoiceMessage(
            audioBlob
          );
        };

      recorder.onerror = () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        setRecording(false);
        setVoiceState("ready");
        setError(
          "Microphone recording failed."
        );
      };

      mediaRecorderRef.current =
        recorder;

      recorder.start();

      setRecording(true);
    } catch (err) {
      setRecording(false);
      setVoiceState("ready");

      console.error(
        "Microphone error:",
        err
      );

      let message =
        "Could not access the microphone.";

      if (
        err?.name ===
        "NotFoundError"
      ) {
        message =
          "No microphone device was found.";
      } else if (
        err?.name ===
        "NotAllowedError"
      ) {
        message =
          "Microphone permission was denied.";
      } else if (
        err?.name ===
        "NotReadableError"
      ) {
        message =
          "The microphone is already being used by another application.";
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    }
  }

  // =====================================================
  // STOP RECORDING
  // =====================================================

  function stopRecording() {
    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state ===
        "inactive"
    ) {
      setRecording(false);
      setVoiceState("ready");
      return;
    }

    recorder.stop();
    setRecording(false);
  }

  // =====================================================
  // VOICE API
  // =====================================================

  async function sendVoiceMessage(
    audioBlob
  ) {
    if (
      !conversationId ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setVoiceState("processing");

    const formData =
      new FormData();

    formData.append(
      "chatbot_id",
      selectedChatbotId
    );

    formData.append(
      "conversation_id",
      conversationId
    );

    formData.append(
      "audio",
      audioBlob,
      "voice.webm"
    );

    try {
      const response =
        await api.post(
          "/voice/chat",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
            responseType: "blob",
          }
        );

      const transcript =
        response.headers[
          "x-transcript"
        ];

      const chatbotResponse =
        response.headers[
          "x-chatbot-response"
        ];

      if (transcript) {
        setMessages((current) => [
          ...current,
          {
            role: "user",
            content: transcript,
            source: "voice",
          },
        ]);
      }

      if (chatbotResponse) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              chatbotResponse,
            source: "voice",
          },
        ]);
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(
          audioUrlRef.current
        );
      }

      const audioUrl =
        URL.createObjectURL(
          response.data
        );

      audioUrlRef.current =
        audioUrl;

      const audio =
        new Audio(audioUrl);

      setVoiceState("speaking");

      audio.onended = () => {
        setVoiceState("ready");
      };

      await audio.play();
    } catch (err) {
      let message =
        "Voice request failed.";

      if (
        err?.response?.data instanceof
        Blob
      ) {
        try {
          const text =
            await err.response.data.text();

          const parsed =
            JSON.parse(text);

          message =
            parsed?.detail ||
            message;
        } catch {
          // Keep default.
        }
      } else {
        message =
          err?.response?.data?.detail ||
          message;
      }

      setError(message);
      setVoiceState("ready");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // DATA
  // =====================================================

  const selectedChatbot =
    chatbots.find(
      (chatbot) =>
        String(
          chatbot.id ||
            chatbot.chatbot_id
        ) ===
        String(selectedChatbotId)
    );

  const selectedName =
    selectedChatbot?.name ||
    selectedChatbot?.bot_name ||
    selectedChatbot?.business_name ||
    "PRAX Voice Agent";

  const canInteract =
    !chatbotLoading &&
    !initializing &&
    !!conversationId &&
    !loading;

  const statusText = (() => {
    if (chatbotLoading) {
      return "Loading voice agents";
    }

    if (initializing) {
      return "Starting conversation";
    }

    if (recording) {
      return "Listening";
    }

    if (voiceState === "processing") {
      return "Processing";
    }

    if (voiceState === "speaking") {
      return "Speaking";
    }

    return "Ready";
  })();

  const lastAssistantMessage =
    [...messages]
      .reverse()
      .find(
        (message) =>
          message.role ===
          "assistant"
      );

  const lastUserMessage =
    [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === "user"
      );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="voice-playground">
      {/* HEADER */}
      <div className="voice-playground-header">
        <div className="voice-playground-title-row">
          <div>
            <h1>
              Voice Playground
            </h1>

            <p>
              Talk naturally with your AI voice agent.
            </p>
          </div>
        </div>
      </div>
{/* TOP CONTROL BAR */}

      <div className="voice-control-bar">
        <div className="voice-agent-picker">
          <span className="control-label">
            VOICE AGENT
          </span>

          <select
            value={
              selectedChatbotId
            }
            onChange={
              handleChatbotChange
            }
            disabled={
              chatbotLoading ||
              loading ||
              recording
            }
          >
            <option value="">
              {chatbotLoading
                ? "Loading..."
                : "Select voice agent"}
            </option>

            {chatbots.map(
              (chatbot) => {
                const id =
                  chatbot.id ||
                  chatbot.chatbot_id;

                const name =
                  chatbot.name ||
                  chatbot.bot_name ||
                  chatbot.business_name ||
                  "Unnamed Agent";

                return (
                  <option
                    key={id}
                    value={id}
                  >
                    {name}
                  </option>
                );
              }
            )}
          </select>
        </div>

        <div className="voice-control-meta">
          <div className="voice-meta-item">
            <span>LANGUAGE</span>
            <strong>
              Urdu + English
            </strong>
          </div>

          <div className="voice-meta-divider" />

          <div className="voice-meta-item">
            <span>MODEL</span>
            <strong>
              Gemini 2.5 Flash
            </strong>
          </div>

          <div className="voice-meta-divider" />

          <div className="voice-meta-item">
            <span>STATUS</span>
            <strong className="status-ready">
              <span className="status-dot" />
              {statusText}
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="voice-error">
          <span>!</span>
          <div>
            <strong>
              Voice Agent Error
            </strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* MAIN VOICE AREA */}

      <div className="voice-playground-grid">
        {/* LEFT â€” VOICE CONTROL */}

        <section className="voice-interaction-panel">
          <div className="interaction-heading">
            <div>
              <span className="eyebrow">
                LIVE VOICE SESSION
              </span>

              <h2>
                {selectedName}
              </h2>
            </div>

            <div className="session-badge">
              <span className="status-dot" />
              Live
            </div>
          </div>

          <div
            className={`voice-orb-area ${
              recording
                ? "is-listening"
                : ""
            } ${
              voiceState ===
              "processing"
                ? "is-processing"
                : ""
            } ${
              voiceState ===
              "speaking"
                ? "is-speaking"
                : ""
            }`}
          >
            <div className="voice-orb-ring ring-one" />
            <div className="voice-orb-ring ring-two" />
            <div className="voice-orb-ring ring-three" />

            <button
              type="button"
              className={`voice-main-button ${
                recording
                  ? "recording"
                  : ""
              }`}
              onClick={
                recording
                  ? stopRecording
                  : startRecording
              }
              disabled={
                !canInteract
              }
              aria-label={
                recording
                  ? "Stop recording"
                  : "Start voice conversation"
              }
            >
              <div className="voice-main-icon">
                {recording
                  ? "â– "
                  : (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="9" y="2" width="6" height="12" rx="3" />
                        <path d="M5 10a7 7 0 0 0 14 0" />
                        <line x1="12" y1="19" x2="12" y2="22" />
                        <line x1="8" y1="22" x2="16" y2="22" />
                      </svg>
                    )}
              </div>
            </button>

            <div className="voice-wave wave-one" />
            <div className="voice-wave wave-two" />
            <div className="voice-wave wave-three" />
          </div>

          <div className="voice-status-area">
            <div className="voice-status-title">
              {recording
                ? "Listening..."
                : voiceState ===
                    "processing"
                  ? "Thinking..."
                  : voiceState ===
                      "speaking"
                    ? "Speaking..."
                    : "Ready to talk"}
            </div>

            <p>
              {recording
                ? "Speak naturally, then press stop when you're finished."
                : voiceState ===
                    "processing"
                  ? "Gemini is processing your message."
                  : voiceState ===
                      "speaking"
                    ? "Your AI voice agent is responding."
                    : "Press the microphone and start speaking."}
            </p>
          </div>

          <div className="voice-capability-row">
            <div className="voice-capability">
              <span>â—‰</span>
              Speech Recognition
            </div>

            <div className="voice-capability">
              <span>âœ¦</span>
              Gemini AI
            </div>

            <div className="voice-capability">
              <span>◌</span>
              Voice Response
            </div>
          </div>
        </section>

        {/* RIGHT â€” LIVE TRANSCRIPT */}

        <section className="voice-transcript-panel">
          <div className="transcript-header">
            <div>
              <span className="eyebrow">
                CONVERSATION
              </span>

              <h2>
                Live Transcript
              </h2>
            </div>

            <span className="turn-count">
              {messages.length} turns
            </span>
          </div>

          <div className="transcript-content">
            {messages.length === 0 &&
              !initializing && (
                <div className="transcript-empty">
                  <div className="empty-icon">
                    ◌
                  </div>

                  <h3>
                    Your conversation
                    starts here
                  </h3>

                  <p>
                    Speak into the
                    microphone and your
                    transcript will appear
                    here.
                  </p>
                </div>
              )}

            {initializing && (
              <div className="transcript-empty">
                <div className="empty-spinner">
                  ...
                </div>

                <h3>
                  Starting session
                </h3>

                <p>
                  Connecting to your
                  voice agent.
                </p>
              </div>
            )}

            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={`transcript-message ${
                    message.role ===
                    "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >
                  <div className="message-avatar">
                    {message.role ===
                    "user"
                      ? "YOU"
                      : "AI"}
                  </div>

                  <div className="message-body">
                    <div className="message-label">
                      {message.role ===
                      "user"
                        ? "You"
                        : selectedName}
                    </div>

                    <div className="message-text">
                      {message.content}
                    </div>
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="transcript-message assistant-message">
                <div className="message-avatar">
                  AI
                </div>

                <div className="message-body">
                  <div className="message-label">
                    {selectedName}
                  </div>

                  <div className="thinking-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="latest-response">
            <span>
              LATEST AI RESPONSE
            </span>

            <p>
              {lastAssistantMessage
                ?.content ||
                "Your AI response will appear here after your first message."}
            </p>
          </div>
        </section>
      </div>

      {/* TEXT FALLBACK */}

      <section className="voice-text-input-panel">
        <div className="text-input-label">
          <span className="eyebrow">
            TEXT FALLBACK
          </span>

          <span>
            You can also type a message
          </span>
        </div>

        <form
          onSubmit={sendMessage}
          className="voice-message-form"
        >
          <input
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder={
              initializing
                ? "Initializing voice session..."
                : "Type a message instead of speaking..."
            }
            disabled={
              !canInteract ||
              recording
            }
          />

          <button
            type="submit"
            disabled={
              !canInteract ||
              recording ||
              !input.trim()
            }
          >
            Send
            <span>→</span>
          </button>
        </form>
      </section>

      {/* FOOTER INFO */}

      <div className="voice-playground-footer">
        <div>
          <span className="footer-live-dot" />
          Voice system operational
        </div>

        <div>
          Conversation ID:
          <strong>
            {conversationId
              ? `${conversationId.slice(
                  0,
                  8
                )}...`
              : "Initializing"}
          </strong>
        </div>

        <div>
          Auto language detection
          <strong>
            Enabled
          </strong>
        </div>
      </div>
    </div>
  );
}
