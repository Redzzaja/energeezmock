"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar - Desktop only */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 pt-0 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <main className="min-h-screen md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav - Mobile only */}
      <BottomNav />
    </div>
  );
}
