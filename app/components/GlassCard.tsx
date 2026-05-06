import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export default function GlassCard({ children, className = "", onClick, style }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`glass-card rounded-xl p-4 relative overflow-hidden ${
        onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
