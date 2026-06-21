import type { CSSProperties } from "react";
import "./ProgressBar.css";

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ completed, total, label }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <span>{label ?? `${completed} из ${total} тем`}</span>
        <span>{percent}%</span>
      </div>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ "--progress-bar-value": `${percent}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
