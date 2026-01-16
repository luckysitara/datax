import { cn } from "@/lib/utils";

type Status = "pending" | "running" | "completed" | "failed";
type Severity = "critical" | "high" | "medium" | "low";

interface StatusBadgeProps {
  status?: Status;
  severity?: Severity;
  className?: string;
  animate?: boolean;
}

export function StatusBadge({ status, severity, className, animate = false }: StatusBadgeProps) {
  if (status) {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50",
      running: "bg-blue-500/10 text-blue-500 border-blue-500/50",
      completed: "bg-green-500/10 text-green-500 border-green-500/50",
      failed: "bg-red-500/10 text-red-500 border-red-500/50",
    };

    return (
      <span className={cn(
        "px-2 py-1 rounded text-xs font-mono border uppercase tracking-wide flex items-center gap-2 w-fit",
        variants[status],
        className
      )}>
        {animate && status === "running" && (
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
        )}
        {status}
      </span>
    );
  }

  if (severity) {
    const variants = {
      critical: "bg-[hsl(0,100%,50%)]/10 text-[hsl(0,100%,50%)] border-[hsl(0,100%,50%)]/50 shadow-[0_0_10px_rgba(255,0,0,0.3)]",
      high: "bg-[hsl(30,100%,50%)]/10 text-[hsl(30,100%,50%)] border-[hsl(30,100%,50%)]/50",
      medium: "bg-[hsl(60,100%,50%)]/10 text-[hsl(60,100%,50%)] border-[hsl(60,100%,50%)]/50",
      low: "bg-[hsl(210,100%,50%)]/10 text-[hsl(210,100%,50%)] border-[hsl(210,100%,50%)]/50",
    };

    return (
      <span className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold font-mono border uppercase tracking-wider",
        variants[severity],
        className
      )}>
        {severity}
      </span>
    );
  }

  return null;
}
