import React from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label
        className="text-sm font-medium text-gray-300"
        title={`Current color: ${value}`}
      >
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-12 h-8 rounded border border-slate-400/40 bg-slate-700/30 cursor-pointer hover:border-slate-300/60 transition-colors"
          title="Click to change color"
        />
        <span
          className="text-xs text-gray-400 font-mono"
          title="Hex color code"
        >
          {value}
        </span>
      </div>
    </div>
  );
};
