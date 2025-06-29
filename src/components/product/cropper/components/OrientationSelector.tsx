
import { memo } from "react";
import { Button } from "@/components/ui/button";

interface OrientationOption {
  label: string;
  value: number;
  key: string;
}

interface OrientationSelectorProps {
  selectedAspectRatio: number;
  onAspectRatioChange: (aspectRatio: number) => void;
  options?: OrientationOption[];
}

const defaultOptions: OrientationOption[] = [
  { label: "Square", value: 1, key: "square" },
  { label: "Horizontal", value: 4/3, key: "horizontal" },
  { label: "Vertical", value: 3/4, key: "vertical" },
];

const OrientationSelector = memo(({
  selectedAspectRatio,
  onAspectRatioChange,
  options = defaultOptions
}: OrientationSelectorProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Orientation</label>
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option.key}
            variant={selectedAspectRatio === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onAspectRatioChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
});

OrientationSelector.displayName = 'OrientationSelector';

export default OrientationSelector;
