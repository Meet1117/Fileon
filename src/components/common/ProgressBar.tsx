import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const ProgressBar = ({
  progress,
  className,
  showLabel = true,
  size = "md",
}: ProgressBarProps) => {
  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Processing...</span>
          <span className="font-medium text-primary">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn("progress-bar", heights[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="progress-bar-fill"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
