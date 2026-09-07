from __future__ import annotations

import json
from typing import Any


class EmbedService:
    """
    Generates the browser-side PRAX chatbot loader.

    The deployment key is intentionally used by the browser as the
    deployment identifier. It does NOT contain an AI provider API key.

    AI provider credentials remain server-side.
    """

    @staticmethod
    def generate_embed_script(
        deployment_key: str,
        api_base_url: str,
    ) -> str:
        if not deployment_key:
            raise ValueError("Deployment key is required.")

        if not api_base_url:
            raise ValueError("API base URL is required.")

        deployment_key_json = json.dumps(
            deployment_key
        )

        api_base_url_json = json.dumps(
            api_base_url.rstrip("/")
        )

        script = f"""
(function () {{
    "use strict";

    if (window.__PRAX_CHATBOT_LOADED__) {{
        return;
    }}

    window.__PRAX_CHATBOT_LOADED__ = true;

    const PRAX_CONFIG = {{
        deploymentKey: {deployment_key_json},
        apiBaseUrl: {api_base_url_json}
    }};

    function createElement(tag, attributes) {{
        const element = document.createElement(tag);

        Object.keys(attributes || {{}}).forEach(function (key) {{
            element.setAttribute(key, attributes[key]);
        }});

        return element;
    }}

    function createWidget(config) {{
        if (document.getElementById("prax-chatbot-widget")) {{
            return;
        }}

        const branding = config.branding || {{}};

        const primaryColor =
            branding.primary_color || "#2563EB";

        const secondaryColor =
            branding.secondary_color || "#FFFFFF";

        const botName =
            branding.bot_name ||
            config.chatbot_name ||
            "PRAX Assistant";

        const welcomeMessage =
            branding.welcome_message ||
            config.welcome_message ||
            "Hello! How can I help you?";

        const position =
            branding.widget_position ||
            "bottom-right";

        const container = createElement(
            "div",
            {{
                id: "prax-chatbot-widget"
            }}
        );

        container.style.position = "fixed";
        container.style.zIndex = "2147483647";
        container.style.fontFamily =
            "Arial, Helvetica, sans-serif";

        if (position === "bottom-left") {{
            container.style.left = "20px";
            container.style.bottom = "20px";
        }} else {{
            container.style.right = "20px";
            container.style.bottom = "20px";
        }}

        const button = createElement(
            "button",
            {{
                type: "button",
                "aria-label": "Open chat"
            }}
        );

        button.textContent = botName;

        button.style.border = "none";
        button.style.borderRadius = "999px";
        button.style.padding = "14px 20px";
        button.style.background = primaryColor;
        button.style.color = secondaryColor;
        button.style.cursor = "pointer";
        button.style.fontSize = "14px";
        button.style.fontWeight = "600";
        button.style.boxShadow =
            "0 8px 24px rgba(0,0,0,0.18)";

        const panel = createElement(
            "div",
            {{}}
        );

        panel.style.display = "none";
        panel.style.width = "360px";
        panel.style.maxWidth =
            "calc(100vw - 40px)";
        panel.style.height = "520px";
        panel.style.marginBottom = "10px";
        panel.style.background = "#ffffff";
        panel.style.borderRadius = "16px";
        panel.style.overflow = "hidden";
        panel.style.boxShadow =
            "0 12px 40px rgba(0,0,0,0.20)";
        panel.style.border =
            "1px solid rgba(0,0,0,0.08)";

        const header = createElement(
            "div",
            {{}}
        );

        header.style.background = primaryColor;
        header.style.color = secondaryColor;
        header.style.padding = "16px";
        header.style.fontWeight = "600";

        header.textContent = botName;

        const messages = createElement(
            "div",
            {{}}
        );

        messages.style.height = "390px";
        messages.style.overflowY = "auto";
        messages.style.padding = "14px";
        messages.style.background = "#f8fafc";

        const inputArea = createElement(
            "div",
            {{}}
        );

        inputArea.style.display = "flex";
        inputArea.style.gap = "8px";
        inputArea.style.padding = "10px";
        inputArea.style.borderTop =
            "1px solid #e5e7eb";
        inputArea.style.background = "#ffffff";

        const input = createElement(
            "input",
            {{
                type: "text",
                placeholder: "Type your message..."
            }}
        );

        input.style.flex = "1";
        input.style.minWidth = "0";
        input.style.border =
            "1px solid #d1d5db";
        input.style.borderRadius = "10px";
        input.style.padding = "10px";

        const sendButton = createElement(
            "button",
            {{
                type: "button"
            }}
        );

        sendButton.textContent = "Send";

        sendButton.style.border = "none";
        sendButton.style.borderRadius = "10px";
        sendButton.style.padding = "10px 14px";
        sendButton.style.background = primaryColor;
        sendButton.style.color = secondaryColor;
        sendButton.style.cursor = "pointer";

        function addMessage(
            text,
            role
        ) {{
            const message = createElement(
                "div",
                {{}}
            );

            message.textContent = text;

            message.style.marginBottom = "10px";
            message.style.padding = "10px 12px";
            message.style.borderRadius = "10px";
            message.style.maxWidth = "85%";
            message.style.whiteSpace = "pre-wrap";
            message.style.wordBreak = "break-word";

            if (role === "user") {{
                message.style.marginLeft = "auto";
                message.style.background =
                    primaryColor;
                message.style.color =
                    secondaryColor;
            }} else {{
                message.style.marginRight = "auto";
                message.style.background = "#ffffff";
                message.style.color = "#111827";
                message.style.border =
                    "1px solid #e5e7eb";
            }}

            messages.appendChild(message);
            messages.scrollTop =
                messages.scrollHeight;
        }}

        let conversationId =
            window.localStorage.getItem(
                "prax_conversation_id_" +
                config.deployment_id
            );

        async function createConversation() {{
            if (conversationId) {{
                return conversationId;
            }}

            const response = await fetch(
                PRAX_CONFIG.apiBaseUrl +
                "/api/conversations",
                {{
                    method: "POST",
                    headers: {{
                        "Content-Type":
                            "application/json"
                    }},
                    body: JSON.stringify({{
                        chatbot_id:
                            config.chatbot_id,
                        external_user_id:
                            "web-" +
                            Math.random()
                                .toString(36)
                                .slice(2)
                    }})
                }}
            );

            if (!response.ok) {{
                throw new Error(
                    "Unable to create conversation."
                );
            }}

            const data =
                await response.json();

            conversationId = data.id;

            window.localStorage.setItem(
                "prax_conversation_id_" +
                config.deployment_id,
                conversationId
            );

            return conversationId;
        }}

        async function sendMessage() {{
            const text =
                input.value.trim();

            if (!text) {{
                return;
            }}

            input.value = "";

            addMessage(
                text,
                "user"
            );

            sendButton.disabled = true;

            try {{
                const conversation =
                    await createConversation();

                const response = await fetch(
                    PRAX_CONFIG.apiBaseUrl +
                    "/api/deployments/public/chat",
                    {{
                        method: "POST",
                        headers: {{
                            "Content-Type":
                                "application/json",
                            "X-Deployment-Key":
                                PRAX_CONFIG.deploymentKey
                        }},
                        body: JSON.stringify({{
                            conversation_id:
                                conversation,
                            user_message:
                                text
                        }})
                    }}
                );

                const data =
                    await response.json();

                if (!response.ok) {{
                    throw new Error(
                        data.detail ||
                        "Chat request failed."
                    );
                }}

                addMessage(
                    data.response ||
                    "I could not generate a response.",
                    "assistant"
                );
            }} catch (error) {{
                addMessage(
                    "Sorry, something went wrong. Please try again.",
                    "assistant"
                );

                console.error(
                    "PRAX chatbot error:",
                    error
                );
            }} finally {{
                sendButton.disabled = false;
                input.focus();
            }}
        }}

        button.addEventListener(
            "click",
            function () {{
                if (
                    panel.style.display ===
                    "none"
                ) {{
                    panel.style.display =
                        "block";

                    input.focus();
                }} else {{
                    panel.style.display =
                        "none";
                }}
            }}
        );

        sendButton.addEventListener(
            "click",
            sendMessage
        );

        input.addEventListener(
            "keydown",
            function (event) {{
                if (
                    event.key === "Enter"
                ) {{
                    sendMessage();
                }}
            }}
        );

        addMessage(
            welcomeMessage,
            "assistant"
        );

        inputArea.appendChild(input);
        inputArea.appendChild(sendButton);

        panel.appendChild(header);
        panel.appendChild(messages);
        panel.appendChild(inputArea);

        container.appendChild(panel);
        container.appendChild(button);

        document.body.appendChild(container);
    }}

    async function initialize() {{
        try {{
            const response = await fetch(
                PRAX_CONFIG.apiBaseUrl +
                "/api/deployments/public/config" +
                "?deployment_key=" +
                encodeURIComponent(
                    PRAX_CONFIG.deploymentKey
                ),
                {{
                    method: "GET",
                    headers: {{
                        "Accept":
                            "application/json"
                    }}
                }}
            );

            const config =
                await response.json();

            if (!response.ok) {{
                throw new Error(
                    config.detail ||
                    "Unable to load PRAX deployment."
                );
            }}

            createWidget(config);
        }} catch (error) {{
            console.error(
                "PRAX chatbot initialization failed:",
                error
            );

            window.__PRAX_CHATBOT_LOADED__ = false;
        }}
    }}

    if (
        document.readyState ===
        "loading"
    ) {{
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    }} else {{
        initialize();
    }}
}})();
"""

        return script.strip()


def get_embed_service() -> EmbedService:
    return EmbedService()