import { Button } from "@/components/ui/button";

interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export const QuickReplies = ({ options, onSelect, disabled = false }: QuickRepliesProps) => {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="text-sm"
        >
          {option}
        </Button>
      ))}
    </div>
  );
};