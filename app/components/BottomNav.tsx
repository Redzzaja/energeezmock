"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: "home", label: "Home", href: "/home" },
  { icon: "insights", label: "Stats", href: "/stats" },
  { icon: "add_circle", label: "Add", href: "/add", isCenter: true },
  { icon: "calendar_month", label: "Calendar", href: "/calendar" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-surface shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe md:hidden">
      <div className="flex justify-around items-center px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 transition-transform active:scale-90 hover:opacity-80"
              >
                <span className="material-symbols-outlined text-[32px] text-primary">
                  {item.icon}
                </span>
                <span className="font-label-sm text-label-sm mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all duration-200 active:scale-90 ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span
                className={`material-symbols-outlined ${isActive ? "filled" : ""}`}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-label-sm mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
