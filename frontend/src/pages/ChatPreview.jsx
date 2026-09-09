import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ChatPreview() {
  const [searchParams] = useSearchParams();
  const chatbotId = searchParams.get("chatbotId");

  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function createConversation() {
      if (!chatbotId) {
        setError("Missing chatbotId in preview URL.");
        setInitializing(false);
        return;
      }

      try {
        setInitializing(true);
        setError("");

        const response = await api.post("/api/conversations", {
          chatbot_id: chatbotId,
        });

        if (!cancelled) {
          setConversationId(response.data.id);
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
  }, [chatbotId]);

  async function sendMessage(event) {
    event.preventDefault();

    const userMessage = input.trim();

    if (!userMessage || !conversationId || loading) {
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
    setError("");

    try {
      const response = await api.post("/api/chat", {
        chatbot_id: chatbotId,
        conversation_id: conversationId,
        user_message: userMessage,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.data.response,
        },
      ]);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to send message."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "24px",
      }}
    >
      <h1>PRAX Chatbot Preview</h1>

      <p>
        {initializing
          ? "Initializing conversation..."
          : conversationId
            ? "Connected to selected chatbot"
            : "Conversation unavailable"}
      </p>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            border: "1px solid #d33",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          minHeight: "300px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        {messages.length === 0 && !initializing && (
          <p>Start the conversation.</p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: "12px",
              textAlign:
                message.role === "user"
                  ? "right"
                  : "left",
            }}
          >
            <strong>
              {message.role === "user"
                ? "You"
                : "PRAX Bot"}
              :
            </strong>{" "}
            {message.content}
          </div>
        ))}

        {loading && <p>PRAX Bot is thinking...</p>}
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder={
            initializing
              ? "Initializing..."
              : "Type your message..."
          }
          disabled={
            initializing ||
            !conversationId ||
            loading
          }
          style={{
            flex: 1,
            padding: "12px",
          }}
        />

        <button
          type="submit"
          disabled={
            initializing ||
            !conversationId ||
            loading ||
            !input.trim()
          }
        >
          Send
        </button>
      </form>
    </div>
  );
}