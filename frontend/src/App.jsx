import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Chatbots from "./pages/Chatbots";
import CreateChatbot from "./pages/CreateChatbot";
import EditChatbot from "./pages/EditChatbot";
import ConfigureChatbot from "./pages/ConfigureChatbot";
import AIProvider from "./pages/AIProvider";
import FlowEditor from "./pages/FlowEditor";
import ChatPreview from "./pages/ChatPreview";

function Dashboard() {
  const stats = [
    {
      title: "Total Chatbots",
      value: "3",
      change: "+1 this week",
      icon: "🤖",
      className: "stat-indigo",
    },
    {
      title: "Conversations",
      value: "128",
      change: "+18.2%",
      icon: "💬",
      className: "stat-blue",
    },
    {
      title: "Knowledge Documents",
      value: "24",
      change: "+4 this month",
      icon: "📚",
      className: "stat-purple",
    },
    {
      title: "AI Requests",
      value: "1,842",
      change: "+12.5%",
      icon: "⚡",
      className: "stat-green",
    },
  ];

  const recentChatbots = [
    {
      name: "PRAX Customer Support Bot",
      business: "PRAX",
      status: "Active",
      statusClass: "active",
    },
    {
      name: "PRAX Frontend Test Bot",
      business: "PRAX",
      status: "Active",
      statusClass: "active",
    },
    {
      name: "PRAX Test Bot",
      business: "PRAX Test Business",
      status: "Active",
      statusClass: "active",
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <div className="page-eyebrow">OVERVIEW</div>

          <h1>Good morning 👋</h1>

          <p>
            Manage your AI automation workspace and monitor your chatbots.
          </p>
        </div>

        <NavLink to="/chatbots/create" className="primary-button">
          <span>+</span>
          Create Chatbot
        </NavLink>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-card-top">
              <div className={`stat-icon ${stat.className}`}>
                {stat.icon}
              </div>

              <span className="stat-menu">•••</span>
            </div>

            <div className="stat-title">{stat.title}</div>

            <div className="stat-value">{stat.value}</div>

            <div className="stat-change">
              <span>↗</span>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Recent Chatbots */}
        <section className="dashboard-card chatbot-overview">
          <div className="section-header">
            <div>
              <h2>Recent Chatbots</h2>
              <p>Your latest configured AI assistants.</p>
            </div>

            <NavLink to="/chatbots" className="view-link">
              View all →
            </NavLink>
          </div>

          <div className="chatbot-list">
            {recentChatbots.map((chatbot) => (
              <div className="dashboard-chatbot" key={chatbot.name}>
                <div className="bot-avatar">🤖</div>

                <div className="bot-info">
                  <h3>{chatbot.name}</h3>
                  <p>{chatbot.business}</p>
                </div>

                <span
                  className={`status-badge ${chatbot.statusClass}`}
                >
                  <span className="status-dot"></span>
                  {chatbot.status}
                </span>

                <NavLink
                  to="/chatbots"
                  className="small-outline-button"
                >
                  Configure
                </NavLink>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-card">
          <div className="section-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Build and manage your AI platform.</p>
            </div>
          </div>

          <div className="quick-actions">
            <NavLink
              to="/chatbots/create"
              className="quick-action"
            >
              <div className="quick-icon purple">🤖</div>

              <div>
                <strong>Create Chatbot</strong>
                <span>Build a new AI assistant</span>
              </div>

              <span className="arrow">→</span>
            </NavLink>

            <NavLink
              to="/knowledge"
              className="quick-action"
            >
              <div className="quick-icon blue">📚</div>

              <div>
                <strong>Add Knowledge</strong>
                <span>Upload documents and data</span>
              </div>

              <span className="arrow">→</span>
            </NavLink>

            <NavLink
              to="/ai-provider"
              className="quick-action"
            >
              <div className="quick-icon green">⚡</div>

              <div>
                <strong>Configure AI</strong>
                <span>Connect your AI provider</span>
              </div>

              <span className="arrow">→</span>
            </NavLink>

            <NavLink
              to="/deploy"
              className="quick-action"
            >
              <div className="quick-icon orange">🚀</div>

              <div>
                <strong>Deploy Chatbot</strong>
                <span>Publish your AI assistant</span>
              </div>

              <span className="arrow">→</span>
            </NavLink>
          </div>
        </section>
      </div>

      {/* Activity */}
      <section className="dashboard-card activity-card">
        <div className="section-header">
          <div>
            <h2>Recent Activity</h2>
            <p>Latest activity across your workspace.</p>
          </div>

          <span className="live-label">
            <span></span>
            Live
          </span>
        </div>

        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon purple">🤖</div>

            <div className="activity-content">
              <strong>PRAX Frontend Test Bot</strong>
              <span>was created successfully</span>
            </div>

            <time>Just now</time>
          </div>

          <div className="activity-item">
            <div className="activity-icon blue">✏️</div>

            <div className="activity-content">
              <strong>PRAX Customer Support Bot</strong>
              <span>configuration was updated</span>
            </div>

            <time>Today</time>
          </div>

          <div className="activity-item">
            <div className="activity-icon green">⚡</div>

            <div className="activity-content">
              <strong>AI Provider</strong>
              <span>system is ready for configuration</span>
            </div>

            <time>Today</time>
          </div>
        </div>
      </section>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div className="dashboard-page">
      <div className="page-eyebrow">PRAX MODULE</div>

      <h1>{title}</h1>

      <p>
        This PRAX module is being connected to the backend.
      </p>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">
        {/* Logo */}

        <div className="brand">
          <div className="brand-mark">P</div>

          <div>
            <div className="logo">PRAX</div>
            <div className="subtitle">AI PLATFORM</div>
          </div>
        </div>

        {/* Workspace */}

        <div className="workspace-card">
          <div className="workspace-avatar">P</div>

          <div className="workspace-info">
            <span>Workspace</span>
            <strong>PRAX</strong>
          </div>

          <span className="workspace-arrow">⌄</span>
        </div>

        {/* Main Navigation */}

        <div className="nav-section">
          <div className="nav-label">MAIN MENU</div>

          <nav>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">⌂</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/chatbots"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">🤖</span>
              <span>Chatbots</span>
              <span className="nav-count">3</span>
            </NavLink>

            <NavLink
              to="/knowledge"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">▣</span>
              <span>Knowledge Base</span>
            </NavLink>

            <NavLink
              to="/flow"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">⌘</span>
              <span>Flow Builder</span>
            </NavLink>
          </nav>
        </div>

        {/* Configuration */}

        <div className="nav-section">
          <div className="nav-label">CONFIGURATION</div>

          <nav>
            <NavLink
              to="/ai-provider"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">⚡</span>
              <span>AI Provider</span>
            </NavLink>

            <NavLink
              to="/handoff"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">♙</span>
              <span>Human Handoff</span>
            </NavLink>

            <NavLink
              to="/branding"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">✦</span>
              <span>Branding</span>
            </NavLink>
          </nav>
        </div>

        {/* Deployment */}

        <div className="nav-section">
          <div className="nav-label">DEPLOYMENT</div>

          <nav>
            <NavLink
              to="/preview"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">◉</span>
              <span>Chat Preview</span>
            </NavLink>

            <NavLink
              to="/deploy"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <span className="nav-icon">↗</span>
              <span>Deploy</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Bottom */}

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="online-dot"></span>

            <div>
              <strong>System Online</strong>
              <small>All services operational</small>
            </div>
          </div>

          <div className="user-card">
            <div className="user-avatar">U</div>

            <div className="user-info">
              <strong>PRAX Admin</strong>
              <span>Administrator</span>
            </div>

            <span className="user-menu">•••</span>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="main-content">
        {/* Topbar */}

        <header className="topbar">
          <div className="breadcrumb">
            <span>PRAX</span>
            <b>/</b>
            <strong>Workspace</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              title="Notifications"
            >
              ♢
              <span className="notification-dot"></span>
            </button>

            <div className="topbar-divider"></div>

            <div className="system-indicator">
              <span></span>
              System Online
            </div>
          </div>
        </header>

        {/* ================= ROUTES ================= */}

        <div className="content-area">
          <Routes>
            {/* Dashboard */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Chatbots */}

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
              path="/chatbots/:chatbotId/configure" 
              element={<ConfigureChatbot />} 
            />

            {/* Main Modules */}

            <Route
              path="/knowledge"
              element={
                <Placeholder title="Knowledge Base" />
              }
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
              element={
                <Placeholder title="Human Handoff" />
              }
            />

            <Route
              path="/branding"
              element={
                <Placeholder title="Branding" />
              }
            />

            <Route
              path="/preview"
              element={<ChatPreview />}
            />

            <Route
              path="/deploy"
              element={
                <Placeholder title="Deploy" />
              }
            />

            {/* Default */}

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