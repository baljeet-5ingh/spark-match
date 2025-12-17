import { useState, useRef } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  values: [number, number];
  onChange: (values: [number, number]) => void;
  label: string;
  step?: number;
  saving?: boolean;
}

export function RangeSlider({
  min,
  max,
  values,
  onChange,
  label,
  step = 1,
  saving,
}: RangeSliderProps) {
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // 🎯 Calculate which thumb is closer to the click position
  const getClosestThumb = (clickValue: number): "min" | "max" => {
    const distanceToMin = Math.abs(clickValue - values[0]);
    const distanceToMax = Math.abs(clickValue - values[1]);
    return distanceToMin <= distanceToMax ? "min" : "max";
  };

  // 🖱️ Handle click on track
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (saving || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const clickValue = Math.round(min + percentage * (max - min));

    // Clamp value to min/max bounds
    const clampedValue = Math.max(min, Math.min(max, clickValue));

    // Determine which thumb to move
    const closestThumb = getClosestThumb(clampedValue);

    if (closestThumb === "min") {
      // Don't let min thumb go past max thumb
      const newMin = Math.min(clampedValue, values[1]);
      onChange([newMin, values[1]]);
    } else {
      // Don't let max thumb go below min thumb
      const newMax = Math.max(clampedValue, values[0]);
      onChange([values[0], newMax]);
    }
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= values[1]) {
      onChange([newMin, values[1]]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= values[0]) {
      onChange([values[0], newMax]);
    }
  };

  const minPercent = ((values[0] - min) / (max - min)) * 100;
  const maxPercent = ((values[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground mb-2 block">
        {label}: {values[0]} - {values[1]} years
      </label>
      
      <div className="relative px-3 pt-2">
        {/* Clickable Track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-2 bg-muted rounded-full cursor-pointer"
        >
          {/* Active Range */}
          <div
            className="absolute h-2 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 rounded-full pointer-events-none"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        {/* Min Thumb Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={values[0]}
          step={step}
          onChange={handleMinChange}
          onMouseDown={() => setActiveThumb("min")}
          onMouseUp={() => setActiveThumb(null)}
          onTouchStart={() => setActiveThumb("min")}
          onTouchEnd={() => setActiveThumb(null)}
          style={{ pointerEvents: 'none' }}
          className={`absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb top-2 ${
            activeThumb === "min" ? "z-30" : "z-20"
          }`}
          disabled={saving}
        />

        {/* Max Thumb Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={values[1]}
          step={step}
          onChange={handleMaxChange}
          onMouseDown={() => setActiveThumb("max")}
          onMouseUp={() => setActiveThumb(null)}
          onTouchStart={() => setActiveThumb("max")}
          onTouchEnd={() => setActiveThumb(null)}
          style={{ pointerEvents: 'none' }}
          className={`absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb top-2 ${
            activeThumb === "max" ? "z-30" : "z-20"
          }`}
          disabled={saving}
        />
      </div>
    </div>
  );
}