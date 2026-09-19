import { useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Chatbots from "./pages/Chatbots";
import CreateChatbot from "./pages/CreateChatbot";
import EditChatbot from "./pages/EditChatbot";
import ConfigureChatbot from "./pages/ConfigureChatbot";
import AIProvider from "./pages/AIProvider";
import FlowEditor from "./pages/FlowEditor";
import ChatPreview from "./pages/ChatPreview";
import KnowledgeBase from "./pages/KnowledgeBase";
import HumanHandoff from "./pages/HumanHandoff";
import Branding from "./pages/Branding";
import Deploy from "./pages/Deploy";


/* =========================================================
   ACTIVE VOICE AGENT
   ========================================================= */

const ACTIVE_CHATBOT_ID =
  "74b2abcd-021d-4c97-acf7-5dfed0f21663";

const withChatbot = (path) =>
  `${path}?chatbotId=${ACTIVE_CHATBOT_ID}`;


/* =========================================================
   VOICE AGENT DASHBOARD
   ========================================================= */

function Dashboard() {
  const stats = [
    {
      title: "VOICE AGENTS",
      value: "1",
      detail: "Active agent",
      icon: "◉",
      type: "violet",
    },
    {
      title: "CONVERSATIONS",
      value: "128",
      detail: "+18.2% this week",
      icon: "◌",
      type: "blue",
    },
    {
      title: "VOICE MINUTES",
      value: "342",
      detail: "+24.6% this month",
      icon: "◷",
      type: "cyan",
    },
    {
      title: "AI RESPONSES",
      value: "1,842",
      detail: "+12.5%",
      icon: "✦",
      type: "green",
    },
  ];

  const conversations = [
    {
      name: "Customer Support",
      language: "Urdu",
      time: "2 min ago",
      status: "Completed",
      icon: "🎧",
    },
    {
      name: "Order Inquiry",
      language: "English",
      time: "8 min ago",
      status: "Completed",
      icon: "📦",
    },
    {
      name: "Order Status",
      language: "Urdu + English",
      time: "14 min ago",
      status: "Completed",
      icon: "🚚",
    },
    {
      name: "General Support",
      language: "English",
      time: "21 min ago",
      status: "Completed",
      icon: "💬",
    },
  ];

  return (
    <div className="voice-dashboard">

      <div className="voice-dashboard-header">
        <div>
          <div className="voice-eyebrow">
            VOICE CONTROL CENTER
          </div>

          <h1>Voice Agent Dashboard</h1>

          <p>
            Monitor conversations, voice activity and AI performance.
          </p>
        </div>

        <NavLink
          to="/preview"
          className="voice-primary-button"
        >
          <span className="voice-button-icon">🎙️</span>
          Test Voice Agent
        </NavLink>
      </div>


      <section className="voice-agent-banner">

        <div className="voice-agent-main">

          <div className="voice-agent-avatar">
            <span>◉</span>
          </div>

          <div className="voice-agent-info">

            <div className="voice-agent-name-row">

              <h2>PRAX AI Voice Agent</h2>

              <span className="voice-live-badge">
                <span></span>
                LIVE
              </span>

            </div>

            <p>
              Intelligent voice customer support powered by Gemini
            </p>

            <div className="voice-agent-tags">
              <span>🎤 Voice Enabled</span>
              <span>🇵🇰 Urdu</span>
              <span>🇬🇧 English</span>
              <span>⚡ Gemini</span>
            </div>

          </div>

        </div>

        <div className="voice-agent-actions">

          <NavLink
            to="/preview"
            className="voice-outline-button"
          >
            Open Playground
          </NavLink>

          <NavLink
            to={`/chatbots/${ACTIVE_CHATBOT_ID}`}
            className="voice-outline-button"
          >
            Configure
          </NavLink>

        </div>

      </section>


      <div className="voice-stats-grid">

        {stats.map((stat) => (

          <div
            className="voice-stat-card"
            key={stat.title}
          >

            <div className="voice-stat-top">

              <div
                className={`voice-stat-icon ${stat.type}`}
              >
                {stat.icon}
              </div>

              <span className="voice-stat-menu">
                •••
              </span>

            </div>

            <div className="voice-stat-label">
              {stat.title}
            </div>

            <div className="voice-stat-value">
              {stat.value}
            </div>

            <div className="voice-stat-detail">
              <span>↗</span>
              {stat.detail}
            </div>

          </div>

        ))}

      </div>


      <div className="voice-main-grid">

        <section className="voice-panel">

          <div className="voice-panel-header">

            <div>
              <h2>Recent Conversations</h2>

              <p>
                Latest voice interactions with your agent.
              </p>
            </div>

            <NavLink
              to="/preview"
              className="voice-view-link"
            >
              Open playground →
            </NavLink>

          </div>


          <div className="voice-conversation-list">

            {conversations.map((conversation, index) => (

              <div
                className="voice-conversation"
                key={`${conversation.name}-${index}`}
              >

                <div className="conversation-avatar">
                  {conversation.icon}
                </div>

                <div className="conversation-content">

                  <strong>
                    {conversation.name}
                  </strong>

                  <span>
                    {conversation.language}
                  </span>

                </div>

                <div className="conversation-time">
                  {conversation.time}
                </div>

                <span className="conversation-status">
                  {conversation.status}
                </span>

              </div>

            ))}

          </div>

        </section>


        <section className="voice-panel">

          <div className="voice-panel-header">

            <div>
              <h2>Voice Capabilities</h2>

              <p>
                Current agent configuration.
              </p>
            </div>

          </div>


          <div className="voice-capability-list">

            <div className="voice-capability">

              <div className="capability-icon">
                🎤
              </div>

              <div>
                <strong>Speech Recognition</strong>
                <span>Gemini audio understanding</span>
              </div>

              <b className="capability-active">
                ON
              </b>

            </div>


            <div className="voice-capability">

              <div className="capability-icon">
                🔊
              </div>

              <div>
                <strong>Voice Response</strong>
                <span>Gemini text-to-speech</span>
              </div>

              <b className="capability-active">
                ON
              </b>

            </div>


            <div className="voice-capability">

              <div className="capability-icon">
                🌐
              </div>

              <div>
                <strong>Auto Language</strong>
                <span>Urdu + English detection</span>
              </div>

              <b className="capability-active">
                ON
              </b>

            </div>


            <div className="voice-capability">

              <div className="capability-icon">
                🧠
              </div>

              <div>
                <strong>AI Runtime</strong>
                <span>Existing PRAX chatbot engine</span>
              </div>

              <b className="capability-active">
                READY
              </b>

            </div>

          </div>

        </section>

      </div>


      <section className="voice-panel voice-actions-panel">

        <div className="voice-panel-header">

          <div>
            <h2>Voice Agent Setup</h2>

            <p>
              Configure the components behind your voice assistant.
            </p>
          </div>

        </div>


        <div className="voice-quick-grid">

          <NavLink
            to={withChatbot("/ai-provider")}
            className="voice-quick-card"
          >

            <div className="voice-quick-icon purple">
              ⚡
            </div>

            <div>
              <strong>AI Provider</strong>
              <span>
                Manage your Gemini connection
              </span>
            </div>

            <b>→</b>

          </NavLink>


          <NavLink
            to={withChatbot("/knowledge")}
            className="voice-quick-card"
          >

            <div className="voice-quick-icon blue">
              🧠
            </div>

            <div>
              <strong>Knowledge Base</strong>
              <span>
                Manage agent knowledge
              </span>
            </div>

            <b>→</b>

          </NavLink>


          <NavLink
            to={withChatbot("/flow")}
            className="voice-quick-card"
          >

            <div className="voice-quick-icon cyan">
              🔀
            </div>

            <div>
              <strong>Conversation Flow</strong>
              <span>
                Design voice conversation stages
              </span>
            </div>

            <b>→</b>

          </NavLink>


          <NavLink
            to={withChatbot("/handoff")}
            className="voice-quick-card"
          >

            <div className="voice-quick-icon orange">
              👤
            </div>

            <div>
              <strong>Human Handoff</strong>
              <span>
                Configure escalation rules
              </span>
            </div>

            <b>→</b>

          </NavLink>

        </div>

      </section>


      <section className="voice-system-panel">

        <div className="voice-system-left">

          <div className="voice-system-icon">
            ✓
          </div>

          <div>
            <strong>
              Voice system operational
            </strong>

            <span>
              Gemini STT · PRAX AI Runtime · Gemini TTS
            </span>
          </div>

        </div>

        <span className="voice-system-status">
          All systems operational
        </span>

      </section>

    </div>
  );
}


/* =========================================================
   SIDEBAR LINK
   ========================================================= */

function VoiceNavLink({
  to,
  icon,
  children,
  count,
  onNavigate,
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        isActive
          ? "voice-nav-link active"
          : "voice-nav-link"
      }
    >
      <span className="voice-nav-icon">
        {icon}
      </span>

      <span className="voice-nav-text">
        {children}
      </span>

      {count && (
        <span className="voice-nav-count">
          {count}
        </span>
      )}
    </NavLink>
  );
}


/* =========================================================
   APP LAYOUT
   ========================================================= */

function AppLayout() {

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (

    <div className="voice-app">

      {mobileMenuOpen && (
        <button
          type="button"
          className="voice-mobile-overlay"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
        />
      )}


      <aside
        className={
          mobileMenuOpen
            ? "voice-sidebar mobile-open"
            : "voice-sidebar"
        }
      >

        <div className="voice-mobile-sidebar-header">

          <span>PRAX</span>

          <button
            type="button"
            className="voice-mobile-close"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          >
            ×
          </button>

        </div>


        <div className="voice-brand">

          <div className="voice-brand-mark">
            P
          </div>

          <div>

            <div className="voice-logo">
              PRAX
            </div>

            <div className="voice-subtitle">
              AI VOICE AGENT
            </div>

          </div>

        </div>


        <div className="voice-agent-selector">

          <div className="selector-avatar">
            ◉
          </div>

          <div className="selector-info">

            <span>
              Active Agent
            </span>

            <strong>
              PRAX Voice Agent
            </strong>

          </div>

          <span className="selector-arrow">
            ⌄
          </span>

        </div>


        <div className="voice-nav-section">

          <div className="voice-nav-label">
            VOICE
          </div>

          <nav>

            <VoiceNavLink
              to="/dashboard"
              icon="◉"
              onNavigate={closeMobileMenu}
            >
              Voice Dashboard
            </VoiceNavLink>

            <VoiceNavLink
              to="/chatbots"
              icon="◎"
              count="1"
              onNavigate={closeMobileMenu}
            >
              Voice Agents
            </VoiceNavLink>

            <VoiceNavLink
              to="/preview"
              icon="🎙️"
              onNavigate={closeMobileMenu}
            >
              Voice Playground
            </VoiceNavLink>

            <VoiceNavLink
              to="/preview"
              icon="◌"
              onNavigate={closeMobileMenu}
            >
              Conversations
            </VoiceNavLink>

          </nav>

        </div>


        <div className="voice-nav-section">

          <div className="voice-nav-label">
            AI & VOICE
          </div>

          <nav>

            <VoiceNavLink
              to={withChatbot("/knowledge")}
              icon="🧠"
              onNavigate={closeMobileMenu}
            >
              Knowledge Base
            </VoiceNavLink>

            <VoiceNavLink
              to={withChatbot("/flow")}
              icon="⌘"
              onNavigate={closeMobileMenu}
            >
              Conversation Flow
            </VoiceNavLink>

            <VoiceNavLink
              to={withChatbot("/ai-provider")}
              icon="⚡"
              onNavigate={closeMobileMenu}
            >
              AI Provider
            </VoiceNavLink>

            <VoiceNavLink
              to={withChatbot("/branding")}
              icon="✦"
              onNavigate={closeMobileMenu}
            >
              Voice Branding
            </VoiceNavLink>

            <VoiceNavLink
              to={withChatbot("/handoff")}
              icon="♙"
              onNavigate={closeMobileMenu}
            >
              Human Handoff
            </VoiceNavLink>

          </nav>

        </div>


        <div className="voice-nav-section">

          <div className="voice-nav-label">
            DEPLOYMENT
          </div>

          <nav>

            <VoiceNavLink
              to={withChatbot("/deploy")}
              icon="↗"
              onNavigate={closeMobileMenu}
            >
              Deploy Voice Agent
            </VoiceNavLink>

          </nav>

        </div>


        <div className="voice-sidebar-bottom">

          <div className="voice-online-card">

            <span className="voice-online-dot"></span>

            <div>

              <strong>
                System Online
              </strong>

              <small>
                Gemini voice services ready
              </small>

            </div>

          </div>


          <div className="voice-user-card">

            <div className="voice-user-avatar">
              U
            </div>

            <div className="voice-user-info">

              <strong>
                PRAX Admin
              </strong>

              <span>
                Voice Administrator
              </span>

            </div>

            <span>
              •••
            </span>

          </div>

        </div>

      </aside>


      <main className="voice-main-content">

        <header className="voice-topbar">

          <button
            type="button"
            className="voice-mobile-menu-button"
            aria-label="Open navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>


          <div className="voice-breadcrumb">

            <span>
              PRAX
            </span>

            <b>
              /
            </b>

            <strong>
              AI Voice Agent
            </strong>

          </div>


          <div className="voice-topbar-actions">

            <div className="voice-language-pill">

              <span>🌐</span>

              <strong>
                Urdu + English
              </strong>

              <span className="voice-language-dot"></span>

            </div>


            <div className="voice-topbar-divider"></div>


            <div className="voice-system-indicator">

              <span></span>

              Gemini Connected

            </div>

          </div>

        </header>


        <div className="voice-content-area">

          <Routes>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/chatbots"
              element={<Chatbots />}
            />

            <Route
              path="/chatbots/create"
              element={<CreateChatbot />}
            />

            <Route
              path="/chatbots/:chatbotId/edit"
              element={<EditChatbot />}
            />

            <Route
              path="/chatbots/:chatbotId"
              element={<ConfigureChatbot />}
            />

            <Route
              path="/knowledge"
              element={<KnowledgeBase />}
            />

            <Route
              path="/flow"
              element={<FlowEditor />}
            />

            <Route
              path="/ai-provider"
              element={<AIProvider />}
            />

            <Route
              path="/handoff"
              element={<HumanHandoff />}
            />

            <Route
              path="/branding"
              element={<Branding />}
            />

            <Route
              path="/preview"
              element={<ChatPreview />}
            />

            <Route
              path="/deploy"
              element={<Deploy />}
            />

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>

        </div>

      </main>

    </div>
  );
}


export default AppLayout;
