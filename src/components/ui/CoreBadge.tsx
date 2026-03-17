type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral";

interface CoreBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  success: "bg-[#F0FDF4] text-[#16A34A]",
  error: "bg-[#FEF2F2] text-[#DC2626]",
  warning: "bg-[#FFFBEB] text-[#B45309]",
  info: "bg-[rgba(0,179,255,0.08)] text-[#0284C7]",
  neutral: "bg-[#F1F5F9] text-[#475569]",
};

export default function CoreBadge({ variant, children, className }: CoreBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
        styles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
