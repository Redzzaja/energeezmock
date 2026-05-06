"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { icon: "home", label: "Home", href: "/home" },
  { icon: "insights", label: "Stats", href: "/stats" },
  { icon: "add_circle", label: "Add Activity", href: "/add" },
  { icon: "calendar_month", label: "Calendar", href: "/calendar" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({
  isCollapsed,
  onToggle,
  isDarkMode,
  onToggleDarkMode,
}: SidebarProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface-container-low border-r border-surface-variant z-50 transition-all duration-300 ease-in-out hidden md:flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo & Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-variant">
        {!isCollapsed && (
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
            <span className="font-h2 text-h2 text-primary">Energeez</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/home" className="mx-auto">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={`w-8 h-8 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant ${
            isCollapsed ? "mx-auto mt-2" : ""
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCollapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.href)
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isActive(item.href) ? "filled" : ""
                  }`}
                  style={{
                    fontVariationSettings: isActive(item.href) ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-label-md text-label-md">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section - Dark Mode & Profile */}
      <div className="p-3 border-t border-surface-variant space-y-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-on-surface-variant hover:bg-surface-container hover:text-on-surface ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="material-symbols-outlined text-[22px]">
            {isDarkMode ? "light_mode" : "dark_mode"}
          </span>
          {!isCollapsed && (
            <span className="font-label-md text-label-md">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-surface-container ${
              isCollapsed ? "justify-center" : ""
            } ${showProfileMenu ? "bg-surface-container" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="font-label-md text-label-md text-on-surface">John Doe</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Free Plan
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  {showProfileMenu ? "expand_less" : "expand_more"}
                </span>
              </>
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && !isCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface-container-high rounded-xl shadow-lg border border-surface-variant overflow-hidden animate-fade-in-up">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface"
                onClick={() => setShowProfileMenu(false)}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span className="font-label-md text-label-md">Settings</span>
              </Link>
              <Link
                href="/auth"
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface border-t border-surface-variant"
                onClick={() => setShowProfileMenu(false)}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="font-label-md text-label-md">Sign Out</span>
              </Link>
            </div>
          )}

          {/* Collapsed Profile Menu (Tooltip style) */}
          {showProfileMenu && isCollapsed && (
            <div className="absolute bottom-0 left-full ml-2 bg-surface-container-high rounded-xl shadow-lg border border-surface-variant overflow-hidden animate-fade-in whitespace-nowrap z-50">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface"
                onClick={() => setShowProfileMenu(false)}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span className="font-label-md text-label-md">Settings</span>
              </Link>
              <Link
                href="/auth"
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface border-t border-surface-variant"
                onClick={() => setShowProfileMenu(false)}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="font-label-md text-label-md">Sign Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
