import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./AppLayout.css";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      className={`app-layout ${sidebarCollapsed ? "app-layout--collapsed" : ""}`}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="app-layout__overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="app-layout__main">
        <TopBar onMenuClick={() => setMobileSidebarOpen((p) => !p)} />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
