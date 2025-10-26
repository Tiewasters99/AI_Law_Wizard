import React from "react";

interface PositionControlsProps {
  label: string;
  position: { x: number; y: number; z: number };
  onChange: (position: { x: number; y: number; z: number }) => void;
  className?: string;
}

export const PositionControls: React.FC<PositionControlsProps> = ({
  label,
  position,
  onChange,
  className = "",
}) => {
  const updateAxis = (axis: "x" | "y" | "z", value: number) => {
    onChange({ ...position, [axis]: value });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label
            className="text-xs text-gray-400 w-4"
            title="X position (left/right)"
          >
            X:
          </label>
          <input
            type="range"
            min="-25"
            max="25"
            step="0.5"
            value={position.x}
            onChange={e => updateAxis("x", parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer hover:bg-slate-500 transition-colors"
            title={`X position: ${position.x.toFixed(1)}`}
          />
          <span
            className="text-xs text-gray-400 w-12 text-right"
            title="Current X value"
          >
            {position.x.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <label
            className="text-xs text-gray-400 w-4"
            title="Y position (up/down)"
          >
            Y:
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={position.y}
            onChange={e => updateAxis("y", parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer hover:bg-slate-500 transition-colors"
            title={`Y position: ${position.y.toFixed(1)}`}
          />
          <span
            className="text-xs text-gray-400 w-12 text-right"
            title="Current Y value"
          >
            {position.y.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <label
            className="text-xs text-gray-400 w-4"
            title="Z position (forward/back)"
          >
            Z:
          </label>
          <input
            type="range"
            min="-25"
            max="25"
            step="0.5"
            value={position.z}
            onChange={e => updateAxis("z", parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer hover:bg-slate-500 transition-colors"
            title={`Z position: ${position.z.toFixed(1)}`}
          />
          <span
            className="text-xs text-gray-400 w-12 text-right"
            title="Current Z value"
          >
            {position.z.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};
